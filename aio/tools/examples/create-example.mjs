import fs from 'fs-extra';
import glob from 'glob';
import ignore from 'ignore';
import path from 'canonical-path';
import shelljs from 'shelljs';
import yargs from 'yargs';
import buildozer from '@bazel/buildozer';

import {
  RUNFILES_ROOT,
  getExamplesBasePath,
  getSharedPath,
  EXAMPLE_CONFIG_FILENAME,
  STACKBLITZ_CONFIG_FILENAME,
} from './constants.mjs';

// BUILD_WORKSPACE_DIRECTORY is set by Bazel when calling `bazel run` and points to the
// root of the source tree (e.g., for creating a new example in the source tree). Otherwise,
// we are in a test so use the runfiles root.
const PROJECT_ROOT = path.resolve(process.env.BUILD_WORKSPACE_DIRECTORY || RUNFILES_ROOT);
const EXAMPLES_BASE_PATH = getExamplesBasePath(PROJECT_ROOT);
const SHARED_PATH = getSharedPath(PROJECT_ROOT);

const BASIC_SOURCE_PATH = path.resolve(SHARED_PATH, 'example-scaffold');

shelljs.set('-e');

export function main() {
  const options = yargs(process.argv.slice(2))
    .command(
      '$0 <name> [source]',
      [
        'Create a new <name> example.',
        '',
        'If [source] is provided then the relevant files from the CLI project at that path are copied into the example.',
      ].join('\n')
    )
    .strict()
    .version(false).argv;

  const exampleName = options.name;
  const examplePath = path.resolve(EXAMPLES_BASE_PATH, exampleName);

  console.log('Creating new example at', examplePath);
  createEmptyExample(exampleName, examplePath);

  const sourcePath =
    options.source !== undefined
      ? path.resolve(EXAMPLES_BASE_PATH, options.source)
      : BASIC_SOURCE_PATH;
  console.log('Copying files from', sourcePath);
  copyExampleFiles(sourcePath, examplePath, exampleName);

  buildozer.runWithOptions(
    [
      {
        commands: [`set name ${exampleName}`],
        targets: [`//aio/content/examples/${exampleName}:%docs_example`],
      },
    ],
    {cwd: PROJECT_ROOT}
  );

  console.log(`The new "${exampleName}" example has been created.`);
  console.log(
    `To include this example, add a "${exampleName}" entry in aio/content/examples/examples.bzl`
  );
  console.log(
    'You can find more info on working with docs examples in aio/tools/examples/README.md.'
  );
}

/**
 * Create the directory and marker files for the new example.
 */
export function createEmptyExample(exampleName, examplePath) {
  validateExampleName(exampleName);
  ensureExamplePath(examplePath);
  writeExampleConfigFile(examplePath);
  writeStackBlitzFile(exampleName, examplePath);
}

function validateExampleName(exampleName) {
  if (/\s/.test(exampleName)) {
    throw new Error(`Unable to create example. The example name contains spaces: '${exampleName}'`);
  }
}

/**
 * Ensure that the new example directory exists.
 */
export function ensureExamplePath(examplePath) {
  if (fs.existsSync(examplePath)) {
    throw new Error(
      `Unable to create example. The path to the new example already exists: ${examplePath}`
    );
  }
  fs.ensureDirSync(examplePath);
}

/**
 * Write the `example-config.json` file to the new example.
 */
export function writeExampleConfigFile(examplePath) {
  fs.writeFileSync(path.resolve(examplePath, EXAMPLE_CONFIG_FILENAME), '');
}

/**
 * Write the `stackblitz.json` file into the new example.
 */
export function writeStackBlitzFile(exampleName, examplePath) {
  const config = {
    description: titleize(exampleName),
    files: ['!**/*.d.ts', '!**/*.js', '!**/*.[1,2].*'],
    tags: [exampleName.split('-')],
  };
  fs.writeFileSync(
    path.resolve(examplePath, STACKBLITZ_CONFIG_FILENAME),
    JSON.stringify(config, null, 2) + '\n'
  );
}

/**
 * Copy all the files from the `sourcePath` to the `examplePath`, except for files
 * ignored by the source example.
 */
export function copyExampleFiles(sourcePath, examplePath, exampleName) {
  const gitIgnoreSource = getGitIgnore(sourcePath);

  // Grab the files in the source folder and filter them based on the gitignore rules.
  const sourceFiles = glob
    .sync('**/*', {
      cwd: sourcePath,
      dot: true,
      ignore: ['**/node_modules/**', '.git/**', '.gitignore'],
      mark: true,
    })
    // Filter out the directories, leaving only files
    .filter((filePath) => !/\/$/.test(filePath))
    // Filter out files that match the source directory .gitignore rules
    .filter((filePath) => !gitIgnoreSource.ignores(filePath));

  for (const sourceFile of sourceFiles) {
    console.log(' - ', sourceFile);
    const destPath = path.resolve(examplePath, sourceFile);
    fs.ensureDirSync(path.dirname(destPath));
    fs.copySync(path.resolve(sourcePath, sourceFile), destPath);
  }
}

function getGitIgnore(directory) {
  const gitIgnoreMatcher = ignore();
  const gitignoreFilePath = path.resolve(directory, '.gitignore');
  if (fs.existsSync(gitignoreFilePath)) {
    const gitignoreFile = fs.readFileSync(gitignoreFilePath, 'utf8');
    gitIgnoreMatcher.add(gitignoreFile);
  }
  return gitIgnoreMatcher;
}

/**
 * Convert a kebab-case string to space separated Title Case string.
 */
export function titleize(input) {
  return input.replace(
    /(-|^)(.)/g,
    (_, pre, char) => `${pre === '-' ? ' ' : ''}${char.toUpperCase()}`
  );
}
