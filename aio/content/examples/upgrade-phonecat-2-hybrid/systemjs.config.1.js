/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  // #docregion paths
  System.config({
    paths: {
      // paths serve as alias
      'npm:': '/node_modules/'
    },
    map: {
      'ng-loader': '../src/systemjs-angular-loader.js',
      app: '/app',
      // #enddocregion paths
      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/common/http': 'npm:@angular/common/bundles/common-http.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/router/upgrade': 'npm:@angular/router/bundles/router-upgrade.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      // #docregion paths
      '@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',
      // #enddocregion paths

      // other libraries
      'rxjs': 'npm:rxjs',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api',
      // #docregion paths
    },
    // #enddocregion paths

    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
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
      'rxjs/ajax': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/operators': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/testing': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/websocket': {main: 'index.js', defaultExtension: 'js' },
      'rxjs': { main: 'index.js', defaultExtension: 'js' },
    }
  });
})(this);
