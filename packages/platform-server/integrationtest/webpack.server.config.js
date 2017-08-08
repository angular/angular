/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {
  target: 'node',
  entry: './built/src/server.js',
  output: {filename: './built/server-bundle.js', libraryTarget: 'commonjs2'},
  resolve: {extensions: ['.js']},
  externals: ['canvas', 'jsdom']
};
