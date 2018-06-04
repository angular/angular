const fs = require('fs-extra');
const glob = require('glob');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');

const SHARED_PATH = path.resolve(__dirname, 'shared');
const SHARED_NODE_MODULES_PATH = path.resolve(SHARED_PATH, 'node_modules');
const BOILERPLATE_BASE_PATH = path.resolve(SHARED_PATH, 'boilerplate');
const BOILERPLATE_COMMON_BASE_PATH = path.resolve(BOILERPLATE_BASE_PATH, 'common');
const EXAMPLES_BASE_PATH = path.resolve(__dirname, '../../content/examples');

const BOILERPLATE_PATHS = {
  cli: [
    'src/environments/environment.prod.ts',
    'src/environments/environment.ts',
    'src/assets/.gitkeep',
    'src/browserslist',
    'src/favicon.ico',
    'src/karma.conf.js',
    'src/polyfills.ts',
    'src/test.ts',
    'src/tsconfig.app.json',
    'src/tsconfig.spec.json',
    'src/tslint.json',
    'e2e/src/app.po.ts',
    'e2e/protractor.conf.js',
    'e2e/tsconfig.e2e.json',
    '.editorconfig',
    'angular.json',
    'package.json',
    'tsconfig.json',
    'tslint.json'
  ],
  systemjs: [
    'src/systemjs-angular-loader.js',
    'src/systemjs.config.js',
    'src/tsconfig.json',
    'bs-config.json',
    'bs-config.e2e.json',
    'package.json',
    'tslint.json'
  ],
  common: [
    'src/styles.css'
  ]
};

// All paths in this tool are relative to the current boilerplate folder, i.e boilerplate/i18n
// This maps the CLI files that exists in a parent folder
const cliRelativePath = BOILERPLATE_PATHS.cli.map(file => `../cli/${file}`);

BOILERPLATE_PATHS.i18n = [
  ...cliRelativePath,
  'angular.json',
  'package.json'
];

BOILERPLATE_PATHS.universal = [
  ...cliRelativePath,
  'angular.json',
  'package.json'
];

BOILERPLATE_PATHS.testing = [
  ...cliRelativePath,
  'angular.json'
];

const EXAMPLE_CONFIG_FILENAME = 'example-config.json';

class ExampleBoilerPlate {
  /**
   * Add boilerplate files to all the examples
   */
  add() {
    // Get all the examples folders, indicated by those that contain a `example-config.json` file
    const exampleFolders = this.getFoldersContaining(EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, 'node_modules');
    exampleFolders.forEach(exampleFolder => {
      const exampleConfig = this.loadJsonFile(path.resolve(exampleFolder, EXAMPLE_CONFIG_FILENAME));

      if (!fs.existsSync(SHARED_NODE_MODULES_PATH)) {
        throw new Error(`The shared node_modules folder for the examples (${SHARED_NODE_MODULES_PATH}) is missing.\n` +
        `Perhaps you need to run "yarn example-use-npm" or "yarn example-use-local" to install the dependencies?`);
      }

      // Link the node modules - requires admin access (on Windows) because it adds symlinks
      const destinationNodeModules = path.resolve(exampleFolder, 'node_modules');
      fs.ensureSymlinkSync(SHARED_NODE_MODULES_PATH, destinationNodeModules);

      const boilerPlateType = exampleConfig.projectType || 'cli';
      const boilerPlateBasePath = path.resolve(BOILERPLATE_BASE_PATH, boilerPlateType);

      // Copy the boilerplate specific files
      BOILERPLATE_PATHS[boilerPlateType].forEach(filePath => this.copyFile(boilerPlateBasePath, exampleFolder, filePath));

      // Copy the boilerplate common files
      BOILERPLATE_PATHS.common.forEach(filePath => this.copyFile(BOILERPLATE_COMMON_BASE_PATH, exampleFolder, filePath));
    });
  }

  /**
   * Remove all the boilerplate files from all the examples
   */
  remove() {
    shelljs.exec('git clean -xdfq', {cwd: EXAMPLES_BASE_PATH});
  }

  main() {
    yargs
      .usage('$0 <cmd> [args]')
      .command('add', 'add the boilerplate to each example', () => this.add())
      .command('remove', 'remove the boilerplate from each example', () => this.remove())
      .demandCommand(1, 'Please supply a command from the list above')
      .argv;
  }

  getFoldersContaining(basePath, filename, ignore) {
    const pattern = path.resolve(basePath, '**', filename);
    const ignorePattern = path.resolve(basePath, '**', ignore, '**');
    return glob.sync(pattern, { ignore: [ignorePattern] }).map(file => path.dirname(file));
  }

  copyFile(sourceFolder, destinationFolder, filePath) {
    const sourcePath = path.resolve(sourceFolder, filePath);

    // normalize path if needed
    filePath = this.normalizePath(filePath);

    const destinationPath = path.resolve(destinationFolder, filePath);
    fs.copySync(sourcePath, destinationPath, { overwrite: true });
    fs.chmodSync(destinationPath, 444);
  }

  loadJsonFile(filePath) {
    return fs.readJsonSync(filePath, {throws: false}) || {};
  }

  normalizePath(filePath) {
    // transform for example ../cli/src/tsconfig.app.json to src/tsconfig.app.json
    return filePath.replace(/\.{2}\/\w+\//, '');
  }
}

module.exports = new ExampleBoilerPlate();

// If this file was run directly then run the main function,
if (require.main === module) {
  module.exports.main();
}
