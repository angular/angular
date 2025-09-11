/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

//tslint:disable:no-console
import assert from 'node:assert';
import {execSync} from 'node:child_process';
import {existsSync, constants as fsConstants} from 'node:fs';
import {copyFile, mkdtemp, readdir, readFile, realpath, unlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

export async function copyJsonAssets({repo, githubApi, assetsPath, destPath}) {
  const buildInfoPath = join(destPath, '_build-info.json');
  if (!existsSync(buildInfoPath)) {
    throw new Error(`${buildInfoPath} does not exist.`);
  }

  assert(process.env.GITHUB_REF);
  const currentBranch = process.env.GITHUB_REF;

  const {sha: storedSha, branchName: storedBranch} = JSON.parse(
    await readFile(buildInfoPath, 'utf-8'),
  );

  let downstreamBranch = currentBranch;
  let latestSha = await githubApi.getShaForBranch(currentBranch);
  if (
    latestSha.includes('No commit') &&
    currentBranch !== 'refs/heads/main' &&
    currentBranch !== storedBranch
  ) {
    // In some cases, such as when a new branch is created for a feature,
    // the branch may not exist in the downstream repo. For example, during an
    // exceptional minor release (e.g. FW 20.3.x and Components: 20.2.x).
    // In such scenarios, we fallback to the last known branch.
    latestSha = await githubApi.getShaForBranch(storedBranch);
    downstreamBranch = storedBranch;
  }

  console.log(`Comparing ${storedSha}...${latestSha}.`);
  const affectedFiles = await githubApi.getAffectedFiles(storedSha, latestSha);
  const changedFiles = affectedFiles.filter((file) => file.startsWith(`${assetsPath}/`));

  let shaWhenFilesChanged;
  if (changedFiles.length > 0) {
    console.log(
      `The below files changed between ${storedSha} and ${latestSha}:\n` +
        changedFiles.map((f) => '* ' + f).join('\n'),
    );

    const temporaryDir = await realpath(await mkdtemp(join(tmpdir(), 'copy-json-assets-')));
    const execOptions = {cwd: temporaryDir, stdio: 'inherit'};
    execSync('git init', execOptions);
    execSync(`git remote add origin https://github.com/${repo}.git`, execOptions);
    // fetch a commit
    execSync(`git fetch origin ${latestSha}`, execOptions);
    // reset this repository's main branch to the commit of interest
    execSync('git reset --hard FETCH_HEAD', execOptions);
    // get sha when files where changed
    shaWhenFilesChanged = execSync(`git rev-list -1 ${latestSha} "${assetsPath}/"`, {
      encoding: 'utf8',
      cwd: temporaryDir,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    // Delete existing asset files.
    const apiFilesUnlink = (await readdir(destPath))
      .filter((f) => f.endsWith('.json'))
      .map((f) => unlink(join(destPath, f)));

    await Promise.allSettled(apiFilesUnlink);

    // Copy new asset files
    const tempAssetsDir = join(temporaryDir, assetsPath);
    const assetFilesCopy = (await readdir(tempAssetsDir)).map((f) => {
      const src = join(tempAssetsDir, f);
      const dest = join(destPath, f);

      return copyFile(src, dest, fsConstants.COPYFILE_FICLONE);
    });

    await Promise.allSettled(assetFilesCopy);

    console.log(`Successfully updated asset files in '${destPath}'.\n`);
  } else {
    console.log(`No '${assetsPath}/**' files changed between ${storedSha} and ${latestSha}.`);
  }

  // Write SHA to file.
  await writeFile(
    buildInfoPath,
    JSON.stringify(
      {
        branchName: downstreamBranch,
        sha: shaWhenFilesChanged ?? storedSha,
      },
      undefined,
      2,
    ),
  );

  // The below command will show uncommitted changes.
  // This is expected because the framework repo and component/cli might have different minors
  // (e.g. during exceptional minor releases), leading to changes that need to be committed.
  console.log('\nChanges: ');
  execSync(`git status --porcelain`, {stdio: 'inherit'});
}
