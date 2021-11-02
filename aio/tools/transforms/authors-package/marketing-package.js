/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const contentPackage = require('../angular-content-package');
const {CONTENTS_PATH} = require('../config');
const baseAuthoringPackage = require('./base-authoring-package');

function createPackage() {
  return new Package('author-marketing', [baseAuthoringPackage, contentPackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH + '/marketing',
          include: CONTENTS_PATH + '/marketing/**/*.{html,md}',
          fileReader: 'contentFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/*.md',
          exclude: [CONTENTS_PATH + '/index.md'],
          fileReader: 'contentFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/marketing/*.json',
          fileReader: 'jsonFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/navigation.json',
          fileReader: 'jsonFileReader'
        },
      ];
    });
}


module.exports = { createPackage };
