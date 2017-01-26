/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

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
    'npm:': 'https://unpkg.com/'
  },
  // map tells the System loader where to look for things
  map: {
    // our app is within the app folder
    app: 'app',

    // angular bundles
    '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
    '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
    '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
    '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
    '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
    '@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',

    // other libraries
    'rxjs':                      'npm:rxjs',
    'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
    'ts':                        'npm:plugin-typescript@4.0.10/lib/plugin.js',
    'typescript':                'npm:typescript@2.0.3/lib/typescript.js',

  },
  // packages tells the System loader how to load when no filename and/or no extension
  packages: {
    app: {
      main: './main.ts',
      defaultExtension: 'ts'
    },
    rxjs: {
      defaultExtension: 'js'
    }
  }
});
