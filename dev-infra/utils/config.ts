/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parse} from 'json5';
import {readFileSync} from 'fs';
import {join} from 'path';
import {exec} from 'shelljs';


/**
 * Gets the path of the directory for the repository base.
 */
function getRepoBaseDir() {
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
export function getAngularDevConfig(): DevInfraConfig {
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

// Interface exressing the expected structure of the DevInfraConfig.
export interface DevInfraConfig {}