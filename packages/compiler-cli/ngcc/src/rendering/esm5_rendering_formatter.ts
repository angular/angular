/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Statement} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {NOOP_DEFAULT_IMPORT_RECORDER} from '../../../src/ngtsc/imports';
import {ImportManager, translateStatement} from '../../../src/ngtsc/translator';
import {CompiledClass} from '../analysis/types';
import {getIifeBody} from '../host/esm5_host';
import {EsmRenderingFormatter} from './esm_rendering_formatter';

/**
 * A RenderingFormatter that works with files that use ECMAScript Module `import` and `export`
 * statements, but instead of `class` declarations it uses ES5 `function` wrappers for classes.
 */
export class Esm5RenderingFormatter extends EsmRenderingFormatter {
  /**
   * Add the definitions inside the IIFE of each decorated class
   */
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void {
    const iifeBody = getIifeBody(compiledClass.declaration);
    if (!iifeBody) {
      throw new Error(`Compiled class declaration is not inside an IIFE: ${compiledClass.name} in ${
          compiledClass.declaration.getSourceFile().fileName}`);
    }

    const returnStatement = iifeBody.statements.find(ts.isReturnStatement);
    if (!returnStatement) {
      throw new Error(`Compiled class wrapper IIFE does not have a return statement: ${
          compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }

    const insertionPoint = returnStatement.getFullStart();
    output.appendLeft(insertionPoint, '\n' + definitions);
  }

  /**
   * Convert a `Statement` to JavaScript code in a format suitable for rendering by this formatter.
   *
   * @param stmt The `Statement` to print.
   * @param sourceFile A `ts.SourceFile` that provides context for the statement. See
   *     `ts.Printer#printNode()` for more info.
   * @param importManager The `ImportManager` to use for managing imports.
   *
   * @return The JavaScript code corresponding to `stmt` (in the appropriate format).
   */
  printStatement(stmt: Statement, sourceFile: ts.SourceFile, importManager: ImportManager): string {
    const node =
        translateStatement(stmt, importManager, NOOP_DEFAULT_IMPORT_RECORDER, ts.ScriptTarget.ES5);
    const code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

    return code;
  }
}
