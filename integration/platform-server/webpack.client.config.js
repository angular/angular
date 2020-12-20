/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');

module.exports = {
  entry: {
    helloworld: './built/src/helloworld/client.js',
    transferstate: './built/src/transferstate/client.js',
  },
  output: {path: path.join(__dirname, 'built'), filename: '[name]-bundle.js'},
  module: {loaders: [{test: /\.js$/, loader: 'babel-loader?presets[]=es2015'}]},
  resolve: {extensions: ['.js']}
};
