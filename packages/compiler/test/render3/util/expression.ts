/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteSourceSpan} from '../../../index';

import * as e from '../../../src/expression_parser/ast';
import * as t from '../../../src/render3/r3_ast';
import {unparse} from '../../expression_parser/utils/unparser';

type HumanizedExpressionSource = [string, AbsoluteSourceSpan];
class ExpressionSourceHumanizer extends e.RecursiveAstVisitor implements t.Visitor {
  result: HumanizedExpressionSource[] = [];

  private recordAst(ast: e.AST) {
    this.result.push([unparse(ast), ast.sourceSpan]);
  }

  // This method is defined to reconcile the type of ExpressionSourceHumanizer
  // since both RecursiveAstVisitor and Visitor define the visit() method in
  // their interfaces.
  override visit(node: e.AST | t.Node, context?: any) {
    if (node instanceof e.AST) {
      node.visit(this, context);
    } else {
      node.visit(this);
    }
  }

  visitASTWithSource(ast: e.ASTWithSource) {
    this.recordAst(ast);
    this.visitAll([ast.ast], null);
  }
  override visitBinary(ast: e.Binary) {
    this.recordAst(ast);
    super.visitBinary(ast, null);
  }
  override visitChain(ast: e.Chain) {
    this.recordAst(ast);
    super.visitChain(ast, null);
  }
  override visitConditional(ast: e.Conditional) {
    this.recordAst(ast);
    super.visitConditional(ast, null);
  }
  override visitImplicitReceiver(ast: e.ImplicitReceiver) {
    this.recordAst(ast);
    super.visitImplicitReceiver(ast, null);
  }
  override visitInterpolation(ast: e.Interpolation) {
    this.recordAst(ast);
    super.visitInterpolation(ast, null);
  }
  override visitKeyedRead(ast: e.KeyedRead) {
    this.recordAst(ast);
    super.visitKeyedRead(ast, null);
  }
  override visitKeyedWrite(ast: e.KeyedWrite) {
    this.recordAst(ast);
    super.visitKeyedWrite(ast, null);
  }
  override visitLiteralPrimitive(ast: e.LiteralPrimitive) {
    this.recordAst(ast);
    super.visitLiteralPrimitive(ast, null);
  }
  override visitLiteralArray(ast: e.LiteralArray) {
    this.recordAst(ast);
    super.visitLiteralArray(ast, null);
  }
  override visitLiteralMap(ast: e.LiteralMap) {
    this.recordAst(ast);
    super.visitLiteralMap(ast, null);
  }
  override visitNonNullAssert(ast: e.NonNullAssert) {
    this.recordAst(ast);
    super.visitNonNullAssert(ast, null);
  }
  override visitPipe(ast: e.BindingPipe) {
    this.recordAst(ast);
    super.visitPipe(ast, null);
  }
  override visitPrefixNot(ast: e.PrefixNot) {
    this.recordAst(ast);
    super.visitPrefixNot(ast, null);
  }
  override visitTypeofExpression(ast: e.TypeofExpression) {
    this.recordAst(ast);
    super.visitTypeofExpression(ast, null);
  }
  override visitVoidExpression(ast: e.VoidExpression) {
    this.recordAst(ast);
    super.visitVoidExpression(ast, null);
  }
  override visitPropertyRead(ast: e.PropertyRead) {
    this.recordAst(ast);
    super.visitPropertyRead(ast, null);
  }
  override visitPropertyWrite(ast: e.PropertyWrite) {
    this.recordAst(ast);
    super.visitPropertyWrite(ast, null);
  }
  override visitSafePropertyRead(ast: e.SafePropertyRead) {
    this.recordAst(ast);
    super.visitSafePropertyRead(ast, null);
  }
  override visitSafeKeyedRead(ast: e.SafeKeyedRead) {
    this.recordAst(ast);
    super.visitSafeKeyedRead(ast, null);
  }
  override visitCall(ast: e.Call) {
    this.recordAst(ast);
    super.visitCall(ast, null);
  }
  override visitSafeCall(ast: e.SafeCall) {
    this.recordAst(ast);
    super.visitSafeCall(ast, null);
  }
  override visitTemplateLiteral(ast: e.TemplateLiteral, context: any): void {
    this.recordAst(ast);
    super.visitTemplateLiteral(ast, null);
  }
  override visitTemplateLiteralElement(ast: e.TemplateLiteralElement, context: any): void {
    this.recordAst(ast);
    super.visitTemplateLiteralElement(ast, null);
  }
  override visitTaggedTemplateLiteral(ast: e.TaggedTemplateLiteral, context: any): void {
    this.recordAst(ast);
    super.visitTaggedTemplateLiteral(ast, null);
  }
  override visitParenthesizedExpression(ast: e.ParenthesizedExpression, context: any): void {
    this.recordAst(ast);
    super.visitParenthesizedExpression(ast, null);
  }

