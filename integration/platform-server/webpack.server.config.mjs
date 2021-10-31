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
  target: 'node',
  entry: './built/src/server.js',
  // Allow for better debugging of this integration test.
  // Also works around an issue where Domino is minimized incorrectly:
  // https://github.com/fgnass/domino/issues/146.
  optimization: {minimize: false},
  output: {path: path.join(baseDir, 'webpack-out'), filename: './server-bundle.js'},
  module: {
    rules: moduleRules,
  }
};
