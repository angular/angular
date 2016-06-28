/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var fs = require('fs');

export function reportAndCalculateFileSizeDifference(
    fileName: string, filePath: string, lastValidFileSize: number) {
  var stats = fs.statSync(filePath);
  var size = stats['size'];
  var diff = size - lastValidFileSize;
  var percentage = Math.abs(diff) / lastValidFileSize;
  console.log(
      `\n\nLOG: ${fileName} (${filePath}) file size has changed by: ${diff}b (${Math.round(percentage * 1000) / 10}%) at a value of ${size}b from ${lastValidFileSize}b\n\n`);
  return percentage;
}
