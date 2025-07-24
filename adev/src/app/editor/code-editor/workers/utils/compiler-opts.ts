/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const getCompilerOpts = (ts: {ScriptTarget: {ES2021: number; ES2020: number}}) => ({
  target: ts.ScriptTarget.ES2021,
  module: ts.ScriptTarget.ES2020,
  lib: ['es2021', 'es2020', 'dom'],
  esModuleInterop: true,
  experimentalDecorators: true,
});
