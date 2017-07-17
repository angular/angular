/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '@angular/core';
import {identifierName} from '../compile_metadata';

import {EmitterVisitorContext} from './abstract_emitter';
import {AbstractJsEmitterVisitor} from './abstract_js_emitter';
import * as o from './output_ast';

function evalExpression(
    sourceUrl: string, ctx: EmitterVisitorContext, vars: {[key: string]: any}): any {
  let fnBody = `${ctx.toSource()}\n//# sourceURL=${sourceUrl}`;
  const fnArgNames: string[] = [];
  const fnArgValues: any[] = [];
  for (const argName in vars) {
    fnArgNames.push(argName);
    fnArgValues.push(vars[argName]);
  }
  if (isDevMode()) {
    // using `new Function(...)` generates a header, 1 line of no arguments, 2 lines otherwise
    // E.g. ```
    // function anonymous(a,b,c
    // /**/) { ... }```
    // We don't want to hard code this fact, so we auto detect it via an empty function first.
    const emptyFn = new Function(...fnArgNames.concat('return null;')).toString();
    const headerLines = emptyFn.slice(0, emptyFn.indexOf('return null;')).split('\n').length - 1;
    fnBody += `\n${ctx.toSourceMapGenerator(sourceUrl, sourceUrl, headerLines).toJsComment()}`;
  }
  return new Function(...fnArgNames.concat(fnBody))(...fnArgValues);
}

export function jitStatements(sourceUrl: string, statements: o.Statement[]): {[key: string]: any} {
  const converter = new JitEmitterVisitor();
  const ctx = EmitterVisitorContext.createRoot();
  converter.visitAllStatements(statements, ctx);
  converter.createReturnStmt(ctx);
  return evalExpression(sourceUrl, ctx, converter.getArgs());
}

export class JitEmitterVisitor extends AbstractJsEmitterVisitor {
  private _evalArgNames: string[] = [];
  private _evalArgValues: any[] = [];
  private _evalExportedVars: string[] = [];

  createReturnStmt(ctx: EmitterVisitorContext) {
    const stmt = new o.ReturnStatement(new o.LiteralMapExpr(this._evalExportedVars.map(
        resultVar => new o.LiteralMapEntry(resultVar, o.variable(resultVar), false))));
    stmt.visitStatement(this, ctx);
  }

  getArgs(): {[key: string]: any} {
    const result: {[key: string]: any} = {};
    for (let i = 0; i < this._evalArgNames.length; i++) {
      result[this._evalArgNames[i]] = this._evalArgValues[i];
    }
    return result;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    const value = ast.value.runtime;
    let id = this._evalArgValues.indexOf(value);
    if (id === -1) {
      id = this._evalArgValues.length;
      this._evalArgValues.push(value);
      const name = identifierName({reference: ast.value.runtime}) || 'val';
      this._evalArgNames.push(`jit_${name}_${id}`);
    }
    ctx.print(ast, this._evalArgNames[id]);
    return null;
  }

  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      this._evalExportedVars.push(stmt.name);
    }
    return super.visitDeclareVarStmt(stmt, ctx);
  }

  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any {
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      this._evalExportedVars.push(stmt.name);
    }
    return super.visitDeclareFunctionStmt(stmt, ctx);
  }

  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any {
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      this._evalExportedVars.push(stmt.name);
    }
    return super.visitDeclareClassStmt(stmt, ctx);
  }
}
