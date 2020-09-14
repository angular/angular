/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Normally the Bazel "ts_devserver" automatically handles the module resolution of
// dependencies in the browser using RequireJS, but there are various examples that
// use SystemJS (e.g. for lazy loading, web workers) and therefore we want to avoid
// repeating the basic configuration by providing this as a general SystemJS config.

const angularPackages = [
  'common',
  'animations',
  'platform-browser/animations',
  'compiler',
  'core',
  'forms',
  'http',
  'platform-browser',
  'platform-browser-dynamic',
  'router',
  'upgrade',
  'upgrade/static',
];

const packagesConfig = {};
const mapConfig = {
  'tslib': 'npm/node_modules/tslib/tslib.js',
  'rxjs': 'npm/node_modules/rxjs/bundles/rxjs.umd.js',
  'rxjs/operators': 'angular/modules/playground/systemjs-rxjs-operators.js',
};

angularPackages.forEach(pkgName => {
  mapConfig[`@angular/${pkgName}`] = `angular/packages/${pkgName}`;
  packagesConfig[`@angular/${pkgName}`] = {
    main: 'index.js',
    defaultExtension: 'js',
  };
});

System.config({
  map: mapConfig,
  packages: packagesConfig,
});
