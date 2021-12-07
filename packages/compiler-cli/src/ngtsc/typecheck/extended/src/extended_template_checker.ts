/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {NgCompilerOptions} from '../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../diagnostics';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {ExtendedTemplateChecker, TemplateCheck, TemplateCheckFactory, TemplateContext} from '../api';

export class ExtendedTemplateCheckerImpl implements ExtendedTemplateChecker {
  private readonly ctx: TemplateContext;
  private readonly templateChecks: TemplateCheck<ErrorCode>[];

  constructor(
      templateTypeChecker: TemplateTypeChecker, typeChecker: ts.TypeChecker,
      templateCheckFactories:
          readonly TemplateCheckFactory<ErrorCode, ExtendedTemplateDiagnosticName>[],
      options: NgCompilerOptions) {
    this.ctx = {templateTypeChecker: templateTypeChecker, typeChecker: typeChecker} as
        TemplateContext;
    this.templateChecks = templateCheckFactories.map((factory) => factory.create(options))
                              .filter((check): check is TemplateCheck<ErrorCode> => check !== null);
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
