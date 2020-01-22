/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note that this file isn't being transpiled so we need to keep it in ES5. Also
// identifiers of the format "$NAME_TMPL" will be replaced by the Bazel rule that
// converts this template file into the actual SystemJS configuration file.

var CDK_PACKAGES = $CDK_ENTRYPOINTS_TMPL;
var CDK_EXPERIMENTAL_PACKAGES = $CDK_EXPERIMENTAL_ENTRYPOINTS_TMPL;
var MATERIAL_PACKAGES = $MATERIAL_ENTRYPOINTS_TMPL;
var MATERIAL_EXPERIMENTAL_PACKAGES = $MATERIAL_EXPERIMENTAL_ENTRYPOINTS_TMPL;

/** Map of Angular framework packages and their bundle names. */
var frameworkPackages = $ANGULAR_PACKAGE_BUNDLES;

/** Whether Ivy is enabled. */
var isRunningWithIvy = '$ANGULAR_IVY_ENABLED_TMPL'.toString() === 'True';

/** Path that relatively resolves to the directory that contains all packages. */
var packagesPath = '$PACKAGES_DIR';

/** Path that relatively resolves to the node_modules directory. */
var nodeModulesPath = '$NODE_MODULES_BASE_PATH';

/** Path mappings that will be registered in SystemJS. */
var pathMapping = {
  'tslib': 'node:tslib/tslib.js',
  'moment': 'node:moment/min/moment-with-locales.min.js',

  'rxjs': 'node:rxjs/bundles/rxjs.umd.min.js',
  'rxjs/operators': 'tools/system-rxjs-operators.js',

  // MDC Web
  '@material/animation': 'node:@material/animation/dist/mdc.animation.js',
  '@material/auto-init': 'node:@material/auto-init/dist/mdc.autoInit.js',
  '@material/base': 'node:@material/base/dist/mdc.base.js',
  '@material/checkbox': 'node:@material/checkbox/dist/mdc.checkbox.js',
  '@material/chips': 'node:@material/chips/dist/mdc.chips.js',
  '@material/dialog': 'node:@material/dialog/dist/mdc.dialog.js',
  '@material/dom': 'node:@material/dom/dist/mdc.dom.js',
  '@material/drawer': 'node:@material/drawer/dist/mdc.drawer.js',
  '@material/floating-label': 'node:@material/floating-label/dist/mdc.floatingLabel.js',
  '@material/form-field': 'node:@material/form-field/dist/mdc.formField.js',
  '@material/icon-button': 'node:@material/icon-button/dist/mdc.iconButton.js',
  '@material/line-ripple': 'node:@material/line-ripple/dist/mdc.lineRipple.js',
  '@material/linear-progress': 'node:@material/linear-progress/dist/mdc.linearProgress.js',
  '@material/list': 'node:@material/list/dist/mdc.list.js',
  '@material/menu': 'node:@material/menu/dist/mdc.menu.js',
  '@material/menu-surface': 'node:@material/menu-surface/dist/mdc.menuSurface.js',
  '@material/notched-outline': 'node:@material/notched-outline/dist/mdc.notchedOutline.js',
  '@material/radio': 'node:@material/radio/dist/mdc.radio.js',
  '@material/ripple': 'node:@material/ripple/dist/mdc.ripple.js',
  '@material/select': 'node:@material/select/dist/mdc.select.js',
  '@material/slider': 'node:@material/slider/dist/mdc.slider.js',
  '@material/snackbar': 'node:@material/snackbar/dist/mdc.snackbar.js',
  '@material/switch': 'node:@material/switch/dist/mdc.switch.js',
  '@material/tab': 'node:@material/tab/dist/mdc.tab.js',
  '@material/tab-bar': 'node:@material/tab-bar/dist/mdc.tabBar.js',
  '@material/tab-indicator': 'node:@material/tab-indicator/dist/mdc.tabIndicator.js',
  '@material/tab-scroller': 'node:@material/tab-scroller/dist/mdc.tabScroller.js',
  '@material/textfield': 'node:@material/textfield/dist/mdc.textfield.js',
  '@material/top-app-bar': 'node:@material/top-app-bar/dist/mdc.topAppBar.js'
};

