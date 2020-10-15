const fs = require('fs-extra');
const glob = require('glob');
const ignore = require('ignore');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');

const {EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, SHARED_PATH, STACKBLITZ_CONFIG_FILENAME} =
    require('./constants');
const BASIC_SOURCE_PATH = path.resolve(SHARED_PATH, 'example_scaffold');

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
  createEmptyExample(exampleName, examplePath, {}, {});

  const sourcePath = options.source !== undefined ? path.resolve(options.source) : BASIC_SOURCE_PATH
  console.log('Copying files from', sourcePath);
  copyExampleFiles(sourcePath, examplePath);

  console.log(`The new "${exampleName}" example has been created.`);
  console.log('Now run "yarn boilerplate:add" to set it up for development.');
}

/**
 * Create the folder and marker files for the new example.
 */
function createEmptyExample(exampleName, examplePath, exampleConfig, stackblitzConfig) {
  ensureExamplePath(examplePath);
  writeExampleConfigFile(examplePath, exampleConfig);
  writeStackBlitzFile(exampleName, examplePath, stackblitzConfig);
}

/**
 * Ensure that the new example folder exists.
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
function writeExampleConfigFile(examplePath, additionalConfig) {
  fs.writeFileSync(
      path.resolve(examplePath, EXAMPLE_CONFIG_FILENAME),
      JSON.stringify(
          {
            ...{/* BASIC CONFIG */},
            ...additionalConfig,
          },
          undefined, 2));
}

/**
 * Write the `stackblitz.json` file into the new example.
 */
function writeStackBlitzFile(exampleName, examplePath, additionalConfig) {
  const config = {
    description: titleize(exampleName),
    files: ['!**/*.d.ts', '!**/*.js', '!**/*.[1,2].*'],
    file: 'src/app/app.component.ts',
    tags: [exampleName.split('-')],
    ...additionalConfig,
  };
  fs.writeFileSync(
      path.resolve(examplePath, STACKBLITZ_CONFIG_FILENAME), JSON.stringify(config, undefined, 2));
}

/**
 * Copy all the files from the `sourcePath`, which are not ignored by the `.gitignore` file in the
 * `EXAMPLES_BASE_PATH`, to the `examplePath`.
 */
function copyExampleFiles(sourcePath, examplePath) {
  const gitignoreFilePath = path.resolve(EXAMPLES_BASE_PATH, '.gitignore');
  const gitignoreFile = fs.readFileSync(gitignoreFilePath, 'utf8');
  const gitignore = ignore().add(gitignoreFile);
  const sourceDir = path.basename(sourcePath);

  // Grab the files in
  const sourceFiles =
      glob.sync('**/*', {
            cwd: sourcePath,
            dot: true,
            ignore: ['**/node_modules/**', '.git/**', ',gitignore'],
            mark: true
          })
          .filter(
              filePath =>
                  !/\/$/.test(filePath))  // this filter removes the folders, leaving only files
          .filter(
              filePath => !gitignore.ignores(path.join(
                  sourceDir,
                  filePath)));  // this filter removes files that match the .gitignore rules
  for (const sourceFile of sourceFiles) {
    console.log(' - ', sourceFile);
    const destPath = path.resolve(examplePath, sourceFile)
    fs.ensureDirSync(path.dirname(destPath));
    fs.copySync(path.resolve(sourcePath, sourceFile), destPath);
  }
}

/**
 * Convert a snake case string to space separated title case string.
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