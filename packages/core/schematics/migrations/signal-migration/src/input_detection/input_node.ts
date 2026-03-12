/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {getMemberName} from '../utils/class_member_names';

/** Variants of input names supported by Angular compiler's input detection. */
export type InputNameNode = ts.Identifier | ts.StringLiteral | ts.PrivateIdentifier;

/** Describes a TypeScript node that can be an Angular `@Input()` declaration. */
export type InputNode = (ts.AccessorDeclaration | ts.PropertyDeclaration) & {
  name: InputNameNode;
  parent: ts.ClassDeclaration;
};

/** Checks whether the given node can be an `@Input()` declaration node. */
export function isInputContainerNode(node: ts.Node): node is InputNode {
  return (
    ((ts.isAccessor(node) && ts.isClassDeclaration(node.parent)) ||
      ts.isPropertyDeclaration(node)) &&
    getMemberName(node) !== null
  );
}
