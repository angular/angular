/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {getConfig} from '../../utils/config';
import {error, green, info, red, warn, yellow} from '../../utils/console';
import {BuiltPackage, getReleaseConfig} from '../config/index';

import {buildReleaseOutput} from './index';

/** Command line options for building a release. */
export interface ReleaseBuildOptions {
  json: boolean;
}

/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv: Argv): Argv<ReleaseBuildOptions> {
  return argv.option('json', {
    type: 'boolean',
    description: 'Whether the built packages should be printed to stdout as JSON.',
    default: false,
  });
}

/** Yargs command handler for building a release. */
async function handler(args: Arguments<ReleaseBuildOptions>) {
  const {npmPackages} = getReleaseConfig();
  let builtPackages = await buildReleaseOutput();

  // If package building failed, print an error and exit with an error code.
  if (builtPackages === null) {
    error(red(`  ✘   Could not build release output. Please check output above.`));
    process.exit(1);
  }

  // If no packages have been built, we assume that this is never correct
  // and exit with an error code.
  if (builtPackages.length === 0) {
    error(red(`  ✘   No release packages have been built. Please ensure that the`));
    error(red(`      build script is configured correctly in ".ng-dev".`));
    process.exit(1);
  }

  const missingPackages =
      npmPackages.filter(pkgName => !builtPackages!.find(b => b.name === pkgName));

  // Check for configured release packages which have not been built. We want to
  // error and exit if any configured package has not been built.
  if (missingPackages.length > 0) {
    error(red(`  ✘   Release output missing for the following packages:`));
    missingPackages.forEach(pkgName => error(red(`      - ${pkgName}`)));
    process.exit(1);
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(builtPackages, null, 2));
  } else {
    info(green('  ✓   Built release packages.'));
    builtPackages.forEach(({name}) => info(green(`      - ${name}`)));
  }
}

/** CLI command module for building release output. */
export const ReleaseBuildCommandModule: CommandModule<{}, ReleaseBuildOptions> = {
  builder,
  handler,
  command: 'build',
  describe: 'Builds the release output for the current branch.',
};
