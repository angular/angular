const node = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const MagicString = require('magic-string');

// Parse the stamp file produced by Bazel from the version control system
let version = '<unknown>';
if (bazel_version_file) {
  const versionTag = require('fs')
    .readFileSync(bazel_version_file, {encoding: 'utf-8'})
    .split('\n')
    .find((s) => s.startsWith('STABLE_PROJECT_VERSION'));
  // Don't assume STABLE_PROJECT_VERSION exists
  if (versionTag) {
    version = versionTag.split(' ')[1].trim();
  }
}

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

// Add 'use strict' to the bundle, https://github.com/angular/angular/pull/40456
// When rollup build esm bundle of zone.js, there will be no 'use strict'
// since all esm bundles are `strict`, but when webpack load the esm bundle,
// because zone.js is a module without export and import, webpack is unable
// to determine the bundle is `esm` module or not, so it doesn't add the 'use strict'
// which webpack does to all other `esm` modules which has export or import.
// And it causes issues such as https://github.com/angular/angular/issues/40215
// `this` should be `undefined` but is assigned with `Window` instead.
const banner = `'use strict';
/**
 * @license Angular v${version}
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */`;

module.exports = {
  external: (id) => {
    if (id[0] === '.') {
      // Relative paths are always non external.
      return false;
    }

    if (/zone\.js[\\/]lib/.test(id)) {
      return false;
    }

    return /rxjs|electron/.test(id);
  },

  plugins: [
    node({
      mainFields: ['es2015', 'module', 'jsnext:main', 'main'],
    }),
    commonjs(),
    stripBannerPlugin,
  ],
  output: {
    globals: {
      electron: 'electron',
      'rxjs/Observable': 'Rx',
      'rxjs/Subscriber': 'Rx',
      'rxjs/Subscription': 'Rx',
      'rxjs/Scheduler': 'Rx.Scheduler',
      'rxjs/scheduler/asap': 'Rx.Scheduler',
      'rxjs/scheduler/async': 'Rx.Scheduler',
      'rxjs/symbol/rxSubscriber': 'Rx.Symbol',
    },
    banner,
  },
};
