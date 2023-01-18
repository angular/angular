/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import createConfig from './esbuild-base.config.mjs';

export default {
  ...(await createConfig({enableLinker: true, optimize: false})),
  // Use the `iife` format for the test entry-point as tests should run immediately.
  // For browser tests which are wrapped in an AMD header and footer, this works as well.
  format: 'iife',
};
