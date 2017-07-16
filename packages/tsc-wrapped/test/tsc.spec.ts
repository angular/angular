/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Tsc} from '../src/tsc';
import {VinylFile} from '../src/vinyl_file';

describe('options parsing', () => {

  const configData = `
{
    "angularCompilerOptions": {
        "googleClosureOutput": true
    },
    "compilerOptions": {
        "module": "commonjs",
        "outDir": "built"
    }
}`;

  const tsc = new Tsc(() => configData, () => ['tsconfig.json']);
  const config = {path: 'basePath/tsconfig.json', contents: new Buffer(configData)};

  it('should combine all options into ngOptions', () => {
    const {parsed, ngOptions} =
        tsc.readConfiguration('projectDir', 'basePath', {target: ts.ScriptTarget.ES2015});

    expect(ngOptions).toEqual({
      genDir: 'basePath',
      googleClosureOutput: true,
      module: ts.ModuleKind.CommonJS,
      outDir: 'basePath/built',
      configFilePath: undefined,
      target: ts.ScriptTarget.ES2015
    });
  });

  it('should combine all options into ngOptions from vinyl like object', () => {
    const {parsed, ngOptions} = tsc.readConfiguration(config as VinylFile, 'basePath');

    expect(ngOptions).toEqual({
      genDir: 'basePath',
      googleClosureOutput: true,
      module: ts.ModuleKind.CommonJS,
      outDir: 'basePath/built',
      configFilePath: undefined
    });
  });
});
