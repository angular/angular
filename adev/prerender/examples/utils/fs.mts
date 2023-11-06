/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Dirent, existsSync, readdirSync} from 'fs';
import {copyFile, mkdir, readFile, readdir, rm, stat} from 'fs/promises';
import {join, relative} from 'path';

export async function copyFolder(source: string, destination: string) {
  if (!existsSync(destination)) {
    await mkdir(destination, {recursive: true});
  }

  const files = await readdir(source);

  for (const file of files) {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);

    const stats = await stat(sourcePath);
    const isDirectory = await stats.isDirectory();

    if (isDirectory) {
      await copyFolder(sourcePath, destPath);
    } else {
      await copyFile(sourcePath, destPath);
    }
  }
}

/** Recursively search the provided directory for all files which satisfy predicate and asynchronously load them. */
export function retrieveFiles(
  baseDir: string,
  predicate?: (file: Dirent) => boolean,
): Promise<{path: string; content: string}[]> {
  const filesWithContent: Promise<{path: string; content: string}>[] = [];

  const checkFilesInDirectory = (dir: string) => {
    const files = readdirSync(dir, {withFileTypes: true});
    for (const file of files) {
      const fullPathToFile = join(dir, file.name);

      if (file.isFile() && (predicate ? predicate(file) : true)) {
        filesWithContent.push(
          readFile(fullPathToFile, {encoding: 'utf-8'}).then((fileContent) => {
            return {
              path: relative(baseDir, fullPathToFile),
              content: fileContent,
            };
          }),
        );
      } else if (file.isDirectory()) {
        checkFilesInDirectory(fullPathToFile);
      }
    }
  };

  checkFilesInDirectory(baseDir);

  return Promise.all(filesWithContent);
}

export async function createFolder(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, {recursive: true});
  }
}

export async function removeFolder(path: string): Promise<void> {
  if (existsSync(path)) {
    await rm(path, {recursive: true});
  }
}
