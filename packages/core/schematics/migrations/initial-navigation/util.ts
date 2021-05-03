/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

/** Determine whether a node is a ModuleWithProviders type reference node without a generic type */
export function isRouterModuleForRoot(
    typeChecker: ts.TypeChecker, node: ts.Node): node is ts.CallExpression {
  if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression) ||
      !ts.isIdentifier(node.expression.expression) || node.expression.name.text !== 'forRoot') {
    return false;
  }
  const imp = getImportOfIdentifier(typeChecker, node.expression.expression);
  return !!imp && imp.name === 'RouterModule' && imp.importModule === '@angular/router' &&
      !node.typeArguments;
}

export function isExtraOptions(
    typeChecker: ts.TypeChecker, node: ts.Node): node is ts.TypeReferenceNode {
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) {
    return false;
  }

  const imp = getImportOfIdentifier(typeChecker, node.typeName);
  return imp !== null && imp.name === 'ExtraOptions' && imp.importModule === '@angular/router' &&
      !node.typeArguments;
}
