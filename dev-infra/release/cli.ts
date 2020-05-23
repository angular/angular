/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {buildEnvStamp} from './env-stamp';

/** Build the parser for the release commands. */
export function buildReleaseParser(localYargs: yargs.Argv) {
  return localYargs.help().strict().demandCommand().command(
      'build-env-stamp', 'Build the environment stamping information', {}, () => buildEnvStamp());
}

if (require.main === module) {
  buildReleaseParser(yargs).parse();
}
