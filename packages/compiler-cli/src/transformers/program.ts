
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '../ngtsc/program';

import {CompilerHost, CompilerOptions, Program} from './api';

export function createProgram({rootNames, options, host, oldProgram}: {
  rootNames: ReadonlyArray<string>,
  options: CompilerOptions,
  host: CompilerHost,
  oldProgram?: Program
}): Program {
  return new NgtscProgram(rootNames, options, host, oldProgram as NgtscProgram | undefined);
}
