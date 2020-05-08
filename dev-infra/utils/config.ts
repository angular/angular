/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {exec} from 'shelljs';

// The filename expected for creating the ng-dev config, without the file
// extension to allow either a typescript or javascript file to be used.
const CONFIG_FILE_NAME = '.ng-dev-config';

/**
 * Gets the path of the directory for the repository base.
 */
export function getRepoBaseDir() {
  const baseRepoDir = exec(`git rev-parse --show-toplevel`, {silent: true});
  if (baseRepoDir.code) {
    throw Error(
        `Unable to find the path to the base directory of the repository.\n` +
        `Was the command run from inside of the repo?\n\n` +
        `ERROR:\n ${baseRepoDir.stderr}`);
  }
  return baseRepoDir.trim();
}

/**
 * Retrieve the configuration from the .ng-dev-config.js file.
 */
export function getAngularDevConfig<K, T>(supressError = false): DevInfraConfig<K, T> {
  const configPath = join(getRepoBaseDir(), CONFIG_FILE_NAME);
  try {
    return require(configPath) as DevInfraConfig<K, T>;
  } catch (err) {
    if (!supressError) {
      throw Error(`Unable to load config file at:\n  ${configPath}`);
    }
  }
  return {} as DevInfraConfig<K, T>;
}

/**
 * Interface exressing the expected structure of the DevInfraConfig.
 * Allows for providing a typing for a part of the config to read.
 */
export interface DevInfraConfig<K, T> {
  [K: string]: T;
}
