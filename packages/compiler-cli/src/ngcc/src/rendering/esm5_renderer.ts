/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {NgccReflectionHost} from '../host/ngcc_host';
import {CompiledClass} from '../analysis/decoration_analyzer';
import {EsmRenderer} from './esm_renderer';

export class Esm5Renderer extends EsmRenderer {
  constructor(
      protected host: NgccReflectionHost, protected isCore: boolean,
      protected rewriteCoreImportsTo: ts.SourceFile|null, protected sourcePath: string,
      protected targetPath: string, transformDts: boolean) {
    super(host, isCore, rewriteCoreImportsTo, sourcePath, targetPath, transformDts);
  }

  /**
   * Add the definitions to each decorated class
   */
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void {
    const classSymbol = this.host.getClassSymbol(compiledClass.declaration);
    if (!classSymbol) {
      throw new Error(
          `Compiled class does not have a valid symbol: ${compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }
    const parent = classSymbol.valueDeclaration && classSymbol.valueDeclaration.parent;
    if (!parent || !ts.isBlock(parent)) {
      throw new Error(
          `Compiled class declaration is not inside an IIFE: ${compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }
    const returnStatement = parent.statements.find(statement => ts.isReturnStatement(statement));
    if (!returnStatement) {
      throw new Error(
          `Compiled class wrapper IIFE does not have a return statement: ${compiledClass.name} in ${compiledClass.declaration.getSourceFile().fileName}`);
    }
    const insertionPoint = returnStatement.getFullStart();
    output.appendLeft(insertionPoint, '\n' + definitions);
  }
}
