/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type ts from 'typescript';
import {ReflectionHost, getAngularDecorators} from '@angular/compiler-cli';

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
