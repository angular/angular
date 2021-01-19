/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {spawnWithDebugOutput} from '../../utils/child-process';

/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
export async function runNpmPublish(
    packagePath: string, distTag: string, registryUrl: string|undefined) {
  const args = ['publish', '--access', 'public', '--tag', distTag];
  // If a custom registry URL has been specified, add the `--registry` flag.
  if (registryUrl !== undefined) {
    args.push('--registry', registryUrl);
  }
  await spawnWithDebugOutput('npm', args, {cwd: packagePath, mode: 'silent'});
}

/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
export async function setNpmTagForPackage(
    packageName: string, distTag: string, version: semver.SemVer, registryUrl: string|undefined) {
  const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
  // If a custom registry URL has been specified, add the `--registry` flag.
  if (registryUrl !== undefined) {
    args.push('--registry', registryUrl);
  }
  await spawnWithDebugOutput('npm', args, {mode: 'silent'});
}

/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
export async function npmIsLoggedIn(registryUrl: string|undefined): Promise<boolean> {
  const args = ['whoami'];
  // If a custom registry URL has been specified, add the `--registry` flag.
  if (registryUrl !== undefined) {
    args.push('--registry', registryUrl);
  }
  try {
    await spawnWithDebugOutput('npm', args, {mode: 'silent'});
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Log into NPM at a provided registry.
 * @throws With the process log output if the login fails.
 */
export async function npmLogin(registryUrl: string|undefined) {
  const args = ['login', '--no-browser'];
  // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
  // must be spliced into the correct place in the command as npm expects it to be the flag
  // immediately following the login subcommand.
  if (registryUrl !== undefined) {
    args.splice(1, 0, '--registry', registryUrl);
  }
  await spawnWithDebugOutput('npm', args);
}

/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
export async function npmLogout(registryUrl: string|undefined): Promise<boolean> {
  const args = ['logout'];
  // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
  // must be spliced into the correct place in the command as npm expects it to be the flag
  // immediately following the logout subcommand.
  if (registryUrl !== undefined) {
    args.splice(1, 0, '--registry', registryUrl);
  }
  try {
    await spawnWithDebugOutput('npm', args, {mode: 'silent'});
  } finally {
    return npmIsLoggedIn(registryUrl);
  }
}
