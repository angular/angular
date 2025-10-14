/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {normalizePath} from './navigation.utils';
export const checkFilesInDirectory = async (dir, fs, filterFromRootPredicate, files = []) => {
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
//# sourceMappingURL=filesystem.utils.js.map
