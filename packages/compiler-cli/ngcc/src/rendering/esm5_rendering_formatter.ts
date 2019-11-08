/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import MagicString from 'magic-string';
import * as ts from 'typescript';
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
      throw new Error(
          `Compiled class declaration is not inside an IIFE: ${compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }

    const returnStatement = iifeBody.statements.find(ts.isReturnStatement);
    if (!returnStatement) {
      throw new Error(
          `Compiled class wrapper IIFE does not have a return statement: ${compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }

    const insertionPoint = returnStatement.getFullStart();
    output.appendLeft(insertionPoint, '\n' + definitions);
  }
}
