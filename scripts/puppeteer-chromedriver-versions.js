/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// Mapping of puppeteer releases to their default Chrome version
// derived from https://github.com/puppeteer/puppeteer/blob/master/docs/api.md.
// The puppeteer package.json file contains the compatible Chrome revision such as
// "chromium_revision": "722234" but this does not map easily to the Chrome version
// so we use this mapping here instead.
module.exports = {
  '18.0.5' : '106.0.5249.21',
  '10.2.0' : '93.0.4577.63',
};
