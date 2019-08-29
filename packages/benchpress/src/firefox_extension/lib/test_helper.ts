/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const q = require('q');
const FirefoxProfile = require('firefox-profile');
const jpm = require('jpm/lib/xpi');
const pathUtil = require('path');

const PERF_ADDON_PACKAGE_JSON_DIR = '..';

exports.getAbsolutePath = function(path: string) {
  const normalizedPath = pathUtil.normalize(path);
  if (pathUtil.resolve(normalizedPath) == normalizedPath) {
    // Already absolute path
    return normalizedPath;
  } else {
    return pathUtil.join(__dirname, normalizedPath);
  }
};

exports.getFirefoxProfile = function(extensionPath: string) {
  const deferred = q.defer();

  const firefoxProfile = new FirefoxProfile();
  firefoxProfile.addExtensions([extensionPath], () => {
    firefoxProfile.encoded((err: any, encodedProfile: string) => {
      const multiCapabilities = [{browserName: 'firefox', firefox_profile: encodedProfile}];
      deferred.resolve(multiCapabilities);
    });
  });

  return deferred.promise;
};

exports.getFirefoxProfileWithExtension = function() {
  const absPackageJsonDir = pathUtil.join(__dirname, PERF_ADDON_PACKAGE_JSON_DIR);
  const packageJson = require(pathUtil.join(absPackageJsonDir, 'package.json'));

  const savedCwd = process.cwd();
  process.chdir(absPackageJsonDir);

  return jpm(packageJson).then((xpiPath: string) => {
    process.chdir(savedCwd);
    return exports.getFirefoxProfile(xpiPath);
  });
};
