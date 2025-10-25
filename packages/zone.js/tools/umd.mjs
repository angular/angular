/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {umdWrapper} from 'esbuild-plugin-umd-wrapper';
import config from './base.mjs';

export default {
  ...config,
  plugins: [umdWrapper(), ...config.plugins],
  format: 'umd',
};
