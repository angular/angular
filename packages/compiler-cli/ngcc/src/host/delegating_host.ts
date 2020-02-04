/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassDeclaration, ClassMember, CtorParameter, Declaration, Decorator, FunctionDefinition, Import, ReflectionHost} from '../../../src/ngtsc/reflection';
import {isFromDtsFile} from '../../../src/ngtsc/util/src/typescript';

import {ModuleWithProvidersFunction, NgccClassSymbol, NgccReflectionHost, SwitchableVariableDeclaration} from './ngcc_host';

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
      return this.tsHost.getDeclarationOfIdentifier(id);
    }
    return this.ngccHost.getDeclarationOfIdentifier(id);
  }

  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
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

  getDtsDeclaration(declaration: ts.Declaration): ts.Declaration|null {
    if (isFromDtsFile(declaration)) {
      return this.tsHost.getDtsDeclaration(declaration);
    }
    return this.ngccHost.getDtsDeclaration(declaration);
  }

  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
    if (isFromDtsFile(module)) {
      return this.tsHost.getExportsOfModule(module);
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

  findClassSymbols(sourceFile: ts.SourceFile): NgccClassSymbol[] {
    return this.ngccHost.findClassSymbols(sourceFile);
  }

  getClassSymbol(node: ts.Node): NgccClassSymbol|undefined {
    return this.ngccHost.getClassSymbol(node);
  }

  getDecoratorsOfSymbol(symbol: NgccClassSymbol): Decorator[]|null {
    return this.ngccHost.getDecoratorsOfSymbol(symbol);
  }

  getModuleWithProvidersFunctions(sf: ts.SourceFile): ModuleWithProvidersFunction[] {
    return this.ngccHost.getModuleWithProvidersFunctions(sf);
  }

  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[] {
    return this.ngccHost.getSwitchableDeclarations(module);
  }

  getEndOfClass(classSymbol: NgccClassSymbol): ts.Node {
    return this.ngccHost.getEndOfClass(classSymbol);
  }
}
