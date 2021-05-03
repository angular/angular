/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Statement} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {ImportManager, translateStatement} from '../../../src/ngtsc/translator';
import {CompiledClass} from '../analysis/types';
import {getContainingStatement} from '../host/esm2015_host';

import {EsmRenderingFormatter} from './esm_rendering_formatter';

/**
 * A RenderingFormatter that works with files that use ECMAScript Module `import` and `export`
 * statements, but instead of `class` declarations it uses ES5 `function` wrappers for classes.
 */
export class Esm5RenderingFormatter extends EsmRenderingFormatter {
  /**
   * Add the definitions, directly before the return statement, inside the IIFE of each decorated
   * class.
   */
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void {
    const classSymbol = this.host.getClassSymbol(compiledClass.declaration);
    if (!classSymbol) {
      throw new Error(
          `Compiled class "${compiledClass.name}" in "${
              compiledClass.declaration.getSourceFile()
                  .fileName}" does not have a valid syntax.\n` +
          `Expected an ES5 IIFE wrapped function. But got:\n` +
          compiledClass.declaration.getText());
    }
    const declarationStatement =
        getContainingStatement(classSymbol.implementation.valueDeclaration);

    const iifeBody = declarationStatement.parent;
    if (!iifeBody || !ts.isBlock(iifeBody)) {
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
    const node = translateStatement(
        stmt, importManager, {downlevelTaggedTemplates: true, downlevelVariableDeclarations: true});
    const code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

    return code;
  }
}
