---
trigger: always_on
---

This is the source code for the Angular framework. This guide outlines standard practices for AI agents working in this repository.

## Environment

- Use `pnpm` for package management.
- Use `pnpm bazel test //target` to run tests.

## Key Documentation

- [Building and Testing](contributing-docs/building-and-testing-angular.md): definitive guide for running targets.
- [Coding Standards](contributing-docs/coding-standards.md): style guide for TypeScript and other files.
- [Commit Guidelines](contributing-docs/commit-message-guidelines.md): format for commit messages and PR titles.

## Testing

- When writing tests, write them in the style of act, wait, assert.
- To keep tests fast, minimize the need for waiting:
  - Use `useAutoTick()` (from `packages/private/testing/src/utils.ts`) to fast-forward time via the mock clock.
  - Use `TestBed.tick()` to flush rendering & effects.
- When waiting is necessary, use real async tests (Use real async tests `it('...', async () => { ... })`) along with:
  - Use `await timeout(ms)` (from `packages/private/testing/src/utils.ts`) to wait a specific number of milliseconds.
  - Use `await fixture.whenStable()` to wait for framework stability.

## Pull Requests

- Use the `gh` CLI (GitHub CLI) for creating and managing pull requests.
