/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import createConfig from './esbuild-base.config.mjs';

export default {
  ...(await createConfig({enableLinker: true, optimize: false})),
  format: 'esm',
  keepNames: true,
};
