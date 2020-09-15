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
const methodConfig = new Map<string, Set<string>>([
  ['navigateByUrl', new Set<string>(['skipLocationChange', 'replaceUrl', 'state'])],
  [
    'createUrlTree', new Set<string>([
      'relativeTo', 'queryParams', 'fragment', 'preserveQueryParams', 'queryParamsHandling',
      'preserveFragment'
    ])
  ]
]);

export function migrateLiteral(
    methodName: string, node: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression {
  const allowedProperties = methodConfig.get(methodName);

  if (!allowedProperties) {
    throw Error(`Attempting to migrate unconfigured method called ${methodName}.`);
  }

  const propertiesToKeep: ts.ObjectLiteralElementLike[] = [];
  const removedPropertyNames: string[] = [];

  node.properties.forEach(property => {
    // Only look for regular and shorthand property assignments since resolving things
    // like spread operators becomes too complicated for this migration.
    if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
        (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
         ts.isIdentifier(property.name))) {
      if (allowedProperties.has(property.name.text)) {
        propertiesToKeep.push(property);
      } else {
        removedPropertyNames.push(property.name.text);
      }
    } else {
      propertiesToKeep.push(property);
    }
  });

  // Don't modify the node if there's nothing to remove.
  if (removedPropertyNames.length === 0) {
    return node;
  }

  // Note that the trailing/leading spaces are necessary so the comment looks good.
  const removalComment =
      ` Removed unsupported properties by Angular migration: ${removedPropertyNames.join(', ')}. `;

  if (propertiesToKeep.length > 0) {
    propertiesToKeep[0] = addUniqueLeadingComment(propertiesToKeep[0], removalComment);
    return ts.createObjectLiteral(propertiesToKeep);
  } else {
    return addUniqueLeadingComment(ts.createObjectLiteral(propertiesToKeep), removalComment);
  }
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

/** Adds a leading comment to a node, if the node doesn't have such a comment already. */
function addUniqueLeadingComment<T extends ts.Node>(node: T, comment: string): T {
  const existingComments = ts.getSyntheticLeadingComments(node);

  // This logic is primarily to ensure that we don't add the same comment multiple
  // times when tslint runs over the same file again with outdated information.
  if (!existingComments || existingComments.every(c => c.text !== comment)) {
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment);
  }

  return node;
}
