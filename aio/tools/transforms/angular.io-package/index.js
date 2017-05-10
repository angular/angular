/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const gitPackage = require('dgeni-packages/git');
const apiPackage = require('../angular-api-package');
const contentPackage = require('../angular-content-package');
const { extname, resolve } = require('canonical-path');
const { existsSync } = require('fs');
const { SRC_PATH } = require('../config');

module.exports = new Package('angular.io', [gitPackage, apiPackage, contentPackage])

  // This processor relies upon the versionInfo. See below...
  .processor(require('./processors/processNavigationMap'))

  // We don't include this in the angular-base package because the `versionInfo` stuff
  // accesses the file system and git, which is slow.
  .config(function(renderDocsProcessor, versionInfo) {
    // Add the version data to the renderer, for use in things like github links
    renderDocsProcessor.extraData.versionInfo = versionInfo;
  })

  .config(function(checkAnchorLinksProcessor, linkInlineTagDef) {

    // Fail the processing if there is an invalid link
    linkInlineTagDef.failOnBadLink = true;

    checkAnchorLinksProcessor.$enabled = true;
    // since we encode the HTML to JSON we need to ensure that this processor runs before that encoding happens.
    checkAnchorLinksProcessor.$runBefore = ['convertToJsonProcessor'];
    checkAnchorLinksProcessor.$runAfter = ['fixInternalDocumentLinks'];
    // We only want to check docs that are going to be output as JSON docs.
    checkAnchorLinksProcessor.checkDoc = (doc) => doc.path && doc.outputPath && extname(doc.outputPath) === '.json';
    // Since we have a `base[href="/"]` arrangement all links are relative to that and not relative to the source document's path
    checkAnchorLinksProcessor.base = '/';
    // Ignore links to local assets
    // (This is not optimal in terms of performance without making changes to dgeni-packages there is no other way.
    //  That being said do this only add 500ms onto the ~30sec doc-gen run - so not a huge issue)
    checkAnchorLinksProcessor.ignoredLinks.push({
      test(url) {
        return (existsSync(resolve(SRC_PATH, url)));
      }
    });
    checkAnchorLinksProcessor.pathVariants = ['', '/', '.html', '/index.html', '#top-of-page'];
  });
