/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {FileAndContent} from '../../../../../scripts/tutorials/tutorials-types';

export async function generateZip(files: FileAndContent[]): Promise<Blob> {
  const {default: JSZip} = await import('jszip');

  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content, {binary: true});
  }

  return await zip.generateAsync({type: 'blob'});
}
