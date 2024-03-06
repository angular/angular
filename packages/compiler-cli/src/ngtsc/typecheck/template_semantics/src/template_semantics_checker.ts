/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImplicitReceiver, PropertyWrite, RecursiveAstVisitor, TmplAstBoundEvent, TmplAstNode, TmplAstRecursiveVisitor, TmplAstVariable} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {TemplateSemanticsChecker} from '../api/api';

export class TemplateSemanticsCheckerImpl implements TemplateSemanticsChecker {
  constructor(private templateTypeChecker: TemplateTypeChecker) {}

  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[] {
    const template = this.templateTypeChecker.getTemplate(component);
    return template !== null ?
        TemplateSemanticsVisitor.visit(template, component, this.templateTypeChecker) :
        [];
  }
}

/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  private constructor(private expressionVisitor: ExpressionsSemanticsVisitor) {
    super();
  }

  static visit(
      nodes: TmplAstNode[], component: ts.ClassDeclaration,
      templateTypeChecker: TemplateTypeChecker) {
    const diagnostics: TemplateDiagnostic[] = [];
    const expressionVisitor =
        new ExpressionsSemanticsVisitor(templateTypeChecker, component, diagnostics);
    const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
    nodes.forEach(node => node.visit(templateVisitor));
    return diagnostics;
  }

  override visitBoundEvent(event: TmplAstBoundEvent): void {
    super.visitBoundEvent(event);
    event.handler.visit(this.expressionVisitor, event);
  }
}

/** Visitor that verifies the semantics of the expressions within a template. */
class ExpressionsSemanticsVisitor extends RecursiveAstVisitor {
  constructor(
      private templateTypeChecker: TemplateTypeChecker, private component: ts.ClassDeclaration,
      private diagnostics: TemplateDiagnostic[]) {
    super();
  }

  override visitPropertyWrite(ast: PropertyWrite, context: TmplAstNode): void {
    super.visitPropertyWrite(ast, context);

    if (!(context instanceof TmplAstBoundEvent) || !(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }

    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    if (target instanceof TmplAstVariable) {
      const errorMessage = `Cannot use variable '${
          target
              .name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }

  private makeIllegalTemplateVarDiagnostic(
      target: TmplAstVariable, expressionNode: TmplAstNode,
      errorMessage: string): TemplateDiagnostic {
    return this.templateTypeChecker.makeTemplateDiagnostic(
        this.component, expressionNode.sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.WRITE_TO_READ_ONLY_VARIABLE), errorMessage, [{
          text: `The variable ${target.name} is declared here.`,
          start: target.valueSpan?.start.offset || target.sourceSpan.start.offset,
          end: target.valueSpan?.end.offset || target.sourceSpan.end.offset,
          sourceFile: this.component.getSourceFile(),
        }]);
  }
}
