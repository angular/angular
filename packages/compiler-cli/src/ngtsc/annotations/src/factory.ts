/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileDeclareFactoryFunction, compileFactoryFunction, R3FactoryMetadata} from '@angular/compiler';

import {CompileResult} from '../../transform';

export type CompileFactoryFn = (metadata: R3FactoryMetadata) => CompileResult;

export function compileNgFactoryDefField(metadata: R3FactoryMetadata): CompileResult {
  const res = compileFactoryFunction(metadata);
  return {name: 'ɵfac', initializer: res.expression, statements: res.statements, type: res.type};
}

export function compileDeclareFactory(metadata: R3FactoryMetadata): CompileResult {
  const res = compileDeclareFactoryFunction(metadata);
  return {name: 'ɵfac', initializer: res.expression, statements: res.statements, type: res.type};
}
