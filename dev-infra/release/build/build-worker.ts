/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * This file will be spawned as a separate process when the `ng-dev release build` command is
 * invoked. A separate process allows us to hide any superfluous stdout output from arbitrary
 * build commands that we cannot control. This is necessary as the `ng-dev release build` command
 * supports stdout JSON output that should be parsable and not polluted from other stdout messages.
 */

import {getReleaseConfig} from '../config/index';

// Start the release package building.
main(process.argv[2] === 'true');

/** Main function for building the release packages. */
async function main(stampForRelease: boolean) {
  if (process.send === undefined) {
    throw Error('This script needs to be invoked as a NodeJS worker.');
  }

  const config = getReleaseConfig();
  const builtPackages = await config.buildPackages(stampForRelease);

  // Transfer the built packages back to the parent process.
  process.send(builtPackages);
}
