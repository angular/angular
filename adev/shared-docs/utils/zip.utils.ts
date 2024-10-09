/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileAndContent} from '../interfaces';

// TODO(josephperrott): Determine how we can load the fflate package dynamically again.
import {zip, strToU8} from 'fflate';

export async function generateZip(files: FileAndContent[]): Promise<Uint8Array> {
  const filesObj: Record<string, Uint8Array> = {};
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
