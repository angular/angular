/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const {runfiles} = require('@bazel/runfiles');

const VERBOSE_LOGS = !!process.env['VERBOSE_LOGS'];

// Set to true if you want the /tmp folder created to persist after running `bazel test`
const KEEP_TMP = false;

// bazelisk requires a $HOME environment variable for its cache
process.env['HOME'] = tmp.dirSync({keep: KEEP_TMP, unsafeCleanup: !KEEP_TMP}).name;

function fail(...m) {
  console.error();
  console.error(`[${path.basename(__filename)}]`);
  console.error('error:', ...m);
  console.error();
  process.exit(1);
}

function log(...m) {
  console.error(`[${path.basename(__filename)}]`, ...m);
}

function log_verbose(...m) {
  if (VERBOSE_LOGS) log(...m);
}

/**
 * Create a new directory and any necessary subdirectories
 * if they do not exist.
 */
function mkdirp(p) {
  if (!fs.existsSync(p)) {
    mkdirp(path.dirname(p));
    fs.mkdirSync(p);
  }
}

/**
 * Checks if a given path exists and is a file.
 * Note: fs.statSync() is used which resolves symlinks.
 */
function isFile(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

/**
 * Check if a given path is an executable file.
 */
function isExecutable(p) {
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Given two arrays returns the longest common slice.
 */
function commonSlice(a, b) {
  const p = a.length < b.length ? [a, b] : [b, a];
  for (let i = 0; i < p[0].length; ++i) {
    if (p[0][i] !== p[1][i]) {
      return p[0].slice(0, i);
    }
  }
  return p[0];
}

/**
 * Given a list of files, the root directory is returned
 */
function rootDirectory(files) {
  let root = path.dirname(files[0]).replace(/\\/g, '/').split('/');
  for (f of files) {
    root = commonSlice(root, path.dirname(f).replace(/\\/g, '/').split('/'));
    if (!root.length) break;
  }
  if (!root.length) {
    fail(`not all test files are under the same root!`);
  }
  return root.join('/');
}

/**
 * Utility function to copy a list of files under a common root to a destination folder.
 */
function copy(files, root, to) {
  for (src of files) {
    if (!src.startsWith(root)) {
      fail(`file to copy ${src} is not under root ${root}`);
    }
    if (isFile(src)) {
      const rel = src.slice(root.length + 1);
      if (rel.startsWith('node_modules/')) {
        // don't copy nested node_modules
        continue;
      }
      const dest = `${to}/${rel}`;
      mkdirp(path.dirname(dest));
      fs.copyFileSync(src, dest);
      // Set file permissions to set for files copied to tmp folders.
      // These are needed as files copied out of bazel-bin will have
      // restrictive permissions that may break tests.
      fs.chmodSync(dest, isExecutable(src) ? '755' : '644');
      log_verbose(`copied file ${src} -> ${dest}`);
    } else {
      fail('directories in test_files not supported');
    }
  }
  return to;
}

/**
 * Utility function to copy a list of files to a tmp folder based on their common root.
 */
function copyToTmp(files) {
  const resolved = files.map(f => runfiles.resolveWorkspaceRelative(f));
  return copy(
      resolved, rootDirectory(resolved),
      tmp.dirSync({keep: KEEP_TMP, unsafeCleanup: !KEEP_TMP}).name);
}

/**
 * Expands environment variables in a string of the form ${FOO_BAR}.
 */
function expandEnv(s) {
  if (!s) return s;
  const reg = /\$\{(\w+)\}/g;
  return s.replace(reg, (matched) => {
    const varName = matched.substring(2, matched.length - 1);
    if (process.env.hasOwnProperty(varName)) {
      return process.env[varName];
    } else {
      throw `Failed to expand unbound environment variable '${varName}' in '${s}'`;
    }
  });
}

/**
 * TestRunner handles setting up the integration test and executing
 * the test commands based on the config.
 */
class TestRunner {
  constructor(config) {
    this.config = config;
    this.successful = 0;
    this._setupTestFiles();
    this._writeNpmPackageManifest();
  }

  /**
   * Run all test commands in the integration test.
   * Returns on first failure.
   */
  run() {
    for (const command of this.config.commands) {
      // TODO: handle a quoted binary path that contains a space such as "/path to/binary"
      //       and quoted arguments that contain spaces
      const split = command.split(' ');
      let binary = split[0];
      const args = split.slice(1).map(a => expandEnv(a));
      switch (binary) {
        case 'patch-package-json': {
          let packageJsonFile = 'package.json';
          if (args.length > 0) {
            packageJsonFile = args[0];
          }
          log(`running test command ${this.successful + 1} of ${
              this.config.commands.length}: patching '${packageJsonFile}' in '${this.testRoot}'`);
          this._patchPackageJson(packageJsonFile);
        } break;

        default: {
          if (binary.startsWith('external/')) {
            binary = `../${binary.substring('external/'.length)}`;
          }
          try {
            // Attempt to resolve runfiles location if command is expected to
            // be in runfiles. For example, $(rootpath @nodejs//:yarn_bin)
            const runfilesBinary = runfiles.resolveWorkspaceRelative(binary);
            binary = (runfilesBinary && fs.existsSync(runfilesBinary)) ? runfilesBinary : binary;
          } catch (e) {
            // If resolveWorkspaceRelative then command is likely a built-in
            // such as 'mkdir' or 'rm'
          }
          log(`running test command ${this.successful + 1} of ${this.config.commands.length}: '${
              binary} ${args.join(' ')}' in '${this.testRoot}'`);
          const spawnedProcess = spawnSync(binary, args, {cwd: this.testRoot, stdio: 'inherit'});
          if (spawnedProcess.error) {
            fail(`test command ${testRunner.successful + 1} '${binary} ${
                args.join(' ')}' failed with ${spawnedProcess.error.code}`);
          }
          if (spawnedProcess.status) {
            log(`test command ${testRunner.successful + 1} '${binary} ${
                args.join(' ')}' failed with status code ${spawnedProcess.status}`);
            return spawnedProcess.status;
          }
        }
      }
      this.successful++;
    }
    return 0;
  }

  /**
   * @internal
   *
   * Patch the specified package.json file with the npmPackages passed in the config.
   */
  _patchPackageJson(packageJsonFile) {
    const packageJson = `${this.testRoot}/${packageJsonFile}`;
    if (!isFile(packageJson)) {
      fail(`no ${packageJsonFile} file found at test root ${this.testRoot}`);
    }
    const contents = JSON.parse(fs.readFileSync(packageJson, {encoding: 'utf-8'}));
    let replacements = 0;
    // replace npm packages
    for (const key of Object.keys(this.config.npmPackages)) {
      const path = runfiles.resolveWorkspaceRelative(this.config.npmPackages[key]);
      const replacement = `file:${path}`;
      if (contents.dependencies && contents.dependencies[key]) {
        replacements++;
        contents.dependencies[key] = replacement;
        log(`overriding dependencies['${key}'] npm package with 'file:${
            path}' in package.json file`);
      }
      if (contents.devDependencies && contents.devDependencies[key]) {
        replacements++;
        contents.devDependencies[key] = replacement;
        log(`overriding devDependencies['${key}'] npm package with 'file:${
            path}' in package.json file`);
      }
      if (contents.resolutions && contents.resolutions[key]) {
        replacements++;
        contents.resolutions[key] = replacement;
        log(`overriding resolutions['${key}'] npm package with 'file:${
            path}' in package.json file`);
      }
      // TODO: handle other formats for resolutions such as `some-package/${key}` or
      // `some-package/**/${key}`
      const altKey = `**/${key}`;
      if (contents.resolutions && contents.resolutions[altKey]) {
        replacements++;
        contents.resolutions[altKey] = replacement;
        log(`overriding resolutions['${altKey}'] npm package with 'file:${
            path}' in package.json file`);
      }
    }
    // check packages that must be replaced
    const failedPackages = [];
    for (const key of this.config.checkNpmPackages) {
      if (contents.dependencies && contents.dependencies[key] &&
          (!contents.dependencies[key].startsWith('file:') ||
           contents.dependencies[key].startsWith('file:.'))) {
        failedPackages.push(key);
      } else if (
          contents.devDependencies && contents.devDependencies[key] &&
          (!contents.devDependencies[key].startsWith('file:') ||
           contents.devDependencies[key].startsWith('file:.'))) {
        failedPackages.push(key);
      }
    }
    const contentsEncoded = JSON.stringify(contents, null, 2);
    log(`package.json file:\n${contentsEncoded}`);
    if (failedPackages.length) {
      fail(`expected replacements of npm packages ${
          JSON.stringify(failedPackages)} not found; add these to the npm_packages attribute`);
    }
    if (replacements) {
      fs.writeFileSync(packageJson, contentsEncoded);
    }
  }

  /**
   * @internal
   *
   * Copy all the test files to a tmp folder so they are sandboxed for the test
   * and so that changes made to source files such as patching package.json
   * do not persist in the user's workspace.
   *
   * In debug mode, do not copy any file but set the testRoot to the user's workspace.
   */
  _setupTestFiles() {
    if (!this.config.testFiles.length) {
      fail(`no test files`);
    }
    if (this.config.debug) {
      // Setup the test in the test files root directory
      const root = rootDirectory(this.config.testFiles);
      if (path.isAbsolute(root)) {
        fail(`root directory of Bazel test files should not be an absolute path but got '${root}'`);
      }
      if (root.startsWith(`../`)) {
        fail(`debug mode only available with test files in the root workspace`);
      }
      let workspaceDirectory = process.env['BUILD_WORKSPACE_DIRECTORY'];
      if (!workspaceDirectory) {
        // bazel test
        const runfilesPath = process.env['RUNFILES'];
        if (!runfilesPath) {
          fail(`RUNFILES environment variable is not set`);
        }
        // read the contents of the output_base/DO_NOT_BUILD_HERE file to get
        // the workspace directory
        const index = runfilesPath.search(/[\\/]execroot[\\/]/);
        if (index === -1) {
          fail(`no /execroot/ in runfiles path`);
        }
        const outputBase = runfilesPath.substr(0, index);
        workspaceDirectory =
            fs.readFileSync(`${outputBase}/DO_NOT_BUILD_HERE`, {encoding: 'utf-8'});
      }
      this.testRoot = `${workspaceDirectory}/${root}`;
      log(`configuring test in-place under ${this.testRoot}`);
    } else {
      this.testRoot = copyToTmp(this.config.testFiles);
      log(`test files from '${rootDirectory(this.config.testFiles)}' copied to tmp folder ${
          this.testRoot}`);
    }
  }

  /**
   * @internal
   *
   * Write an NPM_PACKAGE_MANIFEST.json file to the test root with a mapping of
   * the npm package mappings for this this test. Integration tests can opt
   * to use this mappings file instead of the built-in `patch-package-json`
   * command.
   */
  _writeNpmPackageManifest() {
    if (!this.testRoot) {
      fail(`test files not yet setup`);
    }
    const manifest = {};
    for (const key of Object.keys(this.config.npmPackages)) {
      manifest[key] = runfiles.resolveWorkspaceRelative(this.config.npmPackages[key]);
    }
    const manifestPath = `${this.testRoot}/NPM_PACKAGE_MANIFEST.json`;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    log(`npm package manifest written to ${manifestPath}`);
  }
}

const config = require(runfiles.resolveWorkspaceRelative(process.argv[2]));

// set env vars passed from --define
for (const k of Object.keys(config.envVars)) {
  const v = config.envVars[k];
  process.env[k] = v;
  log_verbose(`set environment variable ${k}='${v}'`);
}

log_verbose(`env: ${JSON.stringify(process.env, null, 2)}`);
log_verbose(`config: ${JSON.stringify(config, null, 2)}`);
log(`running in ${process.cwd()}`);

const testRunner = new TestRunner(config);
const result = testRunner.run();
log(`${testRunner.successful} of ${config.commands.length} test commands successful`);
if (result) {
  if (!config.debug) {
    log(`to run this integration test in debug mode:

    bazel run ${process.env['TEST_TARGET']}.debug

in debug mode the integration test will be run out of the workspace folder`);
  }
}
if (config.debug) {
  log(`this integration test may be re-run manually from the '${testRunner.testRoot}' folder

for example,

    cd ${testRunner.testRoot}
    yarn test`);
}
process.exit(result);
