/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ora from 'ora';
import * as semver from 'semver';
import {Arguments, Argv, CommandModule} from 'yargs';

import {bold, debug, error, green, info, red} from '../../utils/console';
import {getReleaseConfig} from '../config/index';
import {setNpmTagForPackage} from '../versioning/npm-publish';


/** Command line options for setting an NPM dist tag. */
export interface ReleaseSetDistTagOptions {
  tagName: string;
  targetVersion: string;
}

function builder(args: Argv): Argv<ReleaseSetDistTagOptions> {
  return args
      .positional('tagName', {
        type: 'string',
        demandOption: true,
        description: 'Name of the NPM dist tag.',
      })
      .positional('targetVersion', {
        type: 'string',
        demandOption: true,
        description: 'Version to which the dist tag should be set.'
      });
}

/** Yargs command handler for building a release. */
async function handler(args: Arguments<ReleaseSetDistTagOptions>) {
  const {targetVersion: rawVersion, tagName} = args;
  const {npmPackages, publishRegistry} = getReleaseConfig();
  const version = semver.parse(rawVersion);

  if (version === null) {
    error(red(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
    process.exit(1);
  }

  const spinner = ora.call(undefined).start();
  debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);

  for (const pkgName of npmPackages) {
    spinner.text = `Setting NPM dist tag for "${pkgName}"`;
    spinner.render();

    try {
      await setNpmTagForPackage(pkgName, tagName, version!, publishRegistry);
      debug(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
    } catch (e) {
      spinner.stop();
      error(e);
      error(red(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
      process.exit(1);
    }
  }

  spinner.stop();
  info(green(`  ✓   Set NPM dist tag for all release packages.`));
  info(green(`      ${bold(tagName)} will now point to ${bold(`v${version}`)}.`));
}

/** CLI command module for setting an NPM dist tag. */
export const ReleaseSetDistTagCommand: CommandModule<{}, ReleaseSetDistTagOptions> = {
  builder,
  handler,
  command: 'set-dist-tag <tag-name> <target-version>',
  describe: 'Sets a given NPM dist tag for all release packages.',
};
