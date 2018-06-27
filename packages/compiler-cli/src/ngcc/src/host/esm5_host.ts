/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import { ClassMember, Decorator, Import, Parameter } from '../../../ngtsc/host';
import { NgccReflectionHost } from './ngcc_host';

/**
 * ESM5 packages contain ECMAScript IIFE functions that act like classes. For example:
 *
 * ```
 * var CommonModule = (function () {
 *  function CommonModule() {
 *  }
 *  CommonModule.decorators = [ ... ];
 * ```
 *
 * Items are decorated if they have a static property called `decorators`.
 *
 */
export class Esm5ReflectionHost implements NgccReflectionHost {
  constructor(protected checker: ts.TypeChecker) { }

  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
    // This is different to ES2015 and TS
    throw new Error('Not implemented');
  }

  getMembersOfClass(clazz: ts.Declaration): ClassMember[] {
    throw new Error('Method not implemented.');
  }

  getConstructorParameters(declaration: ts.Declaration): Parameter[] | null {
    throw new Error('Method not implemented.');
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    throw new Error('Method not implemented.');
  }

  isClass(node: ts.Node): node is ts.Declaration {
    throw new Error('Method not implemented');
  }
}
