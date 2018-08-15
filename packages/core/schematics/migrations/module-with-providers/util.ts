/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

/** Add a generic type to a type reference. */
export function createModuleWithProvidersType(
    type: string, node?: ts.TypeReferenceNode): ts.TypeReferenceNode {
  const typeNode = node || ts.createTypeReferenceNode('ModuleWithProviders', []);
  const typeReferenceNode = ts.createTypeReferenceNode(ts.createIdentifier(type), []);
  return ts.updateTypeReferenceNode(
      typeNode, typeNode.typeName, ts.createNodeArray([typeReferenceNode]));
}

/** Determine whether a node is a ModuleWithProviders type reference node without a generic type */
export function isModuleWithProvidersNotGeneric(
    typeChecker: ts.TypeChecker, node: ts.Node): node is ts.TypeReferenceNode {
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) {
    return false;
  }

  const imp = getImportOfIdentifier(typeChecker, node.typeName);
  return !!imp && imp.name === 'ModuleWithProviders' && imp.importModule === '@angular/core' &&
      !node.typeArguments;
}
