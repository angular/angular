/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-console
module.exports = (gulp) => (done) => {
  const madge = require('madge');

  // TODO: This only checks for circular dependencies within each package because
  // imports to other packages cannot be resolved by Madge when CommonJS is used.
  // We should consider updating Madge and use a tsonfig to check across packages.
  const dependencyObject = madge(['dist/packages-dist/'], {
    format: 'cjs',
    extensions: ['.js'],
    onParseFile: function(data) { data.src = data.src.replace(/\/\* circular \*\//g, '//'); }
  });
  const circularDependencies = dependencyObject.circular().getArray();
  if (circularDependencies.length > 0) {
    console.log('Found circular dependencies!');
    console.log(circularDependencies);
    process.exit(1);
  }
  done();
};
