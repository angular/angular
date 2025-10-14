/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {DiagnosticCategoryLabel} from '../../../core/api';
export class ExtendedTemplateCheckerImpl {
  partialCtx;
  templateChecks;
  constructor(templateTypeChecker, typeChecker, templateCheckFactories, options) {
    this.partialCtx = {templateTypeChecker, typeChecker};
    this.templateChecks = new Map();
    for (const factory of templateCheckFactories) {
      // Read the diagnostic category from compiler options.
      const category = diagnosticLabelToCategory(
        options?.extendedDiagnostics?.checks?.[factory.name] ??
          options?.extendedDiagnostics?.defaultCategory ??
          DiagnosticCategoryLabel.Warning,
      );
      // Skip the diagnostic if suppressed via compiler options.
      if (category === null) {
        continue;
      }
      // Try to create the check.
      const check = factory.create(options);
      // Skip the diagnostic if it was disabled due to unsupported options. For example, this can
      // happen if the check requires `strictNullChecks: true` but that flag is disabled in compiler
      // options.
      if (check === null) {
        continue;
      }
      // Use the check.
      this.templateChecks.set(check, category);
    }
  }
  getDiagnosticsForComponent(component) {
    const template = this.partialCtx.templateTypeChecker.getTemplate(component);
    // Skip checks if component has no template. This can happen if the user writes a
    // `@Component()` but doesn't add the template, could happen in the language service
    // when users are in the middle of typing code.
    if (template === null) {
      return [];
    }
    const diagnostics = [];
    for (const [check, category] of this.templateChecks.entries()) {
      const ctx = {
        ...this.partialCtx,
        // Wrap `templateTypeChecker.makeTemplateDiagnostic()` to implicitly provide all the known
        // options.
        makeTemplateDiagnostic: (span, message, relatedInformation) => {
          return this.partialCtx.templateTypeChecker.makeTemplateDiagnostic(
            component,
            span,
            category,
            check.code,
            message,
            relatedInformation,
          );
        },
      };
      diagnostics.push(...check.run(ctx, component, template));
    }
    return diagnostics;
  }
}
/**
 * Converts a `DiagnosticCategoryLabel` to its equivalent `ts.DiagnosticCategory` or `null` if
 * the label is `DiagnosticCategoryLabel.Suppress`.
 */
function diagnosticLabelToCategory(label) {
  switch (label) {
    case DiagnosticCategoryLabel.Warning:
      return ts.DiagnosticCategory.Warning;
    case DiagnosticCategoryLabel.Error:
      return ts.DiagnosticCategory.Error;
    case DiagnosticCategoryLabel.Suppress:
      return null;
    default:
      return assertNever(label);
  }
}
function assertNever(value) {
  throw new Error(`Unexpected call to 'assertNever()' with value:\n${value}`);
}
//# sourceMappingURL=extended_template_checker.js.map
