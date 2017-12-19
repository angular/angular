/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const shell = require("shelljs");

module.exports = {
  // Check source code for formatting errors (clang-format)
  enforce: (gulp) => () => {
    const result = shell.exec("./node_modules/.bin/git-clang-format");
    if (result.code !== 0) {
      console.error('git-clang-format found unformatted changes');
      process.exit(1) ;
    }
  },
};
