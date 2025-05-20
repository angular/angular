/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {dirname, resolve as resolvePath} from 'node:path';
import {fileURLToPath} from 'node:url';
import {copyJsonAssets} from '../shared/copy-json-assets.mjs';
import {GithubClient} from '../shared/github-client.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));

const CLI_BUILDS_REPO = 'angular/cli-builds';
const CLI_HELP_CONTENT_PATH = resolvePath(scriptDir, '../../src/content/cli/help');

async function main() {
  await copyJsonAssets({
    repo: CLI_BUILDS_REPO,
    assetsPath: 'help',
    destPath: CLI_HELP_CONTENT_PATH,
    githubApi: new GithubClient(
      CLI_BUILDS_REPO,
      process.env.ANGULAR_CLI_BUILDS_READONLY_GITHUB_TOKEN,
      'ADEV_Angular_CLI_Sources_Update',
    ),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
