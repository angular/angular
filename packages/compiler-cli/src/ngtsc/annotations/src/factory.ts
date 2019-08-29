/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3FactoryDefMetadata, compileFactoryFromMetadata} from '@angular/compiler';

import {CompileResult} from '../../transform';

export function compileNgFactoryDefField(metadata: R3FactoryDefMetadata): CompileResult {
  const res = compileFactoryFromMetadata(metadata);
  return {
    name: 'ngFactoryDef',
    initializer: res.factory,
    statements: res.statements,
    type: res.type
  };
}
