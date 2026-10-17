/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type * as nga from './types.js';

/**
 * Mirrors `DiagnosticCategoryLabel` in `ngtsc/core/api/src/public_options.ts`. The string
 * values are what appears in a tsconfig, so they are interchangeable with the upstream enum.
 */
export type DiagnosticCategoryLabel = 'warning' | 'error' | 'suppress';

/**
 * Mirrors `ExtendedTemplateDiagnosticName` in
 * `ngtsc/diagnostics/src/extended_template_diagnostic_name.ts`.
 */
export type ExtendedTemplateDiagnosticName =
  | 'controlFlowPreventingContentProjection'
  | 'unusedStandaloneImports'
  | 'invalidBananaInBox'
  | 'nullishCoalescingNotNullable'
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

export const SUPPORTED_DIAGNOSTIC_NAMES: readonly ExtendedTemplateDiagnosticName[] = [
  'controlFlowPreventingContentProjection',
  'unusedStandaloneImports',
  'invalidBananaInBox',
  'nullishCoalescingNotNullable',
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
];

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
 * Validates `extendedDiagnostics` compiler options, mirroring `verifyCompatibleTypeCheckOptions`
 * in `ngtsc/core/src/compiler.ts`.
 */
export function verifyExtendedDiagnosticsOptions(options: NgpCompilerOptions): nga.NgDiagnostic[] {
  if (!options.extendedDiagnostics) {
    return [];
  }
  const errors: nga.NgDiagnostic[] = [];
  if (options.strictTemplates === false) {
    errors.push({
      category: 1,
      code: 4003,
      messageText: `
Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.

Using "extendedDiagnostics" requires that "strictTemplates" is also enabled.

One of the following actions is required:
1. Remove "strictTemplates: false" to enable it.
2. Remove "extendedDiagnostics" configuration to disable them.
      `.trim(),
    });
  }
  const defaultCategory = options.extendedDiagnostics.defaultCategory;
  const allCategories: readonly DiagnosticCategoryLabel[] = ['warning', 'error', 'suppress'];
  if (defaultCategory !== undefined && !allCategories.includes(defaultCategory as any)) {
    errors.push({
      category: 1,
      code: 4004,
      messageText: `
Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "${defaultCategory}".

Allowed diagnostic categories are:
${allCategories.join('\n')}
      `.trim(),
    });
  }
  if (options.extendedDiagnostics.checks) {
    for (const [name, category] of Object.entries(options.extendedDiagnostics.checks)) {
      if (!(SUPPORTED_DIAGNOSTIC_NAMES as readonly string[]).includes(name)) {
        errors.push({
          category: 1,
          code: 4005,
          messageText: `
Angular compiler option "extendedDiagnostics.checks" has an unknown check: "${name}".

Allowed check names are:
${SUPPORTED_DIAGNOSTIC_NAMES.join('\n')}
          `.trim(),
        });
      }
      if (!category || !allCategories.includes(category)) {
        errors.push({
          category: 1,
          code: 4004,
          messageText: `
Angular compiler option "extendedDiagnostics.checks['${name}']" has an unknown diagnostic category: "${category}".

Allowed diagnostic categories are:
${allCategories.join('\n')}
          `.trim(),
        });
      }
    }
  }
  return errors;
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
  unusedStandaloneImports?: DiagnosticCategoryLabel;

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
