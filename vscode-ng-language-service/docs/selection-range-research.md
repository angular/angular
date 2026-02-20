# Selection Range Research: Angular LS vs VS Code CSS/HTML/TS

## Scope

This document analyzes how selection ranges are implemented in:

- Angular Language Service (current implementation)
- VS Code CSS language service
- VS Code HTML language service
- TypeScript smart selection (tsserver)
- VS Code editor merge/validation behavior

It then maps what Angular can reuse today, especially for CSS string literals inside Angular templates.

## TL;DR

- Reuse is not only possible, it is already partially present in Angular server for other features.
- `vscode-ng-language-service/server` already depends on `vscode-css-languageservice` and `vscode-html-languageservice` for hover/folding/completions.
- The strongest path is to delegate selection ranges for CSS contexts to CSS LS in the server handler layer, then merge with Angular ranges similarly to VS Code HTML server mode-merging.
- It is not ideal to fully parse CSS token semantics in Angular AST visitor. Keep Angular visitor for Angular semantics, delegate CSS semantics to CSS LS.

## Current Angular Pipeline

### Client middleware

Angular client forwards selection range requests only when file is in Angular project and in supported context.

Reference:

- `vscode-ng-language-service/client/src/client.ts` (`provideSelectionRanges` middleware)

Behavior:

- For HTML files: forwarded.
- For TypeScript files: forwarded only if any cursor position is in Angular decorator field (inline template context).

### Server handler

Reference:

- `vscode-ng-language-service/server/src/handlers/selection_range.ts`

Behavior:

- Calls Angular LS `getSelectionRangeAtPosition` per position.
- Preserves LSP cardinality (`result[i]` for `positions[i]`).
- Uses empty-range fallback at the exact position if TS/Angular has no range.

### Angular LS range builder

Reference:

- `packages/language-service/src/selection_range.ts`

Current design:

- Custom AST visitors (`TmplAst*` + expression visitor).
- Adds synthetic stops (attribute keys/values, call arguments, pipe spans, string inner spans, etc.).
- Explicit containment guard in chain construction (parent must contain child).

## VS Code and LSP Constraints You Must Obey

### Provider output validation in VS Code extension host

Reference:

- `src/vs/workbench/api/common/extHostLanguageFeatures.ts` (`SelectionRangeAdapter`)

Rules:

- Provider must return exactly one chain per input position.
- Every `parent` must contain previous range.
- Violations are rejected as invalid.

### Editor aggregation behavior

Reference:

- `src/vs/editor/contrib/smartSelect/browser/smartSelect.ts` (`provideSelectionRanges`)

Important details:

- VS Code may combine ranges from multiple providers.
- If only one provider exists, word/bracket providers are added.
- Ranges are sorted and de-duplicated by containment/equality.

Implication for Angular:

- You can safely merge multiple sources if containment is preserved.
- Overlapping but non-contained chains cause bad UX and possible dropped steps.

## How CSS LS Does Selection Ranges

References:

- `vscode-css-languageservice/src/services/cssSelectionRange.ts`
- `vscode-css-languageservice/src/test/css/selectionRange.test.ts`

Algorithm:

- Find AST node at offset: `stylesheet.findChildAtOffset(offset, true)`.
- Walk parents and emit `[offset, end]` spans.
- Special case declarations: adds inner `{ ... }` range.
- Build parent chain from outermost to innermost.

Test philosophy:

- Light tests; relies on parser AST correctness.
- Rich coverage for boundary behavior and declaration/value steps.

Implication:

- CSS token/value behavior (e.g. quoted values, declarations, multi-values) is already standardized there.

## How HTML LS Does Selection Ranges

References:

- `vscode-html-languageservice/src/services/htmlSelectionRange.ts`
- `vscode-html-languageservice/src/test/selectionRange.test.ts`

Algorithm:

- Parse HTML node at cursor.
- Add context-sensitive stops:
- tag name
- attribute name
- quoted/unquoted attribute value
- content region between tags
- parent tag/content ranges
- Uses scanner tokenization for attribute-level precision.
- De-duplicates equal adjacent ranges.

Notable behavior:

- Explicitly leaves some cases to default provider (e.g. comments/doctype unhandled in semantic provider).

Implication:

- HTML LS is designed to provide semantic structure; defaults fill generic text behavior.

## How VS Code HTML Server Mixes HTML + Embedded Modes

References:

- `extensions/html-language-features/server/src/modes/selectionRanges.ts`
- `extensions/html-language-features/server/src/modes/languageModes.ts`
- `extensions/html-language-features/server/src/modes/cssMode.ts`
- `extensions/html-language-features/server/src/modes/javascriptMode.ts`

