## 21.1.0 (2026-01-12)

- fix(vscode-extension): convert enum member kind in completions correctly ([50674f8c28](https://github.com/angular/angular/commit/50674f8c28c970e6a9cfe222f9f55bace4e16321))

<!-- CHANGELOG SPLIT MARKER -->

## 21.0.1 (2025-12-17)

- fix(language-service): Prevent language service from crashing on suggestion diagnostic errors ([5047be4bc1](https://github.com/angular/angular/commit/5047be4bc1c6f6016263703c743f8033f669f0ee))
- fix(language-service): avoid interpolation highlighting inside @let ([e0694df3ec](https://github.com/angular/angular/commit/e0694df3eccae3d31a4ea537dffe1db1368ef34a))
- fix(vscode-extension): Show warning if multiple versions of Angular are detected in workspace ([a41b0ce025](https://github.com/angular/angular/commit/a41b0ce02528c27e4804bcd39a61c932503bae61))

<!-- CHANGELOG SPLIT MARKER -->

## 21.0.0 (2025-11-18)

- fix(language-service): address potential memory leak during project creation ([89095946cf](https://github.com/angular/angular/commit/89095946cff051c5613b8f54ec722d08cd47c709))
- fix(language-server): fix directory renaming on Windows ([3f7111a9c3](https://github.com/angular/angular/commit/3f7111a9c38c6fd00af705a3045f2909f47b505b))

# 20.3.3

| Commit                                                                                           | Type | Description                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| [eb74ece723](https://github.com/angular/angular/commit/3ef2edc0765d523928454c1c8d6e49eb74ece723) | fix  | build: update typescript dependency for vscode-ng-language-service ([#64912](https://github.com/angular/angular/pull/64912)) |

# 20.3.2

This release includes internal-only changes to packaging to fix an issue with the 20.3.1 release.

# 20.3.1

This release upgrades `@angular/language-service` to v21.0.0-rc.0

This release includes several internal build and repository structure changes.

# 20.3.0

This release upgrades `@angular/language-service` to v20.3.5

# 20.2.2

This release upgrades `@angular/language-service` to v20.2.0-rc.1.

| Commit                                                                                           | Type | Description                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------- |
| [c81e345e72](https://github.com/angular/angular/commit/c81e345e726b5b281621159c789e6d80a9f328e2) | feat | support auto-import for attribute completions ([#62797](https://github.com/angular/angular/pull/62797))               |
| [4aa120ac00](https://github.com/angular/angular/commit/4aa120ac000a569a29e45e9c6db9e4f32c61d183) | fix  | error when type checking host bindings of generic directive ([#63061](https://github.com/angular/angular/pull/63061)) |

# 20.2.1

This release upgrades `@angular/language-service` to v20.2.0-next.6.

| Commit                                                                                           | Type | Description                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| [812463c563](https://github.com/angular/angular/commit/812463c5636effe5bd5ba5c7c7fc65c3cc08d047) | fix  | Ignore diagnostics on ngTemplateContextGuard lines in TCB ([#63054](https://github.com/angular/angular/pull/63054))               |
| [45b030b5ce](https://github.com/angular/angular/commit/45b030b5ce1e116a88fe1c2fe133f654fb1f66c5) | fix  | prevent dom event assertion in TCB generation on older angular versions ([#63053](https://github.com/angular/angular/pull/63053)) |

# 20.2.0

This release upgrades `@angular/language-service` to v20.2.0-next.5.

- [feat(language-service): support to report the deprecated API in the template](https://github.com/angular/vscode-ng-language-service/pull/2192)

# 20.1.1

- [fix(server): Remove custom semantic tokens to fix regression in file highlighting](https://github.com/angular/vscode-ng-language-service/pull/2197)

# 20.1.0

This release upgrades `@angular/language-service` to v20.1.0-rc.0.

- [feat(language-server): Support semantic tokens for components in templates](https://github.com/angular/vscode-ng-language-service/commit/1c0fd4e94daf3d082c0f629d9ec0e32ff290b354)
- [feat(language-server): Support external modules in autocomplete](https://github.com/angular/vscode-ng-language-service/commit/a39e01df7d474b1495ea93dd64c26880c54ec4de)
- [feat(language-service): Quick fix missing required inputs](https://github.com/angular/angular/commit/5d2e85920e714560e8d06bfb9c41d9312eeaae3b)

# 20.0.1

This release upgrades `@angular/language-service` to v20.0.0-rc.2.

- [fix(language-server): fix Always retain prior results for all files](https://github.com/angular/angular/pull/61487)

# 20.0.0

This release upgrades `@angular/language-service` to v20.0.0-rc.0.

- [feat(language-server): support type checking of host bindings](https://github.com/angular/angular/pull/60267)

# 19.2.4

This release upgrades `@angular/language-service` to v19.2.7.

- [fix(language-service): Do not provide element completions in end tag](https://github.com/angular/angular/commit/a22b13f99041eb6931471aaa81391f9ab0ad7c6d)
- [fix(language-service): Ensure dollar signs are escaped in completions](https://github.com/angular/angular/commit/b9cf414790f5217cd5c73f7520a11031bde6c864)
- [fix(language-server): Do best-effort to initialize composite project](https://github.com/angular/vscode-ng-language-service/commit/f0c8831c1d66c13a48deae1dd4abe636825a8676)

# 19.2.3

This release upgrades `@angular/language-service` to v19.2.5.

- [fix(language-service): Produce fatal diagnostic on duplicate decorated properties](https://github.com/angular/angular/commit/f4c4b10ea8dc263c30d1051a83a72486344d81e4)
- [fix(language-service): Update adapter to log instead of throw errors](https://github.com/angular/angular/commit/ea62a4f3172d0618a33e8e95b49e133cfee6b15d)
- [fix(syntaxes): variable token for @let binding](https://github.com/angular/vscode-ng-language-service/commit/0aa2aa572dedcad4c5fc3c6825227396f4e99f21)
- [fix(syntaxes): keyword token for track](https://github.com/angular/vscode-ng-language-service/commit/8c84410f61ed87e261a83458af10af18cbf669a9)
- [fix(syntaxes): Semicolons not tokenized](https://github.com/angular/vscode-ng-language-service/commit/39057fc2dbb37125778fb2c5c517c661f9399996)

# 19.2.2

This release upgrades `@angular/language-service` to v19.2.4.

- Bumps `@angular/language-server` to use the latest language-service version of Angular.
- [fix: report more accurate diagnostic for invalid import](https://github.com/angular/angular/commit/aa8ea7a5b227913e3f15270dac48479481c47f9a)

# 19.2.1

This release upgrades `@angular/language-service` to v19.2.2.

- [feat(syntaxes): support template literals (#2152)](https://github.com/angular/vscode-ng-language-service/commit/de5d9650caa3a9de1b50e9815acb2a631f14ab3d)
- [Updates the bundled version of the Angular compiler to fix enum resolution errors](https://github.com/angular/angular/commit/4fa5d18e5a57be03979b73be03a3d280c6dc0cb5)
- [feat: forward tags for quick info from type definitions](https://github.com/angular/angular/commit/3f0116607dc3ad7e31cb4d895a56094f77c82f5d)

# 19.2.0

This release upgrades `@angular/language-service` to v19.2.0.

- [fix(language-service): provide correct rename info for elements (#60088)](https://github.com/angular/angular/pull/60088)

# 19.1.0

This release upgrades `@angular/language-service` to v19.1.4.

- [fix: replace the closing symbol for inputs/outputs (#2142)](https://github.com/angular/vscode-ng-language-service/pull/2142)
- [fix(extension): Fix grouping of Angular commands into submenu (#2136)](https://github.com/angular/vscode-ng-language-service/pull/2136)

# 19.0.4

This release upgrades `@angular/language-service` to v19.0.6.

- [fix(compiler-cli): consider pre-release versions when detecting feature support #59061](https://github.com/angular/angular/pull/59061)

# 19.0.3

This release upgrades `@angular/language-service` to v19.0.1.

- [Fixes for the unused standalone imports](https://github.com/angular/angular/pull/58719)
- [Improved diagnostics for `host` binding issues](https://github.com/angular/angular/pull/58870)

# 19.0.2

This release upgrades `@angular/language-service` to v19.0.0-rc.3.

- [Better diagnostics for unused standalone imports](https://github.com/angular/angular/commit/9bbb01c85e763b0457456a2393a834db15008671)
- [Migration fixes for the signal input and queries code actions](https://github.com/angular/angular/pull/58581)

# 19.0.1

- **fix**: [improve detection of Angular core version in monorepo setup](https://github.com/angular/vscode-ng-language-service/commit/6692c40500cabe7f1fae9cc12e6298946a2e37ee)

# 19.0.0

This release upgrades `@angular/language-service` to v19.0.0-rc.1.

- **feat**: Code refactoring action to migrate `@Input` to signal inputs.
  - https://v19.angular.dev/reference/migrations/signal-inputs
- **feat**: Code refactoring action to migrate decorator queries to signal queries.
  e.g. `@ViewChild` to `viewChild()`.
  - https://v19.angular.dev/reference/migrations/signal-queries

To use any of the new code refactoring actions, click on an input or query, and wait for
the code refactoring lightbulb to appear. You can also click on the class header to update
inputs or queries for the full class!

# 19.0.0-next.0

This release upgrades `@angular/language-service` to v19.0.0-next.6.

| Commit                                                                                                              | Type | Description                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| [8da9fb49b5](https://github.com/angular/angular/commit/8da9fb49b54e50de2d028691f73fb773def62ecd)                    | feat | add code fix for unused standalone imports ([#57605](https://github.com/angular/angular/pull/57605))                     |
| [1f067f4507](https://github.com/angular/angular/commit/1f067f4507b6e908fe991d5de0dc4d3a627ab2f9)                    | feat | add code reactoring action to migrate `@Input` to signal-input ([#57214](https://github.com/angular/angular/pull/57214)) |
| [56ee47f2ec](https://github.com/angular/angular/commit/56ee47f2ec6e983e2ffdf59476ab29a92590811e)                    | feat | allow code refactorings to compute edits asynchronously ([#57214](https://github.com/angular/angular/pull/57214))        |
| [6ec0c6bcee](https://github.com/angular/vscode-ng-language-service/commit/7c1330694cc50a166f45d48641c2e06ec0c6bcee) | feat | Allow specific diagnostics to be suppressed ([#57675](https://github.com/angular/angular/pull/57675))                    |

# 18.2.0

This release upgrades `@angular/language-service` to v18.2.0-rc.0.

- feat: integrate code refactorings from language-service via LSP (#2050)

# 18.1.2

This release upgrades `@angular/language-service` to v18.1.0.

- fix(syntaxes): add back block syntaxes to injection for entire TS file (#2065)

# 18.1.1

- fix(syntaxes): inject template tags to top-level source.ts (#2058)

# 18.1.0

This release upgrades `@angular/language-service` to v18.1.0-rc.0.

- feat(syntaxes): add support for let declarations (#2042)
- feat: generate the import declaration for the completion item code actions (#2031)
- fix(server): disable let syntax when not supported (#2047)

# 18.0.0

This release upgrades `@angular/language-service` to v18.0.0.

- fix: allow external projects to use provided compiler options ([#55035](https://github.com/angular/angular/pull/55035))
- fix: avoid generating TS syntactic diagnostics for templates ([#55091](https://github.com/angular/angular/pull/55091))
- fix: implement getDefinitionAtPosition for Angular templates ([#55269](https://github.com/angular/angular/pull/55269))
- fix: prevent underlying TS Service from handling template files ([#55003](https://github.com/angular/angular/pull/55003))
- fix: use type-only import in plugin factory ([#55996](https://github.com/angular/angular/pull/55996))
- fix(syntaxes): Only match known block names (#2034) (dceedb686)

# 17.2.2

This release upgrades `@angular/language-service` to v17.2.1.

- fix: pass oldest Angular version in the workspace to the compiler (#2003)

# 17.2.1

This release rolls back the `@angular/language-service` version to v17.2.0-next.0 to resolve an issue reported in ticket [#2001](https://github.com/angular/vscode-ng-language-service/issues/2001).

# 17.2.0

This release upgrades `@angular/language-service` to v17.2.0-rc.1.

- fix(syntaxes): Do not highlight bindings outside element tags (#1725) (28739e4)

# 17.1.0

This release upgrades `@angular/language-service` to v17.1.0. It is based on the final RC of `@angular/compiler`.

- feat: Complete inside @switch ([#52153](https://github.com/angular/angular/pull/52153))
- feat: Enable go to definition of styleUrl ([#51746](https://github.com/angular/angular/pull/51746))
- feat: Implement outlining spans for control flow blocks ([#52062](https://github.com/angular/angular/pull/52062))
- feat: Support autocompletion for blocks ([#52121](https://github.com/angular/angular/pull/52121))
- fix: Autocomplete block keywords in more cases ([#52198](https://github.com/angular/angular/pull/52198))
- fix(syntaxes): Do not apply block syntax highlighting to JS and CSS in templates (#1952)

# 17.0.2

This release upgrades `@angular/language-service` to v17.0.2.

- fix(client,server): Correctly use bundled version unless tsdk is specified (#1970) (46b9a56a2)
- fix(server): Do not disable language service for solution style root tsconfig (#1972) (d8689bee4)
- fix(language-service): incorrect inferred type of for loop implicit variables (https://github.com/angular/angular/pull/52732)

# 17.0.1

This release upgrades `@angular/language-service` to v17.0.1.

- fix: Disable block syntax parsing when no project in workspace supports it (#1962) (#1964) (e276a57d4)
- fix(syntaxes): Single quote should end `as` alias match (#1956) (d7dab5264)
- fix(syntaxes): Adjust block syntax highlighting to require `(` or `{` on same line (#1961) (075047ae3)
- fix(syntaxes): Use expression.ng instead of JS for block expressions (#1960) (e17fc5c35)

# 17.0.0

This release upgrades `@angular/language-service` to v17.0.0-rc.3.

- fix(syntaxes): Support scss for inline styles (#1951)
- fix(syntaxes): Support multiline block expressions
- feat: Complete inside @switch (https://github.com/angular/angular/pull/52153)
- fix: correct incomplete escaping (https://github.com/angular/angular/pull/51557)
- fix: fix Autocomplete block keywords in more cases (https://github.com/angular/angular/pull/52198)

# 17.0.0-next.2

This release upgrades `@angular/language-service` to v17.0.0-next.8.

- feat(server): Add folding range support for Angular template syntax (#1938)
- feat: support block completions (#1937)

# 17.0.0-next.1

This release upgrades `@angular/language-service` to v17.0.0-next.7.

# 17.0.0-next.0

This release upgrades `@angular/language-service` to v17.0.0-next.6.

- feat(syntaxes): Add support for block syntaxes
- fix(client): fix detection of Angular context after string interpolation
- feat: Enable go to definition of styleUrl (https://github.com/angular/angular/pull/51746)

# 16.2.0

This release upgrades the `@angular/language-service` to v16.2.8

- fix: Retain correct language service when ts.Project reloads ([#51912](https://github.com/angular/angular/commit/08482f2c7dcbcd100981dfb266a6e63f64432328))
- fix(server): support to show the tag info in the jsDoc (#1904)
- fix(client): fix detection of Angular context after string interpolation (#1922)

# 16.1.8

This release upgrades `@angular/language-service` to v16.1.8.

- Update the bundled version of TypeScript to 5.1.3

# 16.1.4

This release upgrades `@angular/language-service` to v16.1.4.

# 16.0.0-next.0

This release upgrades `@angular/language-service` to v16.0.0-next.4.

- fix(server): Respect the client capabilities "textDocument.{declaration,typeDefinition}.linkSupport."
  https://github.com/angular/vscode-ng-language-service/commit/8751840d6be1ddb1900be8713eabf0c7796e5ca8

# 15.2.0

This release upgrades `@angular/language-service` to v15.2.0.

- fix(server): Fall back to bundled TS version if specified TSDK is too old ([#1863](https://github.com/angular/vscode-ng-language-service/pull/1863))

# 15.2.0-next.0

This release upgrades `@angular/language-service` to v15.2.0-next.1.

- feat: Add option to disable code actions ([#1849](https://github.com/angular/vscode-ng-language-service/pull/1849))

# 15.1.0

This release upgrades `@angular/language-service` to v15.1.0.

- feat: Allow auto-imports to suggest multiple possible imports. ([#47955](https://github.com/angular/angular/pull/47955))

# 15.0.4

This release upgrades `@angular/language-service` to v15.0.4.

- perf(extension): Ensure Angular code actions are only retrieved in Angular contexts (#1842)

# 15.0.3

This release upgrades `@angular/language-service` to v15.0.3.

- fix(server): filter unsupported code action to improve performance on save (#1834)
- fix(compiler-cli): Produce diagnostic rather than crash when using invalid hostDirective ([#48314](https://github.com/angular/angular/pull/48314))

# 15.0.2

This release upgrades `@angular/language-service` to v15.0.2.

- fix(extension): Ensure older projects that require View Engine can function (#1826)

# 15.0.1

This release fixes an incorrectly bundled `vsix` in the v15.0.0 release.

# 15.0.0

This release upgrades `@angular/language-service` to v15.0.0.

- feat(server): provide folding ranges for inline templates (#1779)
- fix(server): resolve tsdk correctly when settings specify a relative location (#1765)
- fix(server): send diagnostic range to the Angular language service when fixing code errors (#1747)
- fix: support deeply nested pnpm virtual store node_modules paths in resolveAndRunNgcc (#1742)
- feat(server): support code actions (#1723)
- feat(language-service): Quick fix to import a component when its selector is used ([#47088](https://github.com/angular/angular/pull/47088))
- feat(language-service): support to fix invalid banana in box ([#47393](https://github.com/angular/angular/pull/47393))

# v14.2.0

This release upgrades `@angular/language-service` to v14.2.0.

- feat: support fix the component missing member (#46764)
- fix: support deeply nested pnpm virtual store node_modules paths in resolveAndRunNgcc (#1742) (511218f10)
- feat: support code action (#1723) (a5ecf2df6)

# v14.1.0

This release upgrades `@angular/language-service` to v14.1.0

- feat(extension): Update untrusted workspace support from 'false' to 'limited' (#1695) (7d904ca20)
- feat(extension): Update virtualWorkspace support to allow syntax highlighting (#1694) (f8b0db869)

# v14.0.1

- fix(extension): disable rename override to allow built in TS renaming (#1687)

# v14.0.0

This release upgrades `@angular/language-service` to v14.0.0

- feat: Add option to disable ngcc (#1620)
- feat(extension): Support renaming from TypeScript files (#1589)
- feat(extension): Add option to force strict templates (#1646) (17fdb9ec6)
- feat: add command to run ngcc manually (#1621) (dd0e0009b)
- Fix detection of Angular for v14+ projects ([#45998](https://github.com/angular/angular/pull/45998))
- Prevent TSServer from removing templates from project ([#45965](https://github.com/angular/angular/pull/45965))

# v13.3.4

This release upgrades `@angular/language-service` to v13.3.8.

| Commit                                                                                           | Type | Description                                                                                                     |
| ------------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------- |
| [b4eb9ed884](https://github.com/angular/angular/commit/b4eb9ed884a82ba741abb503c974df7ec0d0048a) | fix  | Prevent TSServer from removing templates from project ([#45965](https://github.com/angular/angular/pull/45965)) |

# v13.2.3

This release upgrades `@angular/language-service` to v13.2.2.

- build(server): Update node version to match angular/angular (including v16) (#1612) (8d2420f11)

# v13.2.2

This release upgrades `@angular/language-service` to v13.2.1.

- fix(server): return the right range for the original source file of DTS (#1604) (2caa6cf23)

# v13.2.1

Skipped due to release process mistake.

# v13.2.0

This release upgrades `@angular/language-service` to v13.2.0.

- feat(server): Definitions for sources compiled with `declarationMap` go to
  original source

# v13.1.0

This release upgrades `@angular/language-service` to v13.1.0.

- fix: Correctly parse inputs and selectors with dollar signs (#44268)

# v13.0.0

This release upgrades `@angular/language-service` to v13.0.0.
For a complete change log see
[here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1300-2021-11-03).

1. feat: provide snippets for attribute (#1509) (0428c31fa)
1. feat: Add support for going to template from component (#1491) (3014713e1)
1. feat(server): add related information to diagnostics (#1492) (04b215b09)
1. feat: add config to enable auto-apply optional chaining on nullable symbol (#1469) (4fcbdb74a)

# v12.2.3

This release upgrades `@angular/language-service` to v12.2.12.

This release contains various internal refactorings and dependency updates.

# v12.2.2

This release upgrades `@angular/language-service` to v12.2.10.

- support resolving ngcc from APF v13 output (#1523) (f8aa9927c)

# v12.2.1

This release upgrades `@angular/language-service` to v12.2.9.

This release contains various internal refactorings and dependency updates.

# v12.2.0

This release upgrades `@angular/language-service` to v12.2.0.
For a complete change log see
[here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1220-2021-08-04).

1. fix(language-service): provide literal completions as well as context completions (https://github.com/angular/angular/pull/42729)

# v12.1.4

This release upgrades `@angular/language-service` to v12.1.4.
For a complete change log see
[here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1214-2021-07-28).

1. fix(language-server): rename response should use URI instead of file name (#1462) (49d81aa4a)
1. fix(language-server): Only enable language service on open projects (#1461) (26f6fcf1b)
1. fix: unchanged files sometimes have no Angular information for string… (#1453) (9ca675a3a)

# v12.1.3

This release upgrades `@angular/language-service` to v12.1.3.
For a complete change log see
[here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1213-2021-07-21).

1. fix(server): Only provide InsertReplaceEdit when the client supports it (#1452) (7c22c4c3a)

# v12.1.2

This release upgrades `@angular/language-service` to v12.1.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1212-2021-07-14).

1. fix(language-server): Ensure LS is enabled in same order as project initialization for solution-style projects (#1447) (68ee8344e)
1. fix(compiler-cli): return directives for an element on a microsyntax template (https://github.com/angular/angular/pull/42640)

# v12.1.1

This release upgrades `@angular/language-service` to v12.1.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1211-2021-06-30).

- update to TS 4.3.4 (#1428) (fb6681ee6)

# v12.1.0

This release upgrades `@angular/language-service` to v12.1.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1210-2021-06-24).

Features:

1. feat: Allow renaming from string literals in TS files (#1337) (9dba839b3)

# v12.0.5

Bug fixes:

1. fix(completions): fix completions for inputs / outputs (#1405) (d602cf933)
2. fix(language-service): fix autocomplete info display for attributes (https://github.com/angular/angular/pull/42472)

# v12.0.4

This release upgrades `@angular/language-service` to v12.0.3.

Bug fixes:

1. compiler-cli: better detect classes that are indirectly exported (#42207)

# v12.0.3

This release upgrades `@angular/language-service` to v12.0.2.

- fix: support nullish coalesce for syntax highlighting (#1376) (fa8a98678)

# v12.0.2

- fix: only give html provider completions for inline templates (#1369) (98d5c97bb)
- fix: avoid showing MISSING: command for code lens in templates (#1370) (fa5212faf)
- perf: Avoid making Angular-related decisions for files not in an Angular project (#1360) (f83b02eb0)
- fix: remove angular.ngdk configuration (#1361) (797140c2b)
- fix: remove message about disabled LS if ngcc fails (#1359) (0fdc5fb20)

# v12.0.1

This release fixes a bug where View Engine is not launched for older projects
even though the Angular version is resolved correctly.
This is because the configuration value is typed as `boolean`, and defaults to
`false` even when the value is not set. (d6cb5cb5ad)

# v12.0.0

This release upgrades `@angular/language-service` to v12.0.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1200-2021-05-12).

New features:

1. add support for signature help (#1277) (ec148073f)
1. forward completion and hover requests to html providers for inline templates (72ee5c71c)
1. Allow users to hide strictTemplates prompt (bd612107a)
1. Add codelens with a link to go to the component from a template (76e234281)
1. add command to go to component(s) from external template (d1ca20a14)
1. update typescript to v4.2.3 (730ce54bf)

Bug fixes:

1. fix: files incorrectly determined as not being in an Angular project (#1331) (43bcbb732)
1. remove TSC_NONPOLLING_WATCHER env variable and provide default watchOptions (#1323) (6eb2984cb)
1. Use View Engine LS for projects < v9 (7ff10b898)
1. Use View Engine LS for projects < v9 (2585e0310)
1. set minimum TS version to 4.2 (ea3a73900)
1. pass watch options to watchFile and watchDirectory (bae335dc4)
1. make Ivy LS the default (c23612f9b)
1. do not resolve CodeLens command until LS is enabled (#1260) (93b47487a)
1. dispose reporters and notification handlers when client is stopped (aa8ac6eb9)
1. only restart language server on angular configuration change (fb5f89590)
1. do not minify the client code (1068ef40a)
1. logger should print one timestamp for an entire group (f3930c1dc)
1. do not load plugins except @angular/language-service (0901addfd)
1. turn off logging by default (f5925ff26)
1. do not watch directories in google3 (6a8a2d9b2)
1. force enable Ivy and strictTemplates in google3 (9182c4cc5)
1. use single entry point for @angular/language-service (93c541f2e)
1. detect @angular/core in google3 and don't run ngcc (ea1a7de77)
1. retain typecheck files after project reload (bc9d9fc78)
1. do not pass execArgv to ngcc process (460ef30f2)
1. show Go to component in HTML files only (d4e70c641)
1. attempt to resolve tsdk using fs path (7a8cb6084)
1. Revert back to boolean type for experimental-ivy flag (c1daa2cc0)
1. remove TSC_NONPOLLING_WATCHER env variable (17708d44c)
1. ensure project language service is the Angular LS (dfedf3cbb)
1. unable to load ivy native plugin (b08b295b2)

Performance improvements:

1. Avoid making Angular-related decisions for files not in an Angular project (#1259) (d8666d835)
1. check diagnostics in most recently used order (dcd32294a)
1. Compute diagnostics for a single file if it is external template (237d3f6df)
1. prevent requests from being sent to the sesrver when outside Angular context (5c3eda19d)
1. yield after checking diagnostics for an open file (d4ab1a21e)
1. Support request cancellation (af0b5a46c)

# v11.2.14

Bug fixes:

1. files incorrectly determined as not being in an Angular project (#1331) (d26daaaa5)
2. remove TSC_NONPOLLING_WATCHER env variable and provide default watchOptions (#1323) (#1326) (bbd0c60fa)

# v11.2.13

This release upgrades `@angular/language-service` to v11.2.12.

Bug fixes:

1. High CPU usage when idle due to file watching (#1317) (06f1add66)

# v11.2.12

This release upgrades `@angular/language-service` to v11.2.11.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#11211-2021-04-21).

Bug fixes:

1. compiler-cli: autocomplete literal types in templates (296f887)

# v11.2.11

This release upgrades `@angular/language-service` to v11.2.10.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#11210-2021-04-14).

Bug fixes:

1. language-service: bound attributes should not break directive matching (#41597) (3dbcc7f)
1. language-service: resolve to the pre-compiled style when compiled css url is provided (#41538) (3d54980)
1. language-service: use 'any' instead of failing for inline TCBs (#41513) (f76873e)

Performance improvements:

1. Avoid making Angular-related decisions for files not in an Angular project
   (#1259) (154cf5efa)

# v11.2.10

This release upgrades `@angular/language-service` to v11.2.9.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1129-2021-04-07).

Bug fixes:

1. Allow analysis to continue with invalid style url (#41403) (#41489) (07131fa)
1. Dispose reporters and notification handlers when client is stopped (ef5297de7)
1. Only restart language server on angular configuration change (ba99ed814)

Performance improvements:

1. Add perf tracing to LanguageService (#41401) (7b0a800)

# v11.2.9

This release upgrades `@angular/language-service` to v11.2.7.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1127-2021-03-24).

bug fixes in `@angular/language-service`:

- **compiler-cli:** add `useInlining` option to type check config ([#41268](https://github.com/angular/angular/issues/41268)) ([57644e9](https://github.com/angular/angular/commit/57644e95aadbfe9c8f336be77a22f7a5e1859758)), closes [#40963](https://github.com/angular/angular/issues/40963)
- **language-service:** show suggestion when type inference is suboptimal ([#41072](https://github.com/angular/angular/issues/41072)) ([18cd7a0](https://github.com/angular/angular/commit/18cd7a0c6921983556fe1fffbff93d42ae138007)), closes [angular/vscode-ng-language-service#1155](https://github.com/angular/vscode-ng-language-service/issues/1155) [#41042](https://github.com/angular/angular/issues/41042)

# v11.2.8

- perf: prevent requests from being sent to the server when outside Angular context (fcbdf938e)
- build: Switch to esbuild instead of rollup for the client and banner (27ccba8d0)
- perf: check diagnostics in most recently used order (7f2873f6f56fbaff6c8232389ce64f3e60484a09)
- perf: Compute diagnostics for a single file if it is external template (a2b77fa7680c8328c67f77e3765fc179702405c0)
- fix: logger should print one timestamp for an entire group (4d94f40d4c699916b379c9dab38a9e9e254e6c3e)

# v11.2.7

This release reverts the following commits due to [#1198](https://github.com/angular/vscode-ng-language-service/issues/1198):

- perf: prevent requests from being sent to the server when outside Angular context (fcbdf938e)
- build: Switch to esbuild instead of rollup for the client and banner (27ccba8d0)

# v11.2.6

This release upgrades `@angular/language-service` to v11.2.5.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1125-2021-03-10).

This release contains various performance improvements.

# v11.2.5

This release contains a few performance improvements.

Bug fixes:

- do not load plugins except @angular/language-service
- turn off logging by default
- do not watch directories in google3

# v11.2.4

This release upgrades `@angular/language-service` to v11.2.4.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1124-2021-03-03).

Bug fixes in `@angular/language-service`:

- Add plugin option to force strictTemplates (#41063) (95f748c)
- Always attempt HTML AST to template AST conversion for LS (#41068) (6dd5497), closes angular/vscode-ng-language-service#1140
- can't provide the Input and Output custom binding property name (#41005) (1b1b65e)
- don't show external template diagnostics in ts files (#41070) (9322e6a), closes #41032
- only provide template results on reference requests (#41041) (ef87953)
- provide element completions after open tag < (#41068) (f09e7ab), closes angular/vscode-ng-language-service#1140

Bug fixes in `@angular/language-server`:

- force enable Ivy and strictTemplates in google3
- detect @angular/core in google3 and don't run ngcc
- retain typecheck files after project reload
- do not pass execArgv to ngcc process
- attempt to resolve tsdk using fs path
- Revert back to boolean type for experimental-ivy flag
- remove TSC_NONPOLLING_WATCHER env variable
- ensure project language service is the Angular LS

# v11.2.3

This release upgrades `@angular/language-service` to v11.2.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-2021-01-20).

Performance improvements:

- The Ivy Language Service no longer slows down the operation of plain TS language service features when editing TS code outside of a template.

# v11.2.2

This release upgrades `@angular/language-service` to v11.2.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1200-next1-2021-02-17).

# v11.2.1

This release fixes a bug in the initialization of tsserver plugin that prevented
the Ivy-native language service from being loaded correctly.
See https://github.com/angular/vscode-ng-language-service/issues/1109

# v11.2.0

This release upgrades `@angular/language-service` to v11.2.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1120-2021-02-10).

Bug fixes:

- disable rename feature when strictTemplates is disabled
- implement realpath to resolve symlinks
- recognize incomplete pipe bindings with whitespace

Features:

- Prompt to use the Ivy Language Service if VE is detected
- Add Command to view template typecheck block
- Add diagnostics to suggest turning on strict mode

# v11.1.3

This release upgrades `@angular/language-service` to v11.1.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1112-2021-02-03).

# v11.1.2

No major updates in this release.

# v11.1.1

This release upgrades `@angular/language-service` to v11.1.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1111-2021-01-27).

# v11.1.0

Ivy-native language service is officially available for preview!
To try it, go to Preferences > Settings > Angular > check experimental-ivy.

This release upgrades `@angular/language-service` to v11.1.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-2021-01-20).

# 0.1101.0-rc.1

Bug fixes:

- update min TS and NG versions
- ngserver script could not find index.js

# v0.1101.0-rc.0

This release upgrades `@angular/language-service` to v11.1.0-rc.0.

For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-rc0-2021-01-13).

Bug fixes:

- prevent project from closing when only a template file is open

Features:

- enable tracing of LSP messages and payload

# v0.1101.0-next.2

This release upgrades `@angular/language-service` to v11.1.0-next.4.

For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-next4-2021-01-06).

# v0.1101.0-next.1

This release upgrades `@angular/language-service` to v11.1.0-next.3.

For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-next3-2020-12-16).

# v0.1101.0-next.0

This release upgrades `@angular/language-service` to v11.1.0-next.2.

For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1110-next2-2020-12-09).

Bug fixes:

- `require.resolve` not working in vscode, resulting in ngcc failure.
- Restart language server on configuration change.

# v0.1100.0

This release upgrades `@angular/language-service` to v11.0.0.

For a complete change log see [here](https://github.com/angular/angular/blob/11.0.x/CHANGELOG.md#1100-2020-11-11).

Bug fixes:

- LS not showing existing diagnotics on file open (#966)

# v0.1100.0-rc.1

This release upgrades `@angular/language-service` to v11.0.0-rc.3.

For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1100-rc3-2020-11-09).

# v0.1100.0-rc.0

This release upgrades `@angular/language-service` to v11.0.0-rc.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1100-rc1-2020-10-28).

# v0.1000.8

This release upgrades `@angular/language-service` to v10.0.14.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#10014-2020-08-26).

# v0.1000.7

This release upgrades `@angular/language-service` to v10.0.7.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1007-2020-07-30).

This release fixes a bug caused by the upgrade of bundle format from ES5 to
ES2015.

Bug fixes:

- Metadata should not include methods on Object.prototype (#38292) (879ff08)

# v0.1000.6

This release upgrades `@angular/language-service` to v10.0.6.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1006-2020-07-28).

# v0.1000.5

This release upgrades `@angular/language-service` to v10.0.5.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1005-2020-07-22).

The `.umd` suffix has been removed from the bundle filename.

# v0.1000.4

This release upgrades `@angular/language-service` to v10.0.4.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1004-2020-07-15).

Features:

- Upgrade bundle format to ES2015.

Bug fixes:

- Remove completion for string (#37983) (387e838)

# v0.1000.3

This release upgrades `@angular/language-service` to v10.0.3.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1003-2020-07-08).

Bug fixes:

- Do not match inline template grammars inside a template itself (#839)

# v0.1000.2

This release upgrades `@angular/language-service` to v10.0.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1002-2020-06-30).

Bug fixes:

- incorrect autocomplete results on unknown symbol (#37518) (7c0b25f)

# v0.1000.1

This release upgrades `@angular/language-service` to v10.0.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1001-2020-06-26).

This release fixes support for ["solution-style"](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#support-for-solution-style-tsconfigjson-files) tsconfig.

Bug fixes:

- reinstate getExternalFiles() (#37750) (ad6680f)

# v0.1000.0

This release upgrades `@angular/language-service` to v10.0.0 and `typescript` to v3.9.5.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1000-2020-06-24).

Known issues:

- This release does not yet support ["solution-style"](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#support-for-solution-style-tsconfigjson-files) tsconfig.
  It is expected to be fixed in `v0.1000.1` release. Please follow [#824](https://github.com/angular/vscode-ng-language-service/issues/824) for updates.

Bug fixes:

- Improve signature selection by finding exact match (#37494) (e97a2d4)
- Recover from error in analyzing NgModules (#37108) (2c1f35e)
- Do not invalidate `@angular/core` module (#36783) (dd049ca)
- infer type of elements of array-like objects (#36312) (fe2b692), closes #36191
- properly evaluate types in comparable expressions (#36529) (8be0972)
- use empty statement as parent of type node (#36989) (a32cbed)
- use the HtmlAst to get the span of HTML tag (#36371) (81195a2)
- wrong completions in conditional operator (#37505) (32020f9)

Deprecations:

- Remove HTML entities autocompletion (#37515) (67bd88b)

# v0.1000.0-rc.1

This release upgrades `@angular/language-service` to v10.0.0-rc.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1000-rc2-2020-06-01).

# v0.1000.0-rc.0

This release upgrades `@angular/language-service` to v10.0.0-rc.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#1000-rc0-2020-05-21).

# v0.901.9

This release upgrades `@angular/language-service` to v9.1.9.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#919-2020-05-20).

# v0.901.8

This release upgrades `@angular/language-service` to v9.1.8.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#918-2020-05-20).

# v0.901.7

This release upgrades `@angular/language-service` to v9.1.7.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#917-2020-05-13).

# v0.901.6

This release upgrades `@angular/language-service` to v9.1.6.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#916-2020-05-08).

# v0.901.5

This release upgrades `@angular/language-service` to v9.1.5.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#915-2020-05-07).

# v0.901.4

This release upgrades `@angular/language-service` to v9.1.4.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#914-2020-04-29).

Bug fixes:

- do not invalidate `@angular/core` module (#36783) (d3a77ea)

# v0.901.3

This release upgrades `@angular/language-service` to v9.1.3.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#913-2020-04-22).

Bug fixes:

- properly evaluate types in comparable expressions (#36529) (5bab498)

# v0.901.2

This release upgrades `@angular/language-service` to v9.1.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#912-2020-04-15).

# v0.901.1

This release upgrades `@angular/language-service` to v9.1.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#911-2020-04-07).

Bug fixes:

- infer type of elements of array-like objects (#36312) (ff523c9), closes #36191
- use the HtmlAst to get the span of HTML tag (#36371) (ffa4e11)
- log message when language service is enabled for a project

# v0.901.0

This release upgrades `@angular/language-service` to v9.1.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#910-2020-03-25).

New features:

- improve non-callable error message (#35271) (acc483e)
- modularize error messages (#35678) (47a1811), closes #32663

Bug fixes:

- Catch failure to open script when language service is disabled (#699)
- Suggest ? and ! operator on nullable receiver (#35200) (3cc24a9)
- fix calculation of pipe spans (#35986) (406419b)
- get the right 'ElementAst' in the nested HTML tag (#35317) (8e354da)
- infer $implicit value for ngIf template contexts (#35941) (18b1bd4)
- infer context type of structural directives (#35537) (#35561) (54fd33f)
- provide completions for the structural directive that only injects the 'ViewContainerRef' (#35466) (66c06eb)
- provide hover for interpolation in attribute value (#35494) (049f118), closes PR#34847
- resolve the real path for symlink (#35895) (4e1d780)
- resolve the variable from the template context first (#35982) (3d46a45)

# v0.900.18

This release upgrades `@angular/language-service` to v9.0.7.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#907-2020-03-18).

Bug fixes:

- infer $implicit value for ngIf template contexts (#35941) (f5e4410)

# v0.900.17

This release upgrades `@angular/language-service` to v9.0.6.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#906-2020-03-10).

Bug fixes:

- resolve the variable from the template context first (#35982) (f882ff0)
- improve missing core.d.ts error message

# v0.900.16

This release upgrades `@angular/language-service` to v9.0.5.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#905-2020-03-04).

New features:

- modularize error messages (#35678) (bcff873)

Bug fixes:

- apply Angular template grammar syntax only to HTML derivative files

# v0.900.15

This release upgrades `@angular/language-service` to v9.0.4.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#904-2020-02-27).

Bug fixes:

- get the right 'ElementAst' in the nested HTML tag (#35317) (7403ba1)
- infer context type of structural directives (#35537) (#35561) (a491f7e)
- provide hover for interpolation in attribute value (#35494) (0700279)

# v0.900.14

This release introduces TextMate grammar for Angular template expressions.
Special thanks to @ghaschel, @ayazhafiz, and @dannymcgee.

# v0.900.13

This release upgrades `@angular/language-service` to v9.0.2.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#902-2020-02-19).

New features:

- Trigger autocomplete on pipe

Bug fixes:

- Editor buffer out of sync with file on disk

# v0.900.12

This release upgrades `@angular/language-service` to v9.0.1.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#901-2020-02-12).

Bug fixes:

- Suggest ? and ! operator on nullable receiver (#35200) (3cc24a9)

# v0.900.11

This release upgrades `@angular/language-service` to v9.0.0.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-2020-02-06).

# v0.900.10

This release upgrades `@angular/language-service` to v9.0.0-rc.14.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc14-2020-02-03).

# v0.900.9

This release upgrades `@angular/language-service` to v9.0.0-rc.13.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc13-2020-02-01).

Bug fixes:

- more accurate and specific binding scopes (#598)
- check that a language service exists for discovered projects (#562)

# v0.900.8

This release upgrades `@angular/language-service` to v9.0.0-rc.12.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc12-2020-01-30).

New features:

- completions for output $event properties in (#34570) (2a53727)
- provide completion for $event variable (#34570) (c246787)
- provide hover for microsyntax in structural directive (#34847) (baf4a63)

Bug fixes:

- prune duplicate returned definitions (#34995) (71f5417)
- remove repeated symbol definitions for structural directive (#34847) (35916d3)
- warn, not error, on missing context members (#35036) (0e76821)
- enable debug mode only when it is strictly turned on

# v0.900.7

This release upgrades `@angular/language-service` to v9.0.0-rc.11.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc11-2020-01-24).

New features:

- Specific suggestions for template context diags (#34751) (cc7fca4)
- Support multiple symbol definitions (#34782) (2f2396c)

Bug fixes:

- Diagnostic span should point to class name (#34932) (c9db7bd)

# v0.900.6

This release upgrades `@angular/language-service` to v9.0.0-rc.10.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc10-2020-01-22).

It also upgrades `vscode-languageclient` and `vscode-languageserver` to major
version 6.

New features:

- Completions support for template reference variables
- Provide completion for $event variable
- Support hover/definitions for structural directive
- Add grammar for template bindings

# v0.900.5

This release upgrades `@angular/language-service` to v9.0.0-rc.9.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc9-2020-01-15).

It also upgrades `typescript` to v3.7.4.

New features:

- Support hover/definitions for structural directive
- More detailed grammar scopes for template property binding syntax
- Textmate grammar for template event bindings
- Reenable probing language service and tsserver from active workspace
- Priortize workspace version when resolving ts and ng
- Add grammar for two-way bindings
- Trigger autocomplete on '$' character
- Upgrade `vscode-jsonrpc` to major version v5

Bug fixes:

- Language service works with HTML without TS files open
- Fix CRLF offset in inline template
- Do not use an i18n parser for templates
- Require min typescript v3.7

# v0.900.4

This release upgrades `@angular/language-service` to v9.0.0-rc.8.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc8-2020-01-08).

New features:

- Append symbol type to hover tooltip (#34515) (381b895)
- Show documentation on hover (#34506) (1660095)
- Add textmate grammar for template property bindings

Bug fixes:

- completions after "let x of |" in ngFor (#34473) (ca8b584)
- correctly parse expressions in an attribute (#34517) (7a0d6e7)
- pipe method should not include parentheses (#34485) (2845596)
- whitelist all html elements

# v0.900.3

This release upgrades `@angular/language-service` to v9.0.0-rc.7.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc7-2019-12-18).

New features:

- add textmate grammar for inline CSS styles
- add syntax highlighting grammar for interpolations

Bug fixes:

- reset loading status when the language service fails to load the project
- correctly specify embedded languages in an Angular template
- HTML path should include last node before cursor
- Proper completions for properties and events

# v0.900.2

This release upgrades `@angular/language-service` to v9.0.0-rc.6.
For a complete change log see [here](https://github.com/angular/angular/blob/main/CHANGELOG.md#900-rc6-2019-12-11).

Bug fixes:

- Fixed accessing a string index signature using dot notation
- Remove `getExternalFiles()`
- Fixed JS primitive type name
- Simplify resolution logic in banner

# v0.900.1

Bug fixes:

- Fixed crash when extension is loaded in VSCode Insiders
- Fixed error message `No metadata found for component`
- Fixed indexed type errors in template
- Fixed error message `Unknown method "bind"`
- Fixed type of exported values in `ngFor`
- Fixed error message `Component is not included in a module`

New features:

- Syntax highlighting for inline templates
- Method completions now include parentheses at the end

# v0.900.0

This release is a substantial overhaul of the Angular language service that brings
significant performance improvements.

New features:

- Added "go to definition" for `templateUrl` and `styleUrls`.
- Hover tooltip now shows the `NgModule` a directive is declared in.
- Added `angular.ngdk` config for specifying location of `@angular/language-service`.
- Added vscode command to restart the extension.
- Display loading indicator while project is loading.
