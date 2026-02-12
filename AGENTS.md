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

- Instead of `fixture.detectChanges()` or `TestBed.flushEffects()` use the following APIs to flush/wait as appropriate:
  - `TestBed.tick()` (flush rendering & effects)
  - `await fixture.whenStable()` (wait for framework stability)
  - Implement `await delay(ms)` if needed to wait for time increments:
    ```
    function delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    ```

- If you need to test async behavior:
  - Use real async tests `it('...', async () => { ... })`
  - Keep tests fast, if artificial delays are needed use the **absolute minimum delay necessary** to verify the behavior (e.g. 1ms)

## Pull Requests

- Use the `gh` CLI (GitHub CLI) for creating and managing pull requests.
