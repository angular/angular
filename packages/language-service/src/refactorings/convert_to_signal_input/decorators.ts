/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getAngularDecorators, ReflectionHost} from '@angular/compiler-cli';
import ts from 'typescript';
import {isDirectiveOrComponent} from '../../utils/decorators';

export function isDecoratorInputClassField(
  node: ts.ClassElement,
  reflector: ReflectionHost,
): boolean {
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators === null) {
    return false;
  }
  return getAngularDecorators(decorators, ['Input'], /* isCore */ false).length > 0;
}

export function isDirectiveOrComponentWithInputs(
  node: ts.ClassDeclaration,
  reflector: ReflectionHost,
): boolean {
  if (!isDirectiveOrComponent(node, reflector)) {
    return false;
  }
  return node.members.some((m) => isDecoratorInputClassField(m, reflector));
}
