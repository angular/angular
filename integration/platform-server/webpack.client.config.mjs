/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import {moduleRules, baseDir} from './base-config.mjs';

export default {
  entry: {
    helloworld: './built/src/helloworld/client.js',
    transferstate: './built/src/transferstate/client.js',
  },
  // Allow for better debugging of this integration test.
  optimization: {minimize: false},
  output: {path: path.join(baseDir, 'webpack-out'), filename: '[name]-bundle.js'},
  module: {
    rules: moduleRules,
  }
};
