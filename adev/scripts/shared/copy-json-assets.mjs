/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

//tslint:disable:no-console
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

  const branch = process.env.GITHUB_REF;
  const {sha: currentSha} = JSON.parse(await readFile(buildInfoPath, 'utf-8'));
  const latestSha = await githubApi.getShaForBranch(branch);

  console.log(`Comparing ${currentSha}...${latestSha}.`);
  const affectedFiles = await githubApi.getAffectedFiles(currentSha, latestSha);
  const changedFiles = affectedFiles.filter((file) => file.startsWith(`${assetsPath}/`));

  if (changedFiles.length === 0) {
    console.log(`No '${assetsPath}/**' files changed between ${currentSha} and ${latestSha}.`);
    return;
  }

  console.log(
    `The below files changed between ${currentSha} and ${latestSha}:\n` +
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
  const shaWhenFilesChanged = execSync(`git rev-list -1 ${latestSha} "${assetsPath}/"`, {
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

  // Write SHA to file.
  await writeFile(
    buildInfoPath,
    JSON.stringify(
      {
        branchName: branch,
        sha: shaWhenFilesChanged,
      },
      undefined,
      2,
    ),
  );

  console.log('\nChanges: ');
  execSync(`git status --porcelain`, {stdio: 'inherit'});

  console.log(`Successfully updated asset files in '${destPath}'.\n`);
}
