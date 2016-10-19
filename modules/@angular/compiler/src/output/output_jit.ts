/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPresent} from '../facade/lang';
import {sanitizeIdentifier} from '../util';

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
  var converter = new JitEmitterVisitor();
  var ctx = EmitterVisitorContext.createRoot([resultVar]);
  converter.visitAllStatements(statements, ctx);
  return evalExpression(sourceUrl, resultVar, ctx.toSource(), converter.getArgs());
}

class JitEmitterVisitor extends AbstractJsEmitterVisitor {
  private _evalArgNames: string[] = [];
  private _evalArgValues: any[] = [];

  getArgs(): {[key: string]: any} {
    var result: {[key: string]: any} = {};
    for (var i = 0; i < this._evalArgNames.length; i++) {
      result[this._evalArgNames[i]] = this._evalArgValues[i];
    }
    return result;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    var value = ast.value.reference;
    var id = this._evalArgValues.indexOf(value);
    if (id === -1) {
      id = this._evalArgValues.length;
      this._evalArgValues.push(value);
      var name = isPresent(ast.value.name) ? sanitizeIdentifier(ast.value.name) : 'val';
      this._evalArgNames.push(sanitizeIdentifier(`jit_${name}${id}`));
    }
    ctx.print(this._evalArgNames[id]);
    return null;
  }
}
