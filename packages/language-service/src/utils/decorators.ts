/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {getAngularDecorators} from '@angular/compiler-cli/src/ngtsc/annotations';

export function isDirectiveOrComponent(
  node: ts.ClassDeclaration,
  reflector: ReflectionHost,
): boolean {
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators === null) {
    return false;
  }
  return (
    getAngularDecorators(decorators, ['Directive', 'Component'], /* isCore */ false).length > 0
  );
}
