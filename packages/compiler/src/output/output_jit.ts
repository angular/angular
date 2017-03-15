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

export function jitStatements(
    sourceUrl: string, statements: o.Statement[], resultVars: string[]): any[] {
  const converter = new JitEmitterVisitor();
  const ctx = EmitterVisitorContext.createRoot(resultVars);
  const returnStmt =
      new o.ReturnStatement(o.literalArr(resultVars.map(resultVar => o.variable(resultVar))));
  converter.visitAllStatements(statements.concat([returnStmt]), ctx);
  return evalExpression(sourceUrl, ctx, converter.getArgs());
}

class JitEmitterVisitor extends AbstractJsEmitterVisitor {
  private _evalArgNames: string[] = [];
  private _evalArgValues: any[] = [];

  getArgs(): {[key: string]: any} {
    const result: {[key: string]: any} = {};
    for (let i = 0; i < this._evalArgNames.length; i++) {
      result[this._evalArgNames[i]] = this._evalArgValues[i];
    }
    return result;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    const value = ast.value.reference;
    let id = this._evalArgValues.indexOf(value);
    if (id === -1) {
      id = this._evalArgValues.length;
      this._evalArgValues.push(value);
      const name = identifierName(ast.value) || 'val';
      this._evalArgNames.push(`jit_${name}${id}`);
    }
    ctx.print(ast, this._evalArgNames[id]);
    return null;
  }
}
