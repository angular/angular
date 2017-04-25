const fs = fsExtra = require('fs-extra');
const globby = require('globby');
const path = require('path');
const Q = require("q");
const shelljs = require('shelljs');

const EXAMPLES_PATH = path.join(__dirname, '/../../content/examples');
const SHARED_PATH = path.join(__dirname, '/shared');
const BOILERPLATE_PATH = path.join(SHARED_PATH, 'boilerplate');
const EXAMPLES_TESTING_PATH = path.join(EXAMPLES_PATH, 'testing');

const files = {
  exampleBoilerplate: [
    'src/styles.css',
    'src/systemjs-angular-loader.js',
    'src/systemjs.config.js',
    'src/tsconfig.json',
    'bs-config.json',
    'bs-config.e2e.json',
    'package.json',
    'tslint.json'
  ],
  exampleUnitTestingBoilerplate: [
    'src/browser-test-shim.js',
    'karma-test-shim.js',
    'karma.conf.js'
  ],
  exampleConfigFilename: 'example-config.json'
};

// requires admin access because it adds symlinks
function add() {
  remove();
  const realPath = path.join(SHARED_PATH, '/node_modules');
  const nodeModulesPaths = getNodeModulesPaths(EXAMPLES_PATH);

  // we install the examples modules first
  installNodeModules();

  nodeModulesPaths.map((linkPath) => {
    console.log("symlinking " + linkPath + ' -> ' + realPath)
    fs.ensureSymlinkSync(realPath, linkPath);
  });

  return copyExampleBoilerplate();
}

function copyExampleBoilerplate() {
  console.log('Copying example boilerplate files');
  const examplePaths = getExamplePaths(EXAMPLES_PATH);
  // Make boilerplate files read-only to avoid that they be edited by mistake.
  const destFileMode = '444';
  let foo = copyFiles(files.exampleBoilerplate, BOILERPLATE_PATH, examplePaths, destFileMode)
    // copy the unit test boilerplate
    .then(() => {
      const unittestPaths = getUnitTestingPaths(EXAMPLES_PATH);
      return copyFiles(files.exampleUnitTestingBoilerplate, EXAMPLES_TESTING_PATH, unittestPaths, destFileMode);
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}

// Copies fileNames into destPaths, setting the mode of the
// files at the destination as optional_destFileMode if given.
// returns a promise
function copyFiles(fileNames, originPath, destPaths, optional_destFileMode) {
  const copy = Q.denodeify(fsExtra.copy);
  const chmod = Q.denodeify(fsExtra.chmod);
  let copyPromises = [];
  destPaths.map((destPath) => {
    fileNames.forEach((fileName) => {
      const originName = path.join(originPath, fileName);
      const destName = path.join(destPath, fileName);
      let p = copy(originName, destName, { clobber: true});
      if(optional_destFileMode !== undefined) {
        p = p.then(() => {
          return chmod(destName, optional_destFileMode);
        });
      }
      copyPromises.push(p);
    });
  });

  return Q.all(copyPromises);
}

function getExamplePaths(basePath, includeBase) {
  // includeBase defaults to false
  return getPaths(basePath, files.exampleConfigFilename, includeBase);
}

function getFilenames(basePath, filename, includeBase) {
  let includePatterns = [path.join(basePath, "**/" + filename)];
  if (!includeBase) {
    // ignore (skip) the top level version.
    includePatterns.push("!" + path.join(basePath, "/" + filename));
  }
  // ignore (skip) the files in BOILERPLATE_PATH.
  includePatterns.push("!" + path.join(BOILERPLATE_PATH, "/" + filename));
  const nmPattern = path.join(basePath, "**/node_modules/**");
  return globby.sync(includePatterns, {ignore: [nmPattern]});
}

function getNodeModulesPaths(basePath) {
  return getExamplePaths(basePath).map((examplePath) => {
    return path.join(examplePath, "/node_modules");
  });
}

function getPaths(basePath, filename, includeBase) {
  const filenames = getFilenames(basePath, filename, includeBase);
  return filenames.map((fileName) => {
    return path.dirname(fileName);
  });
}

function getUnitTestingPaths(basePath) {
  const examples = getPaths(basePath, files.exampleConfigFilename, true);
  return examples.filter((example) => {
    const exampleConfig = fs.readJsonSync(`${example}/${files.exampleConfigFilename}`, {throws: false});
    return exampleConfig && !!exampleConfig.unittesting;
  });
}

function installNodeModules() {
  shelljs.exec('yarn', {cwd: SHARED_PATH});
}

function remove() {
  shelljs.exec('git clean -xdf', {cwd: EXAMPLES_PATH});
}

module.exports = {
  add: add,
  remove: remove
};

// being executed from shell script
switch (process.argv[2]) {
  case 'add':
    add();
    break;
  case 'remove':
    remove();
    break;
  default:
    console.error(`There is no function with the name: ${process.argv}`);
}
