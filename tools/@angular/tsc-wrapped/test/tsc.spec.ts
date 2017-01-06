/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Tsc} from '../src/tsc';

describe('options parsing', () => {

  const tsc = new Tsc(
      () => `
{
    "angularCompilerOptions": {
        "googleClosureOutput": true
    },
    "compilerOptions": {
        "module": "commonjs",
        "outDir": "built"
    }
}`,
      () => ['tsconfig.json']);

  it('should combine all options into ngOptions', () => {
    const {parsed, ngOptions} = tsc.readConfiguration('projectDir', 'basePath');

    expect(ngOptions).toEqual({
      genDir: 'basePath',
      googleClosureOutput: true,
      module: ts.ModuleKind.CommonJS,
      outDir: 'basePath/built',
      configFilePath: undefined
    });
  });
});
