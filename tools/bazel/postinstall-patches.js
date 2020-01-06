/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches. Similarly
 * to Bazel's "patches" attribute on repository fetch rules.
 */

const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');

/**
 * Version of the post install patch. Needs to be incremented when patches
 * have been added or removed.
 */
const PATCH_VERSION = 1;

/** Path to the project directory. */
const projectDir = path.join(__dirname, '../..');

/**
 * Object that maps a given file path to a list of patches that need to be
 * applied.
 */
const PATCHES_PER_FILE = {};

shelljs.set('-e');
shelljs.cd(projectDir);

// Workaround for https://github.com/angular/angular/issues/18810.
shelljs.exec('ngc -p angular-tsconfig.json');

// Temporary patch to make @angular/bazel compatible with rules_nodejs 1.0.0.
// This is needed to resolve the dependency sandwich between angular components and
// repo framework. It can be removed with a future @angular/bazel update.
applyPatch(path.join(__dirname, './angular_bazel_rules_nodejs_1.0.0.patch'));

// Temporary patch for ts-api-guardian to be compatible with rules_nodejs 1.0.0.
// TODO: a new ts-api-guardian release is needed.
applyPatch(path.join(__dirname, './ts_api_guardian_rules_nodejs_1.0.0.patch'));

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
  var indexFile = files.find(f => f.endsWith('/public-api.ts'));
`,
    'node_modules/@angular/compiler-cli/src/metadata/bundle_index_host.js');
searchAndReplace(
    'var resolvedEntryPoint = null;', `
  var resolvedEntryPoint = tsFiles.find(f => f.endsWith('/public-api.ts')) || null;
`,
    'node_modules/@angular/compiler-cli/src/ngtsc/entry_point/src/logic.js');

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
applyPatch(path.join(__dirname, './flat_module_factory_resolution.patch'));
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
applyPatch(path.join(__dirname, './manifest_externs_hermeticity.patch'));

// Workaround for using Ngcc with "--create-ivy-entry-points". This is a special
// issue for our repository since we want to run Ivy by default in the module resolution,
// but still have the option to opt-out by not using the compiled ngcc entry-points.
searchAndReplace(`[formatProperty + "_ivy_ngcc"]`, '[formatProperty]',
  'node_modules/@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer.js');

// Workaround for https://github.com/angular/angular/issues/33452:
searchAndReplace(/angular_compiler_options = {/, `$&
        "strictTemplates": True,
        "strictDomLocalRefTypes ": False,
        "strictAttributeTypes": False,
        "strictDomEventTypes": False,`, 'node_modules/@angular/bazel/src/ng_module.bzl');

// More info in https://github.com/angular/angular/pull/33786
shelljs.rm('-rf', [
  'node_modules/rxjs/add/',
  'node_modules/rxjs/observable/',
  'node_modules/rxjs/operator/',
  // rxjs/operators is a public entry point that also contains files to support legacy deep import
  // paths, so we need to preserve index.* and package.json files that are required for module
  // resolution.
  'node_modules/rxjs/operators/!(index.*|package.json)',
  'node_modules/rxjs/scheduler/',
  'node_modules/rxjs/symbol/',
  'node_modules/rxjs/util/',
  'node_modules/rxjs/internal/Rx.d.ts',
  'node_modules/rxjs/AsyncSubject.*',
  'node_modules/rxjs/BehaviorSubject.*',
  'node_modules/rxjs/InnerSubscriber.*',
  'node_modules/rxjs/interfaces.*',
  'node_modules/rxjs/Notification.*',
  'node_modules/rxjs/Observable.*',
  'node_modules/rxjs/Observer.*',
  'node_modules/rxjs/Operator.*',
  'node_modules/rxjs/OuterSubscriber.*',
  'node_modules/rxjs/ReplaySubject.*',
  'node_modules/rxjs/Rx.*',
  'node_modules/rxjs/Scheduler.*',
  'node_modules/rxjs/Subject.*',
  'node_modules/rxjs/SubjectSubscription.*',
  'node_modules/rxjs/Subscriber.*',
  'node_modules/rxjs/Subscription.*',
]);

// Apply all collected patches on a per-file basis. This is necessary because
// multiple edits might apply to the same file, and we only want to mark a given
// file as patched once all edits have been made.
Object.keys(PATCHES_PER_FILE).forEach(filePath => {
  if (hasFileBeenPatched(filePath)) {
    console.info('File ' + filePath + ' is already patched. Skipping..');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const patchFunctions = PATCHES_PER_FILE[filePath];

  console.info(`Patching file ${filePath} with ${patchFunctions.length} edits..`);
  patchFunctions.forEach(patchFn => content = patchFn(content));

  fs.writeFileSync(filePath, content, 'utf8');
  writePatchMarker(filePath);
});

/**
 * Applies the given patch if not done already. Throws if the patch does
 * not apply cleanly.
 */
function applyPatch(patchFile) {
  const patchMarkerFileName = `${path.basename(patchFile)}.patch_marker`;
  const patchMarkerPath = path.join(projectDir, 'node_modules/', patchMarkerFileName);

  if (hasFileBeenPatched(patchMarkerPath)) {
    return;
  }

  writePatchMarker(patchMarkerPath);
  shelljs.cat(patchFile).exec('patch -p0');
}

/**
 * Schedules an edit where the specified file is read and its content replaced based on
 * the given search expression and corresponding replacement. Throws if no changes were made
 * and the patch has not been applied.
 */
function searchAndReplace(search, replacement, relativeFilePath) {
  const filePath = path.join(projectDir, relativeFilePath);
  const fileEdits = PATCHES_PER_FILE[filePath] || (PATCHES_PER_FILE[filePath] = []);

  fileEdits.push(originalContent => {
    const newFileContent = originalContent.replace(search, replacement);
    if (originalContent === newFileContent) {
      throw Error(`Could not perform replacement in: ${filePath}.`);
    }
    return newFileContent;
  });
}

/** Marks the specified file as patched. */
function writePatchMarker(filePath) {
  new shelljs.ShellString(PATCH_VERSION).to(`${filePath}.patch_marker`);
}

/** Checks if the given file has been patched. */
function hasFileBeenPatched(filePath) {
  const markerFilePath = `${filePath}.patch_marker`;
  return shelljs.test('-e', markerFilePath) &&
      shelljs.cat(markerFilePath).toString().trim() === `${PATCH_VERSION}`;
}
