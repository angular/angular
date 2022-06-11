import * as fs from 'fs';
import * as path from 'path';

import {$} from 'zx';
import {projectDir} from './utils.mjs';

/** Git repository HTTP url pointing to the docs repository. */
export const docsRepoUrl = 'https://github.com/angular/material.angular.io.git';

/**
 * Clones the docs repository for the given major into a
 * temporary directory.
 *
 * @returns An absolute path to the temporary directory.
 */
export async function cloneDocsRepositoryForMajor(major: number): Promise<string> {
  const repoTmpDir = path.join(projectDir, 'tmp/docs-repo');
  const baseCloneArgs = [docsRepoUrl, repoTmpDir, '--single-branch', '--depth=1'];
  const majorDocsBranchName = getDocsBranchNameForMajor(major);

  // Cleanup the temporary repository directory if it exists.
  try {
    await fs.promises.rm(repoTmpDir, {recursive: true});
  } catch {}

  // Clone the docs app (either the main branch, or a dedicated major branch if available).
  if (await hasUpstreamDocsBranch(majorDocsBranchName)) {
    console.log(`Cloning docs app with dedicated branch: ${majorDocsBranchName}`);
    await $`git clone ${baseCloneArgs} --branch=${majorDocsBranchName}`;
  } else {
    console.log(`Cloning docs app with default branch (no dedicated branch for major).`);
    await $`git clone ${baseCloneArgs}`;
  }

  return repoTmpDir;
}

/**
 * Gets whether the specified branch exists in the specified remote URL.
 */
async function hasUpstreamDocsBranch(branchName: string): Promise<boolean> {
  try {
    const proc = await $`git ls-remote ${docsRepoUrl} refs/heads/${branchName}`;
    return proc.stdout.trim() !== '';
  } catch {
    return false;
  }
}

/**
 * Gets the name of a potential dedicated branch for this major in the
 * docs repository.
 *
 * e.g. if a branch like `13.x` exists and we intend to deploy v13, then
 * this branch can be used as revision for the docs-app.
 *
 * More details on why this is preferred:
 * https://docs.google.com/document/d/1xkrSOFa6WeFqyg1cTwMhl_wB8ygbVwdSxr3K2-cps14/edit#heading=h.nsf3ag63jpwu.
 */
function getDocsBranchNameForMajor(major: number): string {
  return `${major}.x`;
}
