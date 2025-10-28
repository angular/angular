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

const ARIA_BUILDS_REPO = 'angular/aria-builds';
const ARIA_APIS_CONTENT_PATH = resolvePath(scriptDir, '../../src/content/aria');

async function main() {
  await copyJsonAssets({
    repo: ARIA_BUILDS_REPO,
    assetsPath: '_adev_assets',
    destPath: ARIA_APIS_CONTENT_PATH,
    githubApi: new GithubClient(
      ARIA_BUILDS_REPO,
      process.env.ANGULAR_ARIA_BUILDS_READONLY_GITHUB_TOKEN,
      'ADEV_Angular_Aria_Sources_Update',
    ),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
