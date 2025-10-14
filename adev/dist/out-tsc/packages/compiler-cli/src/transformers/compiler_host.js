/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
let wrapHostForTest = null;
export function setWrapHostForTest(wrapFn) {
  wrapHostForTest = wrapFn;
}
export function createCompilerHost({options, tsHost = ts.createCompilerHost(options, true)}) {
  if (wrapHostForTest !== null) {
    tsHost = wrapHostForTest(tsHost);
  }
  return tsHost;
}
//# sourceMappingURL=compiler_host.js.map
