/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createEsbuildAngularOptimizePlugin} from '@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs';
import {GLOBAL_DEFS_FOR_TERSER_WITH_AOT} from '@angular/compiler-cli/private/tooling';

/** Converts an object to a string dictionary. */
function convertObjectToStringDictionary(value) {
  return Object.entries(value).reduce((result, [propName, value]) => {
    result[propName] = String(value);
    return result;
  }, {});
}

export default async function createConfig({enableLinker, optimize}) {
  return {
    resolveExtensions: ['.mjs', '.js'],
    // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
    mainFields: ['es2020', 'es2015', 'module', 'main'],
    // `tslib` sets the `module` condition to resolve to ESM.
    conditions: ['es2020', 'es2015', 'module'],
    supported: {
      // Downlevel native `async/await` so that ZoneJS can intercept it.
      'async-await': false,
    },
    define: optimize ? convertObjectToStringDictionary(GLOBAL_DEFS_FOR_TERSER_WITH_AOT) : undefined,
    plugins: [
      await createEsbuildAngularOptimizePlugin({
        optimize: {
          isSideEffectFree: null,
        },
        downlevelAsyncGeneratorsIfPresent: true,
        enableLinker: enableLinker
          ? {
              ensureNoPartialDeclaration: false,
              // Only run the linker on fesm2020 and fesm2022 bundles. This should not have an effect on
              // the bundle output, but helps speeding up ESBuild when it visits other modules.
              filterPaths: /fesm2020|fesm2022/,
              linkerOptions: {
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
                unknownDeclarationVersionHandling: 'ignore',
              },
            }
          : undefined,
      }),
    ],
  };
}
