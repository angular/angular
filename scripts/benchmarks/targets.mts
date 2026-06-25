/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import path from 'path';
import {exec, projectDir} from './utils.mts';

/** Branded string representing a resolved Bazel benchmark target. */
export type ResolvedTarget = string & {
  __resolvedTarget: true;
};

/** Finds all benchmark Bazel targets in the project. */
export async function findBenchmarkTargets(): Promise<string[]> {
  return (
    await exec('pnpm', [
      'bazel',
      'query',
      '--output=label',
      `kind("^js_test|^web_test", //modules/...) intersect attr("name", "^perf$", //modules/...)`,
    ])
  )
    .split(/\r?\n/)
    .filter((t) => t !== '');
}

/** Gets the testlog path of a given Bazel target. */
export async function getTestlogPath(
  target: ResolvedTarget,
  cwd: string = projectDir,
): Promise<string> {
  const symlinkPath = path.join(cwd, 'dist/testlogs', target.substring(2).replace(':', '/'));
  if (fs.existsSync(path.join(cwd, 'dist/testlogs'))) {
    return symlinkPath;
  }
  try {
    const bazelTestlogs = (
      await exec('pnpm', ['bazel', 'info', 'bazel-testlogs', '--lockfile_mode=update'], cwd)
    ).trim();
    return path.join(bazelTestlogs, target.substring(2).replace(':', '/'));
  } catch (e) {
    return symlinkPath;
  }
}

/** Resolves a given benchmark Bazel target to the fully expanded label. */
export async function resolveTarget(target: string): Promise<ResolvedTarget> {
  return (
    await exec('pnpm', ['bazel', 'query', '--output=label', '--', target])
  ).trim() as ResolvedTarget;
}
