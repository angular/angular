/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '@angular/compiler-cli';
import {TemplateTypeChecker,} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';

import {ChangesByFile, ChangeTracker, ImportRemapper} from '../../utils/change_tracker';

import {findClassDeclaration, findLiteralProperty,} from './util';


/**
 * Converts all application routes that are using standalone components to be lazy loaded.
 * @param sourceFiles Files that should be migrated.
 * @param program
 * @param printer
 * @param fileImportRemapper Optional function that can be used to remap file-level imports.
 * imports.
 */
export function toLazyStandaloneRoutes(
  sourceFiles: ts.SourceFile[],
  program: NgtscProgram,
  printer: ts.Printer,
  fileImportRemapper?: ImportRemapper,
): ChangesByFile {
  const templateTypeChecker = program.compiler.getTemplateTypeChecker();
  const typeChecker = program.getTsProgram().getTypeChecker();
  const tracker = new ChangeTracker(printer, fileImportRemapper);

  for (const sourceFile of sourceFiles) {
    const routeArraysToMigrate = findRoutesArrayToMigrate(sourceFile, typeChecker);

    for (const routeArray of routeArraysToMigrate) {
      migrateRoutesArray(routeArray, typeChecker, templateTypeChecker, tracker);
    }
  }

  return tracker.recordChanges();
}

/** Finds route object that can be migrated */
function findRoutesArrayToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const routesArrays: ts.ArrayLiteralExpression[] = [];

  // Get the object from provideRouter(routes) or RouterModule.forRoot(routes) or RouterModule.forChild(routes) or router.resetConfig(routes)
  // as those are the only valid ways to define routes in Angular.

  function isRouterModuleCallExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
    if (ts.isPropertyAccessExpression(node.expression)) {
      const propAccess = node.expression;
      const moduleSymbol = typeChecker.getSymbolAtLocation(propAccess.expression);
      return moduleSymbol && moduleSymbol.name === 'RouterModule' && propAccess.name.text === 'forRoot' || propAccess.name.text === 'forChild';
    }
    return false;
  }

  function isRouterCallExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
    if (ts.isPropertyAccessExpression(node.expression)) {
      const propAccess = node.expression;
      const moduleSymbol = typeChecker.getSymbolAtLocation(propAccess.expression);
      return moduleSymbol && moduleSymbol.name === 'Router' && propAccess.name.text === 'resetConfig';
    }
    return false;
  }

  function isRouterProviderCallExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
    if (ts.isIdentifier(node.expression)) {
      const moduleSymbol = typeChecker.getSymbolAtLocation(node.expression);
      return moduleSymbol && moduleSymbol.name === 'provideRouter';
    }
    return false;
  }

  sourceFile.forEachChild(function walk(node) {
    if (ts.isCallExpression(node)) {
      if (
        isRouterModuleCallExpression(node, typeChecker) ||
        isRouterProviderCallExpression(node, typeChecker) ||
        isRouterCallExpression(node, typeChecker)
      ) {
        const arg = node.arguments[0];

        if (ts.isArrayLiteralExpression(arg)) {
          routesArrays.push(arg);
        }
      }
    }

    node.forEachChild(walk);
  });

  return routesArrays;
}


/** Migrate a routes object standalone components to be lazy loaded. */
function migrateRoutesArray(
  routesArray: ts.ArrayLiteralExpression,
  typeChecker: ts.TypeChecker,
  templateTypeChecker: TemplateTypeChecker,
  tracker: ChangeTracker,
) {
  /*
  * import { TestComponent } from './test/test.component';
  * const routes = [{
  *   path: 'test',
  *   component: TestComponent
  * }];
  *
  * to
  *
  * const routes = [{
  *  path: 'test',
  *  loadComponent: () => import('./test/test.component').then(m => m.TestComponent)
  * }];
  **/

  const routes = routesArray.elements;

  const importsToRemove: ts.ImportDeclaration[] = [];

  for (const route of routes) {
    if (ts.isObjectLiteralExpression(route)) {
      const component = findLiteralProperty(route, 'component');
      if (component) {
        if (ts.isIdentifier(component)) {
          const componentDeclaration = findClassDeclaration(component, typeChecker);

          if (!isStandaloneComponent(componentDeclaration!, templateTypeChecker)) {
            continue;
          }

          if (componentDeclaration) {
            const loadComponent = ts.factory.createPropertyAssignment(
              'loadComponent',
              ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createCallExpression(
                      ts.factory.createIdentifier('import'),
                      undefined,
                      [ts.factory.createStringLiteral(componentDeclaration.getSourceFile().fileName)],
                    ),
                    'then',
                  ),
                  undefined,
                  [ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [ts.factory.createParameterDeclaration(
                      undefined,
                      undefined,
                      'm',
                      undefined,
                      undefined,
                    )],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('m'),
                      componentDeclaration.name!,
                    ),
                  )],
                ),
              ),

            );

            tracker.replaceNode(component, loadComponent);

            // Remove the import statement for the standalone component
            importsToRemove.push(...componentDeclaration.getSourceFile().statements.filter(ts.isImportDeclaration));
          }
        }
      }
    }
  }

  for (const importToRemove of importsToRemove) {
    tracker.removeNode(importToRemove);
  }

}

