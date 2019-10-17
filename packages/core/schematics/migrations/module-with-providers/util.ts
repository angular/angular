/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Add a generic type to a type reference. */
export function addGeneric(type: string, node?: ts.TypeReferenceNode): ts.TypeReferenceNode {
  const typeNode = node || ts.createTypeReferenceNode('ModuleWithProviders', []);
  const typeReferenceNode = ts.createTypeReferenceNode(ts.createIdentifier(type), []);
  return ts.updateTypeReferenceNode(
      typeNode, typeNode.typeName, ts.createNodeArray([typeReferenceNode]));
}

/** Determine whether a node has a generic type */
export function isModuleWithProvidersNotGeneric(node: ts.TypeNode): boolean {
  return ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) &&
      node.typeName.text === 'ModuleWithProviders' && !node.typeArguments;
}
