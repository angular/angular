import {join} from 'path';
import {getSubdirectoryNames} from './secondary-entry-points';
import {buildConfig} from './build-config';

/** Method that converts dash-case strings to a camel-based string. */
export const dashCaseToCamelCase =
  (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/** List of potential secondary entry-points for the cdk package. */
const cdkSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk'));

/** List of potential secondary entry-points for the material package. */
const matSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'lib'));

/** Object with all cdk entry points in the format of Rollup globals. */
const rollupCdkEntryPoints = cdkSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
  globals[`@angular/cdk/${entryPoint}`] = `ng.cdk.${dashCaseToCamelCase(entryPoint)}`;
  return globals;
}, {});

/** Object with all material entry points in the format of Rollup globals. */
const rollupMatEntryPoints = matSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
  globals[`@angular/material/${entryPoint}`] = `ng.material.${dashCaseToCamelCase(entryPoint)}`;
  return globals;
}, {});

/** Map of globals that are used inside of the different packages. */
export const rollupGlobals = {
  'tslib': 'tslib',
  'moment': 'moment',

  '@angular/animations': 'ng.animations',
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/common/http': 'ng.common.http',
  '@angular/router': 'ng.router',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-server': 'ng.platformServer',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/common/testing': 'ng.common.testing',
  '@angular/common/http/testing': 'ng.common.http.testing',

  // Some packages are not really needed for the UMD bundles, but for the missingRollupGlobals rule.
  '@angular/material-examples': 'ng.materialExamples',
  '@angular/material': 'ng.material',
  '@angular/material-moment-adapter': 'ng.materialMomentAdapter',
  '@angular/cdk': 'ng.cdk',

  // Include secondary entry-points of the cdk and material packages
  ...rollupCdkEntryPoints,
  ...rollupMatEntryPoints,

  'rxjs': 'Rx',
  'rxjs/operators': 'Rx.operators',
};
