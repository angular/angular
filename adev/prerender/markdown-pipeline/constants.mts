/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

// FOLDER NAMES
export const ASSETS_FOLDER_NAME = 'assets';
export const CONTENT_FOLDER_NAME = 'content';
export const EXAMPLES_FOLDER_NAME = 'examples';
export const TUTORIALS_FOLDER_NAME = 'tutorials';

// PATHS
export const BASE_PATH = dirname(fileURLToPath(import.meta.url));
export const ASSETS_EXAMPLES_PATH = 'assets/content/examples';
export const PROJECT_FOLDER_PATH = join(BASE_PATH, '../../src');
export const ASSETS_CONTENT_FOLDER_PATH = join(
  PROJECT_FOLDER_PATH,
  ASSETS_FOLDER_NAME,
  CONTENT_FOLDER_NAME,
);
export const CONTENT_FOLDER_PATH = join(PROJECT_FOLDER_PATH, CONTENT_FOLDER_NAME);
export const EXAMPLES_FOLDER_PATH = join(CONTENT_FOLDER_PATH, EXAMPLES_FOLDER_NAME);
export const TUTORIALS_FOLDER_PATH = join(CONTENT_FOLDER_PATH, TUTORIALS_FOLDER_NAME);

// TODO: Update the branch/sha
// URLS
export const GITHUB_CONTENT_URL = 'https://github.com/angular/angular/blob/main/adev/src/content';
export const GITHUB_EDIT_CONTENT_URL =
  'https://github.com/angular/angular/edit/main/adev/src/content';
