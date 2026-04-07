/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalizePath} from './navigation.utils';
import {FileAndContent} from '../interfaces';

interface DirEnt<T> {
  name: T;
  isFile(): boolean;
  isDirectory(): boolean;
}

interface FileSystemAPI {
  readdir(
    path: string,
    options: {
      encoding?:
        | 'ascii'
        | 'utf8'
        | 'utf-8'
        | 'utf16le'
        | 'ucs2'
        | 'ucs-2'
        | 'base64'
        | 'base64url'
        | 'latin1'
        | 'binary'
        | 'hex'
        | null;
      withFileTypes: true;
    },
  ): Promise<DirEnt<string>[]>;
  readFile(path: string, encoding?: string): Promise<string>;
}

export const checkFilesInDirectory = async (
  dir: string,
  fs: FileSystemAPI,
  filterFromRootPredicate: ((path: string) => boolean) | null,
  files: FileAndContent[] = [],
) => {
  const entries = (await fs.readdir(dir, {withFileTypes: true})) ?? [];

  for (const entry of entries) {
    const fullPath = normalizePath(`${dir}/${entry.name}`);

    if (filterFromRootPredicate && !filterFromRootPredicate?.(entry.name)) {
      continue;
    }

    if (entry.isFile()) {
      const content = await fs.readFile(fullPath, 'utf-8');
      files.push({content, path: fullPath});
    } else if (entry.isDirectory()) {
      await checkFilesInDirectory(fullPath, fs, null, files);
    }
  }

  return files;
};
