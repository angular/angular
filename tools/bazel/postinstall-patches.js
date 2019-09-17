/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches. Similarly
 * to Bazel's "patches" attribute on repository fetch rules.
 */

const shelljs = require('shelljs');
const path = require('path');

shelljs.set('-e');
shelljs.cd(path.join(__dirname, '../..'));

// Do not apply postinstall patches when running "postinstall" outside. The
// "generate_build_file.js" file indicates that we run in Bazel managed node modules.
if (!shelljs.test('-e', 'generate_build_file.js')) {
  return;
}

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

// Workaround for: https://github.com/angular/angular/issues/32651. We just do not
// generate re-exports for secondary entry-points. Similar to what "ng-packagr" does.
shelljs.sed('-i', /(?!function\s+)createMetadataReexportFile\([^)]+\);/,
    '', 'node_modules/@angular/bazel/src/ng_package/packager.js');
shelljs.sed('-i', /(?!function\s+)createTypingsReexportFile\([^)]+\);/,
    '', 'node_modules/@angular/bazel/src/ng_package/packager.js');

// Workaround for: https://github.com/angular/angular/pull/32650
shelljs.sed('-i', 'var indexFile;', `
  var publicApiFile = files.find(f => f.endsWith('/public-api.ts'));
  var moduleFile = files.find(f => f.endsWith('/module.ts'));
  var indexFile = publicApiFile || moduleFile;
`, 'node_modules/@angular/compiler-cli/src/metadata/bundle_index_host.js');
shelljs.sed('-i', 'var resolvedEntryPoint = null;', `
  var publicApiFile = tsFiles.find(f => f.endsWith('/public-api.ts'));
  var moduleFile = tsFiles.find(f => f.endsWith('/module.ts'));
  var resolvedEntryPoint = publicApiFile || moduleFile || null;
`, 'node_modules/@angular/compiler-cli/src/ngtsc/entry_point/src/logic.js');

// Workaround for https://github.com/angular/angular/issues/32603. Note that we don't
// want to apply the patch if it has been applied already.
if (!shelljs.test('-f', 'node_modules/@angular/bazel/src/ng_package/rollup_bin.js')) {
  shelljs.cat(path.join(__dirname, './rollup_windows_arguments.patch')).exec('patch -p0');
}

// Workaround for: https://hackmd.io/MlqFp-yrSx-0mw4rD7dnQQ?both. We only want to discard
// the metadata of files in the bazel managed node modules. That way we keep the default
// behavior of ngc-wrapped except for dependencies between sources of the library. This makes
// the "generateCodeForLibraries" flag more accurate in the Bazel environment where previous
// compilations should not be treated as external libraries. Read more about this in the document.
shelljs.sed('-i', /if \((this\.options\.generateCodeForLibraries === false)/, `
  const fs = require('fs');
  const hasFlatModuleBundle = fs.existsSync(filePath.replace('.d.ts', '.metadata.json'));
  if ((filePath.includes('node_modules/') || !hasFlatModuleBundle) && $1`,
  'node_modules/@angular/compiler-cli/src/transformers/compiler_host.js');
shelljs.cat(path.join(__dirname, './flat_module_factory_resolution.patch')).exec('patch -p0');
// The three replacements below ensure that metadata files can be read by NGC and
// that metadata files are collected as Bazel action inputs.
shelljs.sed('-i', /(const NGC_ASSETS = \/[^(]+\()([^)]*)(\).*\/;)/, '$1$2|metadata.json$3',
  'node_modules/@angular/bazel/src/ngc-wrapped/index.js');
shelljs.sed('-i', /^((\s*)results = depset\(dep.angular.summaries, transitive = \[results]\))$/,
  `$1#\n$2results = depset(dep.angular.metadata, transitive = [results])`,
  'node_modules/@angular/bazel/src/ng_module.bzl');
shelljs.sed('-i',
  /^((\s*)results = depset\(target.angular.summaries if hasattr\(target, "angular"\) else \[]\))$/,
  `$1#\n$2results = depset(target.angular.metadata if hasattr(target, "angular") else [], transitive = [results])`,
  'node_modules/@angular/bazel/src/ng_module.bzl');
// Ensure that "metadata" of transitive dependencies can be collected.
shelljs.sed('-i', /("metadata": outs.metadata),/,
  `$1 + [m for dep in ctx.attr.deps if hasattr(dep, "angular") for m in dep.angular.metadata],`,
  'node_modules/@angular/bazel/src/ng_module.bzl');
