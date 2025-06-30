/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type fflate from 'fflate';

import {FileAndContent} from '../interfaces';

let zip: typeof fflate.zip;
let strToU8: typeof fflate.strToU8;

export async function generateZip(files: FileAndContent[]): Promise<Uint8Array> {
  if (zip === undefined || strToU8 === undefined) {
    const fflate = require('fflate');
    zip = fflate.zip;
    strToU8 = fflate.strToU8;
  }
  const filesObj: Record<string, Uint8Array> = {};
  files.forEach(({path, content}) => {
    filesObj[path] = typeof content === 'string' ? strToU8(content) : content;
  });

  return new Promise((resolve, reject) => {
    zip(filesObj, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
