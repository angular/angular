/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {
  generate: (gulp) => () => {
    const path = require('path');
    const Dgeni = require('dgeni');
    const angularDocsPackage = require(path.resolve(__dirname, '../transforms/angular.io-package'));
    const dgeni = new Dgeni([angularDocsPackage]);
    return dgeni.generate();
  },

  test: (gulp) => () => {
    const execSync = require('child_process').execSync;
    execSync(
        'node ../dist/tools/cjs-jasmine/index-tools ../../transforms/**/*.spec.js',
        {stdio: ['inherit', 'inherit', 'inherit']});
  }
};