Key pattern:

- Compute HTML range chain at position.
- Compute embedded-mode chain at same position (CSS/JS/TS if active).
- Stitch chains by finding top embedded parent that still sits inside HTML range.
- Attach HTML chain as outer parent.

This is the exact reusable architecture for Angular server selection ranges.

## How TypeScript Smart Selection Works

References:

- `TypeScript/src/services/smartSelection.ts`
- `extensions/typescript-language-features/src/languageFeatures/smartSelect.ts`

Core ideas:

- Position snapping (`positionShouldSnapToNode`) to include end-of-token behavior.
- Synthesized grouping ranges (not only raw AST parents).
- Quote-inside and quote-outside stops for string/template literals.
- Skip empty and duplicate ranges, and ranges not containing original position.

Implication:

- Angular custom visitor should stay focused on Angular-specific synthesized steps.
- For language-specific token semantics (CSS), TS model suggests delegation when possible.

## Why `{'border': '5px solid gold'}` Can Still Fail In Angular Visitor

Short answer: AST traversal alone is not enough; offset mapping and context boundaries matter.

Common failure modes in custom visitor design:

- `sourceSpan` vs source text slicing mismatch (wrong base offset).
- Cursor boundary snap behavior (`<= end` vs `< end`) inconsistent across synthetic ranges.
- Quoted map key/value ranges generated, but token extraction runs against wrong substring window.
- Generated ranges later dropped by containment cleanup if order/span nesting is imperfect.

Observation from current file:

- `visitLiteralMap` and `visitLiteralPrimitive` do attempt key and inner-token handling.
- So the missing behavior is likely not "visitor has no support", but "support is brittle vs spans/mapping".

## Can We "Announce this is CSS string literal" to CSS Provider?

Not as a dedicated LSP primitive. There is no protocol field like "delegate this node to CSS".

Practical way:

- Detect CSS context in server (inline style attribute, `[style]`, `[ngStyle]` map/object expression regions where applicable).
- Build virtual CSS document text and mapped positions.
- Ask CSS LS `getSelectionRanges(...)` for those mapped positions.
- Map ranges back and merge with Angular chain.

This mirrors existing Angular server patterns already used for hover/folding/completions with virtual SCSS/HTML content.

## Embedded CSS Ownership Matrix

This section clarifies what upstream HTML/CSS already handles, and what Angular should own.

| Context                               | Upstream HTML/CSS behavior                                        | Owner for Angular selection ranges                                                  | Reuse status                 |
| ------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| `<style> ... </style>` in HTML        | Treated as embedded CSS by HTML server mode routing               | CSS LS (delegated) + HTML/Angular outer chain                                       | Reusable now                 |
| `style="..."` / `style='...'` in HTML | Treated as embedded CSS attribute value                           | CSS LS (delegated) + HTML/Angular outer chain                                       | Reusable now                 |
| `style=...` unquoted in HTML          | Treated as embedded CSS attribute value                           | CSS LS (delegated) + HTML/Angular outer chain                                       | Reusable now                 |
| `class="..."`                         | Not treated as CSS embedded language                              | Angular/HTML generic ranges only                                                    | Keep custom/non-CSS          |
| Inline template in `.ts` decorator    | Not automatically handled by HTML server as standalone HTML doc   | Angular server must virtualize/delegate explicitly                                  | Needs Angular implementation |
| `[style]="..."` Angular binding expr  | Angular expression, not HTML `style` attribute value token stream | Angular context detection + CSS LS delegation for CSS-like string/object subregions | Needs Angular implementation |
| `[ngStyle]="{...}"` map/object expr   | Angular expression object literal                                 | Angular context detection + CSS LS delegation for CSS-like keys/values              | Needs Angular implementation |

Notes:

- Upstream HTML embedded-language detection maps `style` attribute values to CSS and `on*` attribute values to JavaScript.
- `class` is not treated as CSS in this pipeline.
- For Angular inline templates inside TypeScript, delegation only works if Angular creates virtual embedded docs and maps positions/ranges.

## What Angular Can Reuse Immediately

### Already reusable in repo today

- CSS LS dependency already present in server package:
  - `vscode-ng-language-service/server/package.json`
- Existing virtual content helper patterns already present:
  - `vscode-ng-language-service/server/src/embedded_support.ts`
- Existing CSS LS usage in handlers:
  - `server/src/handlers/hover.ts`
  - `server/src/handlers/folding.ts`
  - `server/src/handlers/completions.ts`

### Reuse targets

1. CSS selection range engine

- Reuse `getSelectionRanges` from `vscode-css-languageservice` for CSS-like subregions.

