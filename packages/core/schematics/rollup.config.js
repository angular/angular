/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

/** Removed license banners from input files. */
const stripBannerPlugin = {
  name: 'strip-license-banner',
  transform(code, _filePath) {
    const banner = /(\/\**\s+\*\s@license.*?\*\/)/s.exec(code);
    if (!banner) {
      return;
    }

    const [bannerContent] = banner;
    const pos = code.indexOf(bannerContent);
    if (pos !== -1) {
      const result = code.slice(0, pos) + code.slice(pos + bannerContent.length);

      return {
        code: result.trimStart(),
        map: null,
      };
    }

    return {
      code: code,
      map: null,
    };
  },
};

const banner = `'use strict';
/**
 * @license Angular v0.0.0-PLACEHOLDER
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */`;

const plugins = [
  nodeResolve({
    jail: process.cwd(),
  }),
  stripBannerPlugin,
  commonjs(),
];

/** @type {import('rollup').RollupOptions} */
const config = {
  plugins,
  external: ['typescript', 'tslib', /@angular-devkit\/.+/],
  output: {
    exports: 'auto',
    chunkFileNames: '[name]-[hash].cjs',
    entryFileNames: '[name].cjs',
    banner,
  },
};

module.exports = config;
