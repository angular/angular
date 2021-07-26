/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstBoundEvent, TmplAstNode, TmplAstRecursiveVisitor} from '@angular/compiler';
import * as ts from 'typescript';
import {ErrorCode} from '../../../../../diagnostics';
import {TemplateCheck, TemplateContext, TemplateDiagnostic} from '../../../api/api';

/**
 * Ensures the two-way binding syntax is correct.
 * Parentheses should be inside the brackets "[()]".
 * Will return diagnostic information when "([])" is found.
 */
export class InvalidBananaInBoxCheck implements TemplateCheck<ErrorCode.INVALID_BANANA_IN_BOX> {
  code: ErrorCode.INVALID_BANANA_IN_BOX = 8101;

  run(ctx: TemplateContext,
      template: TmplAstNode[]): TemplateDiagnostic<ErrorCode.INVALID_BANANA_IN_BOX>[] {
    const visitor = new BananaVisitor(ctx);

    return visitor.getDiagnostics(template);
  }
}

class BananaVisitor extends TmplAstRecursiveVisitor {
  private diagnostics: ts.Diagnostic[] = [];

  constructor(public readonly ctx: TemplateContext) {
    super();
  }

  /**
   * Check for outputs with names surrounded in brackets "[]".
   * The syntax '([foo])="bar"' would be interpreted as an @Output()
   * with name '[foo]'. Just like '(foo)="bar"' would have the name 'foo'.
   * Generate diagnostic information for the cases found.
   */
  override visitBoundEvent(boundEvent: TmplAstBoundEvent) {
    const name = boundEvent.name;
    if (name.startsWith('[') && name.endsWith(']')) {
      const boundSyntax = boundEvent.sourceSpan.toString();
      const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
      this.diagnostics.push(
          this.ctx.templateTypeChecker.makeTemplateDiagnostic<ErrorCode.INVALID_BANANA_IN_BOX>(
              this.ctx.component, boundEvent.sourceSpan, ts.DiagnosticCategory.Warning,
              ErrorCode.INVALID_BANANA_IN_BOX,
              `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${
                  expectedBoundSyntax}'. 
                Find more at https://angular.io/guide/two-way-binding`));
    }
  }

  getDiagnostics(template: TmplAstNode[]): ts.Diagnostic[] {
    this.diagnostics = [];
    for (const node of template) {
      node.visit(this);
    }
    return this.diagnostics;
  }
}
