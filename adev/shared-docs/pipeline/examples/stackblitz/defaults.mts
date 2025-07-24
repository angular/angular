/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const TEST_FILES_EXTENSION_SUFFIX = '.spec.ts';
export const TEST_FILES_E2E_EXTENSION_SUFFIX = '.e2e-spec.ts';
export const BUILD_BAZEL_FILENAME = 'BUILD.bazel';
export const EXAMPLE_CONFIG_FILENAME = 'example-config.json';
export const STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';

/** Default file paths to be excluded from stackblitz examples. */
export const EXCLUDE_FILES_FOR_STACKBLITZ = [
  STACKBLITZ_CONFIG_FILENAME,
  BUILD_BAZEL_FILENAME,
  EXAMPLE_CONFIG_FILENAME,
  TEST_FILES_EXTENSION_SUFFIX,
  TEST_FILES_E2E_EXTENSION_SUFFIX,
];
