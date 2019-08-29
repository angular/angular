/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {Symbol, SymbolExtractor} from './symbol_extractor';

describe('scenarios', () => {
  const symbolExtractorSpecDir = path.dirname(
      require.resolve('angular/tools/symbol-extractor/symbol_extractor_spec/empty.json'));
  const scenarioFiles = fs.readdirSync(symbolExtractorSpecDir);
  for (let i = 0; i < scenarioFiles.length; i = i + 2) {
    let jsFile = scenarioFiles[i];
    let jsonFile = scenarioFiles[i + 1];
    let testName = jsFile.substring(0, jsFile.lastIndexOf('.'));
    if (!jsFile.endsWith('.js')) throw new Error('Expected: .js file found: ' + jsFile);
    if (!jsonFile.endsWith('.json')) throw new Error('Expected: .json file found: ' + jsonFile);

    // Left here so that it is easy to debug single test.
    // if (testName !== 'hello_world_min_debug') continue;

    it(testName, () => {
      const jsFileContent = fs.readFileSync(path.join(symbolExtractorSpecDir, jsFile)).toString();
      const jsonFileContent =
          fs.readFileSync(path.join(symbolExtractorSpecDir, jsonFile)).toString();
      const symbols = SymbolExtractor.parse(testName, jsFileContent);
      const diff = SymbolExtractor.diff(symbols, jsonFileContent);
      expect(diff).toEqual({});
    });
  }
});
