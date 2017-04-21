/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint no-console: "off" */

const Package = require('dgeni').Package;
const contentPackage = require('../angular-content-package');
const { readFileSync } = require('fs');
const { resolve } = require('canonical-path');
const { CONTENTS_PATH } = require('../config');

function createPackage(guideName) {

  const guideFilePath = `${CONTENTS_PATH}/guide/${guideName}.md`;
  const guideFile = readFileSync(guideFilePath, 'utf8');
  const examples = [];
  guideFile.replace(/<code-(?:pane|example) [^>]*path="([^"]+)"/g, (_, path) => examples.push('examples/' + path));

  if (examples.length) {
    console.log('The following example files are referenced in this guide:');
    console.log(examples.map(example => ' - ' + example).join('\n'));
  }

  return new Package('author-guide', [contentPackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH,
          include: guideFilePath,
          fileReader: 'contentFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: examples.map(example => resolve(CONTENTS_PATH, example)),
          fileReader: 'exampleFileReader'
        }
      ];
    });
}

module.exports = { createPackage };