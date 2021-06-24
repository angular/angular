/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {ReleaseBuildCommandModule} from './build/cli';
import {ReleaseInfoCommandModule} from './info/cli';
import {ReleaseNotesCommandModule} from './notes/cli';
import {ReleasePublishCommandModule} from './publish/cli';
import {ReleaseSetDistTagCommand} from './set-dist-tag/cli';
import {BuildEnvStampCommand} from './stamping/cli';

/** Build the parser for the release commands. */
export function buildReleaseParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .command(ReleasePublishCommandModule)
      .command(ReleaseBuildCommandModule)
      .command(ReleaseInfoCommandModule)
      .command(ReleaseSetDistTagCommand)
      .command(BuildEnvStampCommand)
      .command(ReleaseNotesCommandModule);
}
