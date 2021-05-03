/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const gitPackage = require('dgeni-packages/git');
const apiPackage = require('../angular-api-package');
const contentPackage = require('../angular-content-package');
const errorsPackage = require('../angular-errors-package');
const cliDocsPackage = require('../cli-docs-package');

module.exports = new Package('angular.io', [gitPackage, apiPackage, contentPackage, cliDocsPackage, errorsPackage])

  // This processor relies upon the versionInfo. See below...
  .processor(require('./processors/processNavigationMap'))
  .processor(require('./processors/createOverviewDump'))
  .processor(require('./processors/cleanGeneratedFiles'))

  // We don't include this in the angular-base package because the `versionInfo` stuff
  // accesses the file system and git, which is slow.
  .config(function(renderDocsProcessor, versionInfo) {
    // Add the version data to the renderer, for use in things like github links
    renderDocsProcessor.extraData.versionInfo = versionInfo;
  })

  .config(function(renderLinkInfo, postProcessHtml) {
    renderLinkInfo.docTypes = postProcessHtml.docTypes;
  });
