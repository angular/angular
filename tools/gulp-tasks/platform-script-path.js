/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// returns the script path for the current platform
module.exports = function platformScriptPath(path) {
  const os = require('os');
  return /^win/.test(os.platform()) ? `${path}.cmd` : path;
};
