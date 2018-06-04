/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const commonjs = require('rollup-plugin-commonjs');
const sourcemaps = require('rollup-plugin-sourcemaps');
const path = require('path');
const fs = require('fs');

var m = /^\@angular\/((\w|\-)+)(\/(\w|\d|\/|\-)+)?$/;
var location = normalize('../../dist/packages-dist') + '/';
var rxjsLocation = normalize('../../node_modules/rxjs');
var tslibLocation = normalize('../../node_modules/tslib');

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
        loc + packageName + '/fesm5/' + packageName + '.js';
    return r;
  }
  if (id && (id == 'rxjs' || id.startsWith('rxjs/'))) {
    return `${rxjsLocation}${id.replace('rxjs', '')}/index.js`;
  }
  if (id == 'tslib') {
    return tslibLocation + '/tslib.es6.js';
  }
}

var banner = fs.readFileSync('bundles/banner.js.txt', 'utf8');

module.exports = {
  entry: '../../dist/packages-dist/language-service/fesm5/language-service.js',
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
