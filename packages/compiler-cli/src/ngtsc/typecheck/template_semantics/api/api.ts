/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {TemplateDiagnostic} from '../../api';

/**
 * Interface to generate diagnostics related to the semantics of a component's template.
 */
export interface TemplateSemanticsChecker {
  /**
   * Run `TemplateSemanticsChecker`s for a component and return the generated `ts.Diagnostic`s.
   */
  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[];
}
