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
const contentPackage = require('../content-package');
const {CONTENTS_PATH, TEMPLATES_PATH, requireFolder} = require('../config');

const errorPackage = new Package('angular-errors', [basePackage, contentPackage]);
errorPackage.factory(require('./readers/error'))
    .processor(require('./processors/processErrorDocs'))
    .processor(require('./processors/processErrorsContainerDoc'))

    // Where do we find the error documentation files?
    .config(function(readFilesProcessor, errorFileReader) {
      readFilesProcessor.fileReaders.push(errorFileReader);
      readFilesProcessor.sourceFiles = readFilesProcessor.sourceFiles.concat([
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/errors/**/*.md',
          exclude: CONTENTS_PATH + '/errors/index.md',
          fileReader: 'errorFileReader'
        },
        {
          basePath: CONTENTS_PATH,
          include: CONTENTS_PATH + '/errors/index.md',
          fileReader: 'contentFileReader'
        },
      ]);
    })

    // Here we compute the `id`, `code`, `aliases`, `path` and `outputPath` for the `error` docs.
    // * The `id` is the same as the `path` (the source path with the `.md` stripped off).
    // * The `code` is the id without any containing paths (currently all errors must be on the top
    // level).
    // * The `aliases` are used for automatic code linking and search terms.
    .config(function(computeIdsProcessor, computePathsProcessor) {
      computeIdsProcessor.idTemplates.push({
        docTypes: ['error'],
        getId: function(doc) {
          return doc.fileInfo
              .relativePath
              // strip off the extension
              .replace(/\.\w*$/, '');
        },
        getAliases: function(doc) {
          doc.code = path.basename(doc.id);
          return [doc.id, doc.code];
        }
      });

      computePathsProcessor.pathTemplates = computePathsProcessor.pathTemplates.concat([
        {
          docTypes: ['error'],
          getPath: (doc) => doc.id,
          outputPathTemplate: '${path}.json',
        },
      ]);
    })

    // Configure jsdoc-style tag parsing
    .config(function(parseTagsProcessor, getInjectables) {
      // Load up all the tag definitions in the tag-defs folder
      parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(
          getInjectables(requireFolder(__dirname, './tag-defs')));
    })

    // The templates that define how the `error` and `error-container` doc-types are rendered are
    // found in the `TEMPLATES_PATH/error` directory.
    .config(function(templateFinder) {
      templateFinder.templateFolders.unshift(path.resolve(TEMPLATES_PATH, 'error'));
    })

    // The AIO application expects content files to be provided as JSON files that it requests via
    // HTTP. So here we tell the `convertToJsonProcessor` to include docs of type `error` in those
    // that it converts.
    .config(function(convertToJsonProcessor, postProcessHtml) {
      convertToJsonProcessor.docTypes.push('error');
      postProcessHtml.docTypes.push('error');
    });

module.exports = errorPackage;