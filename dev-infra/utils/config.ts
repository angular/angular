/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {exec} from 'shelljs';

/**
 * The common configuration for ng-dev.  This type signature is included whenever
 * the config is retrieved.
 */
type CommonConfig = {
  // TODO: add common configuration
};

/**
 * Interface exressing the expected structure of the DevInfraConfig.
 * Allows for providing a typing for a part of the config to read.
 */
export type NgDevConfig<T = {}> = CommonConfig&T;

/**
 * Configuration loader object, providing information needed to load and validate
 * the configuration.
 */
export type ConfigLoader<T> = {
  configKey: string; validator: (config: any, errors?: string[]) => config is T;
};

// The filename expected for creating the ng-dev config, without the file
// extension to allow either a typescript or javascript file to be used.
const CONFIG_FILE_NAME = '.ng-dev-config';

/** The configuration for ng-dev. */
let CONFIG: any;

/** Get the configuration for ng-dev, only validating the common configuration. */
export function getConfig(): NgDevConfig;
/**
 * Get the configuration for ng-dev, validating the config is correct for the common
 * configuration as well as the provided subcommand's validator.
 */
export function getConfig<T extends NgDevConfig>(loader: ConfigLoader<T>): T;
export function getConfig<T extends NgDevConfig>(loader?: ConfigLoader<T>) {
  // List of errors discovered by validators.
  const errors: string[] = [];
  // The unvalidated ng-dev configuration.
  const config = loadConfig();
  /** Get the configuration, after checking no errors have been discovered. */
  const getConfigAfterErrorCheck = (): T => {
    if (errors.length !== 0) {
      console.error(`Errors discovered while loading configuration file:`);
      for (const error of errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }
    return config;
  };

  // Validate the common configuration requirements are met.
  validateCommonConfig(config, errors);

  // If the requested configuration key is not defined in the config,
  // error and exit before additional validation occurs.
  if (config[loader.configKey] === undefined) {
    errors.push(`No configuration defined for "${loader.configKey}"`);
    return getConfigAfterErrorCheck();
  }

  // If a validator is provided, run it to ensure the sub command's configuration
  // requirements are met.
  if (loader.validator(config, errors)) {
    return getConfigAfterErrorCheck();
  }
  return getConfigAfterErrorCheck();
}


/** Validate the common configuration has been met for the ng-dev command. */
function validateCommonConfig(config: Partial<NgDevConfig<CommonConfig>>, errors: string[]) {
  // TODO: add validation for the common configuration
}

/**
 * Load the configuration from the file system, returning the already loaded copy if it
 * is defined.
 */
function loadConfig() {
  // If the global config is defined, return it rather than reloading from file system.
  if (CONFIG) {
    return {...CONFIG};
  }
  // The full path to the configuration file.
  const configPath = join(getRepoBaseDir(), CONFIG_FILE_NAME);
  // The configuration, loaded through default exports from the config file.
  const config = require(configPath);
  // Set the global config object to the newly loaded config.
  CONFIG = config;

  return config;
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
