/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const Package = require('dgeni').Package;
const contentPackage = require('../angular-content-package');
const { readFileSync } = require('fs');
const { resolve } = require('canonical-path');
const { CONTENTS_PATH } = require('../config');

/* eslint no-console: "off" */

function createPackage(tutorialName) {

  const tutorialFilePath = `${CONTENTS_PATH}/tutorial/${tutorialName}.md`;
  const tutorialFile = readFileSync(tutorialFilePath, 'utf8');
  const examples = [];
  tutorialFile.replace(/<code-(?:pane|example) [^>]*path="([^"]+)"/g, (_, path) => examples.push('examples/' + path));

  if (examples.length) {
    console.log('The following example files are referenced in this tutorial:');
    console.log(examples.map(example => ' - ' + example).join('\n'));
  }

  return new Package('author-tutorial', [contentPackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH,
          include: tutorialFilePath,
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