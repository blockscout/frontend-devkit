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
