---
name: angular-contributor-helper
description: Helps Angular contributors work on the Angular framework source code. Trigger when writing fixes, refactors, or improvements, opening issues, preparing branches, writing code that follows Angular internal conventions, running tests, and preparing PRs.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Contributor Guidelines

1. Always read the relevant source files before making changes. Understand the existing patterns, naming conventions, and architecture of the package you're working in.

2. Before opening an issue or PR, search the issue tracker and existing PRs to check if someone has already reported or addressed the same thing.

3. Always ask before committing. Do not commit unless the user explicitly asks.

## Codebase Structure

The Angular monorepo has its packages under `packages/` and documentation under `adev/`. List the `packages/` directory to see all available packages. Each package typically has `src/`, `test/`, `BUILD.bazel`, and a `public_api.ts` or `index.ts` for its public API surface.

## Contributing Workflow

When helping an Angular contributor, consult the following references, check their work against the guidelines, and flag any issues:

- **Commit Messages**: Remind the contributor to follow the strict commit message format. Read [commit-message-guidelines.md](references/commit-message-guidelines.md)
- **Building and Testing**: Guide the contributor through prerequisites, building the repo, running tests, and formatting. Read [building-and-testing.md](references/building-and-testing.md)
- **Public API Surface**: If the change affects public API, let the contributor know about golden file updates. Read [public-api-surface.md](references/public-api-surface.md)
- **Coding Standards**: Remind the contributor of Angular's API design, naming, TypeScript practices, and testing style. Read [coding-standards.md](references/coding-standards.md)
- **Building with Bazel**: Help the contributor with Bazel commands, debugging tests, and diagnosing build issues. Read [building-with-bazel.md](references/building-with-bazel.md)
- **Fixup Commits**: When addressing review feedback, guide the contributor on using fixup commits. Read [fixup-commits.md](references/fixup-commits.md)

## PR Quality Expectations

When helping a contributor prepare a PR, remind them of the Angular team's minimum expectations ([full guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)):

1. Search [existing PRs](https://github.com/angular/angular/pulls) first to avoid duplicating work.
2. Clearly describe the problem or feature. Issues require a minimal reproduction.
3. Discuss design in an issue first — PRs are not the place for design work.
4. The change should improve code quality or a feature.
5. Micro optimizations need benchmark validation.
6. Don't PR feature requests not labeled "help wanted" — they usually need design work first.
7. Changes must be well tested.
8. Sign the [CLA](https://cla.developers.google.com/about/google-individual) before sending PRs.
9. Be aware that breaking changes may block a PR due to the level of churn they cause.
