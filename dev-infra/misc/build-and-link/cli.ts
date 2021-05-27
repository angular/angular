/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green} from 'chalk';
import {lstatSync} from 'fs';
import {resolve} from 'path';
import {Arguments, Argv, CommandModule} from 'yargs';

import {buildReleaseOutput} from '../../release/build/index';
import {spawn} from '../../utils/child-process';
import {error, info, red} from '../../utils/console';


/** Command line options. */
export interface BuildAndLinkOptions {
  projectRoot: string;
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<BuildAndLinkOptions> {
  return argv.positional('projectRoot', {
    type: 'string',
    normalize: true,
    coerce: (path: string) => resolve(path),
    demandOption: true,
  });
}

/** Yargs command handler for the command. */
async function handler({projectRoot}: Arguments<BuildAndLinkOptions>) {
  try {
    if (!lstatSync(projectRoot).isDirectory()) {
      error(red(`  ✘   The 'projectRoot' must be a directory: ${projectRoot}`));
      process.exit(1);
    }
  } catch {
    error(red(`  ✘   Could not find the 'projectRoot' provided: ${projectRoot}`));
    process.exit(1);
  }

  const releaseOutputs = await buildReleaseOutput(false);

  if (releaseOutputs === null) {
    error(red(`  ✘   Could not build release output. Please check output above.`));
    process.exit(1);
  }
  info(green(` ✓  Built release output.`));

  for (const {outputPath, name} of releaseOutputs) {
    await spawn('yarn', ['link', '--cwd', outputPath]);
    await spawn('yarn', ['link', '--cwd', projectRoot, name]);
  }

  info(green(` ✓  Linked release packages in provided project.`));
}

/** CLI command module. */
export const BuildAndLinkCommandModule: CommandModule<{}, BuildAndLinkOptions> = {
  builder,
  handler,
  command: 'build-and-link <projectRoot>',
  describe:
      'Builds the release output, registers the outputs as linked, and links via yarn to the provided project',
};
