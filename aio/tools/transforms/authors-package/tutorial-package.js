/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const { basePackage, CONTENTS_PATH, getBoilerPlateExcludes } = require('./base-package');

function createPackage() {
  return new Package('author-tutorial', [basePackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/tutorial/**/*.md',
          fileReader: 'contentFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/examples/toh-*/**/*',
          exclude: getBoilerPlateExcludes(),
          fileReader: 'exampleFileReader'
        }
      ];
    });
}


module.exports = { createPackage };