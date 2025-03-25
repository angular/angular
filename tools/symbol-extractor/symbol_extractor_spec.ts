/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
import * as path from 'path';

import {SymbolExtractor} from './symbol_extractor';

describe('scenarios', () => {
  const symbolExtractorSpecDir = path.dirname(
    runfiles.resolve('angular/tools/symbol-extractor/symbol_extractor_spec/empty.json'),
  );
  const scenarioFiles = fs.readdirSync(symbolExtractorSpecDir);
  for (let i = 0; i < scenarioFiles.length; i++) {
    const filePath = scenarioFiles[i];
    // We only consider files as tests if they have a `.js` extension, but do
    // not resolve to a tsickle externs file (which is a leftover from TS targets).
    if (!filePath.endsWith('.js') || filePath.endsWith('.externs.js')) {
      continue;
    }
    const testName = filePath.substring(0, filePath.lastIndexOf('.'));
    const goldenFilePath = path.join(symbolExtractorSpecDir, `${testName}.json`);

    if (!fs.existsSync(goldenFilePath)) {
      throw new Error(`No golden file found for test: ${filePath}`);
    }

    // Left here so that it is easy to debug single test.
    // if (testName !== 'hello_world_min_debug') continue;

    it(testName, () => {
      const jsFileContent = fs.readFileSync(path.join(symbolExtractorSpecDir, filePath)).toString();
      const jsonFileContent = fs.readFileSync(goldenFilePath).toString();
      const symbols = SymbolExtractor.parse(testName, jsFileContent);
      const diff = SymbolExtractor.diff(symbols, jsonFileContent);
      expect(diff).toEqual({});
    });
  }

  // Tests not existing in source root. We cannot glob for generated test fixtures as
  // tests do not run in a sandbox on Windows.

  it('should properly capture classes in TypeScript ES2015 class output', () => {
    const jsFileContent = fs.readFileSync(
      runfiles.resolve(
        'angular/tools/symbol-extractor/symbol_extractor_spec/es2015_class_output.mjs',
      ),
      'utf8',
    );
    const jsonFileContent = fs
      .readFileSync(path.join(symbolExtractorSpecDir, 'es2015_class_output.json'))
      .toString();
    const symbols = SymbolExtractor.parse('es2015_class_output', jsFileContent);
    const diff = SymbolExtractor.diff(symbols, jsonFileContent);
    expect(diff).toEqual({});
  });
});
