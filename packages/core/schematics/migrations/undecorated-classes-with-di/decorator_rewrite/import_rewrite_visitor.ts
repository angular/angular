/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost} from '@angular/compiler';
import {dirname, resolve} from 'path';
import * as ts from 'typescript';

import {ImportManager} from '../../../utils/import_manager';
import {getImportOfIdentifier, Import} from '../../../utils/typescript/imports';
import {getValueSymbolOfDeclaration} from '../../../utils/typescript/symbol';

import {getPosixPath} from './path_format';
import {getExportSymbolsOfFile, ResolvedExport} from './source_file_exports';


/**
 * Factory that creates a TypeScript transformer which ensures that
 * referenced identifiers are available at the target file location.
 *
 * Imports cannot be just added as sometimes identifiers collide in the
 * target source file and the identifier needs to be aliased.
 */
export class ImportRewriteTransformerFactory {
  private sourceFileExports = new Map<ts.SourceFile, ResolvedExport[]>();

  constructor(
      private importManager: ImportManager, private typeChecker: ts.TypeChecker,
      private compilerHost: AotCompilerHost) {}

  create<T extends ts.Node>(ctx: ts.TransformationContext, newSourceFile: ts.SourceFile):
      ts.Transformer<T> {
    const visitNode: ts.Visitor = (node: ts.Node) => {
      if (ts.isIdentifier(node)) {
        // Record the identifier reference and return the new identifier. The identifier
        // name can change if the generated import uses an namespaced import or aliased
        // import identifier (to avoid collisions).
        return this._recordIdentifierReference(node, newSourceFile);
      }

      return ts.visitEachChild(node, visitNode, ctx);
    };

    return (node: T) => ts.visitNode(node, visitNode);
  }

  private _recordIdentifierReference(node: ts.Identifier, targetSourceFile: ts.SourceFile):
      ts.Node {
    // For object literal elements we don't want to check identifiers that describe the
    // property name. These identifiers do not refer to a value but rather to a property
    // name and therefore don't need to be imported. The exception is that for shorthand
    // property assignments the "name" identifier is both used as value and property name.
    if (ts.isObjectLiteralElementLike(node.parent) &&
        !ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node) {
      return node;
    }

    const resolvedImport = getImportOfIdentifier(this.typeChecker, node);
    const sourceFile = node.getSourceFile();

    if (resolvedImport) {
      const symbolName = resolvedImport.name;
      const moduleFileName =
          this.compilerHost.moduleNameToFileName(resolvedImport.importModule, sourceFile.fileName);

      // In case the identifier refers to an export in the target source file, we need to use
      // the local identifier in the scope of the target source file. This is necessary because
      // the export could be aliased and the alias is not available to the target source file.
      if (moduleFileName && resolve(moduleFileName) === resolve(targetSourceFile.fileName)) {
        const resolvedExport =
            this._getSourceFileExports(targetSourceFile).find(e => e.exportName === symbolName);
        if (resolvedExport) {
          return resolvedExport.identifier;
        }
      }

      return this.importManager.addImportToSourceFile(
          targetSourceFile, symbolName,
          this._rewriteModuleImport(resolvedImport, targetSourceFile));
    } else {
      let symbol = getValueSymbolOfDeclaration(node, this.typeChecker);

      if (symbol) {
        // If the symbol refers to a shorthand property assignment, we want to resolve the
        // value symbol of the shorthand property assignment. This is necessary because the
        // value symbol is ambiguous for shorthand property assignment identifiers as the
        // identifier resolves to both property name and property value.
        if (symbol.valueDeclaration && ts.isShorthandPropertyAssignment(symbol.valueDeclaration)) {
          symbol = this.typeChecker.getShorthandAssignmentValueSymbol(symbol.valueDeclaration);
        }

        const resolvedExport =
            this._getSourceFileExports(sourceFile).find(e => e.symbol === symbol);

        if (resolvedExport) {
          return this.importManager.addImportToSourceFile(
              targetSourceFile, resolvedExport.exportName,
              getPosixPath(this.compilerHost.fileNameToModuleName(
                  sourceFile.fileName, targetSourceFile.fileName)));
        }
      }

      // The referenced identifier cannot be imported. In that case we throw an exception
      // which can be handled outside of the transformer.
      throw new UnresolvedIdentifierError();
    }
  }

  /**
   * Gets the resolved exports of a given source file. Exports are cached
   * for subsequent calls.
   */
  private _getSourceFileExports(sourceFile: ts.SourceFile): ResolvedExport[] {
    if (this.sourceFileExports.has(sourceFile)) {
      return this.sourceFileExports.get(sourceFile)!;
    }

    const sourceFileExports = getExportSymbolsOfFile(sourceFile, this.typeChecker);
    this.sourceFileExports.set(sourceFile, sourceFileExports);
    return sourceFileExports;
  }

  /** Rewrites a module import to be relative to the target file location. */
  private _rewriteModuleImport(resolvedImport: Import, newSourceFile: ts.SourceFile): string {
    if (!resolvedImport.importModule.startsWith('.')) {
      return resolvedImport.importModule;
    }

    const importFilePath = resolvedImport.node.getSourceFile().fileName;
    const resolvedModulePath = resolve(dirname(importFilePath), resolvedImport.importModule);
    const relativeModuleName =
        this.compilerHost.fileNameToModuleName(resolvedModulePath, newSourceFile.fileName);

    return getPosixPath(relativeModuleName);
  }
}

/** Error that will be thrown if a given identifier cannot be resolved. */
export class UnresolvedIdentifierError extends Error {}
