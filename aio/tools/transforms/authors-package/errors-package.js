/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const {CONTENTS_PATH} = require('../config');
const baseAuthoringPackage = require('./base-authoring-package');

function createPackage() {
  return new Package('author-errors', [baseAuthoringPackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH,
          include: `${CONTENTS_PATH}/errors/index.md`,
          fileReader: 'contentFileReader',
        },
        {
          basePath: CONTENTS_PATH,
          include: `${CONTENTS_PATH}/errors/**/*.md`,
          exclude: `${CONTENTS_PATH}/errors/index.md`,
          fileReader: 'errorFileReader',
        },
      ];
    });
}

module.exports = {createPackage};
