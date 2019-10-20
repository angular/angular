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
  return {
    name: 'Directive',
    identifier: null,
    import: {name: 'Directive', from: '@angular/core'},
    node: clazz.name,
    args: [],
  };
}

/**
 * Create an empty `Injectable` decorator that will be associated with the `clazz`.
 */
export function createInjectableDecorator(clazz: ClassDeclaration): Decorator {
  return {
    name: 'Injectable',
    identifier: null,
    import: {name: 'Injectable', from: '@angular/core'},
    node: clazz.name,
    args: [],
  };
}
