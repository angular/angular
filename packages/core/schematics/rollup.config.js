/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const MagicString = require('magic-string');

/** Removed license banners from input files. */
const stripBannerPlugin = {
  name: 'strip-license-banner',
  transform(code, _filePath) {
    const banner = /(\/\**\s+\*\s@license.*?\*\/)/s.exec(code);
    if (!banner) {
      return;
    }

    const [bannerContent] = banner;
    const magicString = new MagicString(code);
    const pos = code.indexOf(bannerContent);
    magicString.remove(pos, pos + bannerContent.length).trimStart();

    return {
      code: magicString.toString(),
      map: magicString.generateMap({
        hires: true,
      }),
    };
  },
};

const banner = `'use strict';
/**
 * @license Angular v0.0.0-PLACEHOLDER
 * (c) 2010-2024 Google LLC. https://angular.io/
 * License: MIT
 */`;

const plugins = [
  nodeResolve({
    jail: process.cwd(),
  }),
  stripBannerPlugin,
  commonjs(),
];

const config = {
  plugins,
  external: ['typescript', 'tslib', /@angular-devkit\/.+/],
  output: {
    exports: 'auto',
    banner,
  },
};

module.exports = config;