2. HTML server merge strategy

- Reuse the same parent-chain stitching pattern from VS Code HTML server `modes/selectionRanges.ts`.

3. TS selection design principles

- Keep snapping + synthetic grouping in Angular visitor only where Angular semantics are unique.

## Recommended Architecture for Angular Selection Ranges

### Recommended split of responsibilities

- Angular LS visitor (`packages/language-service/src/selection_range.ts`):
  - Angular template semantics only.
  - Structural element/attribute/block boundaries.
  - Minimal expression grouping where language-neutral.

- Server handler (`vscode-ng-language-service/server/src/handlers/selection_range.ts`):
  - Context detection for embedded CSS regions.
  - Delegation to CSS LS selection ranges for those regions.
  - Merge chain with Angular range chain preserving containment.

### Why server layer (not LS layer)

- Server already owns `vscode-css-languageservice` and virtual-doc logic.
- Avoids introducing VS Code CSS dependency into core LS package.
- Keeps Angular LS portable and narrower in scope.

## Suggested TDD Plan

1. Add failing server tests (not giant user-style templates)

- Borrow concise patterns from upstream CSS/HTML selection-range tests:
  - quoted value cursor
  - property name cursor
  - value token cursor
  - boundary cursor near delimiters

2. Implement CSS delegation path in server handler

- Only for recognized CSS contexts.
- Preserve index alignment and empty fallback.

3. Add merge containment tests

- Ensure each parent contains child after merge.
- Ensure no disjoint parent insertion.

4. Reduce bloaty tests

- Replace large user-copied fixture with several focused fixtures.
- Keep one realistic integration fixture if necessary.

## Reusable Components Checklist

Use this checklist during implementation.

### Reuse 1:1 (preferred)

- [ ] Chain stitching pattern from VS Code HTML server selection ranges.
- [ ] LSP cardinality/index alignment fallback behavior (already in Angular server handler).
- [ ] Strict parent-contains-child invariant checks.
- [ ] Focused test style from CSS/HTML/TS upstream suites.

### Reuse with adaptation

- [ ] Embedded-document shaping for CSS attribute-like fragments (`prefix/suffix` + whitespace-preserving mapping).
- [ ] TS smart-selection principles (snap, skip-empty, skip-duplicate, contain-cursor) applied to Angular-owned ranges.
- [ ] Context detection for Angular binding cases (`[style]`, `[ngStyle]`) mapped into CSS-delegation windows.

### Do not reuse directly

- [ ] Full TypeScript `smartSelection.ts` algorithm for template AST traversal.
- [ ] HTML LS scanner logic as a drop-in replacement for Angular expression AST navigation.

## Consolidated Execution Plan

This is the plan to follow after research approval.

### Phase 0: Lock scope

Goal:

- Delegate CSS semantics where context is truly CSS-like.
- Keep Angular visitor responsible for Angular structure only.

Deliverables:

- Finalized context matrix (this doc).

### Phase 1: Add failing tests (TDD red)

Target files:

- `vscode-ng-language-service/server/src/tests/selection_range_spec.ts`
- `packages/language-service/test/selection_range_spec.ts` (only if Angular-owned behavior changes)

Test cases (small fixtures):

- `style="color: red"` cursor in `red` (delegated CSS chain expected).
- `style="font-family: 'Courier New'"` cursor inside quoted value.
- `[style]` binding with CSS-like string literal token stop.
- `[ngStyle]` map with key and value cursor positions.
- Multi-position request cardinality/index alignment.
- Parent containment invariant for every chain.

Exit criteria:

- New tests fail for expected reasons before implementation.

### Phase 2: Implement delegation + merge (green)

Target files:

- `vscode-ng-language-service/server/src/handlers/selection_range.ts`
- Supporting helper(s) under `vscode-ng-language-service/server/src/` (new helper file if needed)

Implementation steps:

- Detect CSS-delegation contexts.
- Build virtual CSS content and stable offset mapping.
- Call CSS LS `getSelectionRanges` for delegated positions.
- Convert delegated chain back to original document coordinates.
- Merge delegated chain with Angular chain using VS Code HTML-server-style stitching.
- Preserve fallback empty ranges where no chain exists.

Exit criteria:

- Phase 1 tests pass.
- Existing selection-range tests remain green.

### Phase 3: Simplify Angular AST ownership

Target file:

- `packages/language-service/src/selection_range.ts`

Steps:

- Remove/minimize CSS-token-specific heuristics that are now delegated.
- Keep Angular structural and expression-generic semantics.
- Ensure no regression for non-CSS template expressions.

Exit criteria:

