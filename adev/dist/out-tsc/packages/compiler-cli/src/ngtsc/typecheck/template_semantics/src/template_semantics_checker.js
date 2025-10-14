/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ASTWithSource,
  ImplicitReceiver,
  ParsedEventType,
  PropertyRead,
  Binary,
  RecursiveAstVisitor,
  TmplAstBoundEvent,
  TmplAstLetDeclaration,
  TmplAstRecursiveVisitor,
  TmplAstVariable,
} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {isSignalReference} from '../../src/symbol_util';
export class TemplateSemanticsCheckerImpl {
  templateTypeChecker;
  constructor(templateTypeChecker) {
    this.templateTypeChecker = templateTypeChecker;
  }
  getDiagnosticsForComponent(component) {
    const template = this.templateTypeChecker.getTemplate(component);
    return template !== null
      ? TemplateSemanticsVisitor.visit(template, component, this.templateTypeChecker)
      : [];
  }
}
/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  expressionVisitor;
  constructor(expressionVisitor) {
    super();
    this.expressionVisitor = expressionVisitor;
  }
  static visit(nodes, component, templateTypeChecker) {
    const diagnostics = [];
    const expressionVisitor = new ExpressionsSemanticsVisitor(
      templateTypeChecker,
      component,
      diagnostics,
    );
    const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
    nodes.forEach((node) => node.visit(templateVisitor));
    return diagnostics;
  }
  visitBoundEvent(event) {
    super.visitBoundEvent(event);
    event.handler.visit(this.expressionVisitor, event);
  }
}
/** Visitor that verifies the semantics of the expressions within a template. */
class ExpressionsSemanticsVisitor extends RecursiveAstVisitor {
  templateTypeChecker;
  component;
  diagnostics;
  constructor(templateTypeChecker, component, diagnostics) {
    super();
    this.templateTypeChecker = templateTypeChecker;
    this.component = component;
    this.diagnostics = diagnostics;
  }
  visitBinary(ast, context) {
    if (Binary.isAssignmentOperation(ast.operation) && ast.left instanceof PropertyRead) {
      this.checkForIllegalWriteInEventBinding(ast.left, context);
    } else {
      super.visitBinary(ast, context);
    }
  }
  visitPropertyRead(ast, context) {
    super.visitPropertyRead(ast, context);
    this.checkForIllegalWriteInTwoWayBinding(ast, context);
  }
  checkForIllegalWriteInEventBinding(ast, context) {
    if (!(context instanceof TmplAstBoundEvent) || !(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }
    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    if (target instanceof TmplAstVariable) {
      const errorMessage = `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }
  checkForIllegalWriteInTwoWayBinding(ast, context) {
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
      let errorMessage;
      if (isVariable) {
        errorMessage = `Cannot use a non-signal variable '${target.name}' in a two-way binding expression. Template variables are read-only.`;
      } else {
        errorMessage = `Cannot use non-signal @let declaration '${target.name}' in a two-way binding expression. @let declarations are read-only.`;
      }
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }
  makeIllegalTemplateVarDiagnostic(target, expressionNode, errorMessage) {
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
function unwrapAstWithSource(ast) {
  return ast instanceof ASTWithSource ? ast.ast : ast;
}
//# sourceMappingURL=template_semantics_checker.js.map
