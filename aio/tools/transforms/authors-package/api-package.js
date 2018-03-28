/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const apiPackage = require('../angular-api-package');
const { API_SOURCE_PATH } = require('../config');

const packageMap = {
  animations: ['animations/index.ts', 'animations/browser/index.ts', 'animations/browser/testing/index.ts'],
  common: ['common/index.ts', 'common/testing/index.ts', 'common/http/index.ts', 'common/http/testing/index.ts'],
  core: ['core/index.ts', 'core/testing/index.ts'],
  elements: ['elements/index.ts'],
  forms: ['forms/index.ts'],
  http: ['http/index.ts', 'http/testing/index.ts'],
  'platform-browser': ['platform-browser/index.ts', 'platform-browser/animations/index.ts', 'platform-browser/testing/index.ts'],
  'platform-browser-dynamic': ['platform-browser-dynamic/index.ts', 'platform-browser-dynamic/testing/index.ts'],
  'platform-server': ['platform-server/index.ts', 'platform-server/testing/index.ts'],
  'platform-webworker': ['platform-webworker/index.ts'],
  'platform-webworker-dynamic': ['platform-webworker-dynamic/index.ts'],
  router: ['router/index.ts', 'router/testing/index.ts', 'router/upgrade/index.ts'],
  'service-worker': ['service-worker/index.ts'],
  upgrade: ['upgrade/index.ts', 'upgrade/static/index.ts']
};


function createPackage(packageName) {

  return new Package('author-api', [apiPackage])
    .config(function(readTypeScriptModules) {
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
    });
}


module.exports = {
  createPackage
};
