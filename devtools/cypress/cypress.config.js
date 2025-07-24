/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

module.exports = {
  defaultCommandTimeout: 10000, // Increase the default command timeout to 10 seconds
  e2e: {
    specPattern: 'integration/*.e2e.js',
    supportFile: 'support/index.js',
    baseUrl: 'http://localhost:4200',
  },
};