  visitTemplate(ast: t.Template) {
    t.visitAll(this, ast.directives);
    t.visitAll(this, ast.children);
    t.visitAll(this, ast.templateAttrs);
  }
  visitElement(ast: t.Element) {
    t.visitAll(this, ast.directives);
    t.visitAll(this, ast.children);
    t.visitAll(this, ast.inputs);
    t.visitAll(this, ast.outputs);
  }
  visitReference(ast: t.Reference) {}
  visitVariable(ast: t.Variable) {}
  visitEvent(ast: t.BoundEvent) {
    ast.handler.visit(this);
  }
  visitTextAttribute(ast: t.TextAttribute) {}
  visitBoundAttribute(ast: t.BoundAttribute) {
    ast.value.visit(this);
  }
  visitBoundEvent(ast: t.BoundEvent) {
    ast.handler.visit(this);
  }
  visitBoundText(ast: t.BoundText) {
    ast.value.visit(this);
  }
  visitContent(ast: t.Content) {
    t.visitAll(this, ast.children);
  }
  visitText(ast: t.Text) {}
  visitUnknownBlock(block: t.UnknownBlock) {}
  visitIcu(ast: t.Icu) {
    for (const key of Object.keys(ast.vars)) {
      ast.vars[key].visit(this);
    }
    for (const key of Object.keys(ast.placeholders)) {
      ast.placeholders[key].visit(this);
    }
  }

  visitDeferredBlock(deferred: t.DeferredBlock) {
    deferred.visitAll(this);
  }

  visitDeferredTrigger(trigger: t.DeferredTrigger): void {
    if (trigger instanceof t.BoundDeferredTrigger) {
      this.recordAst(trigger.value);
    }
  }

  visitDeferredBlockPlaceholder(block: t.DeferredBlockPlaceholder) {
    t.visitAll(this, block.children);
  }

  visitDeferredBlockError(block: t.DeferredBlockError) {
    t.visitAll(this, block.children);
  }

  visitDeferredBlockLoading(block: t.DeferredBlockLoading) {
    t.visitAll(this, block.children);
  }

  visitSwitchBlock(block: t.SwitchBlock) {
    block.expression.visit(this);
    t.visitAll(this, block.cases);
  }

  visitSwitchBlockCase(block: t.SwitchBlockCase) {
    block.expression?.visit(this);
    t.visitAll(this, block.children);
  }

  visitForLoopBlock(block: t.ForLoopBlock) {
    block.item.visit(this);
    t.visitAll(this, block.contextVariables);
    block.expression.visit(this);
    t.visitAll(this, block.children);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: t.ForLoopBlockEmpty) {
    t.visitAll(this, block.children);
  }

  visitIfBlock(block: t.IfBlock) {
    t.visitAll(this, block.branches);
  }

  visitIfBlockBranch(block: t.IfBlockBranch) {
    block.expression?.visit(this);
    block.expressionAlias?.visit(this);
    t.visitAll(this, block.children);
  }

  visitLetDeclaration(decl: t.LetDeclaration) {
    decl.value.visit(this);
  }

  visitComponent(ast: t.Component) {
    t.visitAll(this, ast.children);
    t.visitAll(this, ast.directives);
    t.visitAll(this, ast.inputs);
    t.visitAll(this, ast.outputs);
  }

  visitDirective(ast: t.Directive) {
    t.visitAll(this, ast.inputs);
    t.visitAll(this, ast.outputs);
  }
}

/**
 * Humanizes expression AST source spans in a template by returning an array of tuples
 *   [unparsed AST, AST source span]
 * for each expression in the template.
 * @param templateAsts template AST to humanize
 */
export function humanizeExpressionSource(templateAsts: t.Node[]): HumanizedExpressionSource[] {
  const humanizer = new ExpressionSourceHumanizer();
  t.visitAll(humanizer, templateAsts);
  return humanizer.result;
}
