/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Whether the Angular module in the given path imports the specified module class name.
 */
export function hasNgModuleImport(tree: Tree, modulePath: string, className: string): boolean {
  const moduleFileContent = tree.read(modulePath);

  if (!moduleFileContent) {
    throw new SchematicsException(`Could not read Angular module file: ${modulePath}`);
  }

  const parsedFile = ts.createSourceFile(modulePath, moduleFileContent.toString(),
      ts.ScriptTarget.Latest, true);
  let ngModuleMetadata: ts.ObjectLiteralExpression | null = null;

  const findModuleDecorator = (node: ts.Node) => {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression) &&
        isNgModuleCallExpression(node.expression)) {
      ngModuleMetadata = node.expression.arguments[0] as ts.ObjectLiteralExpression;
      return;
    }

    ts.forEachChild(node, findModuleDecorator);
  };

  ts.forEachChild(parsedFile, findModuleDecorator);

  if (!ngModuleMetadata) {
    throw new SchematicsException(`Could not find NgModule declaration inside: "${modulePath}"`);
  }

  for (let property of ngModuleMetadata!.properties) {
    if (!ts.isPropertyAssignment(property) || property.name.getText() !== 'imports' ||
        !ts.isArrayLiteralExpression(property.initializer)) {
      continue;
    }

    if (property.initializer.elements.some(element => element.getText() === className)) {
      return true;
    }
  }

  return false;
}

/**
 * Resolves the last identifier that is part of the given expression. This helps resolving
 * identifiers of nested property access expressions (e.g. myNamespace.core.NgModule).
 */
function resolveIdentifierOfExpression(expression: ts.Expression): ts.Identifier | null {
  if (ts.isIdentifier(expression)) {
    return expression;
  } else if (ts.isPropertyAccessExpression(expression)) {
    return resolveIdentifierOfExpression(expression.expression);
  }
  return null;
}

/** Whether the specified call expression is referring to a NgModule definition. */
function isNgModuleCallExpression(callExpression: ts.CallExpression): boolean {
  if (!callExpression.arguments.length ||
      !ts.isObjectLiteralExpression(callExpression.arguments[0])) {
    return false;
  }

  const decoratorIdentifier = resolveIdentifierOfExpression(callExpression.expression);
  return decoratorIdentifier ? decoratorIdentifier.text === 'NgModule' : false;
}
