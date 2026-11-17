/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {spawnSync} from 'node:child_process';
import path from 'node:path';

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const scriptPath = path.join(workspace, 'scripts/ci/annotate-bazel-failures.mts');

const result = spawnSync(process.execPath, [scriptPath], {
  cwd: workspace,
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  process.stderr.write(`annotate-bazel-failures failed: ${result.error.message}\n`);
}
