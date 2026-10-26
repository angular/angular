/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {NgDiagnostic} from './types.js';

/**
 * Mirrors `DiagnosticCategoryLabel` in `ngtsc/core/api/src/public_options.ts`. The string
 * values are what appears in a tsconfig, so they are interchangeable with the upstream enum.
 */
export type DiagnosticCategoryLabel = 'warning' | 'error' | 'suppress';

/** In the order `DiagnosticCategoryLabel` declares its members, which the diagnostics list. */
const DIAGNOSTIC_CATEGORY_LABELS: readonly string[] = ['warning', 'error', 'suppress'];

/**
 * Mirrors `ExtendedTemplateDiagnosticName` in
 * `ngtsc/diagnostics/src/extended_template_diagnostic_name.ts`.
 */
export type ExtendedTemplateDiagnosticName =
  | 'controlFlowPreventingContentProjection'
  | 'unusedStandaloneImports'
  | 'invalidBananaInBox'
  | 'nullishCoalescingNotNullable'
  | 'numericCssPropertyRequiresUnit'
  | 'optionalChainNotNullable'
  | 'missingControlFlowDirective'
  | 'textAttributeNotBinding'
  | 'missingNgForOfLet'
  | 'missingStructuralDirective'
  | 'suffixNotSupported'
  | 'interpolatedSignalNotInvoked'
  | 'uninvokedFunctionInEventBinding'
  | 'unusedLetDeclaration'
  | 'skipHydrationNotStatic'
  | 'unparenthesizedNullishCoalescing'
  | 'uninvokedTrackFunction'
  | 'uninvokedFunctionInTextInterpolation'
  | 'deferTriggerMisconfiguration';

/**
 * Mirrors `SUPPORTED_DIAGNOSTIC_NAMES` in `ngtsc/typecheck/extended/index.ts`, in its iteration
 * order (the two option-only checks, then `ALL_DIAGNOSTIC_FACTORIES`), since the diagnostic
 * lists them. Keep in sync when a check is added upstream.
 */
export const SUPPORTED_DIAGNOSTIC_NAMES: ReadonlySet<ExtendedTemplateDiagnosticName> = new Set([
  'controlFlowPreventingContentProjection',
  'unusedStandaloneImports',
  'invalidBananaInBox',
  'nullishCoalescingNotNullable',
  'numericCssPropertyRequiresUnit',
  'optionalChainNotNullable',
  'missingControlFlowDirective',
  'textAttributeNotBinding',
  'missingNgForOfLet',
  'missingStructuralDirective',
  'suffixNotSupported',
  'interpolatedSignalNotInvoked',
  'uninvokedFunctionInEventBinding',
  'unusedLetDeclaration',
  'skipHydrationNotStatic',
  'unparenthesizedNullishCoalescing',
  'uninvokedTrackFunction',
  'uninvokedFunctionInTextInterpolation',
  'deferTriggerMisconfiguration',
]);

/**
 * Mirrors `DiagnosticOptions['extendedDiagnostics']`.
 */
