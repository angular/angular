import fs from 'fs-extra';
import glob from 'glob';
import ignore from 'ignore';
import path from 'canonical-path';
import shelljs from 'shelljs';
import yargs from 'yargs';
import {
  RUNFILES_ROOT,
  getExamplesBasePath,
  getSharedPath,
  EXAMPLE_CONFIG_FILENAME,
} from './constants.mjs';

const PROJECT_ROOT = RUNFILES_ROOT;
const EXAMPLES_BASE_PATH = getExamplesBasePath(PROJECT_ROOT);
const SHARED_PATH = getSharedPath(PROJECT_ROOT);

const BOILERPLATE_BASE_PATH = path.resolve(SHARED_PATH, 'boilerplate');
const BOILERPLATE_CLI_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'cli');
const BOILERPLATE_COMMON_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'common');

class ExampleBoilerPlate {
  /**
   * Add boilerplate files to an example
   */
  add(exampleFolder, outputDir) {
    const gitignore = ignore().add(
      fs.readFileSync(path.resolve(BOILERPLATE_BASE_PATH, '.gitignore'), 'utf8')
    );

    const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));

    // Compute additional boilerplate files that should not be copied over for this specific example
    // This allows the example to override boilerplate files locally, perhaps to include doc-regions specific to the example.
    const overrideBoilerplate = exampleConfig['overrideBoilerplate'] || [];
    const boilerplateIgnore = ignore()
      .add(gitignore)
      .add(
        // Note that the `*` here is to skip over the boilerplate folder itself.
        // E.g. if the override is `a/b` then we what to match `cli/a/b` and `i18n/a/b` etc.
        overrideBoilerplate.map((p) => path.join('*', p))
      );
    const isPathIgnored = (absolutePath) =>
      boilerplateIgnore.ignores(path.relative(BOILERPLATE_BASE_PATH, absolutePath));

    const boilerPlateType = exampleConfig.projectType || 'cli';
    const boilerPlateBasePath = path.resolve(BOILERPLATE_BASE_PATH, boilerPlateType);
    shelljs.mkdir('-p', outputDir);

    // All example types other than `cli` and `systemjs` are based on `cli`. Copy over the `cli`
    // boilerplate files first.
    // (Some of these files might be later overwritten by type-specific files.)
    if (boilerPlateType !== 'cli' && boilerPlateType !== 'systemjs') {
      this.copyDirectoryContents(BOILERPLATE_CLI_PATH, outputDir, isPathIgnored);
    }

    // Copy the type-specific boilerplate files.
    this.copyDirectoryContents(boilerPlateBasePath, outputDir, isPathIgnored);

    // Copy the common boilerplate files (unless explicitly not used).
    if (exampleConfig.useCommonBoilerplate !== false) {
      this.copyDirectoryContents(BOILERPLATE_COMMON_PATH, outputDir, isPathIgnored);
    }
  }

  listOverrides() {
    const exampleFolders = this.getFoldersContaining(
      EXAMPLES_BASE_PATH,
      EXAMPLE_CONFIG_FILENAME,
      'node_modules'
    );

    const overriddenFiles = [];
    exampleFolders.forEach((exampleFolder) => {
      const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));
      const overrideBoilerplate = exampleConfig['overrideBoilerplate'] || [];
      if (overrideBoilerplate.length > 0) {
        for (const file of overrideBoilerplate) {
          overriddenFiles.push(
            path.relative(EXAMPLES_BASE_PATH, path.resolve(exampleFolder, file))
          );
        }
      }
    });

    if (overriddenFiles.length > 0) {
      console.log(`Boilerplate files that have been overridden in examples:`);
      for (const file of overriddenFiles) {
        console.log(` - ${file}`);
      }
      console.log(`(All these paths are relative to ${EXAMPLES_BASE_PATH}.)`);
      console.log(
        'If you are updating the boilerplate files then also consider updating these too.'
      );
    } else {
      console.log('No boilerplate files have been overridden in examples.');
      console.log('You are safe to update the boilerplate files.');
    }
  }

  main() {
    yargs(process.argv.slice(2))
      .usage('$0 <cmd> [args]')
      .command('add <exampleDir> <outputDir>', 'create boilerplate for an example', (yrgs) =>
        this.add(yrgs.argv._[1], yrgs.argv._[2])
      )
      .command(
        'list-overrides',
        'list all the boilerplate files that have been overridden in examples',
        () => this.listOverrides()
      )
      .demandCommand(1, 'Please supply a command from the list above').argv;
  }

  getFoldersContaining(basePath, filename, ignore) {
    const pattern = path.resolve(basePath, '**', filename);
    const ignorePattern = path.resolve(basePath, '**', ignore, '**');
    return glob.sync(pattern, {ignore: [ignorePattern]}).map((file) => path.dirname(file));
  }

  loadJsonFile(filePath) {
    return fs.readJsonSync(filePath, {throws: false}) || {};
  }

  copyDirectoryContents(srcDir, dstDir, isPathIgnored) {
    shelljs.ls('-Al', srcDir).forEach((stat) => {
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

export default new ExampleBoilerPlate();
