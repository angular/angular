/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint no-console: "off" */

const {resolve} = require('canonical-path');
const Package = require('dgeni').Package;
const {readFileSync} = require('fs');

const contentPackage = require('../angular-content-package');
const {CONTENTS_PATH} = require('../config');
const baseAuthoringPackage = require('./base-authoring-package');
const {codeExampleMatcher} = require('./utils');

function createPackage(guideName) {
  const guideFilePath = `${CONTENTS_PATH}/guide/${guideName}.md`;
  const guideFile = readFileSync(guideFilePath, 'utf8');
  const examples = [];
  guideFile.replace(codeExampleMatcher, (_, path) => examples.push('examples/' + path));

  if (examples.length) {
    console.log('The following example files are referenced in this guide:');
    console.log(examples.map(example => ' - ' + example).join('\n'));
  }

  return new Package('author-guide', [baseAuthoringPackage, contentPackage]).config(function(readFilesProcessor) {
    readFilesProcessor.sourceFiles = [
      {basePath: CONTENTS_PATH, include: guideFilePath, fileReader: 'contentFileReader'}, {
        basePath: CONTENTS_PATH,
        include: examples.map(example => resolve(CONTENTS_PATH, example)),
        fileReader: 'exampleFileReader'
      }
    ];
  });
}

module.exports = {createPackage};
