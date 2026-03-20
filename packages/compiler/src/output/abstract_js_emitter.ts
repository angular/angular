/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractEmitterVisitor, EmitterVisitorContext, escapeIdentifier} from './abstract_emitter';
import * as o from './output_ast';

/**
 * In TypeScript, tagged template functions expect a "template object", which is an array of
 * "cooked" strings plus a `raw` property that contains an array of "raw" strings. This is
 * typically constructed with a function called `__makeTemplateObject(cooked, raw)`, but it may not
 * be available in all environments.
 *
 * This is a JavaScript polyfill that uses __makeTemplateObject when it's available, but otherwise
 * creates an inline helper with the same functionality.
 *
 * In the inline function, if `Object.defineProperty` is available we use that to attach the `raw`
 * array.
 */
const makeTemplateObjectPolyfill =
  '(this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})';

export abstract class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
  constructor() {
    super(false /* printComments */, false /* emitTypes */);
  }

  override visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): void {
    throw new Error('Cannot emit a WrappedNodeExpr in Javascript.');
  }

  override visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): void {
    ctx.print(stmt, `var ${stmt.name}`);
    if (stmt.value) {
      ctx.print(stmt, ' = ');
      stmt.value.visitExpression(this, ctx);
    }
    ctx.println(stmt, `;`);
  }

  override visitTaggedTemplateLiteralExpr(
    ast: o.TaggedTemplateLiteralExpr,
    ctx: EmitterVisitorContext,
  ): void {
    // The following convoluted piece of code is effectively the downlevelled equivalent of
    // ```
    // tag`...`
    // ```
    // which is effectively like:
    // ```
    // tag(__makeTemplateObject(cooked, raw), expression1, expression2, ...);
    // ```
    const elements = ast.template.elements;
    ast.tag.visitExpression(this, ctx);
    ctx.print(ast, `(${makeTemplateObjectPolyfill}(`);
    ctx.print(ast, `[${elements.map((part) => escapeIdentifier(part.text)).join(', ')}], `);
    ctx.print(ast, `[${elements.map((part) => escapeIdentifier(part.rawText)).join(', ')}])`);
    ast.template.expressions.forEach((expression) => {
      ctx.print(ast, ', ');
      expression.visitExpression(this, ctx);
    });
    ctx.print(ast, ')');
  }

  override visitTemplateLiteralExpr(expr: o.TemplateLiteralExpr, ctx: EmitterVisitorContext): void {
    ctx.print(expr, '`');
    for (let i = 0; i < expr.elements.length; i++) {
      expr.elements[i].visitExpression(this, ctx);
      const expression = i < expr.expressions.length ? expr.expressions[i] : null;
      if (expression !== null) {
        ctx.print(expression, '${');
        expression.visitExpression(this, ctx);
        ctx.print(expression, '}');
      }
    }
    ctx.print(expr, '`');
  }

  override visitTemplateLiteralElementExpr(
    expr: o.TemplateLiteralElementExpr,
    ctx: EmitterVisitorContext,
  ): void {
    ctx.print(expr, expr.rawText);
  }

  override visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): void {
    // The following convoluted piece of code is effectively the downlevelled equivalent of
    // ```
    // $localize `...`
    // ```
    // which is effectively like:
    // ```
    // $localize(__makeTemplateObject(cooked, raw), expression1, expression2, ...);
    // ```
    ctx.print(ast, `$localize(${makeTemplateObjectPolyfill}(`);
    const parts = [ast.serializeI18nHead()];
    for (let i = 1; i < ast.messageParts.length; i++) {
      parts.push(ast.serializeI18nTemplatePart(i));
    }
    ctx.print(ast, `[${parts.map((part) => escapeIdentifier(part.cooked)).join(', ')}], `);
    ctx.print(ast, `[${parts.map((part) => escapeIdentifier(part.raw)).join(', ')}])`);
    ast.expressions.forEach((expression) => {
      ctx.print(ast, ', ');
      expression.visitExpression(this, ctx);
    });
    ctx.print(ast, ')');
  }
}
