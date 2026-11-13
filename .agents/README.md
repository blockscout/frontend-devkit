# Agent configuration

Every agent document in home has one source here. Claude Code and Cursor reach it through symlinks.

| Path | What it is | Reached by |
|---|---|---|
| `AGENTS.md` | Always-loaded instructions | `.claude/CLAUDE.md`; Cursor loads it only from the root, so a root `AGENTS.md` link too |
| `rules/*.md` | Rules, scoped to file patterns | `.claude/rules/`, and one `.cursor/rules/<name>.mdc` per rule |
| `skills/*/SKILL.md` | Workflows loaded on invocation | `.claude/skills/` |

## The rules contract

Claude Code and Cursor discover rules differently, so a rule file carries frontmatter for both. Each tool
ignores the keys it does not recognise.

```yaml
---
description: what this rule covers
paths:                        # Claude Code — YAML list of globs
  - "**/*.{ts,tsx}"
globs: "**/*.ts,**/*.tsx"     # Cursor — the same patterns, comma-separated in one string
alwaysApply: false
---
```

Keep `paths` and `globs` in step by hand. Nothing warns when they drift.

- **A new rule needs a new Cursor symlink.** Cursor reads only `.cursor/rules/*.mdc`. Claude Code needs no
  per-file step, because `.claude/rules` links the whole directory.

  ```bash
  ln -s "../../.agents/rules/<name>.md" ".cursor/rules/<name>.mdc"
  ```

- **A rule with no `paths` loads at launch, in every session.** A document meant to be read on demand sits
  outside `rules/`, with a pointer to it from `AGENTS.md` or a skill.
