/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var fs = require('fs');
module.exports = function(licenseFile, outputFile) {
  var licenseText = fs.readFileSync(licenseFile);
  var license = '/**\n @license\n' + licenseText + '\n */\n';
  if (outputFile) {
    outputFile = licenseFile + '.wrapped';
    fs.writeFileSync(outputFile, license, 'utf8');
    return outputFile;
  } else {
    return license;
  }
};
