# frontend-devkit

Agent skills, rules and developer tools shared by Blockscout frontend repositories.

**Status: prototype.** See [blockscout/frontend#3882](https://github.com/blockscout/frontend/issues/3882).
The layout and contents may change or the repository may be removed.

| Path | What it is |
|---|---|
| `skills/` | Agent skills, one folder per skill |
| `rules/` | Coding rules with frontmatter for Claude Code (`paths`) and Cursor (`globs`) |
| `tools/` | Developer tools run from a consumer repository |

A consumer mounts this repository as a read-only git submodule at `devkit/` and symlinks the items
it uses into its own agent config. Changes are made here, by pull request, never inside a consumer.

## Writing a shared file

A shared skill or rule is read inside a consumer, from its real location under `devkit/`:

- Refer to another shared file by relative path (`./adr.md`).
- Refer to a file the consumer owns by its path from the consumer's root (`.agents/GLOSSARY.md`).
  That path is then a requirement on every consumer that links the file in; the consumer's
  `doc-links` run fails when it is missing.
