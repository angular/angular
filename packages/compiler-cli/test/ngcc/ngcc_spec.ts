/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';

import {mainNgcc} from '../../src/ngcc/src/main';

import {TestSupport, isInBazel, setup} from '../test_support';

const OUTPUT_PATH = 'node_modules_ngtsc';

describe('ngcc behavioral tests', () => {
  if (!isInBazel()) {
    // These tests should be excluded from the non-Bazel build.
    return;
  }

  // Temporary local debugging aid. Set to `true` to turn on.
  const preserveOutput = false;
  const onSpecCompleted = (format: string) => {
    if (preserveOutput) {
      const {tmpdir} = require('os');
      const {cp, mkdir, rm, set} = require('shelljs');

      const tempRootDir = join(tmpdir(), 'ngcc-spec', format);
      const outputDir = OUTPUT_PATH;

      set('-e');
      rm('-rf', tempRootDir);
      mkdir('-p', tempRootDir);
      cp('-R', join(support.basePath, outputDir), tempRootDir);

      global.console.log(`Copied '${outputDir}' to '${tempRootDir}'.`);
    }
  };

  let support: TestSupport;
  beforeEach(() => support = setup());

  it('should run ngcc without errors for fesm2015', () => {
    const commonPath = join(support.basePath, 'node_modules/@angular/common');
    const format = 'fesm2015';

    expect(mainNgcc([format, commonPath, OUTPUT_PATH])).toBe(0);

    onSpecCompleted(format);
  });

  it('should run ngcc without errors for fesm5', () => {
    const commonPath = join(support.basePath, 'node_modules/@angular/common');
    const format = 'fesm5';

    expect(mainNgcc([format, commonPath, OUTPUT_PATH])).toBe(0);

    onSpecCompleted(format);
  });

  it('should run ngcc without errors for esm2015', () => {
    const commonPath = join(support.basePath, 'node_modules/@angular/common');
    const format = 'esm2015';

    expect(mainNgcc([format, commonPath, OUTPUT_PATH])).toBe(0);

    onSpecCompleted(format);
  });

  it('should run ngcc without errors for esm5', () => {
    const commonPath = join(support.basePath, 'node_modules/@angular/common');
    const format = 'esm5';

    expect(mainNgcc([format, commonPath, OUTPUT_PATH])).toBe(0);

    onSpecCompleted(format);
  });
});