- No duplicated/conflicting CSS semantics between LS and server handler.

### Phase 4: Regression and quality gates

Validation:

- Run focused selection-range targets first.
- Run broader language-service and server test targets.
- Verify no containment/cardinality failures.

Result:

- Stable smart select for CSS contexts without over-engineering Angular AST visitor.

## Implementation Tracking Checklist

- [ ] Phase 0 approved
- [ ] Phase 1 tests added (red)
- [ ] Phase 2 delegation implemented (green)
- [ ] Phase 3 AST cleanup completed
- [ ] Phase 4 regressions clean
- [ ] Bloaty fixture removed/replaced
- [ ] Final doc updated with any deviations

## Execution Outcomes (Current)

Implemented:

- Added server-side HTML selection-range delegation path in:
  - `vscode-ng-language-service/server/src/handlers/selection_range.ts`
- Delegation is applied conservatively:
  - Angular chain remains fallback/default.
  - Delegated HTML chain is preferred only when its innermost range is strictly more specific at cursor position.
  - Cardinality/index alignment fallback is preserved.
- Added server test coverage:
  - `vscode-ng-language-service/server/src/tests/selection_range_spec.ts`
  - New assertion verifies delegated HTML/CSS-derived range behavior for style attribute content.
- Added targeted delegated token stop for `[style.<prop>]` string-literal content (e.g. `[style.color]="'rgb(...)'"`) in server handler selection-range flow.
- Added delegated token stops for `[style]` / `[ngStyle]` object-literal key/value string subregions in server handler selection-range flow.
- Added hardening coverage for:
  - double-quoted object-literal keys/values,
  - negative non-style binding controls (ensuring CSS delegation does not trigger outside style contexts).
- Reduced bloat in LS tests by removing one oversized user-derived fixture.
- Updated LS expectation for `[style.color]` string literal to avoid asserting CSS token-level granularity in core LS test.

Validation run:

- `pnpm bazel test //vscode-ng-language-service/server/src/tests:test --test_output=errors`
- `pnpm bazel test //packages/language-service/test:test --test_output=errors`

Current deviation from ideal end-state:

- This pass establishes reusable server delegation infrastructure and keeps core LS from overcommitting to CSS token semantics.
- Further hardening may still be useful for edge cases (nested/complex object expressions beyond quoted key/value patterns).

## What To Remove / Minimize

- Avoid expanding custom CSS tokenization in Angular expression visitor over time.
- Keep custom literal-token logic minimal for non-CSS expressions.
- For CSS strings/maps, prefer CSS LS range semantics.

## Risk Notes

- Position mapping between TS/template offsets and virtual CSS doc offsets is the critical correctness risk.
- Merge order must preserve strict containment to satisfy VS Code adapter checks.
- Multi-cursor requests must preserve 1:1 cardinality and index order.

## Concrete Next Reuse Candidate

First candidate to implement:

- In `server/src/handlers/selection_range.ts`, detect inline style contexts (same family as hover/completions style detection), compute CSS LS ranges, then chain them under/over Angular ranges using HTML-server-like parent stitching.

This gives immediate value for CSS string literals while avoiding over-engineering the Angular AST visitor.

## Source References

Angular repo:

- `packages/language-service/src/selection_range.ts`
- `vscode-ng-language-service/client/src/client.ts`
- `vscode-ng-language-service/server/src/handlers/selection_range.ts`
- `vscode-ng-language-service/server/src/tests/selection_range_spec.ts`
- `vscode-ng-language-service/server/src/handlers/hover.ts`
- `vscode-ng-language-service/server/src/handlers/folding.ts`
- `vscode-ng-language-service/server/src/handlers/completions.ts`

Upstream:

- TypeScript smart selection:
  - https://raw.githubusercontent.com/microsoft/TypeScript/main/src/services/smartSelection.ts
- VS Code editor smart select merge:
  - https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/editor/contrib/smartSelect/browser/smartSelect.ts
- VS Code extension host validation:
  - https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostLanguageFeatures.ts
- CSS LS selection ranges:
  - https://raw.githubusercontent.com/microsoft/vscode-css-languageservice/main/src/services/cssSelectionRange.ts
  - https://github.com/microsoft/vscode-css-languageservice/blob/main/src/test/css/selectionRange.test.ts
- HTML LS selection ranges:
  - https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/main/src/services/htmlSelectionRange.ts
  - https://github.com/microsoft/vscode-html-languageservice/blob/main/src/test/selectionRange.test.ts
- VS Code HTML server mode merge:
  - https://raw.githubusercontent.com/microsoft/vscode/main/extensions/html-language-features/server/src/modes/selectionRanges.ts
