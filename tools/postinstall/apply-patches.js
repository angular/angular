/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches. Similarly
 * to Bazel's "patches" attribute on repository fetch rules.
 */

const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Version of the post install patch. Needs to be incremented when
 * existing patches or edits have been modified.
 */
const PATCH_VERSION = 16;

/** Path to the project directory. */
const projectDir = path.join(__dirname, '../..');

/**
 * Object that maps a given file path to a list of patches that need to be
 * applied.
 */
const PATCHES_PER_FILE = {};

const PATCH_MARKER_FILE_PATH = path.join(projectDir, 'node_modules/_ng-comp-patch-marker.json');

/** Registry of applied patches. */
let registry = null;

main();

async function main() {
  shelljs.set('-e');
  shelljs.cd(projectDir);

  registry = await readAndValidatePatchMarker();

  // Apply all patches synchronously.
  try {
    applyPatches();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  // Write the patch marker file so that we don't accidentally re-apply patches
  // in subsequent Yarn installations.
  fs.writeFileSync(PATCH_MARKER_FILE_PATH, JSON.stringify(registry, null, 2));
}

function applyPatches() {
  // Switches the devmode output for Angular Bazel to ES2020 target and module.
  applyPatch(path.join(__dirname, './devmode-es2020-bazel.patch'));

  // Similar to the `rxjs` performance improvement below, see:
  // https://github.com/angular/angular/pull/46187.
  shelljs.rm('-rf', ['node_modules/@angular/common/locales']);

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
    if (isFilePatched(filePath)) {
      console.info('File ' + filePath + ' is already patched. Skipping..');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const patchFunctions = PATCHES_PER_FILE[filePath];

    console.info(`Patching file ${filePath} with ${patchFunctions.length} edits..`);
    patchFunctions.forEach(patchFn => (content = patchFn(content)));

    fs.writeFileSync(filePath, content, 'utf8');
    captureFileAsPatched(filePath);
  });
}

/**
 * Applies the given patch if not done already. Throws if the patch
 * does not apply cleanly.
 */
function applyPatch(patchFile) {
  if (isFilePatched(patchFile)) {
    console.info('Patch: ' + patchFile + ' has been applied already. Skipping..');
    return;
  }

  shelljs.cat(patchFile).exec('patch -p0');
  captureFileAsPatched(patchFile);
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
      throw Error(
        `Could not perform replacement in: ${filePath}.\n` + `Searched for pattern: ${search}`,
      );
    }
    return newFileContent;
  });
}

/** Gets a project unique id for a given file path. */
function getIdForFile(filePath) {
  return path.relative(projectDir, filePath).replace(/\\/g, '/');
}

/** Marks the specified file as patched. */
function captureFileAsPatched(filePath) {
  registry.patched[getIdForFile(filePath)] = true;
}

/** Checks whether the given file is patched. */
function isFilePatched(filePath) {
  return registry.patched[getIdForFile(filePath)] === true;
}

/**
 * Reads the patch marker from the node modules if present. Validates that applied
 * patches are up-to-date. If not, an error will be reported with a prompt that
 * allows convenient clean up of node modules in case those need to be cleaned up.
 */
async function readAndValidatePatchMarker() {
  if (!shelljs.test('-e', PATCH_MARKER_FILE_PATH)) {
    return {version: PATCH_VERSION, patched: {}};
  }
  const registry = JSON.parse(shelljs.cat(PATCH_MARKER_FILE_PATH));
  // If the node modules are up-to-date, return the parsed patch registry.
  if (registry.version === PATCH_VERSION) {
    return registry;
  }
  // Print errors that explain the current situation where patches from another
  // postinstall patch revision are applied in the current node modules.
  if (registry.version < PATCH_VERSION) {
    console.error(chalk.red('Your node modules have been patched by a previous Yarn install.'));
    console.error(chalk.red('The postinstall patches have changed since then, and in order to'));
    console.error(chalk.red('apply the most recent patches, your node modules need to be cleaned'));
    console.error(chalk.red('up from past changes.'));
  } else {
    console.error(chalk.red('Your node modules already have patches applied from a more recent.'));
    console.error(chalk.red('revision of the components repository. In order to be able to apply'));
    console.error(chalk.red('patches for the current revision, your node modules need to be'));
    console.error(chalk.red('cleaned up.'));
  }

  let cleanupModules = true;

  // Do not prompt if there is no TTY. Inquirer does not skip in non-tty environments.
  // TODO: Remove once inquirer has been updated to v8.x where TTY is respected.
  if (process.stdin.isTTY) {
    cleanupModules = (
      await inquirer.prompt({
        name: 'result',
        type: 'confirm',
        message: 'Clean up node modules automatically?',
        default: false,
      })
    ).result;
  }

  if (cleanupModules) {
    // This re-runs Yarn with `--check-files` mode. The postinstall will rerun afterwards,
    // so we can exit with a zero exit-code here.
    shelljs.exec('yarn --check-files --frozen-lockfile', {cwd: projectDir});
    process.exit(0);
  } else {
    process.exit(1);
  }
}
