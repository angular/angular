/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../../core/api';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {TemplateSemanticsChecker} from '../api/api';

export class TemplateSemanticsCheckerImpl implements TemplateSemanticsChecker {
  constructor(private templateTypeChecker: TemplateTypeChecker) {}

  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[] {
    const template = this.templateTypeChecker.getTemplate(component);

    if (template === null) {
      return [];
    }

    const diagnostics: TemplateDiagnostic[] = [];
    return diagnostics;
  }
}
