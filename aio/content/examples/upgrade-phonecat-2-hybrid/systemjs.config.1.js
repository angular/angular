/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  // #docregion paths, angular-paths, rxjs-paths, tslib-paths, plugin-babel
  System.config({
    // #enddocregion angular-paths, rxjs-paths, tslib-paths, plugin-babel
    paths: {
      // paths serve as alias
      'npm:': '/node_modules/'
    },
    // #docregion angular-paths, rxjs-paths, tslib-paths, plugin-babel
    map: {
      // #enddocregion angular-paths, rxjs-paths, tslib-paths, plugin-babel
      'ng-loader': '../src/systemjs-angular-loader.js',
      app: '/app',
      // #enddocregion paths
      // angular bundles
      // #docregion angular-paths
      '@angular/core': 'npm:@angular/core/fesm2022/core.mjs',
      '@angular/common': 'npm:@angular/common/fesm2022/common.mjs',
      '@angular/common/http': 'npm:@angular/common/fesm2022/http.mjs',
      '@angular/compiler': 'npm:@angular/compiler/fesm2022/compiler.mjs',
      '@angular/platform-browser': 'npm:@angular/platform-browser/fesm2022/platform-browser.mjs',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/fesm2022/platform-browser-dynamic.mjs',
      '@angular/router': 'npm:@angular/router/fesm2022/router.mjs',
      '@angular/router/upgrade': 'npm:@angular/router/fesm2022/upgrade.mjs',
      '@angular/forms': 'npm:@angular/forms/fesm2022/forms.mjs',
      // #enddocregion angular-paths
      // #docregion paths
      '@angular/upgrade/static': 'npm:@angular/upgrade/fesm2022/static.mjs',
      // #enddocregion paths

      // other libraries
      // #docregion rxjs-paths
      'rxjs': 'npm:rxjs/dist/cjs',
      'rxjs/operators': 'npm:rxjs/dist/cjs/operators',
      // #enddocregion rxjs-paths
      // #docregion tslib-paths
      'tslib': 'npm:tslib/tslib.js',
      // #enddocregion tslib-paths
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api',

      // #docregion plugin-babel
      'plugin-babel': 'npm:systemjs-plugin-babel/plugin-babel.js',
      'systemjs-babel-build': 'npm:systemjs-plugin-babel/systemjs-babel-browser.js'
      // #docregion paths, angular-paths, rxjs-paths, tslib-paths
    },
    // #enddocregion paths, angular-paths, rxjs-paths, tslib-paths

    transpiler: 'plugin-babel',
    // #enddocregion plugin-babel
    // packages tells the System loader how to load when no filename and/or no extension
    // #docregion rxjs-paths, plugin-babel
    packages: {
      // #enddocregion rxjs-paths, plugin-babel
      'app': {
        main: './main.js',
        defaultExtension: 'js',
        meta: {
          './*.js': {
            loader: 'ng-loader'
          }
        }
      },
      'angular-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      },
      // #docregion rxjs-paths
      'rxjs': {
        defaultExtension: 'js',
        format: 'cjs',
        main: 'index.js'
      },
      'rxjs/operators': {
        defaultExtension: 'js',
        format: 'cjs',
        main: 'index.js'
      },
      // #enddocregion rxjs-paths
      // #docregion plugin-babel
      'meta': {
        '*.mjs': {
          babelOptions: {
            es2015: false
          }
        }
      }
      // #docregion rxjs-paths
    }
    // #docregion angular-paths, tslib-paths
  });
  // #enddocregion angular-paths, rxjs-paths, tslib-paths, plugin-babel
})(this);
