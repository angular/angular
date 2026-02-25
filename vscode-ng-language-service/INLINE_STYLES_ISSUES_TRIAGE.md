# Inline Styles Issues Triage (`area: vscode-extension`)

Date: 2026-02-24
Source query: open Angular issues with label `area: vscode-extension`

## Scope

This document focuses on open issues directly related to inline styles support in the VS Code extension, and adjacent issues that share the same embedded-content/scanner architecture.

## Directly related to inline styles

| Issue                                                     | Title                                                | Relation to Inline Styles                                             | Can we fix in extension? | Notes / Proposed approach                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#65521](https://github.com/angular/angular/issues/65521) | Syntax highlighting for inline styles other than CSS | Core issue for inline styles language handling (`css/scss/less/styl`) | **Partial**              | We can improve provider-side features (symbols/color/definition/selection), but TextMate syntax highlighting is constrained by static grammar mapping and marked `blocked on upstream`. Practical path: keep provider bridges robust; add optional user override for style language; document limitation. |

## Strongly adjacent (shared embedded/scanner infrastructure)

| Issue                                                     | Title                                                                | Why it matters for inline styles work                                                                                                     | Can we fix in extension? | Notes / Proposed approach                                                                                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#65516](https://github.com/angular/angular/issues/65516) | String interpolation before inline template breaks language features | Same scanner/token boundary logic in `embedded_support.ts`; robustness here affects style/template region detection reliability           | **Yes**                  | Replace scanner heuristics with TS AST-based region extraction for all embedded contexts where possible. Add regression tests with preceding template literals/interpolations. |
| [#65493](https://github.com/angular/angular/issues/65493) | Inline template Template Literals is not highlighted properly        | Indicates embedded tokenization instability around nested template literals; similar class of problems can affect style literals          | **Partial**              | Provider features can be made robust via AST + virtual docs, but full highlight behavior remains tied to grammar limitations.                                                  |
| [#65494](https://github.com/angular/angular/issues/65494) | Template literals cause malfunction to quick suggestions             | Same root class: context detection in TS literals breaks suggestion routing                                                               | **Yes**                  | Strengthen context detection with AST and avoid scanner-only assumptions.                                                                                                      |
| [#65500](https://github.com/angular/angular/issues/65500) | Highlighting within inline templates                                 | Highlights mismatch between file language (`typescript`) and embedded language behaviors; same architectural limitation applies to styles | **Partial**              | Similar to #65521: some behavior can be bridged provider-side; full editor language-mode parity is limited by VS Code grammar model.                                           |
| [#65508](https://github.com/angular/angular/issues/65508) | Template fold variable break                                         | Folding in embedded template regions; style folding would rely on same virtual-region reliability                                         | **Yes**                  | Reuse robust region mapping and delegate folding provider on virtual docs where supported.                                                                                     |

## Related config issue that affects style-language resolution

| Issue                                                     | Title                                           | Relation                                                                                                              | Can we fix in extension? | Notes / Proposed approach                                                                                                                                        |
| --------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#65509](https://github.com/angular/angular/issues/65509) | Support angular.json configuration for tsconfig | Project resolution quality impacts style-language policy when trying to infer inline style mode from workspace config | **Yes**                  | Improve project mapping from file -> effective project config; do not assume single root `tsconfig.json`. Useful for any future style-language selection policy. |

## What we can realistically ship in `lsp-inline-styles-support`

1. Robust provider bridges for inline styles in TS files:

- document symbols
- definition
- selection ranges
- color provider + color edit propagation

2. Region detection hardening:

- prefer AST extraction over scanner-only heuristics for embedded regions
- add regressions around template literals/interpolation noise

3. Explicitly document known limitation:

- inline style syntax highlighting language switching remains partially blocked by upstream VS Code grammar capabilities.

## Suggested sequencing

1. Land provider reliability + tests (branch `lsp-inline-styles-support`).
2. Land scanner/AST robustness fixes that reduce false negatives in embedded detection.
3. Track `#65521` as partial: provider side improved now; grammar parity deferred/upstream-dependent.
