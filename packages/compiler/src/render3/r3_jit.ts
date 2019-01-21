/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector} from '../compile_reflector';
import {ConstantPool} from '../constant_pool';
import * as o from '../output/output_ast';
import {jitStatements} from '../output/output_jit';

/**
 * Implementation of `CompileReflector` which resolves references to @angular/core
 * symbols at runtime, according to a consumer-provided mapping.
 *
 * Only supports `resolveExternalReference`, all other methods throw.
 */
class R3JitReflector implements CompileReflector {
  constructor(private context: {[key: string]: any}) {}

  resolveExternalReference(ref: o.ExternalReference): any {
    // This reflector only handles @angular/core imports.
    if (ref.moduleName !== '@angular/core') {
      throw new Error(
          `Cannot resolve external reference to ${ref.moduleName}, only references to @angular/core are supported.`);
    }
    if (!this.context.hasOwnProperty(ref.name !)) {
      throw new Error(`No value provided for @angular/core symbol '${ref.name!}'.`);
    }
    return this.context[ref.name !];
  }

  parameters(typeOrFunc: any): any[][] { throw new Error('Not implemented.'); }

  annotations(typeOrFunc: any): any[] { throw new Error('Not implemented.'); }

  shallowAnnotations(typeOrFunc: any): any[] { throw new Error('Not implemented.'); }

  tryAnnotations(typeOrFunc: any): any[] { throw new Error('Not implemented.'); }

  propMetadata(typeOrFunc: any): {[key: string]: any[];} { throw new Error('Not implemented.'); }

  hasLifecycleHook(type: any, lcProperty: string): boolean { throw new Error('Not implemented.'); }

  guards(typeOrFunc: any): {[key: string]: any;} { throw new Error('Not implemented.'); }

  componentModuleUrl(type: any, cmpMetadata: any): string { throw new Error('Not implemented.'); }
}

/**
 * JIT compiles an expression and returns the result of executing that expression.
 *
 * @param def the definition which will be compiled and executed to get the value to patch
 * @param context an object map of @angular/core symbol names to symbols which will be available in
 * the context of the compiled expression
 * @param sourceUrl a URL to use for the source map of the compiled expression
 * @param constantPool an optional `ConstantPool` which contains constants used in the expression
 */
export function jitExpression(
    def: o.Expression, context: {[key: string]: any}, sourceUrl: string,
    preStatements: o.Statement[]): any {
  // The ConstantPool may contain Statements which declare variables used in the final expression.
  // Therefore, its statements need to precede the actual JIT operation. The final statement is a
  // declaration of $def which is set to the expression being compiled.
  const statements: o.Statement[] = [
    ...preStatements,
    new o.DeclareVarStmt('$def', def, undefined, [o.StmtModifier.Exported]),
  ];

  const res = jitStatements(sourceUrl, statements, new R3JitReflector(context), false);
  return res['$def'];
}
