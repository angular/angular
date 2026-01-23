/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {CompilerHost, CompilerOptions} from './api';

let wrapHostForTest: ((host: ts.CompilerHost) => ts.CompilerHost) | null = null;

export function setWrapHostForTest(
  wrapFn: ((host: ts.CompilerHost) => ts.CompilerHost) | null,
): void {
  wrapHostForTest = wrapFn;
}

export function createCompilerHost({
  options,
  tsHost = ts.createCompilerHost(options, true),
}: {
  options: CompilerOptions;
  tsHost?: ts.CompilerHost;
}): CompilerHost {
  if (wrapHostForTest !== null) {
    tsHost = wrapHostForTest(tsHost);
  }
  return tsHost;
}
