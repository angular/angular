/**
 * WEB VERSION FOR CURRENT ANGULAR BUILD
 * (based on systemjs.config.js in angular.io)
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 *
 * UNTESTED !
 */
(function (global) {
  System.config({
    // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
    transpiler: 'ts',
    typescriptOptions: {
      // Copy of compiler options in standard tsconfig.json
      "target": "es5",
      "module": "commonjs",
      "moduleResolution": "node",
      "sourceMap": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "lib": ["es2015", "dom"],
      "noImplicitAny": true,
      "suppressImplicitAnyIndexErrors": true
    },
    meta: {
      'typescript': {
        "exports": "ts"
      }
    },
    paths: {
      // paths serve as alias
      'npm:': 'https://unpkg.com/',
      'ng:': 'https://cdn.rawgit.com/angular/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      'app': 'app',

      // angular bundles
      '@angular/animations': 'ng:animations-builds/master/bundles/animations.umd.js',
      '@angular/animations/browser': 'ng:animations-builds/master/bundles/animations-browser.umd.js',
      '@angular/core': 'ng:core-builds/master/bundles/core.umd.js',
      '@angular/common': 'ng:common-builds/master/bundles/common.umd.js',
      '@angular/common/http': 'ng:common-builds/master/bundles/common-http.umd.js',
      '@angular/compiler': 'ng:compiler-builds/master/bundles/compiler.umd.js',
      '@angular/platform-browser': 'ng:platform-browser-builds/master/bundles/platform-browser.umd.js',
      '@angular/platform-browser/animations': 'ng:animations-builds/master/bundles/platform-browser-animations.umd.js',
      '@angular/platform-browser-dynamic': 'ng:platform-browser-dynamic-builds/master/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'ng:http-builds/master/bundles/http.umd.js',
      '@angular/router': 'ng:router-builds/master/bundles/router.umd.js',
      '@angular/router/upgrade': 'ng:router-builds/master/bundles/router-upgrade.umd.js',
      '@angular/forms': 'ng:forms-builds/master/bundles/forms.umd.js',
      '@angular/upgrade': 'ng:upgrade-builds/master/bundles/upgrade.umd.js',
      '@angular/upgrade/static': 'ng:upgrade-builds/master/bundles/upgrade-static.umd.js',

      // angular testing umd bundles (overwrite the shim mappings)
      '@angular/core/testing': 'ng:core-builds/master/bundles/core-testing.umd.js',
      '@angular/common/testing': 'ng:common-builds/master/bundles/common-testing.umd.js',
      '@angular/common/http/testing': 'ng:common-builds/master/bundles/common-http-testing.umd.js',
      '@angular/compiler/testing': 'ng:compiler-builds/master/bundles/compiler-testing.umd.js',
      '@angular/platform-browser/testing': 'ng:platform-browser-builds/master/bundles/platform-browser-testing.umd.js',
      '@angular/platform-browser-dynamic/testing': 'ng:platform-browser-dynamic-builds/master/bundles/platform-browser-dynamic-testing.umd.js',
      '@angular/http/testing': 'ng:http-builds/master/bundles/http-testing.umd.js',
      '@angular/router/testing': 'ng:router-builds/master/bundles/router-testing.umd.js',
      '@angular/forms/testing': 'ng:forms-builds/master/bundles/forms-testing.umd.js',

      // other libraries
      'rxjs':                      'npm:rxjs@5.5.2',
      'rxjs/operators':            'npm:rxjs@5.5.2/operators/index.js',
      'tslib':                     'npm:tslib/tslib.js',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api@0.4/bundles/in-memory-web-api.umd.js',
      'ts':                        'npm:plugin-typescript@5.2.7/lib/plugin.js',
      'typescript':                'npm:typescript@2.4.2/lib/typescript.js',

    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.ts',
        defaultExtension: 'ts',
        meta: {
          './*.ts': {
            loader: 'systemjs-angular-loader.js'
          }
        }
      },
      'rxjs/ajax': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/operators': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/testing': {main: 'index.js', defaultExtension: 'js' },
      'rxjs/websocket': {main: 'index.js', defaultExtension: 'js' },
      'rxjs': { main: 'index.js', defaultExtension: 'js' },
    }
  });

})(this);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
