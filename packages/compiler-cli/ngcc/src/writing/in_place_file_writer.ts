
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname} from 'canonical-path';
import {existsSync, writeFileSync} from 'fs';
import {mkdir, mv} from 'shelljs';

import {EntryPoint} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileInfo} from '../rendering/renderer';

import {FileWriter} from './file_writer';

/**
 * This FileWriter overwrites the transformed file, in-place, while creating
 * a back-up of the original file with an extra `.bak` extension.
 */
export class InPlaceFileWriter implements FileWriter {
  writeBundle(_entryPoint: EntryPoint, _bundle: EntryPointBundle, transformedFiles: FileInfo[]) {
    transformedFiles.forEach(file => this.writeFileAndBackup(file));
  }
  protected writeFileAndBackup(file: FileInfo): void {
    mkdir('-p', dirname(file.path));
    const backPath = file.path + '.__ivy_ngcc_bak';
    if (existsSync(backPath)) {
      throw new Error(
          `Tried to overwrite ${backPath} with an ngcc back up file, which is disallowed.`);
    }
    if (existsSync(file.path)) {
      mv(file.path, backPath);
    }
    writeFileSync(file.path, file.contents, 'utf8');
  }
}
