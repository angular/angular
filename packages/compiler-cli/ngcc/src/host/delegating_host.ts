/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassDeclaration, ClassMember, CtorParameter, Declaration, DeclarationNode, Decorator, FunctionDefinition, Import, ReflectionHost} from '../../../src/ngtsc/reflection';
import {isFromDtsFile} from '../../../src/ngtsc/util/src/typescript';

import {NgccClassSymbol, NgccReflectionHost, SwitchableVariableDeclaration} from './ngcc_host';

/**
 * A reflection host implementation that delegates reflector queries depending on whether they
 * reflect on declaration files (for dependent libraries) or source files within the entry-point
 * that is being compiled. The first type of queries are handled by the regular TypeScript
 * reflection host, whereas the other queries are handled by an `NgccReflectionHost` that is
 * specific to the entry-point's format.
 */
export class DelegatingReflectionHost implements NgccReflectionHost {
  constructor(private tsHost: ReflectionHost, private ngccHost: NgccReflectionHost) {}

  getConstructorParameters(clazz: ClassDeclaration): CtorParameter[]|null {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getConstructorParameters(clazz);
    }
    return this.ngccHost.getConstructorParameters(clazz);
  }

  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    if (isFromDtsFile(id)) {
      const declaration = this.tsHost.getDeclarationOfIdentifier(id);
      return declaration !== null ? this.detectKnownDeclaration(declaration) : null;
    }
    return this.ngccHost.getDeclarationOfIdentifier(id);
  }

  getDecoratorsOfDeclaration(declaration: DeclarationNode): Decorator[]|null {
    if (isFromDtsFile(declaration)) {
      return this.tsHost.getDecoratorsOfDeclaration(declaration);
    }
    return this.ngccHost.getDecoratorsOfDeclaration(declaration);
  }

  getDefinitionOfFunction(fn: ts.Node): FunctionDefinition|null {
    if (isFromDtsFile(fn)) {
      return this.tsHost.getDefinitionOfFunction(fn);
    }
    return this.ngccHost.getDefinitionOfFunction(fn);
  }

  getDtsDeclaration(declaration: DeclarationNode): ts.Declaration|null {
    if (isFromDtsFile(declaration)) {
      return this.tsHost.getDtsDeclaration(declaration);
    }
    return this.ngccHost.getDtsDeclaration(declaration);
  }

  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
    if (isFromDtsFile(module)) {
      const exportMap = this.tsHost.getExportsOfModule(module);

      if (exportMap !== null) {
        exportMap.forEach(decl => this.detectKnownDeclaration(decl));
      }

      return exportMap;
    }
    return this.ngccHost.getExportsOfModule(module);
  }

  getGenericArityOfClass(clazz: ClassDeclaration): number|null {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getGenericArityOfClass(clazz);
    }
    return this.ngccHost.getGenericArityOfClass(clazz);
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    if (isFromDtsFile(id)) {
      return this.tsHost.getImportOfIdentifier(id);
    }
    return this.ngccHost.getImportOfIdentifier(id);
  }

  getInternalNameOfClass(clazz: ClassDeclaration): ts.Identifier {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getInternalNameOfClass(clazz);
    }
    return this.ngccHost.getInternalNameOfClass(clazz);
  }

  getAdjacentNameOfClass(clazz: ClassDeclaration): ts.Identifier {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getAdjacentNameOfClass(clazz);
    }
    return this.ngccHost.getAdjacentNameOfClass(clazz);
  }

  getMembersOfClass(clazz: ClassDeclaration): ClassMember[] {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getMembersOfClass(clazz);
    }
    return this.ngccHost.getMembersOfClass(clazz);
  }

  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null {
    if (isFromDtsFile(declaration)) {
      return this.tsHost.getVariableValue(declaration);
    }
    return this.ngccHost.getVariableValue(declaration);
  }

  hasBaseClass(clazz: ClassDeclaration): boolean {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.hasBaseClass(clazz);
    }
    return this.ngccHost.hasBaseClass(clazz);
  }

  getBaseClassExpression(clazz: ClassDeclaration): ts.Expression|null {
    if (isFromDtsFile(clazz)) {
      return this.tsHost.getBaseClassExpression(clazz);
    }
    return this.ngccHost.getBaseClassExpression(clazz);
  }

  isClass(node: ts.Node): node is ClassDeclaration {
    if (isFromDtsFile(node)) {
      return this.tsHost.isClass(node);
    }
    return this.ngccHost.isClass(node);
  }

  // Note: the methods below are specific to ngcc and the entry-point that is being compiled, so
  // they don't take declaration files into account.

  findClassSymbols(sourceFile: ts.SourceFile): NgccClassSymbol[] {
    return this.ngccHost.findClassSymbols(sourceFile);
  }

  getClassSymbol(node: ts.Node): NgccClassSymbol|undefined {
    return this.ngccHost.getClassSymbol(node);
  }

  getDecoratorsOfSymbol(symbol: NgccClassSymbol): Decorator[]|null {
    return this.ngccHost.getDecoratorsOfSymbol(symbol);
  }

  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[] {
    return this.ngccHost.getSwitchableDeclarations(module);
  }

  getEndOfClass(classSymbol: NgccClassSymbol): ts.Node {
    return this.ngccHost.getEndOfClass(classSymbol);
  }

  detectKnownDeclaration<T extends Declaration>(decl: T): T {
    return this.ngccHost.detectKnownDeclaration(decl);
  }

  isStaticallyExported(clazz: ClassDeclaration): boolean {
    return this.ngccHost.isStaticallyExported(clazz);
  }
}
