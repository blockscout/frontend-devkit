/* eslint-disable no-console -- CLI tool, console output is the interface */
import { execFileSync } from 'node:child_process';

import { checkFile } from './check';
import { loadConfig } from './config';
import { renderReport } from './report';
import { buildRepoIndex } from './resolve';
import { collectSurface } from './surface';

// These files instruct agents rather than humans, so a reference that no longer resolves does not merely read
// badly — it sends an agent to a file that is not there, and nothing else in the toolchain notices. Kept
// mechanical on purpose: a review agent should spend its judgement on what a rule says, not on whether the
// rule's target still exists.
//
// CLI entry only; everything worth a test lives in the modules beside it. See ./CONTEXT.md for the file map.

// The root is the repository the command runs in, asked of git from the working directory. Asking from this
// file's own location would answer with the devkit checkout when the tool is mounted as a submodule.
function repoRoot(): string {
  return execFileSync('git', [ 'rev-parse', '--show-toplevel' ], { cwd: process.cwd(), encoding: 'utf8' }).trim();
}

function trackedFiles(root: string): Array<string> {
  return execFileSync('git', [ 'ls-files' ], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
}

async function main(): Promise<void> {
  const root = repoRoot();
  const repo = buildRepoIndex(root, trackedFiles(root));
  const files = await collectSurface(root, repo.tracked, loadConfig(root).exclude);

  const findings = [];
  for (const file of files) {
    findings.push(...await checkFile(repo, file));
  }

  const report = renderReport(findings, files.length);
  for (const line of report.output) {
    (line.stream === 'err' ? console.error : console.log)(line.text);
  }

  process.exitCode = report.exitCode;
}

void main();
