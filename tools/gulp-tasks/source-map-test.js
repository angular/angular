/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const path = require('path');
const sourceMapTest = require('../source-map-test');

const excludedPackages = ['bazel', 'benchpress', 'compiler-cli', 'language-service'];

module.exports = (gulp) => () => {
  const packageDir = path.resolve(process.cwd(), 'dist/packages-dist/');
  const packages =
      fs.readdirSync(packageDir).filter(package => excludedPackages.indexOf(package) === -1);

  packages.forEach(package => {
    if (sourceMapTest(package).length) {
      process.exit(1);
    }
  });

  if (!packages.length) {
    // tslint:disable-next-line:no-console
    console.log('No packages found in packages-dist. Unable to run source map test.');
    process.exit(1);
  }
};
