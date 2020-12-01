/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {identifierName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {TrustedTypePolicy, TrustedTypePolicyFactory} from '../jit/trusted_type_defs';
import {global} from '../util';

import {EmitterVisitorContext} from './abstract_emitter';
import {AbstractJsEmitterVisitor} from './abstract_js_emitter';
import * as o from './output_ast';

/**
 * A Trusted Types policy for evaluating arbitrary code in the JIT compiler.
 * null if Trusted Types are not enabled/supported, or undefined if the policy
 * has not been created yet.
 */
let unsafeJitPolicy: TrustedTypePolicy|null|undefined;

/**
 * Returns the Trusted Types policy, or null if Trusted Types are not
 * enabled/supported. The first call to this function will create the policy.
 */
function getUnsafeJitPolicy(): TrustedTypePolicy|null {
  if (unsafeJitPolicy === undefined) {
    unsafeJitPolicy = null;
    if (global.trustedTypes) {
      try {
        unsafeJitPolicy =
            (global.trustedTypes as TrustedTypePolicyFactory).createPolicy('angular#unsafe-jit', {
              createScript: (s: string) => s,
            });
      } catch {
        // trustedTypes.createPolicy throws if called with a name that is
        // already registered, even in report-only mode. Until the API changes,
        // catch the error not to break the applications functionally. In such
        // cases, the code will fall back to using strings.
      }
    }
  }
  return unsafeJitPolicy;
}

/**
 * Unsafely call the Function constructor with the given string arguments.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that it
 * is only called from the JIT compiler, as use in other code can lead to XSS
 * vulnerabilities.
 */
function newTrustedFunction(...args: string[]): Function {
  if (!global.trustedTypes) {
    // In environments that don't support Trusted Types, fall back to the most
    // straightforward implementation:
    return new Function(...args);
  }

  // Chrome currently does not support passing TrustedScript to the Function
  // constructor. The following implements the workaround proposed on the page
  // below, where the Chromium bug is also referenced:
  // https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
  const fnArgs = args.slice(0, -1).join(',');
  const fnBody = args.pop()!.toString();
  const body = `(function anonymous(${fnArgs}
) { ${fnBody}
})`;

  const safeScript = getUnsafeJitPolicy()?.createScript(body) || body;

  // Using eval directly confuses the compiler and prevents this module from
  // being stripped out of JS binaries even if not used. The global['eval']
  // indirection fixes that.
  const fn = global['eval'](safeScript as string) as Function;

  // To completely mimic the behavior of calling "new Function", two more
  // things need to happen:
  // 1. Stringifying the resulting function should return its source code
  fn.toString = () => body;
  // 2. When calling the resulting function, `this` should refer to `global`
  return fn.bind(global);

  // When Trusted Types support in Function constructors is widely available,
  // the implementation of this function can be simplified to:
  // return new Function(...args.map(a => trustedScriptFromString(a)));
}

/**
 * A helper class to manage the evaluation of JIT generated code.
 */
export class JitEvaluator {
  /**
   *
   * @param sourceUrl The URL of the generated code.
   * @param statements An array of Angular statement AST nodes to be evaluated.
   * @param reflector A helper used when converting the statements to executable code.
   * @param createSourceMaps If true then create a source-map for the generated code and include it
   * inline as a source-map comment.
   * @returns A map of all the variables in the generated code.
   */
  evaluateStatements(
      sourceUrl: string, statements: o.Statement[], reflector: CompileReflector,
      createSourceMaps: boolean): {[key: string]: any} {
    const converter = new JitEmitterVisitor(reflector);
    const ctx = EmitterVisitorContext.createRoot();
    // Ensure generated code is in strict mode
    if (statements.length > 0 && !isUseStrictStatement(statements[0])) {
      statements = [
        o.literal('use strict').toStmt(),
        ...statements,
      ];
    }
    converter.visitAllStatements(statements, ctx);
    converter.createReturnStmt(ctx);
    return this.evaluateCode(sourceUrl, ctx, converter.getArgs(), createSourceMaps);
  }

  /**
   * Evaluate a piece of JIT generated code.
   * @param sourceUrl The URL of this generated code.
   * @param ctx A context object that contains an AST of the code to be evaluated.
   * @param vars A map containing the names and values of variables that the evaluated code might
   * reference.
   * @param createSourceMap If true then create a source-map for the generated code and include it
   * inline as a source-map comment.
   * @returns The result of evaluating the code.
   */
  evaluateCode(
      sourceUrl: string, ctx: EmitterVisitorContext, vars: {[key: string]: any},
      createSourceMap: boolean): any {
    let fnBody = `"use strict";${ctx.toSource()}\n//# sourceURL=${sourceUrl}`;
    const fnArgNames: string[] = [];
    const fnArgValues: any[] = [];
    for (const argName in vars) {
      fnArgValues.push(vars[argName]);
      fnArgNames.push(argName);
    }
    if (createSourceMap) {
      // using `new Function(...)` generates a header, 1 line of no arguments, 2 lines otherwise
      // E.g. ```
      // function anonymous(a,b,c
      // /**/) { ... }```
      // We don't want to hard code this fact, so we auto detect it via an empty function first.
      const emptyFn = newTrustedFunction(...fnArgNames.concat('return null;')).toString();
      const headerLines = emptyFn.slice(0, emptyFn.indexOf('return null;')).split('\n').length - 1;
      fnBody += `\n${ctx.toSourceMapGenerator(sourceUrl, headerLines).toJsComment()}`;
    }
    const fn = newTrustedFunction(...fnArgNames.concat(fnBody));
    return this.executeFunction(fn, fnArgValues);
  }

  /**
   * Execute a JIT generated function by calling it.
   *
   * This method can be overridden in tests to capture the functions that are generated
   * by this `JitEvaluator` class.
   *
   * @param fn A function to execute.
   * @param args The arguments to pass to the function being executed.
   * @returns The return value of the executed function.
   */
  executeFunction(fn: Function, args: any[]) {
    return fn(...args);
  }
}

/**
 * An Angular AST visitor that converts AST nodes into executable JavaScript code.
 */
export class JitEmitterVisitor extends AbstractJsEmitterVisitor {
  private _evalArgNames: string[] = [];
  private _evalArgValues: any[] = [];
  private _evalExportedVars: string[] = [];

  constructor(private reflector: CompileReflector) {
    super();
  }

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
    this._emitReferenceToExternal(ast, this.reflector.resolveExternalReference(ast.value), ctx);
    return null;
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): any {
    this._emitReferenceToExternal(ast, ast.node, ctx);
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

  private _emitReferenceToExternal(ast: o.Expression, value: any, ctx: EmitterVisitorContext):
      void {
    let id = this._evalArgValues.indexOf(value);
    if (id === -1) {
      id = this._evalArgValues.length;
      this._evalArgValues.push(value);
      const name = identifierName({reference: value}) || 'val';
      this._evalArgNames.push(`jit_${name}_${id}`);
    }
    ctx.print(ast, this._evalArgNames[id]);
  }
}


function isUseStrictStatement(statement: o.Statement): boolean {
  return statement.isEquivalent(o.literal('use strict').toStmt());
}
