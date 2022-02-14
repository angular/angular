/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {Reference} from '../../../imports';
import {ResolvedValue} from '../../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration} from '../../../reflection';
import {createValueHasWrongTypeError} from '../../common';

export function validateAndFlattenComponentImports(imports: ResolvedValue, expr: ts.Expression): {
  imports: Reference<ClassDeclaration>[],
  diagnostics: ts.Diagnostic[],
} {
  const flattened: Reference<ClassDeclaration>[] = [];

  if (!Array.isArray(imports)) {
    const error = createValueHasWrongTypeError(
                      expr, imports,
                      `'imports' must be an array of components, directives, pipes, or NgModules`)
                      .toDiagnostic();
    return {
      imports: [],
      diagnostics: [error],
    };
  }
  const diagnostics: ts.Diagnostic[] = [];

  for (const ref of imports) {
    if (Array.isArray(ref)) {
      const {imports: childImports, diagnostics: childDiagnostics} =
          validateAndFlattenComponentImports(ref, expr);
      flattened.push(...childImports);
      diagnostics.push(...childDiagnostics);
    } else if (ref instanceof Reference) {
      if (isNamedClassDeclaration(ref.node)) {
        flattened.push(ref as Reference<ClassDeclaration>);
      } else {
        diagnostics.push(
            createValueHasWrongTypeError(
                ref.getOriginForDiagnostics(expr), ref,
                `'imports' must be an array of components, directives, pipes, or NgModules`)
                .toDiagnostic());
      }
    } else {
      diagnostics.push(
          createValueHasWrongTypeError(
              expr, imports,
              `'imports' must be an array of components, directives, pipes, or NgModules`)
              .toDiagnostic());
    }
  }

  return {imports: flattened, diagnostics};
}
