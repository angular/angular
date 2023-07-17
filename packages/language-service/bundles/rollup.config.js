/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


const {nodeResolve} = require('@rollup/plugin-node-resolve');

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
    if (m === 'typescript' || m === 'typescript/lib/tsserverlibrary') {
      return ts;
    }
    return require(m);
  });
  $deferred.callback(...resolvedModules);
  return results;
};
`;

const external = [
  'os',
  'fs',
  'path',
  'typescript',
  'typescript/lib/tsserverlibrary',
];

module.exports = {
  external,
  plugins: [nodeResolve({preferBuiltins: true})],
  output: {
    banner: amdFileHeader,
  }
};
