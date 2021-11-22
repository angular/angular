/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note: This needs to be a workspace manifest path as this ESBuild config
// is generated and can end up in arbitrary Bazel packages.
import {createLinkerEsbuildPlugin} from 'angular_devtools/tools/angular/create_linker_esbuild_plugin.mjs';

// Based on the Bazel action and its substitutions, we run the linker for all inputs.
const plugins = TMPL_RUN_LINKER
  ? [await createLinkerEsbuildPlugin(/.*/, /* ensureNoPartialDeclaration */ true)]
  : [];

export default {
  // `tslib` sets the `module` condition to resolve to ESM.
  conditions: ['es2020', 'es2015', 'module'],
  // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
  mainFields: ['es2020', 'es2015', 'module', 'main'],
  // Use the `iife` format for the test entry-point as tests should run immediately.
  // For browser tests which are wrapped in an AMD header and footer, this works as well.
  format: 'iife',
  plugins,
};
