/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3FactoryFnMetadata, Statement, compileFactoryFromMetadata} from '@angular/compiler';

import {CompileResult} from '../../transform';

export function getNgFactoryFnCompileResult(
    metadata: R3FactoryFnMetadata, metadataStatement: Statement | null,
    isPipe = false): CompileResult {
  const res = compileFactoryFromMetadata(metadata, isPipe);
  if (metadataStatement !== null) {
    res.statements.push(metadataStatement);
  }
  return {
    name: 'ngFactoryFn',
    initializer: res.factory,
    statements: res.statements,
    type: res.type
  };
}
