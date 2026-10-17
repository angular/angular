/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BoundTarget,
  OutOfBandDiagnosticCategory,
  TcbDirectiveMetadata,
  TypeCheckId,
} from '@angular/compiler';
import type {Diagnostic} from '../diagnostic.js';
import type {TcbTargetInput} from '../tcb.js';
import type {ComponentImportEntryMetadata, SpanMetadata} from '../types.js';

/**
 * Rule that flags unused symbols inside of the `imports` array of a standalone component.
 *
 * Mirrors `UnusedStandaloneImportsRule` in
 * `ngtsc/validation/src/rules/unused_standalone_imports_rule.ts`.
 */
export function checkUnusedStandaloneImports(
  typeCheckId: TypeCheckId,
  category: OutOfBandDiagnosticCategory,
  comp: TcbTargetInput,
  boundTarget: BoundTarget<TcbDirectiveMetadata>,
  filePath: string,
): Diagnostic[] {
  const component = comp.classMeta.component;
  if (!comp.isStandalone || !component?.resolvedImportEntries?.length) {
    return [];
  }
  const importEntries = component.resolvedImportEntries;
  const usedDirectives = boundTarget.getUsedDirectives();
  const usedPipes = new Set(boundTarget.getUsedPipes());

  const isUsedDirective = (entry: ComponentImportEntryMetadata): boolean => {
    return usedDirectives.some((dir) => {
      const ref = dir.ref;
      if (entry.filePath != null && ref.nodeFilePath != null) {
        return ref.nodeFilePath === entry.filePath && dir.name === entry.name;
      }
      return dir.name === entry.name;
    });
  };

  const unused: ComponentImportEntryMetadata[] = [];
  for (const entry of importEntries) {
    if (
      (entry.declarationType === 'component' || entry.declarationType === 'directive') &&
      entry.isStandalone !== false &&
      !isUsedDirective(entry) &&
      !entry.isPotentialShared
    ) {
      unused.push(entry);
    } else if (
      entry.declarationType === 'pipe' &&
      entry.isStandalone !== false &&
      entry.pipeName != null &&
      !usedPipes.has(entry.pipeName) &&
      !entry.isPotentialShared
    ) {
      unused.push(entry);
    }
  }

  if (unused.length === 0) {
    return [];
  }

  if (unused.length === importEntries.length && component.importsKeySpan != null) {
    return [
      {
        typeCheckId,
        category,
        code: 8113,
        message: 'All imports are unused',
        start: component.importsKeySpan.start,
        end: component.importsKeySpan.end,
        sourceFilePath: filePath,
      },
    ];
  }

  const fallbackSpan: SpanMetadata =
    component.importsFactorySpan ?? component.rawImportsSpan ?? comp.classMeta.span;
  return unused.map((entry) => {
    const span = entry.usageSpan ?? fallbackSpan;
    return {
      typeCheckId,
      category,
      code: 8113,
      message: `${entry.name} is not used within the template of ${comp.className}`,
      start: span.start,
      end: span.end,
      sourceFilePath: filePath,
    };
  });
}
