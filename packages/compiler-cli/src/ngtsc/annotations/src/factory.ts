/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileFactoryFunction, R3FactoryMetadata} from '@angular/compiler';

import {CompileResult} from '../../transform';

export function compileNgFactoryDefField(metadata: R3FactoryMetadata): CompileResult {
  const res = compileFactoryFunction(metadata);
  return {name: 'ɵfac', initializer: res.factory, statements: res.statements, type: res.type};
}
