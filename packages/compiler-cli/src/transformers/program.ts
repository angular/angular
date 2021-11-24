
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '../ngtsc/program';

import {CompilerHost, CompilerOptions, Program} from './api';

/** Error message to show when attempting to build View Engine. */
const VE_DISABLED_MESSAGE = `
This compilation is using the View Engine compiler which is no longer supported by the Angular team
and is being removed. Please upgrade to the Ivy compiler by switching to \`NgtscProgram\`. See
https://angular.io/guide/ivy for more information.
`.trim().split('\n').join(' ');

export function createProgram({rootNames, options, host, oldProgram}: {
  rootNames: ReadonlyArray<string>,
  options: CompilerOptions,
  host: CompilerHost,
  oldProgram?: Program
}): Program {
  if (options.enableIvy !== false) {
    return new NgtscProgram(rootNames, options, host, oldProgram as NgtscProgram | undefined);
  } else {
    throw new Error(VE_DISABLED_MESSAGE);
  }
}
