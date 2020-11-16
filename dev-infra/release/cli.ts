/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {ReleaseBuildCommandModule} from './build/cli';
import {ReleasePublishCommandModule} from './publish/cli';
import {ReleaseSetDistTagCommand} from './set-dist-tag/cli';
import {buildEnvStamp} from './stamping/env-stamp';

/** Build the parser for the release commands. */
export function buildReleaseParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .command(ReleasePublishCommandModule)
      .command(ReleaseBuildCommandModule)
      .command(ReleaseSetDistTagCommand)
      .command(
          'build-env-stamp', 'Build the environment stamping information', {},
          () => buildEnvStamp());
}
