/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;

const basePackage = require('../angular-base-package');
const typeScriptPackage = require('dgeni-packages/typescript');
const { API_SOURCE_PATH, requireFolder } = require('../config');

module.exports = new Package('angular-api', [basePackage, typeScriptPackage])

  // Register the processors
  .processor(require('./processors/convertPrivateClassesToInterfaces'))
  .processor(require('./processors/generateApiListDoc'))
  .processor(require('./processors/addNotYetDocumentedProperty'))
  .processor(require('./processors/mergeDecoratorDocs'))
  .processor(require('./processors/extractDecoratedClasses'))
  .processor(require('./processors/matchUpDirectiveDecorators'))
  .processor(require('./processors/filterMemberDocs'))
  .processor(require('./processors/markBarredODocsAsPrivate'))
  .processor(require('./processors/filterPrivateDocs'))
  .processor(require('./processors/filterIgnoredDocs'))

  // Where do we get the source files?
  .config(function(readTypeScriptModules, readFilesProcessor, collectExamples) {

    // API files are typescript
    readTypeScriptModules.basePath = API_SOURCE_PATH;
    readTypeScriptModules.ignoreExportsMatching = [/^[_ɵ]/];
    readTypeScriptModules.hidePrivateMembers = true;
    readTypeScriptModules.sourceFiles = [
      'common/index.ts',
      'common/testing/index.ts',
      'core/index.ts',
      'core/testing/index.ts',
      'forms/index.ts',
      'http/index.ts',
      'http/testing/index.ts',
      'platform-browser/index.ts',
      'platform-browser/testing/index.ts',
      'platform-browser-dynamic/index.ts',
      'platform-browser-dynamic/testing/index.ts',
      'platform-server/index.ts',
      'platform-server/testing/index.ts',
      'platform-webworker/index.ts',
      'platform-webworker-dynamic/index.ts',
      'router/index.ts',
      'router/testing/index.ts',
      'upgrade/index.ts',
      'upgrade/static.ts',
    ];

    // API Examples
    readFilesProcessor.sourceFiles = [
      {
        basePath: API_SOURCE_PATH,
        include: API_SOURCE_PATH + '/examples/**/*',
        fileReader: 'exampleFileReader'
      }
    ];
    collectExamples.exampleFolders.push('examples');
  })

  // Ignore certain problematic files
  .config(function(filterIgnoredDocs) {
    filterIgnoredDocs.ignore = [
      /\/VERSION$/  // Ignore the `VERSION` const, since it would be written to the same file as the `Version` class
    ];
  })

  // Configure jsdoc-style tag parsing
  .config(function(parseTagsProcessor, getInjectables) {
    // Load up all the tag definitions in the tag-defs folder
    parseTagsProcessor.tagDefinitions =
        parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder(__dirname, './tag-defs')));

    // We actually don't want to parse param docs in this package as we are getting the data out using TS
    // TODO: rewire the param docs to the params extracted from TS
    parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
      if (tagDef.name === 'param') {
        tagDef.docProperty = 'paramData';
        tagDef.transforms = [];
      }
    });
  })


  .config(function(computePathsProcessor, EXPORT_DOC_TYPES, generateApiListDoc) {

    const API_SEGMENT = 'api';

    generateApiListDoc.outputFolder = API_SEGMENT;

    computePathsProcessor.pathTemplates.push({
      docTypes: ['module'],
      getPath: function computeModulePath(doc) {
        doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
        return doc.moduleFolder;
      },
      outputPathTemplate: '${moduleFolder}.json'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
      pathTemplate: '${moduleDoc.moduleFolder}/${name}',
      outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
    });
  })

  .config(function(convertToJsonProcessor, EXPORT_DOC_TYPES) {
    const DOCS_TO_CONVERT = EXPORT_DOC_TYPES.concat([
      'decorator', 'directive', 'pipe', 'module'
    ]);
    convertToJsonProcessor.docTypes = convertToJsonProcessor.docTypes.concat(DOCS_TO_CONVERT);
  });
