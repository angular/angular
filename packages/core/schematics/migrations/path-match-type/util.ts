/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';


export function findExpressionsToMigrate(sourceFile: ts.SourceFile, importManager: ImportManager) {
  const migratedNodesMap: Map<ts.VariableDeclaration, ts.VariableDeclaration> = new Map();
  let _currentVariableDecl: ts.VariableDeclaration|null = null;
  (() => {
    sourceFile.forEachChild(function visitNode(node: ts.Node) {
      if (ts.isVariableDeclaration(node)) {
        _currentVariableDecl = node;
        node.forEachChild(visitNode);
        _currentVariableDecl = null;
      }
      if (isRouteOrRoutesVariableDeclaration(node)) {
        // The variable declaration is already explicitly typed as `Route` or `Routes` so it does
        // not need a migration.
        return;
      } else if (ts.isObjectLiteralExpression(node)) {
        if (_currentVariableDecl !== null && _currentVariableDecl.type === undefined) {
          visitObjectLiteral(node);
        }
      } else {
        node.forEachChild(visitNode);
      }
    });

    function visitObjectLiteral(obj: ts.ObjectLiteralExpression) {
      const hasPathMatch = obj.properties.some(p => isPropertyWithName(p, 'pathMatch'));
      const hasPath = obj.properties.some(p => isPropertyWithName(p, 'path'));
      const childrenProperty = obj.properties.find(p => isPropertyWithName(p, 'children'));
      // The object must have _both_ pathMatch _and_ path for us to be reasonably sure that it's
      // a `Route` definition.
      if (hasPath && hasPathMatch) {
        updateCurrentVariableDeclaration();
      } else if (
          childrenProperty !== undefined && ts.isPropertyAssignment(childrenProperty) &&
          ts.isArrayLiteralExpression(childrenProperty.initializer)) {
        // Also need to check the children if it exists
        for (const child of childrenProperty.initializer.elements) {
          if (ts.isObjectLiteralExpression(child)) {
            visitObjectLiteral(child);
            // If the child caused a migration, we can exit early
            if (_currentVariableDecl && migratedNodesMap.has(_currentVariableDecl)) {
              break;
            }
          }
        }
      }
    }

    function isPropertyWithName(p: ts.ObjectLiteralElementLike, name: string) {
      if (ts.isPropertyAssignment(p)) {
        return p.name.getText() === name;
      } else if (ts.isShorthandPropertyAssignment(p)) {
        return p.name.getText() === name;
      } else {
        // Don't attempt to migrate edge case spreadAssignment
        return false;
      }
    }

    function updateCurrentVariableDeclaration() {
      if (_currentVariableDecl === null || _currentVariableDecl.initializer === undefined) {
        return;
      }
      let typeToUse: ts.TypeNode;
      if (ts.isArrayLiteralExpression(_currentVariableDecl.initializer)) {
        typeToUse = importManager.addImportToSourceFile(sourceFile, 'Routes', '@angular/router') as
            unknown as ts.TypeNode;
      } else {
        typeToUse = importManager.addImportToSourceFile(sourceFile, 'Route', '@angular/router') as
            unknown as ts.TypeNode;
      }

      const migrated = ts.factory.updateVariableDeclaration(
          _currentVariableDecl, _currentVariableDecl.name, _currentVariableDecl.exclamationToken,
          typeToUse, _currentVariableDecl.initializer);
      migratedNodesMap.set(_currentVariableDecl, migrated);
    }
  })();

  return migratedNodesMap;
}

function isRouteOrRoutesVariableDeclaration(node: ts.Node) {
  return ts.isVariableDeclaration(node) && node.type &&
      (node.type.getText() === 'Route' || node.type.getText() === 'Routes');
}
