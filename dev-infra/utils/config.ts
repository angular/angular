/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync} from 'fs';
import {join} from 'path';
import {exec} from 'shelljs';
import {isTsNodeAvailable} from './ts-node';

/**
 * Describes the Github configuration for dev-infra. This configuration is
 * used for API requests, determining the upstream remote, etc.
 */
export interface GithubConfig {
  /** Owner name of the repository. */
  owner: string;
  /** Name of the repository. */
  name: string;
}

/** The common configuration for ng-dev. */
type CommonConfig = {
  github: GithubConfig
};

/**
 * The configuration for the specific ng-dev command, providing both the common
 * ng-dev config as well as the specific config of a subcommand.
 */
export type NgDevConfig<T = {}> = CommonConfig&T;

/**
 * The filename expected for creating the ng-dev config, without the file
 * extension to allow either a typescript or javascript file to be used.
 */
const CONFIG_FILE_NAME = '.ng-dev-config';

/** The configuration for ng-dev. */
let CONFIG: {}|null = null;

/**
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
export function getConfig(): NgDevConfig {
  // If the global config is not defined, load it from the file system.
  if (CONFIG === null) {
    // The full path to the configuration file.
    const configPath = join(getRepoBaseDir(), CONFIG_FILE_NAME);
    // Set the global config object.
    CONFIG = readConfigFile(configPath);
  }
  // Return a clone of the global config to ensure that a new instance of the config is returned
  // each time, preventing unexpected effects of modifications to the config object.
  return validateCommonConfig({...CONFIG});
}

/** Validate the common configuration has been met for the ng-dev command. */
function validateCommonConfig(config: Partial<NgDevConfig>) {
  const errors: string[] = [];
  // Validate the github configuration.
  if (config.github === undefined) {
    errors.push(`Github repository not configured. Set the "github" option.`);
  } else {
    if (config.github.name === undefined) {
      errors.push(`"github.name" is not defined`);
    }
    if (config.github.owner === undefined) {
      errors.push(`"github.owner" is not defined`);
    }
  }
  assertNoErrors(errors);
  return config as NgDevConfig;
}

/** Resolves and reads the specified configuration file. */
function readConfigFile(configPath: string): object {
  // If the the `.ts` extension has not been set up already, and a TypeScript based
  // version of the given configuration seems to exist, set up `ts-node` if available.
  if (require.extensions['.ts'] === undefined && existsSync(`${configPath}.ts`) &&
      isTsNodeAvailable()) {
    require('ts-node').register({skipProject: true, transpileOnly: true});
  }

  try {
    return require(configPath)
  } catch (e) {
    console.error('Could not read configuration file.');
    console.error(e);
    process.exit(1);
  }
}

/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
export function assertNoErrors(errors: string[]) {
  if (errors.length == 0) {
    return;
  }
  console.error(`Errors discovered while loading configuration file:`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

/** Gets the path of the directory for the repository base. */
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
