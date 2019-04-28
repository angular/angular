
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {FileSystem} from '../file_system/file_system';
import {EntryPoint} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileToWrite} from '../rendering/utils';
import {FileWriter} from './file_writer';

/**
 * This FileWriter overwrites the transformed file, in-place, while creating
 * a back-up of the original file with an extra `.bak` extension.
 */
export class InPlaceFileWriter implements FileWriter {
  constructor(protected fs: FileSystem) {}

  writeBundle(_entryPoint: EntryPoint, _bundle: EntryPointBundle, transformedFiles: FileToWrite[]) {
    transformedFiles.forEach(file => this.writeFileAndBackup(file));
  }

  protected writeFileAndBackup(file: FileToWrite): void {
    this.fs.ensureDir(AbsoluteFsPath.dirname(file.path));
    const backPath = AbsoluteFsPath.fromUnchecked(`${file.path}.__ivy_ngcc_bak`);
    if (this.fs.exists(backPath)) {
      throw new Error(
          `Tried to overwrite ${backPath} with an ngcc back up file, which is disallowed.`);
    }
    if (this.fs.exists(file.path)) {
      this.fs.moveFile(file.path, backPath);
    }
    this.fs.writeFile(file.path, file.contents);
  }
}
