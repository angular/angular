/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import * as path from 'path';

var m = /^\@angular\/((\w|\-)+)(\/(\w|\d|\/|\-)+)?$/;
var location = normalize('../../dist/packages-dist') + '/';
var rxjsLocation = normalize('../../node_modules/rxjs');
var tslibLocation = normalize('../../node_modules/tslib');
var esm = 'esm/';

var locations = {'compiler-cli': normalize('../../dist/packages') + '/'};

var esm_suffixes = {};

function normalize(fileName) {
  return path.resolve(__dirname, fileName);
}

function resolve(id, from) {
  // console.log('Resolve id:', id, 'from', from)
  var match = m.exec(id);
  if (match) {
    var packageName = match[1];
    var esm_suffix = esm_suffixes[packageName] || '';
    var loc = locations[packageName] || location;
    var r = loc !== location && (loc + esm_suffix + packageName + (match[3] || '/index') + '.js') ||
        loc + packageName + '/esm5/' + packageName + '.js';
    return r;
  }
  if (id && id.startsWith('rxjs/')) {
    const resolved = `${rxjsLocation}${id.replace('rxjs', '')}.js`;
    return resolved;
  }
  if (id == 'tslib') {
    return tslibLocation + '/tslib.es6.js';
  }
}

var banner = `
var $reflect = {defineMetadata: function() {}, getOwnMetadata: function(){}};
((typeof global !== 'undefined' && global)||{})['Reflect'] = $reflect;
var $deferred, $resolved, $provided;
function $getModule(name) { return $provided[name] || require(name); }
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

export default {
  entry: '../../dist/packages-dist/language-service/esm5/language-service.js',
  dest: '../../dist/packages-dist/language-service/bundles/language-service.umd.js',
  format: 'amd',
  amd: {
      // Don't name this module, causes
      // Loading the language service caused the following exception: TypeError:
      // $deferred.modules.map is not a function
      // id: '@angular/language-service'
  },
  moduleName: 'ng.language_service',
  exports: 'named',
  external: [
    'fs',
    'path',
    'typescript',
  ],
  globals: {
    'typescript': 'ts',
    'path': 'path',
    'fs': 'fs',
  },
  banner: banner,
  plugins: [{resolveId: resolve}, commonjs(), sourcemaps()]
};
