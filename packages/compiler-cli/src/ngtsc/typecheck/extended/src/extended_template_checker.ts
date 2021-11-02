/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode} from '../../../diagnostics';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {ExtendedTemplateChecker, TemplateCheck, TemplateContext} from '../api';

export class ExtendedTemplateCheckerImpl implements ExtendedTemplateChecker {
  private ctx: TemplateContext;

  constructor(
      templateTypeChecker: TemplateTypeChecker, typeChecker: ts.TypeChecker,
      private readonly templateChecks: TemplateCheck<ErrorCode>[]) {
    this.ctx = {templateTypeChecker: templateTypeChecker, typeChecker: typeChecker} as
        TemplateContext;
  }

  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[] {
    const template = this.ctx.templateTypeChecker.getTemplate(component);
    // Skip checks if component has no template. This can happen if the user writes a
    // `@Component()` but doesn't add the template, could happen in the language service
    // when users are in the middle of typing code.
    if (template === null) {
      return [];
    }
    const diagnostics: TemplateDiagnostic[] = [];

    for (const check of this.templateChecks) {
      diagnostics.push(...check.run(this.ctx, component, template));
    }

    return diagnostics;
  }
}
