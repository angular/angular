/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

const CAN_ACTIVATE = 'canActivate';
const REDIRECT_TO = 'redirectTo';

export function migrateLiteral(node: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression {
  const propertiesToKeep: ts.ObjectLiteralElementLike[] = [];
  node.properties.forEach(property => {
    // Only look for regular and shorthand property assignments since resolving things
    // like spread operators becomes too complicated for this migration.
    if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
        (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
         ts.isIdentifier(property.name))) {
      if (property.name.text !== CAN_ACTIVATE) {
        propertiesToKeep.push(property);
      }
    } else {
      propertiesToKeep.push(property);
    }
  });

  return ts.createObjectLiteral(propertiesToKeep);
}


export function findLiteralsToMigrate(sourceFile: ts.SourceFile) {
  const results = new Set<ts.ObjectLiteralExpression>();

  sourceFile.forEachChild(function visitNode(node: ts.Node) {
    if (!ts.isObjectLiteralExpression(node)) {
      node.forEachChild(visitNode);
      return;
    }
    if (hasProperty(node, REDIRECT_TO) && hasProperty(node, CAN_ACTIVATE)) {
      results.add(node);
    }
  });

  return results;
}

function hasProperty(node: ts.ObjectLiteralExpression, propertyName: string): boolean {
  for (const property of node.properties) {
    // Only look for regular and shorthand property assignments since resolving things
    // like spread operators becomes too complicated for this migration.
    if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
        (ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name) ||
         ts.isIdentifier(property.name)) &&
        property.name.text === propertyName) {
      return true;
    }
  }
  return false;
}