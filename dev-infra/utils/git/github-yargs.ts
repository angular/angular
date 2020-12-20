/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';
import {error, red, yellow} from '../console';
import {GITHUB_TOKEN_GENERATE_URL} from './github-urls';

export type ArgvWithGithubToken = Argv<{githubToken: string}>;

/** Sets up the `github-token` command option for the given Yargs instance. */
export function addGithubTokenOption(yargs: Argv): ArgvWithGithubToken {
  return yargs
      // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
      // the Argv object being camelCase rather than kebob case due to the `camel-case-expansion`
      // config: https://github.com/yargs/yargs-parser#camel-case-expansion
      .option('github-token' as 'githubToken', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        coerce: (token: string) => {
          const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
          if (!githubToken) {
            error(red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
            error(red('Alternatively, pass the `--github-token` command line flag.'));
            error(yellow(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`));
            process.exit(1);
          }
          return githubToken;
        },
      })
      .default('github-token' as 'githubToken', '', '<LOCAL TOKEN>');
}
