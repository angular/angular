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
 * Interface to generate extended template diagnostics from the component templates.
 */
export interface ExtendedTemplateChecker {
  /**
   * Run `TemplateCheck`s for a component and return the generated `ts.Diagnostic`s.
   */
  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[];
}
