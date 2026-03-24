# PR Review Task List: https://github.com/angular/angular/pull/67830

## Context

PR Title: feat(core): implement Angular Hydration within Document Fragments
Description: Introduces `withHydrationBoundary` API and `renderApplicationParts` API to support Astro Islands and non-destructive fragment hydration.

## Focus Areas

- [ ] **Commit Messages**: Do they explain _why_? (Check `git log main..HEAD`)
- [ ] **Code Cleanliness**: Is it readable and maintainable?
- [ ] **Performance**: Any negative impact on runtime or bundle size? (Check hydration hot paths).
- [ ] **Testing**: Ensure all new logic has comprehensive tests, including edge cases. Ensure test coverage is adequate.
- [ ] **API Design**: `withHydrationBoundary` and `renderApplicationParts` well-designed and documented?
- [ ] **Payload Size**: Impact of changes on the final client payload size?

## File Review Progress

- [x] `packages/core/src/hydration/api.ts`
- [x] `packages/core/src/hydration/node_lookup_utils.ts`
- [x] `packages/core/src/hydration/tokens.ts`
- [x] `packages/core/src/hydration/utils.ts`
- [x] `packages/core/test/hydration/marker_spec.ts`
- [x] `packages/platform-browser/src/hydration.ts`
- [x] `packages/platform-browser/src/platform-browser.ts` (Found missing export for `withHydrationBoundary`!)
- [x] `packages/platform-server/src/platform-server.ts`
- [x] `packages/platform-server/src/platform_state.ts`
- [x] `packages/platform-server/src/utils.ts` (Found duplicated BEFORE_APP_SERIALIZED logic)
- [x] `packages/platform-server/test/hydration_utils.ts`
- [x] `packages/platform-server/test/render_spec.ts`

## Notes and Findings

- **API Export**: `withHydrationBoundary` was missing from `packages/platform-browser/src/platform-browser.ts` exports. _Fixed this locally by adding the export._
- **Code Duplication**: `renderApplicationPartsInternal` and `renderInternal` duplicated the `BEFORE_APP_SERIALIZED` execution loop heavily. _Fixed this locally by refactoring it into a new helper function `runBeforeAppSerializedCallbacks`._
- **Test Coverage**: While `marker_spec.ts` tests the boundary SSR markup correctly, there aren't tests confirming that the actual hydration behaves correctly and honors the boundaries (e.g. `gatherDeferBlocksCommentNodes` limiting its scope).
- **Test Coverage**: `renderApplicationParts` lacks edge-case tests (e.g. if the document is missing `head` or `body` and hits the fallbacks in `PlatformState.renderToParts()`).
