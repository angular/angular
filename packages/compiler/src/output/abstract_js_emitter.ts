/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
    super(false);
  }

  override visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): any {
    throw new Error('Cannot emit a WrappedNodeExpr in Javascript.');
  }

  override visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    ctx.print(stmt, `var ${stmt.name}`);
    if (stmt.value) {
      ctx.print(stmt, ' = ');
      stmt.value.visitExpression(this, ctx);
    }
    ctx.println(stmt, `;`);
    return null;
  }
  override visitTaggedTemplateExpr(ast: o.TaggedTemplateExpr, ctx: EmitterVisitorContext): any {
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
    ctx.print(ast, `[${elements.map(part => escapeIdentifier(part.text, false)).join(', ')}], `);
    ctx.print(ast, `[${elements.map(part => escapeIdentifier(part.rawText, false)).join(', ')}])`);
    ast.template.expressions.forEach(expression => {
      ctx.print(ast, ', ');
      expression.visitExpression(this, ctx);
    });
    ctx.print(ast, ')');
    return null;
  }
  override visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any {
    ctx.print(ast, `function${ast.name ? ' ' + ast.name : ''}(`);
    this._visitParams(ast.params, ctx);
    ctx.println(ast, `) {`);
    ctx.incIndent();
    this.visitAllStatements(ast.statements, ctx);
    ctx.decIndent();
    ctx.print(ast, `}`);
    return null;
  }
  override visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any {
    ctx.print(stmt, `function ${stmt.name}(`);
    this._visitParams(stmt.params, ctx);
    ctx.println(stmt, `) {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.statements, ctx);
    ctx.decIndent();
    ctx.println(stmt, `}`);
    return null;
  }
  override visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): any {
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
    ctx.print(ast, `[${parts.map(part => escapeIdentifier(part.cooked, false)).join(', ')}], `);
    ctx.print(ast, `[${parts.map(part => escapeIdentifier(part.raw, false)).join(', ')}])`);
    ast.expressions.forEach(expression => {
      ctx.print(ast, ', ');
      expression.visitExpression(this, ctx);
    });
    ctx.print(ast, ')');
    return null;
  }

  private _visitParams(params: o.FnParam[], ctx: EmitterVisitorContext): void {
    this.visitAllObjects(param => ctx.print(null, param.name), params, ctx, ',');
  }
}
