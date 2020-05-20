/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, isAbsolute, resolve} from 'path';

import {error} from '../utils/console';

import {ModuleResolver} from './analyzer';


/** Configuration for a circular dependencies test. */
export interface CircularDependenciesTestConfig {
  /** Base directory used for shortening paths in the golden file. */
  baseDir: string;
  /** Path to the golden file that is used for checking and approving. */
  goldenFile: string;
  /** Glob that resolves source files which should be checked. */
  glob: string;
  /**
   * Optional module resolver function that can be used to resolve modules
   * to absolute file paths.
   */
  resolveModule?: ModuleResolver;
  /**
   * Optional command that will be displayed if the golden check failed. This can be used
   * to consistently use script aliases for checking/approving the golden.
   */
  approveCommand?: string;
}

/**
 * Loads the configuration for the circular dependencies test. If the config cannot be
 * loaded, an error will be printed and the process exists with a non-zero exit code.
 */
export function loadTestConfig(configPath: string): CircularDependenciesTestConfig {
  const configBaseDir = dirname(configPath);
  const resolveRelativePath = (relativePath: string) => resolve(configBaseDir, relativePath);

  try {
    const config = require(configPath) as CircularDependenciesTestConfig;
    if (!isAbsolute(config.baseDir)) {
      config.baseDir = resolveRelativePath(config.baseDir);
    }
    if (!isAbsolute(config.goldenFile)) {
      config.goldenFile = resolveRelativePath(config.goldenFile);
    }
    if (!isAbsolute(config.glob)) {
      config.glob = resolveRelativePath(config.glob);
    }
    return config;
  } catch (e) {
    error('Could not load test configuration file at: ' + configPath);
    error(`Failed with: ${e.message}`);
    process.exit(1);
  }
}
