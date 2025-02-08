/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {NgtscProgram} from '../ngtsc/program';

import {CompilerHost, CompilerOptions, Program} from './api';

export function createProgram({
  rootNames,
  options,
  projectReferences,
  host,
  oldProgram,
}: {
  rootNames: ReadonlyArray<string>;
  options: CompilerOptions;
  projectReferences?: readonly ts.ProjectReference[];
  host: CompilerHost;
  oldProgram?: Program;
}): Program {
  return new NgtscProgram(rootNames, options, host, oldProgram as NgtscProgram | undefined, projectReferences);
}
