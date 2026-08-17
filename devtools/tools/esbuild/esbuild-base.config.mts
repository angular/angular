/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// @ts-ignore
import {createEsbuildAngularOptimizePlugin} from '../angular-optimization/esbuild-plugin.mjs';
import {GLOBAL_DEFS_FOR_TERSER_WITH_AOT} from '@angular/compiler-cli/private/tooling';

/** Converts an object to a string dictionary. */
function convertObjectToStringDictionary(value: {[key: string]: any}) {
  return Object.entries(value).reduce(
    (result, [propName, value]) => {
      result[propName] = String(value);
      return result;
    },
    {} as {[key: string]: string},
  );
}

export default async function createConfig({
  enableLinker,
  optimize,
}: {
  enableLinker: boolean;
  optimize: boolean;
}) {
  return {
    resolveExtensions: ['.mjs', '.js'],
    // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
    mainFields: ['es2020', 'es2015', 'module', 'main'],
    // `tslib` sets the `module` condition to resolve to ESM.
    conditions: ['es2020', 'es2015', 'module'],
    define: optimize ? convertObjectToStringDictionary(GLOBAL_DEFS_FOR_TERSER_WITH_AOT) : undefined,
    plugins: [
      createEsbuildAngularOptimizePlugin({
        optimize: {
          isSideEffectFree: undefined,
        },
        enableLinker,
      }),
    ],
  };
}
