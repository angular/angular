/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';


export function findExpressionsToMigrate(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, importManager: ImportManager) {
  const migratedNodesMap: Map<ts.Node, ts.Node> = new Map();
  (() => {
    sourceFile.forEachChild(function visitNode(node: ts.Node) {
      if (isRouteOrRoutesVariableDeclaration(node)) {
        // The variable declaration is already explicitly typed as `Route` or `Routes` so it does
        // not need a migration.
        return;
      } else if (ts.isObjectLiteralExpression(node)) {
        visitObjectLiteral(node, typeChecker);
      } else {
        node.forEachChild(visitNode);
      }
    });

    function visitObjectLiteral(obj: ts.ObjectLiteralExpression, typeChecker: ts.TypeChecker) {
      const hasPathMatch = obj.properties.some(p => isPropertyWithName(p, 'pathMatch'));
      const hasPath = obj.properties.some(p => isPropertyWithName(p, 'path'));
      const childrenProperty = obj.properties.find(p => isPropertyWithName(p, 'children'));
      // If the object must have _both_ pathMatch _and_ path for us to be reasonably sure that it's
      // a `Route` definition.
      if (hasPath && hasPathMatch) {
        updateTypeOfParentIfNeeded(obj);
      } else if (
          childrenProperty !== undefined && ts.isPropertyAssignment(childrenProperty) &&
          ts.isArrayLiteralExpression(childrenProperty.initializer)) {
        // Also need to check the children if it exists
        for (const child of childrenProperty.initializer.elements) {
          if (ts.isObjectLiteralExpression(child)) {
            visitObjectLiteral(child, typeChecker);
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

    function updateTypeOfParentIfNeeded(obj: ts.ObjectLiteralExpression) {
      let node: ts.ObjectLiteralExpression|ts.ArrayLiteralExpression|ts.PropertyAssignment = obj;
      while (node.parent && ts.isObjectLiteralExpression(node.parent) ||
             ts.isArrayLiteralExpression(node.parent) || ts.isPropertyAssignment(node.parent)) {
        node = node.parent;
      }

      const parent = node.parent;
      if (parent === undefined) {
        return;
      } else if (ts.isVariableDeclaration(parent) && parent.type === undefined) {
        let typeToUse: ts.TypeNode;
        if (ts.isArrayLiteralExpression(node)) {
          typeToUse = importManager.addImportToSourceFile(
                          sourceFile, 'Routes', '@angular/router') as unknown as ts.TypeNode;
        } else {
          typeToUse = importManager.addImportToSourceFile(sourceFile, 'Route', '@angular/router') as
              unknown as ts.TypeNode;
        }

        const migrated = ts.factory.updateVariableDeclaration(
            parent, parent.name, parent.exclamationToken, typeToUse, parent.initializer);
        migratedNodesMap.set(parent, migrated);
      } else {
        // maybe migrate some other things?
      }
    }
  })();

  return migratedNodesMap;
}

function isRouteOrRoutesVariableDeclaration(node: ts.Node) {
  return ts.isVariableDeclaration(node) && node.type &&
      (node.type.getText() === 'Route' || node.type.getText() === 'Routes');
}
