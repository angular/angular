import {join} from 'path';
import {getSubdirectoryNames} from './secondary-entry-points';
import {buildConfig} from './build-config';

/** Method that converts dash-case strings to a camel-based string. */
export const dashCaseToCamelCase =
  (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/** Generates rollup entry point mappings for the given package and entry points. */
function generateRollupEntryPoints(packageName: string, entryPoints: string[]):
    {[k: string]: string} {
  return entryPoints.reduce((globals: {[k: string]: string}, entryPoint: string) => {
    globals[`@angular/${packageName}/${entryPoint}`] =
        `ng.${dashCaseToCamelCase(packageName)}.${dashCaseToCamelCase(entryPoint)}`;
    return globals;
  }, {});
}

/** List of potential secondary entry-points for the cdk package. */
const cdkSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk'));

/** List of potential secondary entry-points for the material package. */
const matSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'material'));

/** List of potential secondary entry-points for the cdk-experimental package. */
const cdkExperimentalSecondaryEntryPoints =
    getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk-experimental'));

/** List of potential secondary entry-points for the material-experimental package. */
const materialExperimentalSecondaryEntryPoints =
    getSubdirectoryNames(join(buildConfig.packagesDir, 'material-experimental'));

/** Object with all cdk entry points in the format of Rollup globals. */
const rollupCdkEntryPoints = generateRollupEntryPoints('cdk', cdkSecondaryEntryPoints);

/** Object with all material entry points in the format of Rollup globals. */
const rollupMatEntryPoints = generateRollupEntryPoints('material', matSecondaryEntryPoints);

/** Object with all material-experimental entry points in the format of Rollup globals. */
const rollupMaterialExperimentalEntryPoints =
    generateRollupEntryPoints('material-experimental', materialExperimentalSecondaryEntryPoints);

/** Object with all cdk-experimental entry points in the format of Rollup globals. */
const rollupCdkExperimentalEntryPoints =
    generateRollupEntryPoints('cdk-experimental', cdkExperimentalSecondaryEntryPoints);

/** Map of globals that are used inside of the different packages. */
export const rollupGlobals = {
  'moment': 'moment',
  'protractor': 'protractor',
  'selenium-webdriver': 'selenium-webdriver',
  'tslib': 'tslib',

  // MDC Web
  '@material/animation': 'mdc.animation',
  '@material/auto-init': 'mdc.autoInit',
  '@material/base': 'mdc.base',
  '@material/checkbox': 'mdc.checkbox',
  '@material/chips': 'mdc.chips',
  '@material/dialog': 'mdc.dialog',
  '@material/dom': 'mdc.dom',
  '@material/drawer': 'mdc.drawer',
  '@material/floating-label': 'mdc.floatingLabel',
  '@material/form-field': 'mdc.formField',
  '@material/grid-list': 'mdc.gridList',
  '@material/icon-button': 'mdc.iconButton',
  '@material/line-ripple': 'mdc.lineRipple',
  '@material/linear-progress': 'mdc.linearProgress',
  '@material/list': 'mdc.list',
  '@material/menu': 'mdc.menu',
  '@material/menu-surface': 'mdc.menuSurface',
  '@material/notched-outline': 'mdc.notchedOutline',
  '@material/radio': 'mdc.radio',
  '@material/ripple': 'mdc.ripple',
  '@material/select': 'mdc.select',
  '@material/slider': 'mdc.slider',
  '@material/snackbar': 'mdc.snackbar',
  '@material/switch': 'mdc.switch',
  '@material/tab': 'mdc.tab',
  '@material/tab-bar': 'mdc.tabBar',
  '@material/tab-indicator': 'mdc.tabIndicator',
  '@material/tab-scroller': 'mdc.tabScroller',
  '@material/text-field': 'mdc.textField',
  '@material/toolbar': 'mdc.toolbar',
  '@material/top-app-bar': 'mdc.topAppBar',

  '@angular/animations': 'ng.animations',
  '@angular/common': 'ng.common',
  '@angular/common/http': 'ng.common.http',
  '@angular/common/http/testing': 'ng.common.http.testing',
  '@angular/common/testing': 'ng.common.testing',
  '@angular/core': 'ng.core',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/forms': 'ng.forms',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-server': 'ng.platformServer',
  '@angular/router': 'ng.router',

  // Some packages are not really needed for the UMD bundles, but for the missingRollupGlobals rule.
  '@angular/cdk': 'ng.cdk',
  '@angular/cdk-experimental': 'ng.cdkExperimental',
  '@angular/material': 'ng.material',
  '@angular/material-examples': 'ng.materialExamples',
  '@angular/material-experimental': 'ng.materialExperimental',
  '@angular/material-moment-adapter': 'ng.materialMomentAdapter',

  // Include secondary entry-points of the cdk and material packages
  ...rollupCdkEntryPoints,
  ...rollupMatEntryPoints,
  ...rollupCdkExperimentalEntryPoints,
  ...rollupMaterialExperimentalEntryPoints,

  '@angular/cdk/testing/e2e': 'ng.cdk.testing.e2e',

  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};
