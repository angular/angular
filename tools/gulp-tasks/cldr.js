/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    if (fs.existsSync(cldrDataFolder)) {
      fs.rmdirSync(cldrDataFolder, {recursive: true});
    } else {
      fs.mkdirSync(cldrDataFolder);
    }
    cldrDownloader(path.join(__dirname, 'cldr/cldr-urls.json'), cldrDataFolder, {}, done);
  },

  closure: gulp => done => {
    const {RELATIVE_I18N_DATA_FOLDER} = require('./cldr/extract');
    // tslint:disable-next-line:no-console
    console.log(RELATIVE_I18N_DATA_FOLDER, fs.existsSync(RELATIVE_I18N_DATA_FOLDER));
    if (!fs.existsSync(RELATIVE_I18N_DATA_FOLDER)) {
      throw new Error(
          `You must run "gulp cldr:extract" before you can create the closure-locale.ts file`);
    }
    const localeAll = require('./cldr/closure');
    return localeAll(gulp, done);
  },
};
