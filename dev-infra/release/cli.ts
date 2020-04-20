/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {generateNextChangelogEntry} from './changelog';
import {getReleaseConfig} from './config';
import {buildEnvStamp} from './env-stamp';

/** Build the parser for the release commands. */
export function buildReleaseParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .command(
          'build-env-stamp', 'Build the environment stamping information', {},
          () => buildEnvStamp())
      .command(
          'changelog', 'Generate the next changelog entry for a project',
          args => {
            return args.option('project', {
              required: true,
              type: 'string',
            });
          },
          ({project}) => {
            const releaseConfig = getReleaseConfig().release[project];
            if (releaseConfig === undefined) {
              console.error(`The project provided, "${project}" was not found in the config`);
              process.exit(1);
            }
            generateNextChangelogEntry(releaseConfig());
          });
}

if (require.main === module) {
  buildReleaseParser(yargs).parse();
}
