/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan} from '@angular/compiler';
import * as e from '../../../src/expression_parser/ast';
import * as t from '../../../src/template_parser/template_ast';
import {unparse} from '../../expression_parser/utils/unparser';

type HumanizedExpressionSource = [string, AbsoluteSourceSpan];
class ExpressionSourceHumanizer extends e.RecursiveAstVisitor implements t.TemplateAstVisitor {
  result: HumanizedExpressionSource[] = [];

  private recordAst(ast: e.AST) {
    this.result.push([unparse(ast), ast.sourceSpan]);
  }

  // This method is defined to reconcile the type of ExpressionSourceHumanizer
  // since both RecursiveAstVisitor and TemplateAstVisitor define the visit()
  // method in their interfaces.
  visit(node: e.AST|t.TemplateAst, context?: any) {
    node.visit(this, context);
  }

  visitASTWithSource(ast: e.ASTWithSource) {
    this.recordAst(ast);
    this.visitAll([ast.ast], null);
  }
  visitUnary(ast: e.Unary) {
    this.recordAst(ast);
    super.visitUnary(ast, null);
  }
  visitBinary(ast: e.Binary) {
    this.recordAst(ast);
    super.visitBinary(ast, null);
  }
  visitChain(ast: e.Chain) {
    this.recordAst(ast);
    super.visitChain(ast, null);
  }
  visitConditional(ast: e.Conditional) {
    this.recordAst(ast);
    super.visitConditional(ast, null);
  }
  visitFunctionCall(ast: e.FunctionCall) {
    this.recordAst(ast);
    super.visitFunctionCall(ast, null);
  }
  visitImplicitReceiver(ast: e.ImplicitReceiver) {
    this.recordAst(ast);
    super.visitImplicitReceiver(ast, null);
  }
  visitInterpolation(ast: e.Interpolation) {
    this.recordAst(ast);
    super.visitInterpolation(ast, null);
  }
  visitKeyedRead(ast: e.KeyedRead) {
    this.recordAst(ast);
    super.visitKeyedRead(ast, null);
  }
  visitKeyedWrite(ast: e.KeyedWrite) {
    this.recordAst(ast);
    super.visitKeyedWrite(ast, null);
  }
  visitLiteralPrimitive(ast: e.LiteralPrimitive) {
    this.recordAst(ast);
    super.visitLiteralPrimitive(ast, null);
  }
  visitLiteralArray(ast: e.LiteralArray) {
    this.recordAst(ast);
    super.visitLiteralArray(ast, null);
  }
  visitLiteralMap(ast: e.LiteralMap) {
    this.recordAst(ast);
    super.visitLiteralMap(ast, null);
  }
  visitMethodCall(ast: e.MethodCall) {
    this.recordAst(ast);
    super.visitMethodCall(ast, null);
  }
  visitNonNullAssert(ast: e.NonNullAssert) {
    this.recordAst(ast);
    super.visitNonNullAssert(ast, null);
  }
  visitPipe(ast: e.BindingPipe) {
    this.recordAst(ast);
    super.visitPipe(ast, null);
  }
  visitPrefixNot(ast: e.PrefixNot) {
    this.recordAst(ast);
    super.visitPrefixNot(ast, null);
  }
  visitPropertyRead(ast: e.PropertyRead) {
    this.recordAst(ast);
    super.visitPropertyRead(ast, null);
  }
  visitPropertyWrite(ast: e.PropertyWrite) {
    this.recordAst(ast);
    super.visitPropertyWrite(ast, null);
  }
  visitSafeMethodCall(ast: e.SafeMethodCall) {
    this.recordAst(ast);
    super.visitSafeMethodCall(ast, null);
  }
  visitSafePropertyRead(ast: e.SafePropertyRead) {
    this.recordAst(ast);
    super.visitSafePropertyRead(ast, null);
  }
  visitQuote(ast: e.Quote) {
    this.recordAst(ast);
    super.visitQuote(ast, null);
  }

  visitNgContent(ast: t.NgContentAst) {}
  visitEmbeddedTemplate(ast: t.EmbeddedTemplateAst) {
    t.templateVisitAll(this, ast.attrs);
    t.templateVisitAll(this, ast.children);
    t.templateVisitAll(this, ast.directives);
    t.templateVisitAll(this, ast.outputs);
    t.templateVisitAll(this, ast.providers);
    t.templateVisitAll(this, ast.references);
    t.templateVisitAll(this, ast.variables);
  }
  visitElement(ast: t.ElementAst) {
    t.templateVisitAll(this, ast.attrs);
    t.templateVisitAll(this, ast.children);
    t.templateVisitAll(this, ast.directives);
    t.templateVisitAll(this, ast.inputs);
    t.templateVisitAll(this, ast.outputs);
    t.templateVisitAll(this, ast.providers);
    t.templateVisitAll(this, ast.references);
  }
  visitReference(ast: t.ReferenceAst) {}
  visitVariable(ast: t.VariableAst) {}
  visitEvent(ast: t.BoundEventAst) {
    ast.handler.visit(this);
  }
  visitElementProperty(ast: t.BoundElementPropertyAst) {
    ast.value.visit(this);
  }
  visitAttr(ast: t.AttrAst) {}
  visitBoundText(ast: t.BoundTextAst) {
    ast.value.visit(this);
  }
  visitText(ast: t.TextAst) {}
  visitDirective(ast: t.DirectiveAst) {
    t.templateVisitAll(this, ast.hostEvents);
    t.templateVisitAll(this, ast.hostProperties);
    t.templateVisitAll(this, ast.inputs);
  }
  visitDirectiveProperty(ast: t.BoundDirectivePropertyAst) {
    ast.value.visit(this);
  }
}

/**
 * Humanizes expression AST source spans in a template by returning an array of tuples
 *   [unparsed AST, AST source span]
 * for each expression in the template.
 * @param templateAsts template AST to humanize
 */
export function humanizeExpressionSource(templateAsts: t.TemplateAst[]):
    HumanizedExpressionSource[] {
  const humanizer = new ExpressionSourceHumanizer();
  t.templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}
