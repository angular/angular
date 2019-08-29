/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Decorator, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {MigrationHost} from './migration';

export function isClassDeclaration(clazz: ts.Declaration): clazz is ClassDeclaration {
  return isNamedClassDeclaration(clazz) || isNamedFunctionDeclaration(clazz) ||
      isNamedVariableDeclaration(clazz);
}

/**
 * Returns true if the `clazz` is decorated as a `Directive` or `Component`.
 */
export function hasDirectiveDecorator(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.metadata.getDirectiveMetadata(new Reference(clazz)) !== null;
}

/**
 * Returns true if the `clazz` has its own constructor function.
 */
export function hasConstructor(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.reflectionHost.getConstructorParameters(clazz) !== null;
}

/**
 * Create an empty `Directive` decorator that will be associated with the `clazz`.
 */
export function createDirectiveDecorator(clazz: ClassDeclaration): Decorator {
  const selectorArg = ts.createObjectLiteral([
    // TODO: At the moment ngtsc does not accept a directive with no selector
    ts.createPropertyAssignment('selector', ts.createStringLiteral('NGCC_DUMMY')),
  ]);
  const decoratorType = ts.createIdentifier('Directive');
  const decoratorNode = ts.createObjectLiteral([
    ts.createPropertyAssignment('type', decoratorType),
    ts.createPropertyAssignment('args', ts.createArrayLiteral([selectorArg])),
  ]);

  setParentPointers(clazz.getSourceFile(), decoratorNode);

  return {
    name: 'Directive',
    identifier: decoratorType,
    import: {name: 'Directive', from: '@angular/core'},
    node: decoratorNode,
    args: [selectorArg],
  };
}

/**
 * Ensure that a tree of AST nodes have their parents wired up.
 */
export function setParentPointers(parent: ts.Node, child: ts.Node): void {
  child.parent = parent;
  ts.forEachChild(child, grandchild => setParentPointers(child, grandchild));
}
