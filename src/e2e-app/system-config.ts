/** Type declaration for ambient System. */
declare const System: any;

// Apply the CLI SystemJS configuration.
System.config({
  paths: {
    'node:*': 'node_modules/*',
  },
  map: {
    'rxjs': 'node:rxjs',
    'main': 'main.js',
    'moment': 'node:moment/min/moment-with-locales.min.js',
    'tslib': 'node:tslib/tslib.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/common/http': 'node:@angular/common/bundles/common-http.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/router': 'node:@angular/router/bundles/router.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser': 'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    '@angular/material': 'dist/bundles/material.umd.js',
    '@angular/material-experimental': 'dist/bundles/material-experimental.umd.js',
    '@angular/material-moment-adapter': 'dist/bundles/material-moment-adapter.umd.js',
    '@angular/cdk': 'dist/bundles/cdk.umd.js',
    '@angular/cdk-experimental': 'dist/bundles/cdk-experimental.umd.js',

    '@angular/cdk/a11y': 'dist/bundles/cdk-a11y.umd.js',
    '@angular/cdk/accordion': 'dist/bundles/cdk-accordion.umd.js',
    '@angular/cdk/bidi': 'dist/bundles/cdk-bidi.umd.js',
    '@angular/cdk/coercion': 'dist/bundles/cdk-coercion.umd.js',
    '@angular/cdk/collections': 'dist/bundles/cdk-collections.umd.js',
    '@angular/cdk/keycodes': 'dist/bundles/cdk-keycodes.umd.js',
    '@angular/cdk/layout': 'dist/bundles/cdk-layout.umd.js',
    '@angular/cdk/observers': 'dist/bundles/cdk-observers.umd.js',
    '@angular/cdk/overlay': 'dist/bundles/cdk-overlay.umd.js',
    '@angular/cdk/platform': 'dist/bundles/cdk-platform.umd.js',
    '@angular/cdk/portal': 'dist/bundles/cdk-portal.umd.js',
    '@angular/cdk/scrolling': 'dist/bundles/cdk-scrolling.umd.js',
    '@angular/cdk/stepper': 'dist/bundles/cdk-stepper.umd.js',
    '@angular/cdk/table': 'dist/bundles/cdk-table.umd.js',
    '@angular/cdk/testing': 'dist/bundles/cdk-testing.umd.js',
    '@angular/material-examples': 'dist/bundles/material-examples.umd.js',

    '@angular/material/autocomplete': 'dist/bundles/material-autocomplete.umd.js',
    '@angular/material/button': 'dist/bundles/material-button.umd.js',
    '@angular/material/button-toggle': 'dist/bundles/material-button-toggle.umd.js',
    '@angular/material/card': 'dist/bundles/material-card.umd.js',
    '@angular/material/checkbox': 'dist/bundles/material-checkbox.umd.js',
    '@angular/material/chips': 'dist/bundles/material-chips.umd.js',
    '@angular/material/core': 'dist/bundles/material-core.umd.js',
    '@angular/material/datepicker': 'dist/bundles/material-datepicker.umd.js',
    '@angular/material/dialog': 'dist/bundles/material-dialog.umd.js',
    '@angular/material/divider': 'dist/bundles/material-divider.umd.js',
    '@angular/material/expansion': 'dist/bundles/material-expansion.umd.js',
    '@angular/material/form-field': 'dist/bundles/material-form-field.umd.js',
    '@angular/material/grid-list': 'dist/bundles/material-grid-list.umd.js',
    '@angular/material/icon': 'dist/bundles/material-icon.umd.js',
    '@angular/material/input': 'dist/bundles/material-input.umd.js',
    '@angular/material/list': 'dist/bundles/material-list.umd.js',
    '@angular/material/menu': 'dist/bundles/material-menu.umd.js',
    '@angular/material/paginator': 'dist/bundles/material-paginator.umd.js',
    '@angular/material/progress-bar': 'dist/bundles/material-progress-bar.umd.js',
    '@angular/material/progress-spinner': 'dist/bundles/material-progress-spinner.umd.js',
    '@angular/material/radio': 'dist/bundles/material-radio.umd.js',
    '@angular/material/select': 'dist/bundles/material-select.umd.js',
    '@angular/material/sidenav': 'dist/bundles/material-sidenav.umd.js',
    '@angular/material/slide-toggle': 'dist/bundles/material-slide-toggle.umd.js',
    '@angular/material/slider': 'dist/bundles/material-slider.umd.js',
    '@angular/material/snack-bar': 'dist/bundles/material-snack-bar.umd.js',
    '@angular/material/sort': 'dist/bundles/material-sort.umd.js',
    '@angular/material/stepper': 'dist/bundles/material-stepper.umd.js',
    '@angular/material/table': 'dist/bundles/material-table.umd.js',
    '@angular/material/tabs': 'dist/bundles/material-tabs.umd.js',
    '@angular/material/toolbar': 'dist/bundles/material-toolbar.umd.js',
    '@angular/material/tooltip': 'dist/bundles/material-tooltip.umd.js',
  },
  packages: {
    // Thirdparty barrels.
    'rxjs': {main: 'index'},

    // Set the default extension for the root package, because otherwise the demo-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});
