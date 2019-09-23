/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note that this file isn't being transpiled so we need to keep it in ES5.

var CDK_PACKAGES = [
  'a11y',
  'accordion',
  'bidi',
  'coercion',
  'collections',
  'drag-drop',
  'keycodes',
  'layout',
  'observers',
  'overlay',
  'platform',
  'portal',
  'scrolling',
  'stepper',
  'table',
  'text-field',
  'tree',
];

var CDK_EXPERIMENTAL_PACKAGES = [
  'dialog',
  'popover-edit',
  'scrolling',
];

var MATERIAL_PACKAGES = [
  'autocomplete',  'badge',
  'bottom-sheet',  'button',
  'button-toggle', 'card',
  'checkbox',      'chips',
  'core',          'datepicker',
  'dialog',        'divider',
  'expansion',     'form-field',
  'grid-list',     'icon',
  'input',         'list',
  'menu',          'paginator',
  'progress-bar',  'progress-spinner',
  'radio',         'select',
  'sidenav',       'slide-toggle',
  'slider',        'snack-bar',
  'sort',          'stepper',
  'table',         'tabs',
  'toolbar',       'tooltip',
  'tree',
];

var MATERIAL_EXPERIMENTAL_PACKAGES = [
  'mdc-button',
  'mdc-card',
  'mdc-checkbox',
  'mdc-chips',
  'mdc-tabs',
  'mdc-helpers',
  'mdc-menu',
  'mdc-radio',
  'mdc-slide-toggle',
  'mdc-slider',
  'popover-edit',
];

/** Bazel runfile path referring to the "src/" folder of the project. */
var srcRunfilePath = 'angular_material/src';

/** Path mappings that will be registered in SystemJS. */
var pathMapping = {};

/** Package configurations that will be used in SystemJS. */
var packagesConfig = {};

// Configure all primary entry-points.
configureEntryPoint('cdk');
configureEntryPoint('cdk-experimental');
configureEntryPoint('material');
configureEntryPoint('material-experimental');
configureEntryPoint('material-examples');
configureEntryPoint('material-moment-adapter');

// Configure all secondary entry-points.
CDK_PACKAGES.forEach(function(pkgName) {
  configureEntryPoint('cdk', pkgName);
});
CDK_EXPERIMENTAL_PACKAGES.forEach(function(pkgName) {
  configureEntryPoint('cdk-experimental', pkgName);
});
MATERIAL_EXPERIMENTAL_PACKAGES.forEach(function(pkgName) {
  configureEntryPoint('material-experimental', pkgName);
});
MATERIAL_PACKAGES.forEach(function(pkgName) {
  configureEntryPoint('material', pkgName);
});
configureEntryPoint('google-maps');
configureEntryPoint('youtube-player');

/** Configures the specified package, its entry-point and its examples. */
function configureEntryPoint(pkgName, entryPoint) {
  var name = entryPoint ? pkgName + '/' + entryPoint : pkgName;
  var examplesName = 'material-examples/' + name;

  pathMapping['@angular/' + name] = srcRunfilePath + '/' + name;
  pathMapping['@angular/' + examplesName] = srcRunfilePath + '/' + examplesName;
  packagesConfig[srcRunfilePath + '/' + name] =
      packagesConfig[srcRunfilePath + '/' + examplesName] = {main: 'index.js'};
}

var map = Object.assign({
  'main': 'main.js',
  'tslib': 'tslib/tslib.js',
  'moment': 'moment/min/moment-with-locales.min.js',

  'rxjs': 'rxjs/bundles/rxjs.umd.min.js',
  'rxjs/operators': 'system-rxjs-operators.js',

  // MDC Web
  '@material/animation': '@material/animation/dist/mdc.animation.js',
  '@material/auto-init': '@material/auto-init/dist/mdc.autoInit.js',
  '@material/base': '@material/base/dist/mdc.base.js',
  '@material/checkbox': '@material/checkbox/dist/mdc.checkbox.js',
  '@material/chips': '@material/chips/dist/mdc.chips.js',
  '@material/dialog': '@material/dialog/dist/mdc.dialog.js',
  '@material/dom': '@material/dom/dist/mdc.dom.js',
  '@material/drawer': '@material/drawer/dist/mdc.drawer.js',
  '@material/floating-label': '@material/floating-label/dist/mdc.floatingLabel.js',
  '@material/form-field': '@material/form-field/dist/mdc.formField.js',
  '@material/grid-list': '@material/grid-list/dist/mdc.gridList.js',
  '@material/icon-button': '@material/icon-button/dist/mdc.iconButton.js',
  '@material/line-ripple': '@material/line-ripple/dist/mdc.lineRipple.js',
  '@material/linear-progress': '@material/linear-progress/dist/mdc.linearProgress.js',
  '@material/list': '@material/list/dist/mdc.list.js',
  '@material/menu': '@material/menu/dist/mdc.menu.js',
  '@material/menu-surface': '@material/menu-surface/dist/mdc.menuSurface.js',
  '@material/notched-outline': '@material/notched-outline/dist/mdc.notchedOutline.js',
  '@material/radio': '@material/radio/dist/mdc.radio.js',
  '@material/ripple': '@material/ripple/dist/mdc.ripple.js',
  '@material/select': '@material/select/dist/mdc.select.js',
  '@material/slider': '@material/slider/dist/mdc.slider.js',
  '@material/snackbar': '@material/snackbar/dist/mdc.snackbar.js',
  '@material/switch': '@material/switch/dist/mdc.switch.js',
  '@material/tab': '@material/tab/dist/mdc.tab.js',
  '@material/tab-bar': '@material/tab-bar/dist/mdc.tabBar.js',
  '@material/tab-indicator': '@material/tab-indicator/dist/mdc.tabIndicator.js',
  '@material/tab-scroller': '@material/tab-scroller/dist/mdc.tabScroller.js',
  '@material/text-field': '@material/textfield/dist/mdc.textfield.js',
  '@material/top-app-bar': '@material/top-app-bar/dist/mdc.topAppBar.js'
}, pathMapping);

var packages = Object.assign({
  // Set the default extension for the root package, because otherwise the dev-app can't
  // be built within the production mode. Due to missing file extensions.
  '.': {defaultExtension: 'js'},

  // Angular specific mappings.
  '@angular/core': {main: 'bundles/core.umd.js'},
  '@angular/common': {main: 'bundles/common.umd.js'},
  '@angular/common/http': {main: '../bundles/common-http.umd.js'},
  '@angular/compiler': {main: 'bundles/compiler.umd.js'},
  '@angular/forms': {main: 'bundles/forms.umd.js'},
  '@angular/animations': {main: 'bundles/animations.umd.js'},
  '@angular/elements': {main: 'bundles/elements.umd.js'},
  '@angular/router': {main: 'bundles/router.umd.js'},
  '@angular/animations/browser': {main: '../bundles/animations-browser.umd.js'},
  '@angular/platform-browser/animations': {main: '../bundles/platform-browser-animations.umd'},
  '@angular/platform-browser': {main: 'bundles/platform-browser.umd.js'},
  '@angular/platform-browser-dynamic': {main: 'bundles/platform-browser-dynamic.umd.js'},
}, packagesConfig);

// Configure the base path and map the different node packages.
System.config({
  map: map,
  packages: packages
});
