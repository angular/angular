/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
module.exports = {
  baseDir: '../',
  goldenFile: '../goldens/ts-circular-deps.json',
  // The test should not capture deprecated packages such as `http`, or the `webworker` platform.
  glob: `./**/*.ts`,
  // Command that will be displayed if the golden needs to be updated.
  approveCommand: 'yarn ts-circular-deps:approve',
  resolveModule: () => {}
};
