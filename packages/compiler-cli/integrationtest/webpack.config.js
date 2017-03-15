/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {
  target: 'node',
  entry: './test/all_spec.js',
  output: {filename: './all_spec.js'},
  resolve: {extensions: ['.js']},
  devtool: '#source-map',
  module: {
    loaders:
        [{test: /\.js$/, exclude: /node_modules/, loaders: ['source-map-loader'], enforce: 'pre'}]
  },
};
