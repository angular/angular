/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
let zip;
let strToU8;
export async function generateZip(files) {
  if (zip === undefined || strToU8 === undefined) {
    const fflate = require('fflate');
    zip = fflate.zip;
    strToU8 = fflate.strToU8;
  }
  const filesObj = {};
  files.forEach(({path, content}) => {
    filesObj[path] = typeof content === 'string' ? strToU8(content) : content;
  });
  return new Promise((resolve, reject) => {
    zip(filesObj, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
//# sourceMappingURL=zip.utils.js.map
