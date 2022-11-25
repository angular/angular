/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;
const basePackage = require('../angular-base-package');

/**
 * A base package used by all the authoring packages in this folder.
 *
 * This package turns off lots of the potentially fatal checks to allow
 * doc-gen to complete when authors are using the `docs-watch` jobs.
 */
const baseAuthoringPackage = new Package('base-authoring', [basePackage]);
baseAuthoringPackage
    .config(function(checkAnchorLinksProcessor, checkForUnusedExampleRegions) {
      // These are disabled here to prevent false negatives for the `docs-watch` task.
      checkAnchorLinksProcessor.$enabled = false;
      checkForUnusedExampleRegions.$enabled = false;
    })

    .config(function(linkInlineTagDef) {
      // Do not fail the processing if there is an invalid link
      linkInlineTagDef.failOnBadLink = false;
    })

    .config(function(renderExamples) {
      // Do not fail the processing if there is a broken example
      renderExamples.ignoreBrokenExamples = true;
    });

module.exports = baseAuthoringPackage;
