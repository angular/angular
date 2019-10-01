/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches. Similarly
 * to Bazel's "patches" attribute on repository fetch rules.
 */

const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');

/** Path to the project directory. */
const projectDir = path.join(__dirname, '../..');

shelljs.set('-e');
shelljs.cd(projectDir);

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
searchAndReplace(
    /(this\.transformTypesToClosure) = bazelOpts\.tsickle;/, '$1 = false;',
    'node_modules/@bazel/typescript/internal/tsc_wrapped/compiler_host.js');

// Workaround for https://github.com/angular/angular/issues/32389. We need to ensure
// that tsickle is available for esm5 output re-compilations.
searchAndReplace(
    '@npm//@bazel/typescript/bin:tsc_wrapped',
    '@angular_material//tools/bazel:tsc_wrapped_with_tsickle',
    'node_modules/@angular/bazel/src/esm5.bzl');

// Workaround for: https://github.com/angular/angular/issues/32651. We just do not
// generate re-exports for secondary entry-points. Similar to what "ng-packagr" does.
searchAndReplace(
    /(?!function\s+)createMetadataReexportFile\([^)]+\);/, '',
    'node_modules/@angular/bazel/src/ng_package/packager.js');
searchAndReplace(
    /(?!function\s+)createTypingsReexportFile\([^)]+\);/, '',
    'node_modules/@angular/bazel/src/ng_package/packager.js');

// Workaround for: https://github.com/angular/angular/pull/32650
searchAndReplace(
    'var indexFile;', `
  var publicApiFile = files.find(f => f.endsWith('/public-api.ts'));
  var moduleFile = files.find(f => f.endsWith('/module.ts'));
  var indexFile = publicApiFile || moduleFile;
`,
    'node_modules/@angular/compiler-cli/src/metadata/bundle_index_host.js');
searchAndReplace(
    'var resolvedEntryPoint = null;', `
  var publicApiFile = tsFiles.find(f => f.endsWith('/public-api.ts'));
  var moduleFile = tsFiles.find(f => f.endsWith('/module.ts'));
  var resolvedEntryPoint = publicApiFile || moduleFile || null;
`,
    'node_modules/@angular/compiler-cli/src/ngtsc/entry_point/src/logic.js');

// Workaround for https://github.com/angular/angular/issues/32603.
shelljs.cat(path.join(__dirname, './rollup_windows_arguments.patch')).exec('patch -p0');

// Workaround for: https://hackmd.io/MlqFp-yrSx-0mw4rD7dnQQ?both. We only want to discard
// the metadata of files in the bazel managed node modules. That way we keep the default
// behavior of ngc-wrapped except for dependencies between sources of the library. This makes
// the "generateCodeForLibraries" flag more accurate in the Bazel environment where previous
// compilations should not be treated as external libraries. Read more about this in the document.
searchAndReplace(
    /if \((this\.options\.generateCodeForLibraries === false)/, `
  const fs = require('fs');
  const hasFlatModuleBundle = fs.existsSync(filePath.replace('.d.ts', '.metadata.json'));
  if ((filePath.includes('node_modules/') || !hasFlatModuleBundle) && $1`,
    'node_modules/@angular/compiler-cli/src/transformers/compiler_host.js');
shelljs.cat(path.join(__dirname, './flat_module_factory_resolution.patch')).exec('patch -p0');
// The three replacements below ensure that metadata files can be read by NGC and
// that metadata files are collected as Bazel action inputs.
searchAndReplace(
    /(const NGC_ASSETS = \/[^(]+\()([^)]*)(\).*\/;)/, '$1$2|metadata.json$3',
    'node_modules/@angular/bazel/src/ngc-wrapped/index.js');
searchAndReplace(
    /^((\s*)results = depset\(dep.angular.summaries, transitive = \[results]\))$/m,
    `$1#\n$2results = depset(dep.angular.metadata, transitive = [results])`,
    'node_modules/@angular/bazel/src/ng_module.bzl');
searchAndReplace(
    /^((\s*)results = depset\(target.angular.summaries if hasattr\(target, "angular"\) else \[]\))$/m,
    `$1#\n$2results = depset(target.angular.metadata if hasattr(target, "angular") else [], transitive = [results])`,
    'node_modules/@angular/bazel/src/ng_module.bzl');
// Ensure that "metadata" of transitive dependencies can be collected.
searchAndReplace(
    /("metadata": outs.metadata),/,
    `$1 + [m for dep in ctx.attr.deps if hasattr(dep, "angular") for m in dep.angular.metadata],`,
    'node_modules/@angular/bazel/src/ng_module.bzl');

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1208.
shelljs.cat(path.join(__dirname, './manifest_externs_hermeticity.patch')).exec('patch -p0');

// Patches https://github.com/angular/angular/pull/32889 into our "@angular/bazel"
// installation. We need to patch it because otherwise the @angular/bazel PR cannot land
// as the "component-unit-tests" job will fail due to not being updated to 0.38.0. Either
// the framework or component repo needs to be patched to unblock the cyclic dependency.
shelljs.cat(path.join(__dirname, './angular_bazel_0.38.0.patch')).exec('patch -p0');

/**
 * Reads the specified file and replaces matches of the search expression
 * with the given replacement. Throws if no changes were made.
 */
function searchAndReplace(search, replacement, relativeFilePath) {
  const filePath = path.join(projectDir, relativeFilePath);
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const newFileContent = originalContent.replace(search, replacement);

  if (originalContent === newFileContent) {
    throw Error(`Could not perform replacement in: ${filePath}.`);
  }

  fs.writeFileSync(filePath, newFileContent, 'utf8');
}
