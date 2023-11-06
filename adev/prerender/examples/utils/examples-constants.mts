/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const BASE = dirname(fileURLToPath(import.meta.url));

// Directory paths
export const ASSETS_EXAMPLE_PATH = join(
  BASE,
  '../../../src/assets/content/examples',
);
export const EXAMPLES_PATH = join(BASE, '../../../src/content/examples');
export const STACKBLITZ_TEMPLATE_PATH = join(
  BASE,
  '../../../src/content/stackblitz-template',
);

export const TEMPORARY_EXAMPLES_PATH = join(fileURLToPath(import.meta.url), '../../../../TEMP');

// Extensions
export const TEST_FILES_EXTENSION_SUFFIX = '.spec.ts';
export const TEST_FILES_E2E_EXTENSION_SUFFIX = '.e2e-spec.ts';

// Filename
// TODO: BUILD.bazel and example-config will be deprecated when migration to standalone examples will be done.
export const BUILD_BAZEL_FILENAME = 'BUILD.bazel';
export const EXAMPLE_CONFIG_FILENAME = 'example-config.json';
export const STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';

// Copyright
const PAD = '\n\n';
const COPYRIGHT =
  '@license\n' +
  'Copyright Google LLC All Rights Reserved.\n' +
  '\n' +
  'Use of this source code is governed by an MIT-style license that can be\n' +
  'found in the LICENSE file at https://angular.dev/license\n';
export const CSS_TS_COPYRIGHT = `/*\n${COPYRIGHT}\n*/${PAD}`;
export const HTML_COPYRIGHT = `<!-- \n${COPYRIGHT}\n-->${PAD}`;

// Exclude
export const EXCLUDE_FILES_FOR_STACKBLITZ = [
  STACKBLITZ_CONFIG_FILENAME,
  BUILD_BAZEL_FILENAME,
  EXAMPLE_CONFIG_FILENAME,
  TEST_FILES_EXTENSION_SUFFIX,
  TEST_FILES_E2E_EXTENSION_SUFFIX,
];
