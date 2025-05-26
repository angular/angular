/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  ImplicitReceiver,
  ParsedEventType,
  PropertyRead,
  Binary,
  RecursiveAstVisitor,
  TmplAstBoundEvent,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstVariable,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {isSignalReference} from '../../src/symbol_util';
import {TemplateSemanticsChecker} from '../api/api';

export class TemplateSemanticsCheckerImpl implements TemplateSemanticsChecker {
  constructor(private templateTypeChecker: TemplateTypeChecker) {}

  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[] {
    const template = this.templateTypeChecker.getTemplate(component);
    return template !== null
      ? TemplateSemanticsVisitor.visit(template, component, this.templateTypeChecker)
      : [];
  }
}

/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  private constructor(private expressionVisitor: ExpressionsSemanticsVisitor) {
    super();
  }

  static visit(
    nodes: TmplAstNode[],
    component: ts.ClassDeclaration,
    templateTypeChecker: TemplateTypeChecker,
  ) {
    const diagnostics: TemplateDiagnostic[] = [];
    const expressionVisitor = new ExpressionsSemanticsVisitor(
      templateTypeChecker,
      component,
      diagnostics,
    );
    const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
    nodes.forEach((node) => node.visit(templateVisitor));
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
    private templateTypeChecker: TemplateTypeChecker,
    private component: ts.ClassDeclaration,
    private diagnostics: TemplateDiagnostic[],
  ) {
    super();
  }

  override visitBinary(ast: Binary, context: TmplAstNode): void {
    if (ast.operation === '=' && ast.left instanceof PropertyRead) {
      this.checkForIllegalWriteInEventBinding(ast.left, context);
    } else {
      super.visitBinary(ast, context);
    }
  }

  override visitPropertyRead(ast: PropertyRead, context: TmplAstNode) {
    super.visitPropertyRead(ast, context);
    this.checkForIllegalWriteInTwoWayBinding(ast, context);
  }

  private checkForIllegalWriteInEventBinding(ast: PropertyRead, context: TmplAstNode) {
    if (!(context instanceof TmplAstBoundEvent) || !(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }

    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    if (target instanceof TmplAstVariable) {
      const errorMessage = `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }

  private checkForIllegalWriteInTwoWayBinding(ast: PropertyRead, context: TmplAstNode) {
    // Only check top-level property reads inside two-way bindings for illegal assignments.
    if (
      !(context instanceof TmplAstBoundEvent) ||
      context.type !== ParsedEventType.TwoWay ||
      !(ast.receiver instanceof ImplicitReceiver) ||
      ast !== unwrapAstWithSource(context.handler)
    ) {
      return;
    }

    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    const isVariable = target instanceof TmplAstVariable;
    const isLet = target instanceof TmplAstLetDeclaration;

    if (!isVariable && !isLet) {
      return;
    }

    // Two-way bindings to template variables are only allowed if the variables are signals.
    const symbol = this.templateTypeChecker.getSymbolOfNode(target, this.component);
    if (symbol !== null && !isSignalReference(symbol)) {
      let errorMessage: string;

      if (isVariable) {
        errorMessage = `Cannot use a non-signal variable '${target.name}' in a two-way binding expression. Template variables are read-only.`;
      } else {
        errorMessage = `Cannot use non-signal @let declaration '${target.name}' in a two-way binding expression. @let declarations are read-only.`;
      }

      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }

  private makeIllegalTemplateVarDiagnostic(
    target: TmplAstVariable | TmplAstLetDeclaration,
    expressionNode: TmplAstBoundEvent,
    errorMessage: string,
  ): TemplateDiagnostic {
    const span =
      target instanceof TmplAstVariable ? target.valueSpan || target.sourceSpan : target.sourceSpan;
    return this.templateTypeChecker.makeTemplateDiagnostic(
      this.component,
      expressionNode.handlerSpan,
      ts.DiagnosticCategory.Error,
      ngErrorCode(ErrorCode.WRITE_TO_READ_ONLY_VARIABLE),
      errorMessage,
      [
        {
          text: `'${target.name}' is declared here.`,
          start: span.start.offset,
          end: span.end.offset,
          sourceFile: this.component.getSourceFile(),
        },
      ],
    );
  }
}

function unwrapAstWithSource(ast: AST): AST {
  return ast instanceof ASTWithSource ? ast.ast : ast;
}
