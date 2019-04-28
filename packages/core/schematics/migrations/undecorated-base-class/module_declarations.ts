/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {UpdateRecorder} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {hasModifier} from '../../utils/typescript/nodes';

import {ResolvedNgModule} from './directive_visitor';
import {ImportManager} from './import_manager';

/**
 * NgModule declarations manager that can be used to add declarations to specified
 * resolved NgModule declarations. The manager ensures that multiple declarations
 * are properly added without shifted offsets. Additionally abstract classes that
 * need to be added to the "declarations" are explicitly casted to "Type<any>" to
 * avoid compilation issues.
*/
export class NgModuleDeclarationsManager {
  private updatedModules =
      new Map<ResolvedNgModule, {expression: ts.Expression, target: ts.ClassDeclaration}[]>();

  constructor(
      private importManager: ImportManager,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder,
      private typeChecker: ts.TypeChecker, private printer: ts.Printer) {}

  /** Adds the given class declaration to the specified NgModule definition. */
  addDeclarationToNgModule(module: ResolvedNgModule, node: ts.ClassDeclaration): null|string {
    if (this.updatedModules.has(module) &&
        this.updatedModules.get(module) !.some(e => e.target === node)) {
      return null;
    }

    const moduleSourceFile = module.node.getSourceFile();
    const classFilePath = node.getSourceFile().fileName;

    let expression: ts.Expression|null = null;

    if (moduleSourceFile.fileName !== classFilePath) {
      const exportName = this._findExportNameOfClass(node);

      if (!exportName) {
        return `Base class is not exported and cannot be added to ` +
            `NgModule (${moduleSourceFile.fileName}#${module.name})`;
      }

      const symbolName = exportName === ts.InternalSymbolName.Default ? null : exportName;
      const relativeImportPath = this._normalizeRelativePath(relative(
          dirname(moduleSourceFile.fileName),
          node.getSourceFile().fileName.replace(/(\.d)?\.ts$/, '')));
      expression = this.importManager.addImportToSourceFile(
          moduleSourceFile, symbolName, relativeImportPath);
    } else if (node.name) {
      // In case the specified target class declaration is defined along with the
      // given NgModule in the same source file, we don't need to add any import
      // and the class can be accessed directly
      expression = ts.createIdentifier(node.name.text);
    } else {
      // In case the specified target class is defined in the same source file, but does
      // not have a class name (e.g. `export default class {}`, we can't reference it
      // in the NgModule and just need to skip updating the module.
      return `Base class cannot be added to NgModule as the class has no name. ` +
          `(${moduleSourceFile.fileName}#${module.name})`;
    }

    // In case the specified target class is marked as "abstract", we need to cast the
    // identifier that is added to the module declarations to "Type<any>" in order to
    // avoid compilation failures.
    if (hasModifier(node, ts.SyntaxKind.AbstractKeyword)) {
      const typeIdentifier = <ts.Identifier>this.importManager.addImportToSourceFile(
          moduleSourceFile, 'Type', '@angular/core', true);
      expression = ts.createAsExpression(
          expression, ts.createTypeReferenceNode(
                          typeIdentifier, [ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)]));
    }

    this.updatedModules.set(module, (this.updatedModules.get(module) || []).concat({
      expression,
      target: node,
    }));
    return null;
  }

  /**
   * Stores the collected NgModule updates within the corresponding update recorders.
   * Instead of updating the "NgModule" definitions once per "addDeclarationToNgModule"
   * call, we record the transformation for the new declarations elements once. This
   * is necessary because otherwise the source-file offsets are shifted and the
   * transformed "NgModule" is not guaranteed contain all collected new declarations.
   */
  recordChanges() {
    this.updatedModules.forEach((elements, module) => {
      const moduleSourceFile = module.node.getSourceFile();
      const recorder = this.getUpdateRecorder(moduleSourceFile);
      const moduleDeclarations = module.declarationsNode;
      const updatedDeclarations = ts.updateArrayLiteral(
          moduleDeclarations, moduleDeclarations.elements.concat(elements.map(e => e.expression)));

      recorder.remove(moduleDeclarations.getStart(), moduleDeclarations.getWidth());
      recorder.insertRight(
          moduleDeclarations.getStart(),
          this.printer.printNode(ts.EmitHint.Unspecified, updatedDeclarations, moduleSourceFile));
    });
  }

  /** Finds the export name of the specified class declaration. */
  private _findExportNameOfClass(node: ts.ClassDeclaration): string|null {
    const sourceFile = node.getSourceFile();
    const fileSymbol = this.typeChecker.getSymbolAtLocation(sourceFile);

    if (!fileSymbol) {
      return null;
    }

    for (let exportSymbol of this.typeChecker.getExportsOfModule(fileSymbol)) {
      if (this._getDeclarationOfSymbol(exportSymbol) === node) {
        return exportSymbol.name;
      }
    }
    return null;
  }

  /** Gets the value declaration of the specified symbol. */
  private _getDeclarationOfSymbol(symbol: ts.Symbol): ts.Node|undefined {
    while (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = this.typeChecker.getAliasedSymbol(symbol);
    }

    return symbol.valueDeclaration;
  }

  /**
   * Normalizes the given relative path so that it can be used within a TypeScript
   * import declaration.
   */
  private _normalizeRelativePath(filePath: string): string {
    const normalizedPath = normalize(filePath);
    if (!normalizedPath.startsWith('../')) {
      return `./${normalizedPath}`;
    }
    return normalizedPath;
  }
}
