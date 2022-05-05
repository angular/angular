const fs = require('fs-extra');
const glob = require('glob');
const ignore = require('ignore');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');
const {EXAMPLES_BASE_PATH, BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH, EXAMPLE_CONFIG_FILENAME, SHARED_PATH} = require('./constants');

const BOILERPLATE_BASE_PATH = path.resolve(SHARED_PATH, 'boilerplate');
const BOILERPLATE_CLI_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'cli');
const BOILERPLATE_COMMON_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'common');

class ExampleBoilerPlate {
  /**
   * Add boilerplate files to all the examples
   */
  add() {
    // Get all the examples folders, indicated by those that contain a `example-config.json` file
    const exampleFolders =
        this.getFoldersContaining(EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, 'node_modules');
    const gitignore = ignore().add(fs.readFileSync(path.resolve(BOILERPLATE_BASE_PATH, '.gitignore'), 'utf8'));

    exampleFolders.forEach(exampleFolder => {
      const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));

      // Compute additional boilerplate files that should not be copied over for this specific example
      // This allows the example to override boilerplate files locally, perhaps to include doc-regions specific to the example.
      const overrideBoilerplate = exampleConfig['overrideBoilerplate'] || [];
      const boilerplateIgnore = ignore().add(gitignore).add(
        // Note that the `*` here is to skip over the boilerplate folder itself.
        // E.g. if the override is `a/b` then we what to match `cli/a/b` and `i18n/a/b` etc.
        overrideBoilerplate.map(p => path.join('*', p))
      );
      const isPathIgnored = absolutePath => boilerplateIgnore.ignores(path.relative(BOILERPLATE_BASE_PATH, absolutePath));

      const boilerPlateType = exampleConfig.projectType || 'cli';
      const boilerPlateBasePath = path.resolve(BOILERPLATE_BASE_PATH, boilerPlateType);
      const outputPath = path.join(BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH, path.relative(EXAMPLES_BASE_PATH, exampleFolder));
      shelljs.mkdir('-p', outputPath);

      // All example types other than `cli` and `systemjs` are based on `cli`. Copy over the `cli`
      // boilerplate files first.
      // (Some of these files might be later overwritten by type-specific files.)
      if (boilerPlateType !== 'cli' && boilerPlateType !== 'systemjs') {
        this.copyDirectoryContents(BOILERPLATE_CLI_PATH, outputPath, isPathIgnored);
      }

      // Copy the type-specific boilerplate files.
      this.copyDirectoryContents(boilerPlateBasePath, outputPath, isPathIgnored);

      // Copy the common boilerplate files (unless explicitly not used).
      if (exampleConfig.useCommonBoilerplate !== false) {
        this.copyDirectoryContents(BOILERPLATE_COMMON_PATH, outputPath, isPathIgnored);
      }
    });
  }

  /**
   * Remove all the boilerplate files from all the examples
   */
  remove() { shelljs.exec('git clean -xdfq', {cwd: EXAMPLES_BASE_PATH}); }

  listOverrides() {
    const exampleFolders =
        this.getFoldersContaining(EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, 'node_modules');

    const overriddenFiles = [];
    exampleFolders.forEach(exampleFolder => {
      const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));
      const overrideBoilerplate = exampleConfig['overrideBoilerplate'] || [];
      if (overrideBoilerplate.length > 0) {
        for (const file of overrideBoilerplate) {
          overriddenFiles.push(path.relative(EXAMPLES_BASE_PATH, path.resolve(exampleFolder, file)));
        }
      }
    });

    if (overriddenFiles.length > 0) {
      console.log(`Boilerplate files that have been overridden in examples:`);
      for (const file of overriddenFiles) {
        console.log(` - ${file}`);
      }
      console.log(`(All these paths are relative to ${EXAMPLES_BASE_PATH}.)`);
      console.log('If you are updating the boilerplate files then also consider updating these too.');
    } else {
      console.log('No boilerplate files have been overridden in examples.');
      console.log('You are safe to update the boilerplate files.');
    }
  }

  main() {
    yargs.usage('$0 <cmd> [args]')
        .command('add', 'add the boilerplate to each example', yrgs => this.add())
        .command('remove', 'remove the boilerplate from each example', () => this.remove())
        .command('list-overrides', 'list all the boilerplate files that have been overridden in examples', () => this.listOverrides())
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
