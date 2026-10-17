/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  BoundTarget,
  OutOfBandDiagnosticCategory,
  ParseSourceSpan,
  TcbDirectiveMetadata,
  TypeCheckId,
} from '@angular/compiler';
import type {
  DiagnosticCategoryLabel,
  ExtendedDiagnosticsOptions,
  ExtendedTemplateDiagnosticName,
  NgpCompilerOptions,
} from '../compiler_options.js';
import type {Diagnostic, DiagnosticRelatedInformation} from '../diagnostic.js';
import type {TcbTargetInput} from '../tcb.js';
import type {TemplateCheck, TemplateCheckFactory, TemplateContext} from './api.js';

/**
 * Interface to generate extended template diagnostics from the component templates.
 *
 * Mirrors `ExtendedTemplateChecker` in `ngtsc/typecheck/extended/api/extended_template_checker.ts`.
 */
export interface ExtendedTemplateChecker {
  /**
   * Run `TemplateCheck`s for a component and return the generated `Diagnostic`s.
   */
  getDiagnosticsForComponent(
    typeCheckId: TypeCheckId,
    component: TcbTargetInput,
    boundTarget: BoundTarget<TcbDirectiveMetadata>,
  ): Diagnostic[];
}

/**
 * Mirrors `ExtendedTemplateCheckerImpl` in `ngtsc/typecheck/extended/src/extended_template_checker.ts`.
 */
export class ExtendedTemplateCheckerImpl implements ExtendedTemplateChecker {
  private readonly templateChecks: Map<TemplateCheck<number>, OutOfBandDiagnosticCategory>;

  constructor(
    templateCheckFactories: readonly TemplateCheckFactory<number, ExtendedTemplateDiagnosticName>[],
    options?: NgpCompilerOptions | {extendedDiagnostics?: ExtendedDiagnosticsOptions},
  ) {
    this.templateChecks = new Map<TemplateCheck<number>, OutOfBandDiagnosticCategory>();

    for (const factory of templateCheckFactories) {
      // Read the diagnostic category from compiler options.
      const category = diagnosticLabelToCategory(
        options?.extendedDiagnostics?.checks?.[factory.name] ??
          options?.extendedDiagnostics?.defaultCategory ??
          'warning',
      );

      // Skip the diagnostic if suppressed via compiler options.
      if (category === null) {
        continue;
      }

      // Try to create the check.
      const check = factory.create(options as NgpCompilerOptions | undefined);

      // Skip the diagnostic if it was disabled due to unsupported options.
      if (check === null) {
        continue;
      }

      // Use the check.
      this.templateChecks.set(check, category);
    }
  }

  getDiagnosticsForComponent(
    typeCheckId: TypeCheckId,
    component: TcbTargetInput,
    boundTarget: BoundTarget<TcbDirectiveMetadata>,
  ): Diagnostic[] {
    const template = component.templateNodes;
    const diagnostics: Diagnostic[] = [];

    for (const [check, category] of this.templateChecks.entries()) {
      const ctx: TemplateContext<number> = {
        boundTarget,
        makeTemplateDiagnostic: (
          span: ParseSourceSpan | AbsoluteSourceSpan | {start: number; end: number},
          message: string,
          relatedInformation?: readonly DiagnosticRelatedInformation[],
        ): Diagnostic => {
          const start = span instanceof ParseSourceSpan ? span.start.offset : span.start;
          const end = span instanceof ParseSourceSpan ? span.end.offset : span.end;
          return {
            typeCheckId,
            category,
            code: check.code,
            message,
            start,
            end,
            ...(relatedInformation ? {relatedInformation} : {}),
          };
        },
      };

      diagnostics.push(...deduplicateDiagnostics(check.run(ctx, component, template)));
    }

    return diagnostics;
  }
}

/**
 * Filter out duplicated diagnostics, this is possible due to the way the compiler handles
 * structural directives (like `*ngIf`), where the compiler creates two nodes (`TmplAstTemplate`
 * and `TmplAstElement`) for the host element and binds the directive inputs to both of them.
 */
function deduplicateDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  const seen = new Set<string>();
  return diagnostics.filter((diag) => {
    const key = JSON.stringify([
      diag.typeCheckId,
      diag.sourceFilePath,
      diag.start,
      diag.end,
      diag.code,
      diag.category,
      diag.message,
    ]);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Converts a `DiagnosticCategoryLabel` to its equivalent `OutOfBandDiagnosticCategory` or `null` if
 * the label is `'suppress'`.
 */
export function diagnosticLabelToCategory(
  label: DiagnosticCategoryLabel,
): OutOfBandDiagnosticCategory | null {
  switch (label) {
    case 'warning':
      return OutOfBandDiagnosticCategory.Warning;
    case 'error':
      return OutOfBandDiagnosticCategory.Error;
    case 'suppress':
      return null;
    default:
      return assertNever(label);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected call to 'assertNever()' with value:\n${value}`);
}
