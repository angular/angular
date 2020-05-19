/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs = require('fs');

module.exports = function(config) {
  let chkResult = true;
  config.targets.forEach(target => {
    if (target.checkTarget) {
      try {
        const stats = fs.statSync(target.path);
        if (stats.size > target.limit) {
          console.error(`file ${target.path} size over limit, limit is ${target.limit}, actual is ${
              stats.size}`);
          chkResult = false;
        }
      } catch (err) {
        console.error(`failed to get filesize: ${target.path}`);
        chkResult = false;
      }
    }
  });
  return chkResult;
};