/** Package configurations that will be used in SystemJS. */
var packagesConfig = {
  // Set the default extension for the root package. Needed for imports to source files
  // without explicit extension. This is common in CommonJS.
  '.': {defaultExtension: 'js'},
};

// Manual directories that need to be configured too. These directories are not
// public entry-points, but they are imported in source files as if they were. In order
// to ensure that the directory imports properly resolve to the "index.js" files within
// SystemJS, we configure them similar to actual package entry-points.
CDK_PACKAGES.push('testing/private', 'testing/testbed/fake-events');
MATERIAL_PACKAGES.push('testing');

// Configure framework packages.
setupFrameworkPackages();

// Configure Angular components packages/entry-points.
setupLocalReleasePackages();

// Configure the base path and map the different node packages.
System.config({
  baseURL: '$BASE_URL',
  map: pathMapping,
  packages: packagesConfig,
  paths: {
    'node:*': nodeModulesPath + '*',
  }
});

/**
 * Walks through all interpolated Angular Framework packages and configures
 * them in SystemJS. Framework packages should always resolve to the UMD bundles.
 */
function setupFrameworkPackages() {
  Object.keys(frameworkPackages).forEach(function(moduleName) {
    var primaryEntryPointSegments = moduleName.split('-');
    // Ensures that imports to the framework package are resolved
    // to the configured node modules directory.
    pathMapping[moduleName] = 'node:' + moduleName;
    // Configure each bundle for the current package.
    frameworkPackages[moduleName].forEach(function(bundleName) {
      // Entry-point segments determined from the UMD bundle name. We split the
      // bundle into segments based on dashes. We omit the leading segments that
      // belong to the primary entry-point module name since we are only interested
      // in the segments that build up the secondary or tertiary entry-point name.
      var segments = bundleName.substring(0, bundleName.length - '.umd.js'.length)
                         .split('-')
                         .slice(primaryEntryPointSegments.length);
      // The entry-point name. For secondary entry-points we determine the name from
      // the UMD bundle names. e.g. "animations-browser" results in "@angular/animations/browser".
      var entryPointName = segments.length ? moduleName + '/' + segments.join('/') : moduleName;
      var bundlePath = 'bundles/' + bundleName;
      // When running with Ivy, we need to load the ngcc processed UMD bundles.
      // These are stored in the "__ivy_ngcc_" folder that has been generated
      // since we run ngcc with "--create-ivy-entry-points".
      if (isRunningWithIvy) {
        bundlePath = '__ivy_ngcc__/' + bundlePath;
      }
      packagesConfig[entryPointName] = {
        main: segments
                  .map(function() {
                    return '../'
                  })
                  .join('') +
            bundlePath
      };
    });
  });
}

/** Configures the local release packages in SystemJS */
function setupLocalReleasePackages() {
  // Configure all primary entry-points.
  configureEntryPoint('cdk');
  configureEntryPoint('cdk-experimental');
  configureEntryPoint('components-examples');
  configureEntryPoint('material');
  configureEntryPoint('material-experimental');
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
}

/** Configures the specified package, its entry-point and its examples. */
function configureEntryPoint(pkgName, entryPoint) {
  var name = entryPoint ? pkgName + '/' + entryPoint : pkgName;
  var examplesName = 'components-examples/' + name;

  pathMapping['@angular/' + name] = packagesPath + '/' + name;
  pathMapping['@angular/' + examplesName] = packagesPath + '/' + examplesName;

  // Ensure that imports which resolve to the entry-point directory are
  // redirected to the "index.js" file of the directory.
  packagesConfig[packagesPath + '/' + name] =
      packagesConfig[packagesPath + '/' + examplesName] = {main: 'index.js'};
}
