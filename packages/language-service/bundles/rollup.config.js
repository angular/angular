/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonJs = require('@rollup/plugin-commonjs');
const {pathPlugin} = require('../../../tools/bazel/rollup/path-plugin.cjs');

// This is a custom AMD file header that patches the AMD `define` call generated
// by rollup so that the bundle exposes a CJS-exported function which takes an
// instance of the TypeScript module. More details in `/language-service/index.ts`.
const amdFileHeader = `
/**
 * @license Angular v0.0.0-PLACEHOLDER
 * Copyright Google LLC All Rights Reserved.
 * License: MIT
 */

let $deferred;
function define(modules, callback) {
  $deferred = {modules, callback};
}
module.exports = function(provided) {
  const ts = provided['typescript'];
  if (!ts) {
    throw new Error('Caller does not provide typescript module');
  }
  const results = {};
  const resolvedModules = $deferred.modules.map(m => {
    if (m === 'exports') {
      return results;
    }
    if (m === 'typescript') {
      return ts;
    }
    return require(m);
  });
  $deferred.callback(...resolvedModules);
  return results;
};
`;

const external = ['os', 'fs', 'path', 'typescript'];

const config = {
  external,
  plugins: [
    pathPlugin({
      tsconfigPath: 'packages/language-service/tsconfig.json',
    }),
    nodeResolve({preferBuiltins: true}),
    commonJs(),
  ],
  output: {
    banner: amdFileHeader,
  },
};

module.exports = config;
