/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {buildEnvStamp, EnvStampMode} from './env-stamp';


export interface Options {
  mode: EnvStampMode;
}

function builder(args: Argv): Argv<Options> {
  return args.option('mode', {
    demandOption: true,
    description: 'Whether the env-stamp should be built for a snapshot or release',
    choices: ['snapshot' as const, 'release' as const]
  });
}

async function handler({mode}: Arguments<Options>) {
  buildEnvStamp(mode);
}

/** CLI command module for building the environment stamp. */
export const BuildEnvStampCommand: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'build-env-stamp',
  describe: 'Build the environment stamping information',
};
