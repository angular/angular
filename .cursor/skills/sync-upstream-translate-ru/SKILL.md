---
name: sync-upstream-translate-ru
description: >-
  Sync angular-docs.ru fork with upstream angular/angular and re-translate
  adev docs/UI to Russian. Use when the user asks to подлить upstream, sync
  with upstream, merge upstream/main, or translate Angular docs to Russian
  after an upstream sync.
---

# Sync upstream + Russian translation (angular-docs.ru)

## Context

This repo is a fork of `angular/angular` for [angular-docs.ru](https://angular-docs.ru).

| Remote | URL |
|--------|-----|
| `origin` | `https://github.com/misha98857/angular-docs.ru.git` |
| `upstream` | `https://github.com/angular/angular.git` |

Translation is **in-place** (overwrite English markdown/UI strings). Not Angular i18n.

## Phase A — Merge upstream

```bash
git fetch upstream main
git checkout -b feat/sync-upstream-YYYY-MM-DD main
git merge upstream/main
```

### Conflict resolution

| Path | Resolution |
|------|------------|
| `packages/`, `integration/`, `devtools/`, `vscode-*`, `goldens/`, `scripts/`, `tools/`, `.github/`, root `package.json`, lockfiles, Bazel | `--theirs` (upstream) |
| `README.md`, `CONTRIBUTING.md` | `--ours` (Russian fork docs) |
| `adev/src/content/**` | `--theirs`, then full re-translate (Phase B) |
| `adev/src/app/`, `adev/shared-docs/` | `--theirs`, then restore RU UI strings (Phase C) |

Do **not** hand-merge Russian prose with English edits in `.md` files.

Commit the merge before translating.

## Phase B — Re-translate markdown

Follow `TRANSLATION_PLAN.md` + `GLOSSARY_RU.md`.

**Priority order:** `introduction` → `ai` → `guide` → `best-practices` → `tutorials` → `ecosystem` → `tools` → `events` → `reference`

**Skip:** `adev/src/content/examples/**` (keep English code), auto-generated `aria/*.json`, `cdk/*.json`, API reference JSON.

### Rules (must)

1. Overwrite entire file with Russian translation.
2. Never translate code fences or inline `` `code` ``.
3. Preserve YAML frontmatter keys/structure; translate display titles if present.
4. Keep internal link paths English (`essentials/components`).
5. Preserve custom tags: `<docs-*>`, attributes, HTML.
6. Headings: Russian text + English anchor `{#english-id}` on h2/h3. **Do not** put `{#anchor}` on h1 (renders visibly).
7. `<docs-step title="...">` titles stay **English** (needed for anchor generation).
8. **Alert markers MUST stay English in markdown** (`NOTE:`, `TIP:`, `IMPORTANT:`, `HELPFUL:`, `CRITICAL:`, `TODO:`, `QUESTION:`, `SUMMARY:`, `TLDR:`). `docs-alert.mts` matches only EN keys; RU labels (ПРИМЕЧАНИЕ/СОВЕТ/…) are applied automatically. Never write `ПРИМЕЧАНИЕ:` / `СОВЕТ:` / Title Case `Note:` in source.
9. Tone: «вы» lowercase or impersonal; follow glossary.

### Parallelism

Use multiple subagents with model `grok-4.5-fast-xhigh` (`subagent_type: generalPurpose`) by section/subdirectory. Each agent: read EN file → write full RU file. Validate a sample after each batch (no conflict markers, anchors present, code untouched).

## Phase C — Russian UI strings

Restore user-facing Russian only; keep upstream structure/logic.

| Area | Files |
|------|-------|
| Sidebar labels | `adev/src/app/routing/navigation-entries/index.ts` (`label` only) |
| Primary nav | `adev/src/app/core/layout/navigation/navigation.component.html` |
| Home / footer | `adev/src/app/features/home/**`, `adev/src/app/core/layout/footer/**` |
| Search | `adev/shared-docs/components/search-dialog/**` |
| Alerts / badges | docs-alert transforms, navigation-list badges (NOTE→ПРИМЕЧАНИЕ, etc.) |

Reference previous RU labels from `feat/sync-with-upstream` or `main` when structure matches; adapt to new upstream entries.

## Phase D — Validate

1. No `<<<<<<<` markers left.
2. Spot-check anchors and nav labels.
3. Prefer `pnpm adev` / docs build if environment allows.

## Commits

Conventional commits, Russian-friendly messages, e.g.:

- `feat: sync with upstream and translate documentation to Russian`
- `feat: translate navigation sidebar labels to Russian`
- `feat: translate home page, footer, and restore Russian nav labels`

Branch: `feat/sync-upstream-YYYY-MM-DD` (or Jira key if provided).
