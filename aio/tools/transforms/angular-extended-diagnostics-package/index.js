/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path = require('canonical-path');
const Package = require('dgeni').Package;
const basePackage = require('../angular-base-package');
const {CONTENTS_PATH, TEMPLATES_PATH} = require('../config');
const contentPackage = require('../content-package');

const extendedDiagnosticsPackage = new Package('angular-extended-diagnostics', [basePackage, contentPackage])

    .factory(require('./readers/extended-diagnostic'))

    .processor(require('./processors/processExtendedDiagnosticDocs'))

    // Where do we find the extended-diagnostic documentation files?
    .config(function(extendedDiagnosticFileReader, readFilesProcessor) {
      readFilesProcessor.fileReaders.push(extendedDiagnosticFileReader);
      readFilesProcessor.sourceFiles = readFilesProcessor.sourceFiles.concat([
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
      ]);
    })

    // Here we compute the `id`, `code`, `aliases`, `path` and `outputPath` for the
    // `extended-diagnostic` docs.
    // * The `id` is the same as the `path` (the source path with the `.md` stripped off).
    // * The `code` is the `id` without any containing paths (currently all extended diagnostics
    //   must be on the top level).
    // * The `aliases` are used for automatic code linking and search terms.
    .config(function(computeIdsProcessor, computePathsProcessor) {
      computeIdsProcessor.idTemplates.push({
        docTypes: ['extended-diagnostic'],
        getId: doc => doc.fileInfo.relativePath.replace(/\.\w*$/, ''), // Strip off the extension.
        getAliases: doc => {
          doc.code = path.basename(doc.id);
          return [doc.id, doc.code];
        },
      });

      computePathsProcessor.pathTemplates = computePathsProcessor.pathTemplates.concat([
        {
          docTypes: ['extended-diagnostic'],
          getPath: doc => doc.id,
          outputPathTemplate: '${path}.json',
        },
      ]);
    })

    // The templates that define how the `extended-diagnostic` doc-type is rendered is found in the
    // `${TEMPLATES_PATH}/extended-diagnostic/` directory.
    .config(function(templateFinder) {
      templateFinder.templateFolders.unshift(path.resolve(TEMPLATES_PATH, 'extended-diagnostic'));
    })

    // The AIO application expects content files to be provided as JSON files that it requests via
    // HTTP. So here we tell the `convertToJsonProcessor` to include docs of type
    // `extended-diagnostic` in those that it converts.
    .config(function(convertToJsonProcessor, postProcessHtml) {
      convertToJsonProcessor.docTypes.push('extended-diagnostic');
      postProcessHtml.docTypes.push('extended-diagnostic');
    });

module.exports = extendedDiagnosticsPackage;
