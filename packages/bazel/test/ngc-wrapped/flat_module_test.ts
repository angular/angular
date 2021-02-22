/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {obsoleteInIvy, onlyInIvy} from '@angular/private/testing';
import {existsSync, readFileSync} from 'fs';
import {dirname, join} from 'path';

/** Runfiles helper from bazel to resolve file name paths.  */
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']!);

describe('flat_module ng_module', () => {
  let packageOutput: string;
  let flatModuleOutFile: string;

  beforeAll(() => {
    packageOutput =
        dirname(runfiles.resolve('angular/packages/bazel/test/ngc-wrapped/flat_module/index.js'));
    flatModuleOutFile = join(packageOutput, 'flat_module.js');
  });

  it('should have a flat module out file', () => {
    expect(existsSync(flatModuleOutFile)).toBe(true);
  });

  describe('flat module out file', () => {
    obsoleteInIvy('Ngtsc computes the AMD module name differently than NGC')
        .it('should have a proper AMD module name', () => {
          expect(readFileSync(flatModuleOutFile, 'utf8'))
              .toContain(`define("flat_module/flat_module"`);
        });

    onlyInIvy('Ngtsc computes the AMD module name differently than NGC')
        .it('should have a proper AMD module name', () => {
          expect(readFileSync(flatModuleOutFile, 'utf8')).toContain(`define("flat_module"`);
        });
  });
});
