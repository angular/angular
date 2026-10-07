/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Mirrors `DiagnosticCategoryLabel` in `ngtsc/core/api/src/public_options.ts`. The string
 * values are what appears in a tsconfig, so they are interchangeable with the upstream enum.
 */
export type DiagnosticCategoryLabel = 'warning' | 'error' | 'suppress';

/**
 * Mirrors `DiagnosticOptions['extendedDiagnostics']`. Upstream keys `checks` by
 * `ExtendedTemplateDiagnosticName`; only the checks the preprocessor reads are named here.
 */
export interface ExtendedDiagnosticsOptions {
  defaultCategory?: DiagnosticCategoryLabel;
  checks?: {
    controlFlowPreventingContentProjection?: DiagnosticCategoryLabel;
    unusedStandaloneImports?: DiagnosticCategoryLabel;
    readonly [name: string]: DiagnosticCategoryLabel | undefined;
  };
}

/**
 * The compiler options the preprocessor consumes: the Angular-specific options from a
 * tsconfig's merged `angularCompilerOptions` (as read by `@angular/compiler-cli`'s
 * `readConfiguration`), plus the few TypeScript `compilerOptions` that ngtsc also
 * reads from the same merged object.
 */
export interface NgpCompilerOptions {
  // Type-checking (`TypeCheckingOptions`).
  strictTemplates?: boolean;
  strictInputTypes?: boolean;
  strictInputAccessModifiers?: boolean;
  strictNullInputTypes?: boolean;
  strictOutputEventTypes?: boolean;
  strictDomEventTypes?: boolean;
  strictSafeNavigationTypes?: boolean;
  strictDomLocalRefTypes?: boolean;
  strictAttributeTypes?: boolean;
  strictContextGenerics?: boolean;
  strictLiteralTypes?: boolean;
  typeCheckHostBindings?: boolean;

  // Diagnostics (`DiagnosticOptions`).
  extendedDiagnostics?: ExtendedDiagnosticsOptions;

  // Emit and Bazel/google3 (`BazelAndG3Options`, `InternalOptions`).
  annotateForClosureCompiler?: boolean;
  _experimentalAllowEmitDeclarationOnly?: boolean;
  onlyPublishPublicTypingsForNgModules?: boolean;
  workspaceName?: string;

  // Compilation (`MiscOptions`, `TargetOptions`, `InternalOptions`).
  legacyOptionalChaining?: boolean;
  onlyExplicitDeferDependencyImports?: boolean;
  enableTemplateSourceLocations?: boolean;
  forbidOrphanComponents?: boolean;
  supportJitMode?: boolean;
  supportTestBed?: boolean;
  preserveWhitespaces?: boolean;
  _enableHmr?: boolean;

  // i18n (`I18nOptions`).
  enableI18nLegacyMessageIdFormat?: boolean;
  i18nUseExternalIds?: boolean;
  i18nNormalizeLineEndingsInICUs?: boolean;

  // TypeScript `compilerOptions` that ngtsc reads off the same merged options object.
  emitDeclarationOnly?: boolean;
  rootDirs?: string[];
}
