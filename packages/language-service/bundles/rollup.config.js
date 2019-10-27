import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

// Parse the stamp file produced by Bazel from the version control system
let version = 'v0.0.0-PLACEHOLDER';
if (bazel_stamp_file) {
  const versionTag = require('fs')
                         .readFileSync(bazel_stamp_file, {encoding: 'utf-8'})
                         .split('\n')
                         .find(s => s.startsWith('BUILD_SCM_VERSION'));
  // Don't assume BUILD_SCM_VERSION exists
  if (versionTag) {
    version = 'v' + versionTag.split(' ')[1].trim();
  }
}

let banner = `/**
* @license Angular ${version}
* (c) 2010-2019 Google LLC. https://angular.io/
* License: MIT
*/

var $reflect = {defineMetadata: function() {}, getOwnMetadata: function() {}};
var Reflect = (typeof global !== 'undefined' ? global : {})['Reflect'] || {};
Object.keys($reflect).forEach(function(key) { Reflect[key] = Reflect[key] || $reflect[key]; });
var $deferred, $resolved, $provided;
function $getModule(name) {
 if (name === 'typescript/lib/tsserverlibrary') return $provided['typescript'] || require(name);
 return $provided[name] || require(name);
}
function define(modules, cb) { $deferred = { modules: modules, cb: cb }; }
module.exports = function(provided) {
 if ($resolved) return $resolved;
 var result = {};
 $provided = Object.assign({'reflect-metadata': $reflect}, provided || {}, { exports: result });
 $deferred.cb.apply(this, $deferred.modules.map($getModule));
 $resolved = result;
 return result;
}
`;

module.exports = {
  external: [
    'fs',
    'path',
    'os',
    'typescript',
    'typescript/lib/tsserverlibrary',
  ],
  output: {
    banner,
    globals: {
      'fs': 'fs',
      'path': 'path',
      'os': 'os',
      'typescript': 'ts',
      'typescript/lib/tsserverlibrary': 'tss',
    },
  },
  plugins: [
    nodeResolve(),
    commonjs({ignoreGlobals: true}),
  ],
};
