/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Type declaration for ambient System. */
declare const System: any;

// Configure the base path and map the different node packages.
System.config({
  paths: {
    'node:*': 'node_modules/*'
  },
  map: {
    'main': 'main.js',
    'tslib': 'node:tslib/tslib.js',
    'moment': 'node:moment/min/moment-with-locales.min.js',

    'rxjs': 'node_modules/rxjs/bundles/rxjs.umd.min.js',
    'rxjs/operators': 'system-rxjs-operators.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/common/http': 'node:@angular/common/bundles/common-http.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/elements': 'node:@angular/elements/bundles/elements.umd.js',
    '@angular/router': 'node:@angular/router/bundles/router.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
    '@angular/platform-browser':
      'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    '@angular/material': 'dist/packages/material/index.js',
    '@angular/material-experimental': 'dist/packages/material-experimental/index.js',
    '@angular/material-examples': 'dist/packages/material-examples/index.js',
    '@angular/material-moment-adapter': 'dist/packages/material-moment-adapter/index.js',
    '@angular/cdk': 'dist/packages/cdk/index.js',
    '@angular/cdk-experimental': 'dist/packages/cdk-experimental/index.js',

    '@angular/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
    '@angular/cdk/accordion': 'dist/packages/cdk/accordion/index.js',
    '@angular/cdk/bidi': 'dist/packages/cdk/bidi/index.js',
    '@angular/cdk/coercion': 'dist/packages/cdk/coercion/index.js',
    '@angular/cdk/collections': 'dist/packages/cdk/collections/index.js',
    '@angular/cdk/drag-drop': 'dist/packages/cdk/drag-drop/index.js',
    '@angular/cdk/keycodes': 'dist/packages/cdk/keycodes/index.js',
    '@angular/cdk/layout': 'dist/packages/cdk/layout/index.js',
    '@angular/cdk/observers': 'dist/packages/cdk/observers/index.js',
    '@angular/cdk/overlay': 'dist/packages/cdk/overlay/index.js',
    '@angular/cdk/platform': 'dist/packages/cdk/platform/index.js',
    '@angular/cdk/portal': 'dist/packages/cdk/portal/index.js',
    '@angular/cdk/scrolling': 'dist/packages/cdk/scrolling/index.js',
    '@angular/cdk/stepper': 'dist/packages/cdk/stepper/index.js',
    '@angular/cdk/table': 'dist/packages/cdk/table/index.js',
    '@angular/cdk/text-field': 'dist/packages/cdk/text-field/index.js',
    '@angular/cdk/tree': 'dist/packages/cdk/tree/index.js',

    '@angular/cdk-experimental/scrolling': 'dist/packages/cdk-experimental/scrolling/index.js',
    '@angular/cdk-experimental/dialog': 'dist/packages/cdk-experimental/dialog/index.js',

    '@angular/material/autocomplete': 'dist/packages/material/autocomplete/index.js',
    '@angular/material/bottom-sheet': 'dist/packages/material/bottom-sheet/index.js',
    '@angular/material/button': 'dist/packages/material/button/index.js',
    '@angular/material/button-toggle': 'dist/packages/material/button-toggle/index.js',
    '@angular/material/card': 'dist/packages/material/card/index.js',
    '@angular/material/checkbox': 'dist/packages/material/checkbox/index.js',
    '@angular/material/chips': 'dist/packages/material/chips/index.js',
    '@angular/material/core': 'dist/packages/material/core/index.js',
    '@angular/material/datepicker': 'dist/packages/material/datepicker/index.js',
    '@angular/material/dialog': 'dist/packages/material/dialog/index.js',
    '@angular/material/divider': 'dist/packages/material/divider/index.js',
    '@angular/material/expansion': 'dist/packages/material/expansion/index.js',
    '@angular/material/form-field': 'dist/packages/material/form-field/index.js',
    '@angular/material/grid-list': 'dist/packages/material/grid-list/index.js',
    '@angular/material/icon': 'dist/packages/material/icon/index.js',
    '@angular/material/input': 'dist/packages/material/input/index.js',
    '@angular/material/list': 'dist/packages/material/list/index.js',
    '@angular/material/menu': 'dist/packages/material/menu/index.js',
    '@angular/material/paginator': 'dist/packages/material/paginator/index.js',
    '@angular/material/progress-bar': 'dist/packages/material/progress-bar/index.js',
    '@angular/material/progress-spinner': 'dist/packages/material/progress-spinner/index.js',
    '@angular/material/radio': 'dist/packages/material/radio/index.js',
    '@angular/material/select': 'dist/packages/material/select/index.js',
    '@angular/material/sidenav': 'dist/packages/material/sidenav/index.js',
    '@angular/material/slide-toggle': 'dist/packages/material/slide-toggle/index.js',
    '@angular/material/slider': 'dist/packages/material/slider/index.js',
    '@angular/material/snack-bar': 'dist/packages/material/snack-bar/index.js',
    '@angular/material/sort': 'dist/packages/material/sort/index.js',
    '@angular/material/stepper': 'dist/packages/material/stepper/index.js',
    '@angular/material/table': 'dist/packages/material/table/index.js',
    '@angular/material/tabs': 'dist/packages/material/tabs/index.js',
    '@angular/material/toolbar': 'dist/packages/material/toolbar/index.js',
    '@angular/material/tooltip': 'dist/packages/material/tooltip/index.js',
    '@angular/material/badge': 'dist/packages/material/badge/index.js',
    '@angular/material/tree': 'dist/packages/material/tree/index.js',
  },
  packages: {
    // Set the default extension for the root package, because otherwise the dev-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});
