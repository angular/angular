/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BoundTarget, TcbDirectiveMetadata, TypeCheckId} from '@angular/compiler';
import type {
  DiagnosticCategoryLabel,
  ExtendedDiagnosticsOptions,
  ExtendedTemplateDiagnosticName,
} from '../compiler_options.js';
import type {Diagnostic} from '../diagnostic.js';
import type {TcbTargetInput} from '../tcb.js';
import {
  EXTENDED_ERROR_DETAILS_PAGE_BASE_URL,
  formatExtendedError,
  isAccessFromUncheckedIndex,
  TemplateCheck,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from './api.js';
import {factory as deferTriggerMisconfigurationFactory} from './checks/defer_trigger_misconfiguration.js';
import {factory as invalidBananaInBoxFactory} from './checks/invalid_banana_in_box.js';
import {factory as missingControlFlowDirectiveFactory} from './checks/missing_control_flow_directive.js';
import {factory as missingNgForOfLetFactory} from './checks/missing_ngforof_let.js';
import {factory as missingStructuralDirectiveFactory} from './checks/missing_structural_directive.js';
import {factory as numericCssPropertyRequiresUnitFactory} from './checks/numeric_css_property_requires_unit.js';
import {factory as skipHydrationNotStaticFactory} from './checks/skip_hydration_not_static.js';
import {factory as suffixNotSupportedFactory} from './checks/suffix_not_supported.js';
import {factory as textAttributeNotBindingFactory} from './checks/text_attribute_not_binding.js';
import {factory as uninvokedFunctionInEventBindingFactory} from './checks/uninvoked_function_in_event_binding.js';
import {factory as unparenthesizedNullishCoalescingFactory} from './checks/unparenthesized_nullish_coalescing.js';
import {factory as unusedLetDeclarationFactory} from './checks/unused_let_declaration.js';
import {
  diagnosticLabelToCategory,
  ExtendedTemplateChecker,
  ExtendedTemplateCheckerImpl,
} from './extended_template_checker.js';
import {checkUnusedStandaloneImports} from './unused_standalone_imports.js';

export {
  checkUnusedStandaloneImports,
  diagnosticLabelToCategory,
  EXTENDED_ERROR_DETAILS_PAGE_BASE_URL,
  type ExtendedTemplateChecker,
  ExtendedTemplateCheckerImpl,
  formatExtendedError,
  isAccessFromUncheckedIndex,
  type TemplateCheck,
  type TemplateCheckFactory,
  TemplateCheckWithVisitor,
  type TemplateContext,
};

// TODO: Add factories for `nullishCoalescingNotNullable` (NG8102), `optionalChainNotNullable`
// (NG8107), `interpolatedSignalNotInvoked` (NG8109), `uninvokedTrackFunction` (NG8115), and
// `uninvokedFunctionInTextInterpolation` (NG8117) when `ts.TypeChecker` integration is available.
export const ALL_DIAGNOSTIC_FACTORIES: readonly TemplateCheckFactory<
  number,
  ExtendedTemplateDiagnosticName
>[] = [
  invalidBananaInBoxFactory,
  missingControlFlowDirectiveFactory,
  textAttributeNotBindingFactory,
  missingNgForOfLetFactory,
  missingStructuralDirectiveFactory,
  suffixNotSupportedFactory,
  uninvokedFunctionInEventBindingFactory,
  unusedLetDeclarationFactory,
  skipHydrationNotStaticFactory,
  unparenthesizedNullishCoalescingFactory,
  deferTriggerMisconfigurationFactory,
  numericCssPropertyRequiresUnitFactory,
];

/**
 * Runs all extended template diagnostics (`ALL_DIAGNOSTIC_FACTORIES`) and
 * `unusedStandaloneImports` (`NG8113`) for a bound component target.
 *
 * Mirrors `ExtendedTemplateCheckerImpl` and `UnusedStandaloneImportsRule` in
 * `@angular/compiler-cli`.
 */
export function runExtendedDiagnostics(
  typeCheckId: TypeCheckId,
  comp: TcbTargetInput,
  boundTarget: BoundTarget<TcbDirectiveMetadata>,
  filePath: string,
  options?: ExtendedDiagnosticsOptions,
  templateCheckFactories: readonly TemplateCheckFactory<
    number,
    ExtendedTemplateDiagnosticName
  >[] = ALL_DIAGNOSTIC_FACTORIES,
  strictTemplates: boolean = true,
  unusedStandaloneImports: DiagnosticCategoryLabel = options?.checks?.unusedStandaloneImports ??
    options?.defaultCategory ??
    'warning',
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  const unusedStandaloneImportsCat = diagnosticLabelToCategory(unusedStandaloneImports);
  if (unusedStandaloneImportsCat !== null) {
    diagnostics.push(
      ...checkUnusedStandaloneImports(
        typeCheckId,
        unusedStandaloneImportsCat,
        comp,
        boundTarget,
        filePath,
      ),
    );
  }

  if (strictTemplates) {
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(templateCheckFactories, {
      extendedDiagnostics: options,
    });
    diagnostics.push(
      ...extendedTemplateChecker.getDiagnosticsForComponent(typeCheckId, comp, boundTarget),
    );
  }

  return diagnostics;
}
