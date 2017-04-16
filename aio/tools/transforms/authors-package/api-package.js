/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const { basePackage, API_SOURCE_PATH } = require('./base-package');
const packageMap = {
  common: ['common/index.ts', 'common/testing/index.ts'],
  core: ['core/index.ts', 'core/testing/index.ts'],
  forms: ['forms/index.ts'],
  http: ['http/index.ts', 'http/testing/index.ts'],
  'platform-browser': ['platform-browser/index.ts', 'platform-browser/testing/index.ts'],
  'platform-browser-dynamic': ['platform-browser-dynamic/index.ts', 'platform-browser-dynamic/testing/index.ts'],
  'platform-server': ['platform-server/index.ts', 'platform-server/testing/index.ts'],
  'platform-webworker': ['platform-webworker/index.ts'],
  'platform-webworker-dynamic': 'platform-webworker-dynamic/index.ts',
  router: ['router/index.ts', 'router/testing/index.ts'],
  upgrade: ['upgrade/index.ts', 'upgrade/static.ts']
};
function createPackage(packageName) {

  return new Package('author-api', [require('dgeni-packages/typescript'), basePackage])
    .processor(require('../angular.io-package/processors/convertPrivateClassesToInterfaces'))
    .processor(require('../angular.io-package/processors/mergeDecoratorDocs'))
    .processor(require('../angular.io-package/processors/extractDecoratedClasses'))
    .processor(require('../angular.io-package/processors/matchUpDirectiveDecorators'))
    .processor(require('../angular.io-package/processors/filterMemberDocs'))
    .processor(require('../angular.io-package/processors/markBarredODocsAsPrivate'))
    .processor(require('../angular.io-package/processors/filterPrivateDocs'))
    .processor(require('../angular.io-package/processors/filterIgnoredDocs'))
    .config(function(readTypeScriptModules) {
      // API files are typescript
      readTypeScriptModules.basePath = API_SOURCE_PATH;
      readTypeScriptModules.ignoreExportsMatching = [/^_/];
      readTypeScriptModules.hidePrivateMembers = true;
      readTypeScriptModules.sourceFiles = packageMap[packageName];
    })
    .config(function(readFilesProcessor) {
      readFilesProcessor.sourceFiles = [
        {
          basePath: API_SOURCE_PATH,
          include: `${API_SOURCE_PATH}/examples/${packageName}/**/*`,
          fileReader: 'exampleFileReader'
        }
      ];
    })
    .config(function(
        computeIdsProcessor, computePathsProcessor, EXPORT_DOC_TYPES) {

      const API_SEGMENT = 'api';

      // Replace any path templates inherited from other packages
      // (we want full and transparent control)
      computePathsProcessor.pathTemplates = [
        {
          docTypes: ['module'],
          getPath: function computeModulePath(doc) {
            doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
            return doc.moduleFolder;
          },
          outputPathTemplate: '${moduleFolder}.json'
        },
        {
          docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
          pathTemplate: '${moduleDoc.moduleFolder}/${name}',
          outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
        },
        {docTypes: ['example-region'], getOutputPath: function() {}},
        {
          docTypes: ['content'],
          getPath: (doc) => `${doc.id.replace(/\/index$/, '')}`,
          outputPathTemplate: '${path}.json'
        },
        {docTypes: ['navigation-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'},
        {docTypes: ['contributors-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'}
      ];
    })

    .config(function(convertToJsonProcessor, EXPORT_DOC_TYPES) {
      convertToJsonProcessor.docTypes = EXPORT_DOC_TYPES.concat([
        'content', 'decorator', 'directive', 'pipe', 'module'
      ]);
    });
}


module.exports = {
  createPackage
};
