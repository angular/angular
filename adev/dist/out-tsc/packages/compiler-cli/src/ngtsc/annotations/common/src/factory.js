/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {compileDeclareFactoryFunction, compileFactoryFunction} from '@angular/compiler';
export function compileNgFactoryDefField(metadata) {
  const res = compileFactoryFunction(metadata);
  return {
    name: 'ɵfac',
    initializer: res.expression,
    statements: res.statements,
    type: res.type,
    deferrableImports: null,
  };
}
export function compileDeclareFactory(metadata) {
  const res = compileDeclareFactoryFunction(metadata);
  return {
    name: 'ɵfac',
    initializer: res.expression,
    statements: res.statements,
    type: res.type,
    deferrableImports: null,
  };
}
//# sourceMappingURL=factory.js.map