export interface ExtendedDiagnosticsOptions {
  defaultCategory?: DiagnosticCategoryLabel;
  checks?: {
    [K in ExtendedTemplateDiagnosticName]?: DiagnosticCategoryLabel;
  } & {
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
  strictUnclaimedEventNames?: boolean;
  strictUnknownElements?: boolean;
  typeCheckHostBindings?: boolean;

  // Diagnostics (`DiagnosticOptions`).
  extendedDiagnostics?: ExtendedDiagnosticsOptions;
  unusedStandaloneImports?: DiagnosticCategoryLabel;

  // Emit and Bazel/google3 (`BazelAndG3Options`, `InternalOptions`).
  annotateForClosureCompiler?: boolean;
  _experimentalAllowEmitDeclarationOnly?: boolean;
  onlyPublishPublicTypingsForNgModules?: boolean;
  workspaceName?: string;
  _useHostForImportGeneration?: boolean;
  _useHostForImportAndAliasGeneration?: boolean;

  // Compilation (`MiscOptions`, `TargetOptions`, `InternalOptions`).
  legacyOptionalChaining?: boolean;
  onlyExplicitDeferDependencyImports?: boolean;
  enableTemplateSourceLocations?: boolean;
  forbidOrphanComponents?: boolean;
  supportJitMode?: boolean;
  supportTestBed?: boolean;
  preserveWhitespaces?: boolean;
  _enableHmr?: boolean;
  _compilePoisonedComponents?: boolean;
  _enableTemplateTypeChecker?: boolean;

  // i18n (`I18nOptions`).
  enableI18nLegacyMessageIdFormat?: boolean;
  i18nUseExternalIds?: boolean;
  i18nNormalizeLineEndingsInICUs?: boolean;
  i18nPreserveWhitespaceForLegacyExtraction?: boolean;

  // TypeScript `compilerOptions` that ngtsc reads off the same merged options object.
  emitDeclarationOnly?: boolean;
  rootDirs?: string[];
}

const CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES = 4003;
const CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL = 4004;
const CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK = 4005;
const CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED = 4006;

/**
 * Validates `extendedDiagnostics` compiler options, mirroring `verifyCompatibleTypeCheckOptions`
 * in `ngtsc/core/src/compiler.ts`.
 */
export function verifyExtendedDiagnosticsOptions(options: NgpCompilerOptions): NgDiagnostic[] {
  if (!options.extendedDiagnostics) {
    return [];
  }
  const diagnostics: NgDiagnostic[] = [];
  const configError = (code: number, messageText: string) =>
    diagnostics.push({category: 1, code, messageText});

  if (options.strictTemplates === false) {
    configError(
      CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES,
      `
Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.

Using "extendedDiagnostics" requires that "strictTemplates" is also enabled.

One of the following actions is required:
1. Remove "strictTemplates: false" to enable it.
2. Remove "extendedDiagnostics" configuration to disable them.
      `.trim(),
    );
  }

  const defaultCategory = options.extendedDiagnostics.defaultCategory;
  if (defaultCategory !== undefined && !DIAGNOSTIC_CATEGORY_LABELS.includes(defaultCategory)) {
    configError(
      CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
      `
Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "${defaultCategory}".

Allowed diagnostic categories are:
${DIAGNOSTIC_CATEGORY_LABELS.join('\n')}
      `.trim(),
    );
  }

  for (const [checkName, category] of Object.entries(options.extendedDiagnostics.checks ?? {})) {
    if (!(SUPPORTED_DIAGNOSTIC_NAMES as ReadonlySet<string>).has(checkName)) {
      configError(
        CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK,
        `
Angular compiler option "extendedDiagnostics.checks" has an unknown check: "${checkName}".

Allowed check names are:
${Array.from(SUPPORTED_DIAGNOSTIC_NAMES).join('\n')}
        `.trim(),
      );
    }

    if (!DIAGNOSTIC_CATEGORY_LABELS.includes(category as string)) {
      configError(
        CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
        `
Angular compiler option "extendedDiagnostics.checks['${checkName}']" has an unknown diagnostic category: "${category}".

Allowed diagnostic categories are:
${DIAGNOSTIC_CATEGORY_LABELS.join('\n')}
        `.trim(),
      );
    }
  }

  return diagnostics;
}

/**
 * Validates the compiler options up front, the way `NgCompiler`'s constructor does
 * (`constructionDiagnostics`). These diagnostics have no file: they describe the tsconfig, not a
 * source location. ngtsc reports them before any other diagnostic and, if any is an error, skips
 * the rest of the compilation, so callers should check them first.
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/core/src/compiler.ts#L1800-L1874
 */
export function verifyCompilerOptions(options: NgpCompilerOptions): NgDiagnostic[] {
  const diagnostics = verifyExtendedDiagnosticsOptions(options);

  // `verifyEmitDeclarationOnly`
  if (options.emitDeclarationOnly && !options._experimentalAllowEmitDeclarationOnly) {
    diagnostics.push({
      category: 1,
      code: CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED,
      messageText: 'TS compiler option "emitDeclarationOnly" is not supported.',
    });
  }

  return diagnostics;
}
