/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {relativePathBetween} from '../../util/src/path';

const STRIP_NG_FACTORY = /(.*)NgFactory$/;

export interface FactoryInfo {
  sourceFilePath: string;
  moduleSymbolNames: Set<string>;
}

export function generatedFactoryTransform(
    factoryMap: Map<string, FactoryInfo>,
    coreImportsFrom: ts.SourceFile | null): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return transformFactorySourceFile(factoryMap, context, coreImportsFrom, file);
    };
  };
}

function transformFactorySourceFile(
    factoryMap: Map<string, FactoryInfo>, context: ts.TransformationContext,
    coreImportsFrom: ts.SourceFile | null, file: ts.SourceFile): ts.SourceFile {
  // If this is not a generated file, it won't have factory info associated with it.
  if (!factoryMap.has(file.fileName)) {
    // Don't transform non-generated code.
    return file;
  }


  const {moduleSymbolNames, sourceFilePath} = factoryMap.get(file.fileName) !;

  const clone = ts.getMutableClone(file);
  clone.statements = ts.createNodeArray([
    ...file.statements.map(stmt => {
      if (coreImportsFrom !== null && ts.isImportDeclaration(stmt) &&
          ts.isStringLiteral(stmt.moduleSpecifier) &&
          stmt.moduleSpecifier.text === '@angular/core') {
        const path = relativePathBetween(sourceFilePath, coreImportsFrom.fileName);
        if (path !== null) {
          return ts.updateImportDeclaration(
              stmt, stmt.decorators, stmt.modifiers, stmt.importClause,
              ts.createStringLiteral(path));
        } else {
          return ts.createNotEmittedStatement(stmt);
        }
      } else if (ts.isVariableStatement(stmt) && stmt.declarationList.declarations.length === 1) {
        const decl = stmt.declarationList.declarations[0];
        if (ts.isIdentifier(decl.name)) {
          const match = STRIP_NG_FACTORY.exec(decl.name.text);
          if (match === null || !moduleSymbolNames.has(match[1])) {
            return updateDeclToNull(stmt, decl);
          }
        }
        return stmt;
      } else {
        return stmt;
      }
    }),
    // Regardless of the above contents, add an export to ensure the resulting module is non-empty.
    ts.createVariableStatement(
        [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration('ɵNonEmptyModule', undefined, ts.createTrue())],
            ts.NodeFlags.Const)),
  ]);
  return clone;
}

function updateDeclToNull(
    stmt: ts.VariableStatement, decl: ts.VariableDeclaration): ts.VariableStatement {
  return ts.updateVariableStatement(
      stmt, stmt.modifiers, ts.updateVariableDeclarationList(stmt.declarationList, [
        ts.updateVariableDeclaration(decl, decl.name, decl.type, ts.createNull()),
      ], ));
}
