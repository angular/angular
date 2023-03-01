/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const extendedDiagnosticsPackage = require('../angular-extended-diagnostics-package');
const {CONTENTS_PATH} = require('../config');
const baseAuthoringPackage = require('./base-authoring-package');

function createPackage() {
  return new Package('author-extended-diagnostics', [baseAuthoringPackage, extendedDiagnosticsPackage])
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: CONTENTS_PATH,
          include: `${CONTENTS_PATH}/extended-diagnostics/index.md`,
          fileReader: 'contentFileReader',
        },
        {
          basePath: CONTENTS_PATH,
          include: `${CONTENTS_PATH}/extended-diagnostics/**/*.md`,
          exclude: `${CONTENTS_PATH}/extended-diagnostics/index.md`,
          fileReader: 'extendedDiagnosticFileReader',
        },
      ];
    });
}

module.exports = {createPackage};
