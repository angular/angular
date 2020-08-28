/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Omit} from 'yargs';
import {error} from './console';

export type ArgvWithGithubToken = Argv < Omit<{'github-token': string;}, 'github-token'>&{
  'github-token': string;
}
> ;

export function addGithubTokenFlag(yargs: Argv): ArgvWithGithubToken {
  return yargs
      .option('github-token', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        coerce: (token: string) => {
          const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
          if (!githubToken) {
            error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
            error('Alternatively, pass the `--github-token` command line flag.');
            error(`You can generate a token here: https://github.com/settings/tokens`);
            process.exit(1);
          }
          return githubToken;
        },
      })
      .default('github-token', '', '<LOCAL TOKEN>');
}
