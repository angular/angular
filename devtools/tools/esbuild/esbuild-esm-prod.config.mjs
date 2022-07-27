/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { createLinkerEsbuildPlugin } from '@angular/build-tooling/shared-scripts/angular-linker/esbuild-plugin.mjs';
import { createEsbuildAngularOptimizePlugin } from '@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs';
import { GLOBAL_DEFS_FOR_TERSER_WITH_AOT } from '@angular/compiler-cli/private/tooling.js';
import baseEsbuildConfig from './esbuild-base.config.mjs';

export default {
  ...baseEsbuildConfig,
  format: 'esm',
  plugins: [
    // Only run the linker on `fesm2020/` bundles. This should not have an effect on
    // the bundle output, but helps speeding up ESBuild when it visits other modules.
    await createLinkerEsbuildPlugin(
      /fesm2020/,
      /* ensureNoPartialDeclaration */ false,

      // DevTools relies on angular framework packages that are consumed,
      // locally via bazel. These packages have a version of 0.0.0-PLACEHOLDER.
      // DevTools also relies on Angular CDK and Material packages that are consumed via npm.
      // Because of this, we set unknownDeclarationVersionHandling to ignore so that we bypass
      // selecting a linker for our CDK and Material dependencies based on our local framework
      // version (0.0.0-PLACEHOLDER).
      // Instead this option defaults to the latest linker version, which should
      // be correct, except for the small time interval where we rollout a new
      // declaration version and target a material release that hasn't been compiled
      // with that version yet.
      { unknownDeclarationVersionHandling: 'ignore' }
    ),
    await createEsbuildAngularOptimizePlugin()
  ],
  define: convertObjectToStringDictionary(GLOBAL_DEFS_FOR_TERSER_WITH_AOT),
};

/** Converts an object to a string dictionary. */
function convertObjectToStringDictionary(value) {
  return Object.entries(value).reduce((result, [propName, value]) => {
    result[propName] = String(value);
    return result;
  }, {});
}
