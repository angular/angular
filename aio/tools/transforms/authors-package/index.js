/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint no-console: "off" */

function createPackage(changedFile) {
  const marketingMatch = /^aio\/content\/marketing\/(.*)/.exec(changedFile);
  if (marketingMatch) {
    console.log('Building marketing docs');
    return require('./marketing-package').createPackage();
  }

  const tutorialMatch = /^aio\/content\/tutorial\/([^.]+)\.md/.exec(changedFile);
  const tutorialExampleMatch = /^aio\/content\/examples\/(toh-[^\/]+)\//.exec(changedFile);
  if (tutorialMatch || tutorialExampleMatch) {
    const tutorialName = tutorialMatch && tutorialMatch[1] || tutorialExampleMatch[1];
    console.log('Building tutorial docs');
    return require('./tutorial-package').createPackage(tutorialName);
  }

  const guideMatch = /^aio\/content\/guide\/([^.]+)\.md/.exec(changedFile);
  const exampleMatch = /^aio\/content\/examples\/(?:cb-)?([^\/]+)\//.exec(changedFile);
  if (guideMatch || exampleMatch) {
    const guideName = guideMatch && guideMatch[1] || exampleMatch[1];
    console.log(`Building guide doc: ${guideName}.md`);
    return require('./guide-package').createPackage(guideName);
  }

  const apiExamplesMatch = /^packages\/examples\/([^\/]+)\//.exec(changedFile);
  const apiMatch = /^packages\/([^\/]+)\//.exec(changedFile);
  if (apiExamplesMatch || apiMatch) {
    const packageName = apiExamplesMatch && apiExamplesMatch[1] || apiMatch[1];
    console.log('Building API docs for', packageName);
    return require('./api-package').createPackage(packageName);
  }
}

module.exports = {
  generateDocs: function(changedFile, options = {}) {
    const {Dgeni} = require('dgeni');
    const package = createPackage(changedFile);
    if (options.silent) {
      package.config(function(log) { log.level = 'error'; });
    }
    var dgeni = new Dgeni([package]);
    const start = Date.now();
    return dgeni.generate()
      .then(
        () => console.log('Generated docs in ' + (Date.now() - start)/1000 + ' secs'),
        err => console.log('Error generating docs', err));
  }
};
