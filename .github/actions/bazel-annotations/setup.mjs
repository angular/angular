/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const bazelRcPath = path.join(workspace, '.bazelrc.user');
const bepPath = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'bazel-bep.jsonl');
const escapedBepPath = bepPath.replace(/\\/g, '/');

fs.appendFileSync(bazelRcPath, `\nbuild --build_event_json_file=${escapedBepPath}\n`);

if (process.env.GITHUB_ENV) {
  fs.appendFileSync(process.env.GITHUB_ENV, `BAZEL_BEP_PATH=${bepPath}\n`);
}

const matcherPath = path.join(workspace, '.github/matchers/ci.json');
if (fs.existsSync(matcherPath)) {
  process.stdout.write(`::add-matcher::${matcherPath}\n`);
}
