/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import commonjs from 'rollup-plugin-commonjs';
import * as path from 'path';

import 'reflect-metadata';

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
        loc + packageName + '/@angular/' + packageName + '.es5.js';
    // console.log('** ANGULAR MAPPED **: ', r);
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

// hack to get around issues with default exports
var banner = `ts['default'] = ts['default'] || ts; fs['default'] = fs['default'] || fs;`;

export default {
  entry: '../../dist/packages-dist/compiler-cli/src/ngc.js',
  dest: './browser-bundle.umd.js',
  format: 'umd',
  amd: {id: '@angular/compiler-cli-browser'},
  moduleName: 'ng.compiler_cli_browser',
  exports: 'named',
  external: [
    'fs',
    'path',
    'typescript',
    'reflect-metadata',
  ],
  globals: {
    'typescript': 'ts',
    'path': 'path',
    'fs': 'fs',
  },
  banner: banner,
  plugins: [{resolveId: resolve}, commonjs()]
};
