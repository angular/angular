/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

/**
 * Configures the methods that the migration should be looking for
 * and the properties from `NavigationExtras` that should be preserved.
 */
const methodConfig = new Set<string>(['navigate', 'createUrlTree']);

const preserveQueryParamsKey = 'preserveQueryParams';

export function migrateLiteral(
    methodName: string, node: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression {
  const isMigratableMethod = methodConfig.has(methodName);

  if (!isMigratableMethod) {
    throw Error(`Attempting to migrate unconfigured method called ${methodName}.`);
  }


  const propertiesToKeep: ts.ObjectLiteralElementLike[] = [];
  let propertyToMigrate: ts.PropertyAssignment|ts.ShorthandPropertyAssignment|undefined = undefined;

  for (const property of node.properties) {
    // Only look for regular and shorthand property assignments since resolving things
    // like spread operators becomes too complicated for this migration.
    if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
        (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
         ts.isIdentifier(property.name)) &&
        (property.name.text === preserveQueryParamsKey)) {
      propertyToMigrate = property;
      continue;
    }
    propertiesToKeep.push(property);
  }

  // Don't modify the node if there's nothing to migrate.
  if (propertyToMigrate === undefined) {
    return node;
  }

  if ((ts.isShorthandPropertyAssignment(propertyToMigrate) &&
       propertyToMigrate.objectAssignmentInitializer?.kind === ts.SyntaxKind.TrueKeyword) ||
      (ts.isPropertyAssignment(propertyToMigrate) &&
       propertyToMigrate.initializer.kind === ts.SyntaxKind.TrueKeyword)) {
    return ts.updateObjectLiteral(
        node,
        propertiesToKeep.concat(
            ts.createPropertyAssignment('queryParamsHandling', ts.createIdentifier(`'preserve'`))));
  }

  return ts.updateObjectLiteral(node, propertiesToKeep);
}

export function findLiteralsToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const results = new Map<string, Set<ts.ObjectLiteralExpression>>(
      Array.from(methodConfig.keys(), key => [key, new Set()]));
  const routerImport = getImportSpecifier(sourceFile, '@angular/router', 'Router');
  const seenLiterals = new Map<ts.ObjectLiteralExpression, string>();

  if (routerImport) {
    sourceFile.forEachChild(function visitNode(node: ts.Node) {
      // Look for calls that look like `foo.<method to migrate>` with more than one parameter.
      if (ts.isCallExpression(node) && node.arguments.length > 1 &&
          ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
          methodConfig.has(node.expression.name.text)) {
        // Check whether the type of the object on which the
        // function is called refers to the Router import.
        if (isReferenceToImport(typeChecker, node.expression.expression, routerImport)) {
          const methodName = node.expression.name.text;
          const parameterDeclaration =
              typeChecker.getTypeAtLocation(node.arguments[1]).getSymbol()?.valueDeclaration;

          // Find the source of the object literal.
          if (parameterDeclaration && ts.isObjectLiteralExpression(parameterDeclaration)) {
            if (!seenLiterals.has(parameterDeclaration)) {
              results.get(methodName)!.add(parameterDeclaration);
              seenLiterals.set(parameterDeclaration, methodName);
              // If the same literal has been passed into multiple different methods, we can't
              // migrate it, because the supported properties are different. When we detect such
              // a case, we drop it from the results so that it gets ignored. If it's used multiple
              // times for the same method, it can still be migrated.
            } else if (seenLiterals.get(parameterDeclaration) !== methodName) {
              results.forEach(literals => literals.delete(parameterDeclaration));
            }
          }
        }
      } else {
        node.forEachChild(visitNode);
      }
    });
  }

  return results;
}
