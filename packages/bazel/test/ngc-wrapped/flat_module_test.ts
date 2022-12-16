/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {existsSync, readFileSync} from 'fs';
import {dirname, join} from 'path';

describe('flat_module ng_module', () => {
  let packageOutput: string;
  let flatModuleOutFile: string;

  beforeAll(() => {
    packageOutput =
        dirname(runfiles.resolve('angular/packages/bazel/test/ngc-wrapped/flat_module/index.mjs'));
    flatModuleOutFile = join(packageOutput, 'flat_module.mjs');
  });

  it('should have a flat module out file', () => {
    expect(existsSync(flatModuleOutFile)).toBe(true);
  });

  describe('flat module out file', () => {
    it('should have a proper flat module re-export', () => {
      expect(readFileSync(flatModuleOutFile, 'utf8')).toContain(`export * from './index';`);
      expect(readFileSync(flatModuleOutFile, 'utf8'))
          .toContain(`Generated bundle index. Do not edit.`);
    });
  });
});
