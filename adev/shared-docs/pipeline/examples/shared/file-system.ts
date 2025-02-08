/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {existsSync} from 'fs';
import {copyFile, mkdir, readdir, rm, stat} from 'fs/promises';
import {join} from 'path';

// TODO(josephperrott): Determine if we can use the fs default version of copying directories.
// TODO(josephperrott): Find a way to not require blank renaming of certain files during copying.

/** Files which must be renamed to remove the .template suffix.  */
const knownTemplateFilesForRename = [
  // package.json.template must be used as ng_package does not allow floating package.json
  // files within the npm package contents.
  'package.json.template',
];

/**
 * Recursively copy folder and contents to the destigation, creating the destination folder
 * if necessary.
 **/
export async function copyFolder(source: string, destination: string) {
  if (!existsSync(destination)) {
    await mkdir(destination, {recursive: true});
  }

  const files = await readdir(source);

  for (const file of files) {
    // If the file/dirname starts with `TMP_` we ignore it as we use `TMP_` to start the name of
    // our temp directory. Since our temp directory is a subdirectory of the provided example,
    // we would end up copying recursively forever.
    if (file.startsWith('TMP_')) {
      continue;
    }

    const sourcePath = join(source, file);
    let destPath = join(destination, file);

    // Rename the destination file path if the file needs to be renamed.
    if (knownTemplateFilesForRename.includes(file)) {
      destPath = join(destination, file.replace(/.template$/, ''));
    }

    const stats = await stat(sourcePath);
    const isDirectory = await stats.isDirectory();

    if (isDirectory) {
      await copyFolder(sourcePath, destPath);
    } else {
      await copyFile(sourcePath, destPath);
    }
  }
}

/** Create folder at the provided path if it does not already exist. */
export async function createFolder(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, {recursive: true});
  }
}

/** Remove folder at the provided path if it exists. */
export async function removeFolder(path: string): Promise<void> {
  if (existsSync(path)) {
    await rm(path, {recursive: true});
  }
}
