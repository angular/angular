/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');
const shx = require('shelljs');
const os = require('os');
const {runCommand, setupTestDirectory} = require('./test_helpers');

// Nodejs toolchains were included in nodejs rules 0.33.0 so the
// repository name for the nodejs toolchain now depends on the platform
// being run on. The following function returns the nodejs repository
// name of the runtime platform platform. These come from
// https://github.com/bazelbuild/rules_nodejs/blob/2a0be492c5d506665798f04673ab1a646c883626/internal/node/node_repositories.bzl#L598.
function nodejs_repository() {
  switch (os.platform()) {
    case 'darwin':
      return 'nodejs_darwin_amd64';
    case 'linux':
      return 'nodejs_linux_amd64';
    case 'win32':
      return 'nodejs_windows_amd64';
    default:
      throw 'Platform not supported';
  }
}

// Since rules nodejs 0.37.1, the nodejs_binary executable now has a different extension depending
// on platform
const nodejsBinaryExt = os.platform() === 'win32' ? '.bat' : '.sh';
const ngcBin = require.resolve(`./ngc_bin${nodejsBinaryExt}`);
const xi18nBin = require.resolve(`./ng_xi18n${nodejsBinaryExt}`);
const nodeBin = require.resolve(`${nodejs_repository()}/${
    (os.platform() === 'win32' ? 'bin/nodejs/node.exe' : 'bin/nodejs/bin/node')}`);
const jasmineBin = require.resolve('npm/node_modules/jasmine/bin/jasmine.js');

// Prepare the test directory before building the integration test output. This ensures that
// the test runs in an hermetic way and works on Windows.
const tmpDir = setupTestDirectory();

// Compile the "flat_module" Angular project using NGC.
runCommand(ngcBin, ['-p', 'flat_module/tsconfig-build.json']);

// Copy HTML asset files from the "flat_module" package to the NPM output. The "flat_module"
// has template code generation disabled and therefore needs to have the asset files included
// next to the JavaScript output.
shx.cp(
    path.join(tmpDir, 'flat_module/src/*.html'), path.join(tmpDir, 'node_modules/flat_module/src'));

// Compile the "third_party" Angular project using NGC.
runCommand(ngcBin, ['-p', 'third_party_src/tsconfig-build.json']);

// Compile the main integration-test Angular project using NGC. Also uses a translated
// i18n file which will be used to verify the translated templates of components.
runCommand(ngcBin, [
  '-p', 'tsconfig-build.json', '--i18nFile=src/messages.fi.xlf', '--locale=fi', '--i18nFormat=xlf'
]);

// Extract the i18n messages into various formats that will be verified
// later on by the "i18n_spec" within "test/".
runCommand(xi18nBin, ['-p', 'tsconfig-xi18n.json', '--i18nFormat=xlf', '--locale=fr']);
runCommand(
    xi18nBin, ['-p', 'tsconfig-xi18n.json', '--i18nFormat=xlf2', '--outFile=messages.xliff2.xlf']);
runCommand(
    xi18nBin, ['-p', 'tsconfig-xi18n.json', '--i18nFormat=xmb', '--outFile=custom_file.xmb']);

// Run the ngtools tests that verify that the public API provided by the "compiler-cli"
// is working as expected in real projects.
runCommand(nodeBin, [path.join(tmpDir, 'test/test_ngtools_api.js')]);

// Run all specs which verify the output from the previously built modules and i18n files.
runCommand(nodeBin, [jasmineBin, path.join(tmpDir, 'test/all_spec.js')]);
