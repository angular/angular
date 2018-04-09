/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview A wrapper around the protractor cli for bazel compatibility.
 */

const launcher = require('protractor/built/launcher');

function main(args) {
  if (!args.length) {
    throw new Error('Config file argument missing');
  }
  const config = require.resolve(args[0]);
  launcher.init(config);
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
