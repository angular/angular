/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');
const fs = require('fs');

module.exports = {
  extract: gulp => done => {
    if (!fs.existsSync(path.join(__dirname, 'cldr/cldr-data'))) {
      throw new Error(`You must run "gulp cldr:download" before you can extract the data`);
    }
    const extract = require('./cldr/extract');
    return extract(gulp, done);
  },

  download: gulp => done => {
    const cldrDownloader = require('cldr-data-downloader');
    const cldrDataFolder = path.join(__dirname, 'cldr/cldr-data');
    if (!fs.existsSync(cldrDataFolder)) {
      fs.mkdirSync(cldrDataFolder);
    }
    cldrDownloader(path.join(__dirname, 'cldr/cldr-urls.json'), cldrDataFolder, done);
  }
};
