/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {parse} from 'json5';
import {join} from 'path';
import {exec} from 'shelljs';

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
 * Retrieve the configuration from the .dev-infra.json file.
 */
export function getAngularDevConfig<K, T>(): DevInfraConfig<K, T> {
  const configPath = join(getRepoBaseDir(), '.dev-infra.json');
  let rawConfig = '';
  try {
    rawConfig = readFileSync(configPath, 'utf8');
  } catch {
    throw Error(
        `Unable to find config file at:\n` +
        `  ${configPath}`);
  }
  return parse(rawConfig);
}

/**
 * Interface exressing the expected structure of the DevInfraConfig.
 * Allows for providing a typing for a part of the config to read.
 */
export interface DevInfraConfig<K, T> { [K: string]: T; }
