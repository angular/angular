/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isFromDtsFile} from '../../util/src/typescript';

import {AbsoluteReference, Reference, ResolvedReference} from './references';

export interface ReferenceResolver {
  resolve(decl: ts.Declaration, importFromHint: string|null, fromFile: string):
      Reference<ts.Declaration>;
}

/**
 * Used by `RouterEntryPointManager` and `NgModuleRouteAnalyzer` (which is in turn is used by
 * `NgModuleDecoratorHandler`) for resolving the module source-files references in lazy-loaded
 * routes (relative to the source-file containing the `NgModule` that provides the route
 * definitions).
 */
export class ModuleResolver {
  constructor(
      private program: ts.Program, private compilerOptions: ts.CompilerOptions,
      private host: ts.CompilerHost) {}

  resolveModuleName(module: string, containingFile: ts.SourceFile): ts.SourceFile|null {
    const resolved =
        ts.resolveModuleName(module, containingFile.fileName, this.compilerOptions, this.host)
            .resolvedModule;
    if (resolved === undefined) {
      return null;
    }
    return this.program.getSourceFile(resolved.resolvedFileName) || null;
  }
}

export class TsReferenceResolver implements ReferenceResolver {
  private moduleExportsCache = new Map<string, Map<ts.Declaration, string>|null>();

  constructor(
      private program: ts.Program, private checker: ts.TypeChecker,
      private options: ts.CompilerOptions, private host: ts.CompilerHost) {}

  resolve(decl: ts.Declaration, importFromHint: string|null, fromFile: string):
      Reference<ts.Declaration> {
    const id = identifierOfDeclaration(decl);
    if (id === undefined) {
      throw new Error(`Internal error: don't know how to refer to ${ts.SyntaxKind[decl.kind]}`);
    }

    if (!isFromDtsFile(decl) || importFromHint === null) {
      return new ResolvedReference(decl, id);
    } else {
      const publicName = this.resolveImportName(importFromHint, decl, fromFile);
      if (publicName !== null) {
        return new AbsoluteReference(decl, id, importFromHint, publicName);
      } else {
        throw new Error(`Internal error: Symbol ${id.text} is not exported from ${importFromHint}`);
      }
    }
  }

  private resolveImportName(moduleName: string, target: ts.Declaration, fromFile: string): string
      |null {
    const exports = this.getExportsOfModule(moduleName, fromFile);
    if (exports !== null && exports.has(target)) {
      return exports.get(target) !;
    } else {
      return null;
    }
  }

  private getExportsOfModule(moduleName: string, fromFile: string):
      Map<ts.Declaration, string>|null {
    if (!this.moduleExportsCache.has(moduleName)) {
      this.moduleExportsCache.set(moduleName, this.enumerateExportsOfModule(moduleName, fromFile));
    }
    return this.moduleExportsCache.get(moduleName) !;
  }

  private enumerateExportsOfModule(moduleName: string, fromFile: string):
      Map<ts.Declaration, string>|null {
    const resolved = ts.resolveModuleName(moduleName, fromFile, this.options, this.host);
    if (resolved.resolvedModule === undefined) {
      return null;
    }

    const indexFile = this.program.getSourceFile(resolved.resolvedModule.resolvedFileName);
    if (indexFile === undefined) {
      return null;
    }

    const indexSymbol = this.checker.getSymbolAtLocation(indexFile);
    if (indexSymbol === undefined) {
      return null;
    }

    const exportMap = new Map<ts.Declaration, string>();

    const exports = this.checker.getExportsOfModule(indexSymbol);
    for (const expSymbol of exports) {
      const declSymbol = expSymbol.flags & ts.SymbolFlags.Alias ?
          this.checker.getAliasedSymbol(expSymbol) :
          expSymbol;
      const decl = declSymbol.valueDeclaration;
      if (decl === undefined) {
        continue;
      }

      if (declSymbol.name === expSymbol.name || !exportMap.has(decl)) {
        exportMap.set(decl, expSymbol.name);
      }
    }

    return exportMap;
  }
}

function identifierOfDeclaration(decl: ts.Declaration): ts.Identifier|undefined {
  if (ts.isClassDeclaration(decl)) {
    return decl.name;
  } else if (ts.isEnumDeclaration(decl)) {
    return decl.name;
  } else if (ts.isFunctionDeclaration(decl)) {
    return decl.name;
  } else if (ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name)) {
    return decl.name;
  } else if (ts.isShorthandPropertyAssignment(decl)) {
    return decl.name;
  } else {
    return undefined;
  }
}
