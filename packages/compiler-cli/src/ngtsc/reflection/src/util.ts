/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ClassDeclaration} from './host';

export function isNamedClassDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.ClassDeclaration> {
  return ts.isClassDeclaration(node) && isIdentifier(node.name);
}

export function isNamedFunctionDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.FunctionDeclaration> {
  return ts.isFunctionDeclaration(node) && isIdentifier(node.name);
}

export function isNamedVariableDeclaration(node: ts.Node):
    node is ClassDeclaration<ts.VariableDeclaration> {
  return ts.isVariableDeclaration(node) && isIdentifier(node.name);
}

function isIdentifier(node: ts.Node|undefined): node is ts.Identifier {
  return node !== undefined && ts.isIdentifier(node);
}
