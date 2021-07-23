/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ErrorCode} from '../../../diagnostics';
import {TemplateTypeChecker} from '../../api';
import {TemplateCheck, TemplateContext} from '../api/api';

/**
 * Run all `TemplateChecks` for a component and return the generated `ts.Diagnostic`s.
 * @param component the `@Component()` class from which the template is obtained
 * @param templateTypeChecker interface to get information about template nodes
 * @param typeChecker program's type checker
 * @param templateChecks specific checks to be run
 * @returns generated `ts.Diagnostic[]`
 */
export function getExtendedTemplateDiagnosticsForComponent(
    component: ts.ClassDeclaration, templateTypeChecker: TemplateTypeChecker,
    typeChecker: ts.TypeChecker, templateChecks: TemplateCheck<ErrorCode>[]): ts.Diagnostic[] {
  const template = templateTypeChecker.getTemplate(component);
  // Skip checks if component has no template. This can happen if the user writes a
  // `@Component()` but doesn't add the template, could happen in the language service
  // when users are in the middle of typing code.
  if (template === null) {
    return [];
  }
  const diagnostics: ts.Diagnostic[] = [];

  const ctx = {templateTypeChecker, typeChecker, component} as TemplateContext;

  for (const check of templateChecks) {
    diagnostics.push(...deduplicateDiagnostics(check.run(ctx, template)));
  }

  return diagnostics;
}

// Filter out duplicated diagnostics, this is possible due to the way the compiler
// handles desugaring and produces `AST`s. Ex.
//
// ```
// <div *ngIf="true" (foo)="bar">test</div>
// ```
//
// Would result in the following AST:
//
// ```
// Template {
//   outputs: [
//    BoundEvent {
//      name: 'foo',
//      /.../
//    }
//   ],
//   children: [
//     Element {
//       outputs: [
//         BoundEvent {
//           name: 'foo',
//           /.../
//         }
//       ]
//     }
//   ],
//   /.../
// }
// ```
//
// In this case a duplicated diagnostic could be generated for the output `foo`.
// TODO(danieltrevino): handle duplicated diagnostics when they are being generated
// to avoid extra work (could be directly in the visitor).
// https://github.com/angular/angular/pull/42984#discussion_r684823926
function deduplicateDiagnostics(diagnostics: ts.Diagnostic[]): ts.Diagnostic[] {
  const result: ts.Diagnostic[] = [];
  for (const newDiag of diagnostics) {
    const isDuplicateDiag = result.some(existingDiag => areDiagnosticsEqual(newDiag, existingDiag));
    if (!isDuplicateDiag) {
      result.push(newDiag);
    }
  }
  return result;
}

function areDiagnosticsEqual(first: ts.Diagnostic, second: ts.Diagnostic): boolean {
  return first.file?.fileName === second.file?.fileName && first.start === second.start &&
      first.length === second.length && first.code === second.code;
}
