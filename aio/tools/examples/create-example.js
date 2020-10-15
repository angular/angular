const fs = require('fs-extra');
const glob = require('glob');
const ignore = require('ignore');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');

const {EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, SHARED_PATH, STACKBLITZ_CONFIG_FILENAME} =
    require('./constants');
const BASIC_SOURCE_PATH = path.resolve(SHARED_PATH, 'example-scaffold');

shelljs.set('-e');

if (require.main === module) {
  const options =
      yargs(process.argv.slice(2))
          .command(
              '$0 <name> [source]',
              [
                'Create a new <name> example.',
                '',
                'If [source] is provided then the relevant files from the CLI project at that path are copied into the example.',
              ].join('\n'))
          .strict()
          .version(false)
          .argv;

  const exampleName = options.name;
  const examplePath = path.resolve(EXAMPLES_BASE_PATH, exampleName);

  console.log('Creating new example at', examplePath);
  createEmptyExample(exampleName, examplePath);

  const sourcePath =
      options.source !== undefined ? path.resolve(options.source) : BASIC_SOURCE_PATH;
  console.log('Copying files from', sourcePath);
  copyExampleFiles(sourcePath, examplePath, exampleName);

  console.log(`The new "${exampleName}" example has been created.`);
  console.log('Now run "yarn boilerplate:add" to set it up for development.');
  console.log(
      'You can find more info on working with docs examples in aio/tools/examples/README.md.')
}

/**
 * Create the directory and marker files for the new example.
 */
function createEmptyExample(exampleName, examplePath) {
  ensureExamplePath(examplePath);
  writeExampleConfigFile(examplePath);
  writeStackBlitzFile(exampleName, examplePath);
}

/**
 * Ensure that the new example directory exists.
 */
function ensureExamplePath(examplePath) {
  if (fs.existsSync(examplePath)) {
    throw new Error(
        `Unable to create example. The path to the new example already exists: ${examplePath}`);
  }
  fs.ensureDirSync(examplePath);
}

/**
 * Write the `example-config.json` file to the new example.
 */
function writeExampleConfigFile(examplePath) {
  fs.writeFileSync(path.resolve(examplePath, EXAMPLE_CONFIG_FILENAME), '');
}

/**
 * Write the `stackblitz.json` file into the new example.
 */
function writeStackBlitzFile(exampleName, examplePath) {
  const config = {
    description: titleize(exampleName),
    files: ['!**/*.d.ts', '!**/*.js', '!**/*.[1,2].*'],
    tags: [exampleName.split('-')]
  };
  fs.writeFileSync(
      path.resolve(examplePath, STACKBLITZ_CONFIG_FILENAME),
      JSON.stringify(config, null, 2) + '\n');
}

/**
 * Copy all the files from the `sourcePath`, which are not ignored by the `.gitignore` file in the
 * `EXAMPLES_BASE_PATH`, to the `examplePath`.
 */
function copyExampleFiles(sourcePath, examplePath, exampleName) {
  const gitIgnoreSource = getGitIgnore(sourcePath);
  const gitIgnoreExamples = getGitIgnore(EXAMPLES_BASE_PATH);

  // Grab the files in the source folder and filter them based on the gitignore rules.
  const sourceFiles =
      glob.sync('**/*', {
            cwd: sourcePath,
            dot: true,
            ignore: ['**/node_modules/**', '.git/**', '.gitignore'],
            mark: true
          })
          // Filter out the directories, leaving only files
          .filter(filePath => !/\/$/.test(filePath))
          // Filter out files that match the source directory .gitignore rules
          .filter(filePath => !gitIgnoreSource.ignores(filePath))
          // Filter out files that match the examples directory .gitignore rules
          .filter(filePath => !gitIgnoreExamples.ignores(path.join(exampleName, filePath)));

  for (const sourceFile of sourceFiles) {
    console.log(' - ', sourceFile);
    const destPath = path.resolve(examplePath, sourceFile)
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
function titleize(input) {
  return input.replace(
      /(-|^)(.)/g, (_, pre, char) => `${pre === '-' ? ' ' : ''}${char.toUpperCase()}`);
}

exports.createEmptyExample = createEmptyExample;
exports.ensureExamplePath = ensureExamplePath;
exports.writeExampleConfigFile = writeExampleConfigFile;
exports.writeStackBlitzFile = writeStackBlitzFile;
exports.copyExampleFiles = copyExampleFiles;
exports.titleize = titleize;