/**
 * Checks whether a component is standalone.
 * @param node Class being checked.
 * @param templateTypeChecker
 */
function isStandaloneComponent(
  node: ts.ClassDeclaration,
  templateTypeChecker: TemplateTypeChecker,
): boolean {
  const metadata = templateTypeChecker.getDirectiveMetadata(node);
  return metadata != null && metadata.isStandalone;
}


//
// export function findExpressionsToMigrate(sourceFile: ts.SourceFile, importManager: ImportManager) {
//   const migratedNodesMap: Map<ts.VariableDeclaration, ts.VariableDeclaration> = new Map();
//   let _currentVariableDecl: ts.VariableDeclaration|null = null;
//   (() => {
//     sourceFile.forEachChild(function visitNode(node: ts.Node) {
//       if (ts.isVariableDeclaration(node)) {
//         _currentVariableDecl = node;
//         node.forEachChild(visitNode);
//         _currentVariableDecl = null;
//       }
//       if (isRouteOrRoutesVariableDeclaration(node)) {
//         // The variable declaration is already explicitly typed as `Route` or `Routes` so it does
//         // not need a migration.
//         return;
//       } else if (ts.isObjectLiteralExpression(node)) {
//         if (_currentVariableDecl !== null && _currentVariableDecl.type === undefined) {
//           visitObjectLiteral(node);
//         }
//       } else {
//         node.forEachChild(visitNode);
//       }
//     });
//
//     function visitObjectLiteral(obj: ts.ObjectLiteralExpression) {
//       const hasPathMatch = obj.properties.some(p => isPropertyWithName(p, 'pathMatch'));
//       const hasPath = obj.properties.some(p => isPropertyWithName(p, 'path'));
//       const childrenProperty = obj.properties.find(p => isPropertyWithName(p, 'children'));
//       // The object must have _both_ pathMatch _and_ path for us to be reasonably sure that it's
//       // a `Route` definition.
//       if (hasPath && hasPathMatch) {
//         updateCurrentVariableDeclaration();
//       } else if (
//         childrenProperty !== undefined && ts.isPropertyAssignment(childrenProperty) &&
//         ts.isArrayLiteralExpression(childrenProperty.initializer)) {
//         // Also need to check the children if it exists
//         for (const child of childrenProperty.initializer.elements) {
//           if (ts.isObjectLiteralExpression(child)) {
//             visitObjectLiteral(child);
//             // If the child caused a migration, we can exit early
//             if (_currentVariableDecl && migratedNodesMap.has(_currentVariableDecl)) {
//               break;
//             }
//           }
//         }
//       }
//     }
//
//     function isPropertyWithName(p: ts.ObjectLiteralElementLike, name: string) {
//       if (ts.isPropertyAssignment(p)) {
//         return p.name.getText() === name;
//       } else if (ts.isShorthandPropertyAssignment(p)) {
//         return p.name.getText() === name;
//       } else {
//         // Don't attempt to migrate edge case spreadAssignment
//         return false;
//       }
//     }
//
//     function updateCurrentVariableDeclaration() {
//       if (_currentVariableDecl === null || _currentVariableDecl.initializer === undefined) {
//         return;
//       }
//       let typeToUse: ts.TypeNode;
//       if (ts.isArrayLiteralExpression(_currentVariableDecl.initializer)) {
//         typeToUse = importManager.addImportToSourceFile(sourceFile, 'Routes', '@angular/router') as
//           unknown as ts.TypeNode;
//       } else {
//         typeToUse = importManager.addImportToSourceFile(sourceFile, 'Route', '@angular/router') as
//           unknown as ts.TypeNode;
//       }
//
//       const migrated = ts.factory.updateVariableDeclaration(
//         _currentVariableDecl, _currentVariableDecl.name, _currentVariableDecl.exclamationToken,
//         typeToUse, _currentVariableDecl.initializer);
//       migratedNodesMap.set(_currentVariableDecl, migrated);
//     }
//   })();
//
//   return migratedNodesMap;
// }
//
// function isRouteOrRoutesVariableDeclaration(node: ts.Node) {
//   return ts.isVariableDeclaration(node) && node.type &&
//     (node.type.getText() === 'Route' || node.type.getText() === 'Routes');
// }
