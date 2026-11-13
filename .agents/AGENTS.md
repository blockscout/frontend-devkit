# Home repo for the Blockscout frontend repositories

Agent sessions for the Blockscout frontend repositories start here. Home holds the shared skills and rules.
The project repositories, the **children**, are cloned inside it and gitignored. `children.txt` lists them.

## Work in the active child

The **active child** is the child a request is about:

- In a task worktree, it is the only child inside.
- Otherwise, infer it from the request: a path, a pull request, an issue, a repository named. If the request
  does not settle it, ask.

A root-relative path in a skill, a rule or a request names a file in the active child. A skill's glossary
path resolves to `<child>/.agents/GLOSSARY.md`. A path meant for home itself says so. Run `git`, `gh` and
package-manager commands from the active child's directory.

The active child sets the default, not a boundary. When a skill names another child or a folder outside
home, as `resolve-config-request` does with the `frontend-configs` checkout, use it as named.

Before the first change in a child, read a file inside it. That loads the child's own instructions, and its
rules load for the files they match.

## Per-directory context

- `tools/doc-links/` — the doc-link checker.

## Editing this instruction set

Before changing anything under `.agents/`, read `./README.md`. It owns the provider symlinks and the rules
contract.
