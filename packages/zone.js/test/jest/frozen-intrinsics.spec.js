/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
'use strict';

const {spawnSync} = require('child_process');
const path = require('path');

describe('zone.js/node under --frozen-intrinsics', () => {
  it('should load without throwing', () => {
    const scriptPath = path.resolve(__dirname, '../node/frozen_intrinsics_load.js');
    const result = spawnSync(process.execPath, ['--frozen-intrinsics', scriptPath], {
      encoding: 'utf-8',
    });

    if (result.status !== 0) {
      throw new Error(
        `zone.js/node threw under --frozen-intrinsics.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
      );
    }
    expect(result.status).toBe(0);
  });
});
