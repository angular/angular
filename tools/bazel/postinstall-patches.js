/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches. Similarly
 * to Bazel's "patches" attribute on repository fetch rules.
 */

const shelljs = require('shelljs');
const path = require('path');

shelljs.set('-e');
shelljs.cd(path.join(__dirname, '../..'));

// Workaround for https://github.com/angular/angular/issues/18810.
shelljs.exec('ngc -p angular-tsconfig.json');

// Workaround for https://github.com/angular/angular/issues/30586. It's not possible to
// enable tsickle decorator processing without enabling import rewriting to closure.
// This replacement allows us to enable decorator processing without rewriting imports.
shelljs.sed(
    '-i', /(this\.transformTypesToClosure) = bazelOpts\.tsickle;/, '$1 = false;',
    'node_modules/@bazel/typescript/internal/tsc_wrapped/compiler_host.js');
shelljs.sed(
    '-i', 'bazelOpts\.tsickleExternsPath', 'null',
    'node_modules/@bazel/typescript/internal/tsc_wrapped/tsc_wrapped.js');

// Workaround for https://github.com/angular/angular/issues/32389. We need to ensure
// that tsickle is available for esm5 output re-compilations.
shelljs.sed(
    '-i', '@npm//@bazel/typescript/bin:tsc_wrapped',
    '@angular_material//tools/bazel:tsc_wrapped_with_tsickle',
    'node_modules/@angular/bazel/src/esm5.bzl');

// Workaround for https://github.com/angular/angular/issues/32603. Note that we don't
// want to apply the patch if it has been applied already.
if (!shelljs.test('-f', 'node_modules/@angular/bazel/src/ng_package/rollup_bin.js')) {
  shelljs.cat(path.join(__dirname, './rollup_windows_arguments.patch')).exec('patch -p0');
}
