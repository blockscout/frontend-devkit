// The instruction surface: which files the checker reads. The agent config directories are walked whole;
// a directory that carries a `CONTEXT.md` contributes every markdown file in and below it, so a directory
// documenting itself across several files is covered whole rather than through that one entry point.
// Task specs are excluded — they describe files that do not exist yet by design.

import type { Dirent } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOTS: ReadonlyArray<string> = [ '.agents', '.claude', '.cursor' ];

// Excluded in every repository; a repository adds its own through `docLinks.exclude` in `devkit.config.json`.
const EXCLUDED: ReadonlyArray<string> = [ '.agents/tasks', '.claude/worktrees' ];

const SKIPPED_DIRS = new Set([ 'node_modules', '.git', '.next' ]);

const MARKDOWN = /\.mdc?$/;

// The trailing slashes match an excluded path and everything below it, but not a sibling whose name
// merely starts the same way — `.agents/tasks-archive`.
const isExcluded = (rel: string, extra: ReadonlyArray<string>): boolean =>
  [ ...EXCLUDED, ...extra ].some((ex) => `${ rel }/`.startsWith(`${ ex }/`));

// A symlink is followed to what it points at. `.agents/skills/<name>` may link into a devkit submodule, and
// the files behind it are part of this repository's instruction surface: the paths they name have to exist
// here. A link onto a directory the walk reaches anyway (`.claude/skills` → `../.agents/skills`) yields the
// same files a second time, which `dedupeByRealPath` drops.
async function kindOf(root: string, rel: string, entry: Dirent): Promise<'directory' | 'file' | 'missing'> {
  if (!entry.isSymbolicLink()) return entry.isDirectory() ? 'directory' : 'file';
  try {
    return (await stat(path.join(root, rel))).isDirectory() ? 'directory' : 'file';
  } catch {
    return 'missing'; // dangling link — an uninitialised submodule
  }
}

export async function collectMarkdown(
  root: string,
  dir: string,
  acc: Array<string> = [],
  exclude: ReadonlyArray<string> = [],
  visited: Set<string> = new Set(),
): Promise<Array<string>> {
  // Each real directory is walked once per call, so a link cycle ends.
  let real: string;
  try {
    real = await realpath(path.join(root, dir));
  } catch {
    return acc; // a root absent from this checkout is not an error
  }
  if (visited.has(real)) return acc;
  visited.add(real);

  let entries: Array<Dirent>;
  try {
    entries = await readdir(path.join(root, dir), { withFileTypes: true });
  } catch {
    return acc; // a root absent from this checkout is not an error
  }

  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (isExcluded(rel, exclude)) continue;

    const kind = await kindOf(root, rel, entry);
    if (kind === 'directory') {
      if (!SKIPPED_DIRS.has(entry.name)) await collectMarkdown(root, rel, acc, exclude, visited);
    } else if (kind === 'file' && MARKDOWN.test(entry.name)) {
      acc.push(rel);
    }
  }

  return acc;
}

export const contextDirs = (tracked: ReadonlyArray<string>): Set<string> =>
  new Set(tracked.filter((file) => path.basename(file) === 'CONTEXT.md').map((file) => path.dirname(file)));

// Walking the ancestors rather than matching one level down is what makes a nested `adr/` or `docs/` count.
const isBelowContextDir = (file: string, dirs: ReadonlySet<string>): boolean => {
  for (let dir = path.dirname(file); dir !== '.'; dir = path.dirname(dir)) {
    if (SKIPPED_DIRS.has(path.basename(dir))) return false;
    if (dirs.has(dir)) return true;
  }
  return false;
};

// Every markdown file in and below a `CONTEXT.md` directory, taken from the tracked-file list the caller
// already has — an untracked or generated file is not part of the instruction surface.
export const contextSurface = (tracked: ReadonlyArray<string>, exclude: ReadonlyArray<string> = []): Array<string> => {
  const dirs = contextDirs(tracked);
  return tracked.filter((file) =>
    MARKDOWN.test(file) && !isExcluded(file, exclude) && isBelowContextDir(file, dirs));
};

// One entry per real file. `.cursor/rules/*.mdc` and `.claude/CLAUDE.md` are symlinks onto files the walk
// already reached under `.agents`, and checking a file twice reports each of its findings twice. First seen
// wins, so the path reported is the one the walk arrived at.
export async function dedupeByRealPath(root: string, relativePaths: ReadonlyArray<string>): Promise<Array<string>> {
  const seen = new Map<string, string>();
  for (const rel of relativePaths) {
    const real = await realpath(path.join(root, rel));
    if (!seen.has(real)) seen.set(real, rel);
  }
  return [ ...seen.values() ];
}

export async function collectSurface(
  root: string,
  tracked: ReadonlyArray<string>,
  exclude: ReadonlyArray<string> = [],
): Promise<Array<string>> {
  const walked = (await Promise.all(ROOTS.map((dir) => collectMarkdown(root, dir, [], exclude)))).flat();
  return dedupeByRealPath(root, [ ...walked, ...contextSurface(tracked, exclude) ]);
}
