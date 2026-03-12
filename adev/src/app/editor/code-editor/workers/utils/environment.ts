/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VirtualTypeScriptEnvironment} from '@typescript/vfs';

// Note: use a comment in empty files to avoid error in vfs
// See: https://github.com/microsoft/TypeScript-Website/issues/2713
export const EMPTY_FILE_CONTENT = '// empty file';

export function updateOrCreateFile(
  env: VirtualTypeScriptEnvironment,
  file: string,
  content: string,
) {
  if (fileExists(env, file)) {
    updateFile(env, file, content);
  } else {
    createFile(env, file, content);
  }
}

export function updateFile(env: VirtualTypeScriptEnvironment, file: string, content: string) {
  env.updateFile(normalizeFileName(file), normalizeFileContent(content));
}

export function createFile(env: VirtualTypeScriptEnvironment, file: string, content: string) {
  env.createFile(normalizeFileName(file), normalizeFileContent(content));
}

export function fileExists(env: VirtualTypeScriptEnvironment, fileName: string) {
  return env.sys.fileExists(normalizeFileName(fileName));
}

export function normalizeFileContent(content: string) {
  return content || EMPTY_FILE_CONTENT;
}

export function normalizeFileName(filename: string) {
  return filename.startsWith('/') ? filename : `/${filename}`;
}
