/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { createLinkerEsbuildPlugin } from '@angular/dev-infra-private/shared-scripts/angular-linker/esbuild-plugin.mjs';

export default {
  // Note: We support `.mjs` here as this is the extension used by Angular APF packages.
  resolveExtensions: ['.mjs', '.js'],
  format: 'esm',
  plugins: [
    // Only run the linker on `fesm2020/` bundles. This should not have an effect on
    // the bundle output, but helps speeding up ESBuild when it visits other modules.
    await createLinkerEsbuildPlugin(/fesm2020/),
  ],
};
