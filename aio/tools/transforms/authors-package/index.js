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

  const tutorialMatch = /^aio\/content\/tutorial\/|^aio\/content\/examples\/toh-\d/.exec(changedFile);
  if (tutorialMatch) {
    console.log('Building tutorial docs');
    return require('./tutorial-package').createPackage();
  }

  const guideMatch = /^aio\/content\/guide\/([^\.]+)\.md/.exec(changedFile);
  const exampleMatch = /^aio\/content\/examples\/(?:cb-)?([^\/]+)\//.exec(changedFile);
  if (guideMatch || exampleMatch) {
    const exampleName = guideMatch && guideMatch[1] || exampleMatch[1];
    console.log(`Building guide doc: ${exampleName}.md`);
    return require('./guide-package').createPackage(exampleName);
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
  generateDocs: function(changedFile) {
    const {Dgeni} = require('dgeni');
    var dgeni = new Dgeni([createPackage(changedFile)]);
    const start = Date.now();
    return dgeni.generate()
      .then(
        () => console.log('Generated docs in ' + (Date.now() - start)/1000 + ' secs'),
        err => console.log('Error generating docs', err));
  }
};
