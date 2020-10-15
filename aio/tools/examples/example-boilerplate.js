const fs = require('fs-extra');
const glob = require('glob');
const ignore = require('ignore');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');
const {EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, SHARED_PATH} = require('./constants');

const SHARED_NODE_MODULES_PATH = path.resolve(SHARED_PATH, 'node_modules');

const BOILERPLATE_BASE_PATH = path.resolve(SHARED_PATH, 'boilerplate');
const BOILERPLATE_CLI_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'cli');
const BOILERPLATE_COMMON_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'common');
const BOILERPLATE_VIEWENGINE_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'viewengine');

class ExampleBoilerPlate {
  /**
   * Add boilerplate files to all the examples
   */
  add(viewengine = false) {
    // Get all the examples folders, indicated by those that contain a `example-config.json` file
    const exampleFolders =
        this.getFoldersContaining(EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, 'node_modules');
    const gitignore = ignore().add(fs.readFileSync(path.resolve(BOILERPLATE_BASE_PATH, '.gitignore'), 'utf8'));
    const isPathIgnored = absolutePath => gitignore.ignores(path.relative(BOILERPLATE_BASE_PATH, absolutePath));

    if (!fs.existsSync(SHARED_NODE_MODULES_PATH)) {
      throw new Error(
          `The shared node_modules folder for the examples (${SHARED_NODE_MODULES_PATH}) is missing.\n` +
          'Perhaps you need to run "yarn example-use-npm" or "yarn example-use-local" to install the dependencies?');
    }

    if (!viewengine) {
      shelljs.exec(`yarn --cwd ${SHARED_PATH} ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points`);
    }

    exampleFolders.forEach(exampleFolder => {
      const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));

      // Link the node modules - requires admin access (on Windows) because it adds symlinks
      const destinationNodeModules = path.resolve(exampleFolder, 'node_modules');
      fs.ensureSymlinkSync(SHARED_NODE_MODULES_PATH, destinationNodeModules);

      const boilerPlateType = exampleConfig.projectType || 'cli';
      const boilerPlateBasePath = path.resolve(BOILERPLATE_BASE_PATH, boilerPlateType);

      // All example types other than `cli` and `systemjs` are based on `cli`. Copy over the `cli`
      // boilerplate files first.
      // (Some of these files might be later overwritten by type-specific files.)
      if (boilerPlateType !== 'cli' && boilerPlateType !== 'systemjs') {
        this.copyDirectoryContents(BOILERPLATE_CLI_PATH, exampleFolder, isPathIgnored);
      }

      // Copy the type-specific boilerplate files.
      this.copyDirectoryContents(boilerPlateBasePath, exampleFolder, isPathIgnored);

      // Copy the common boilerplate files (unless explicitly not used).
      if (exampleConfig.useCommonBoilerplate !== false) {
        this.copyDirectoryContents(BOILERPLATE_COMMON_PATH, exampleFolder, isPathIgnored);
      }

      // Copy ViewEngine (pre-Ivy) specific files
      if (viewengine) {
        const veBoilerPlateType = boilerPlateType === 'systemjs' ? 'systemjs' : 'cli';
        const veBoilerPlateBasePath = path.resolve(BOILERPLATE_VIEWENGINE_PATH, veBoilerPlateType);
        this.copyDirectoryContents(veBoilerPlateBasePath, exampleFolder, isPathIgnored);
      }
    });
  }

  /**
   * Remove all the boilerplate files from all the examples
   */
  remove() { shelljs.exec('git clean -xdfq', {cwd: EXAMPLES_BASE_PATH}); }

  main() {
    yargs.usage('$0 <cmd> [args]')
        .command('add', 'add the boilerplate to each example', yrgs => this.add(yrgs.argv.viewengine))
        .command('remove', 'remove the boilerplate from each example', () => this.remove())
        .demandCommand(1, 'Please supply a command from the list above')
        .argv;
  }

  getFoldersContaining(basePath, filename, ignore) {
    const pattern = path.resolve(basePath, '**', filename);
    const ignorePattern = path.resolve(basePath, '**', ignore, '**');
    return glob.sync(pattern, {ignore: [ignorePattern]}).map(file => path.dirname(file));
  }

  loadJsonFile(filePath) { return fs.readJsonSync(filePath, {throws: false}) || {}; }

  copyDirectoryContents(srcDir, dstDir, isPathIgnored) {
    shelljs.ls('-Al', srcDir).forEach(stat => {
      const srcPath = path.resolve(srcDir, stat.name);
      const dstPath = path.resolve(dstDir, stat.name);

      if (isPathIgnored(srcPath)) {
        // `srcPath` is ignored (e.g. by a `.gitignore` file): Ignore it.
        return;
      }

      if (stat.isDirectory()) {
        // `srcPath` is a directory: Recursively copy it to `dstDir`.
        shelljs.mkdir('-p', dstPath);
        return this.copyDirectoryContents(srcPath, dstPath, isPathIgnored);
      }

      // `srcPath` is a file: Copy it to `dstDir`.
      // (Also make the file non-writable to avoid accidental editing of boilerplate files).
      if (shelljs.test('-f', dstPath)) {
        // If the file already exists, ensure it is writable (so it can be overwritten).
        shelljs.chmod(666, dstPath);
      }
      shelljs.cp(srcPath, dstDir);
      shelljs.chmod(444, dstPath);
    });
  }
}

module.exports = new ExampleBoilerPlate();

// If this file was run directly then run the main function,
if (require.main === module) {
  module.exports.main();
}
