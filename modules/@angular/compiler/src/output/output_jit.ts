/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {identifierName} from '../compile_metadata';
import {isPresent} from '../facade/lang';

import {EmitterVisitorContext} from './abstract_emitter';
import {AbstractJsEmitterVisitor} from './abstract_js_emitter';
import * as o from './output_ast';

function evalExpression(
    sourceUrl: string, expr: string, declarations: string, vars: {[key: string]: any}): any {
  const fnBody = `${declarations}\nreturn ${expr}\n//# sourceURL=${sourceUrl}`;
  const fnArgNames: string[] = [];
  const fnArgValues: any[] = [];
  for (const argName in vars) {
    fnArgNames.push(argName);
    fnArgValues.push(vars[argName]);
  }
  return new Function(...fnArgNames.concat(fnBody))(...fnArgValues);
}


export function jitStatements(
    sourceUrl: string, statements: o.Statement[], resultVar: string): any {
  const converter = new JitEmitterVisitor();
  const ctx = EmitterVisitorContext.createRoot([resultVar]);
  converter.visitAllStatements(statements, ctx);
  return evalExpression(sourceUrl, resultVar, ctx.toSource(), converter.getArgs());
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
    ctx.print(this._evalArgNames[id]);
    return null;
  }
}
