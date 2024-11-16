/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'path';
import {exec} from './utils.mjs';

/** Branded string representing a resolved Bazel benchmark target. */
export type ResolvedTarget = string & {
  __resolvedTarget: true;
};

/** Finds all benchmark Bazel targets in the project. */
export async function findBenchmarkTargets(): Promise<string[]> {
  return (
    await exec('bazel', [
      'query',
      '--output=label',
      `'kind("^web_test", //modules/...) intersect attr("name", "perf", //modules/...)'`,
    ])
  )
    .split(/\r?\n/)
    .filter((t) => t !== '');
}

/** Gets the testlog path of a given Bazel target. */
export async function getTestlogPath(target: ResolvedTarget): Promise<string> {
  return path.join(await bazelTestlogDir(), target.substring(2).replace(':', '/'));
}

/** Resolves a given benchmark Bazel target to the fully expanded label. */
export async function resolveTarget(target: string): Promise<ResolvedTarget> {
  // If the target does not specify an explicit browser test target, we attempt
  // to automatically add the Chromium suffix. This is necessary for e.g.
  // resolving testlogs which would reside under the actual test target.
  if (!target.endsWith('_chromium')) {
    target = `${target}_chromium`;
  }

  return (await exec('bazel', ['query', '--output=label', target])).trim() as ResolvedTarget;
}

let testlogDir: string | null = null;
async function bazelTestlogDir(): Promise<string> {
  return testlogDir ?? (testlogDir = (await exec('bazel', ['info', 'bazel-testlogs'])).trim());
}
