/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Rebases the current branch on top of the GitHub PR target branch.
 *
 * **Context:**
 * Since a GitHub PR is not necessarily up to date with its target branch, it is useful to rebase
 * prior to testing it on CI to ensure more up to date test results.
 *
 * **NOTE:**
 * This script cannot use external dependencies or be compiled because it needs to run before the
 * environment is setup.
 * Use only features supported by the NodeJS versions used in the environment.
 */
// tslint:disable:no-console
const {execSync} = require('child_process');


/** A regex to select a ref that matches our semver refs. */
const semverRegex = /^(\d+)\.(\d+)\.x$/;

// Run
_main().catch(err => {
  console.log('Failed to rebase on top of target branch.\n');
  console.error(err);
  process.exitCode = 1;
});

// Helpers
async function _main() {
  const refs = await getRefsAndShasForChange();

  // Log known refs and shas
  console.log(`--------------------------------`);
  console.log(`    Target Branch:                   ${refs.base.ref}`);
  console.log(`    Latest Commit for Target Branch: ${refs.target.latestSha}`);
  console.log(`    Latest Commit for PR:            ${refs.base.latestSha}`);
  console.log(`    First Common Ancestor SHA:       ${refs.commonAncestorSha}`);
  console.log(`--------------------------------`);
  console.log();

  // Get the count of commits between the latest commit from origin and the common ancestor SHA.
  const commitCount =
      exec(`git rev-list --count origin/${refs.base.ref}...${refs.commonAncestorSha}`);
  console.log(`Checking ${commitCount} commits for changes in the CircleCI config file.`);

  // Check if the files changed between the latest commit from origin and the common ancestor SHA
  // includes the CircleCI config.
  const circleCIConfigChanged = exec(`git diff --name-only origin/${refs.base.ref} ${
      refs.commonAncestorSha} -- .circleci/config.yml`);

  if (!!circleCIConfigChanged) {
    throw Error(`
        CircleCI config on ${refs.base.ref} has been modified since commit
        ${refs.commonAncestorSha.slice(0, 7)}, which this PR is based on.

        Please rebase the PR on ${refs.base.ref} after fetching from upstream.

        Rebase instructions for PR Author, please run the following commands:

          git fetch upstream ${refs.base.ref};
          git checkout ${refs.target.ref};
          git rebase upstream/${refs.base.ref};
          git push --force-with-lease;
        `);
  } else {
    console.log('No change found in the CircleCI config file, continuing.');
  }
  console.log();

  // Rebase the PR.
  exec(`git rebase origin/${refs.base.ref}`);
  console.log(`Rebased current branch onto ${refs.base.ref}.`);
}



/**
 * Sort a list of fullpath refs into a list and then provide the first entry.
 *
 * The sort order will first find master ref, and then any semver ref, followed
 * by the rest of the refs in the order provided.
 *
 * Branches are sorted in this order as work is primarily done on master, and
 * otherwise on a semver branch. If neither of those were to match, the most
 * likely correct branch will be the first one encountered in the list.
 */
function getRefFromBranchList(gitOutput) {
  const branches = gitOutput.split('\n').map(b => b.split('/').slice(1).join('/').trim());
  return branches.sort((a, b) => {
    if (a === 'master') {
      return -1;
    }
    if (b === 'master') {
      return 1;
    }
    const aIsSemver = semverRegex.test(a);
    const bIsSemver = semverRegex.test(b);
    if (aIsSemver && bIsSemver) {
      const [, aMajor, aMinor] = a.match(semverRegex);
      const [, bMajor, bMinor] = b.match(semverRegex);
      return parseInt(bMajor, 10) - parseInt(aMajor, 10) ||
          parseInt(aMinor, 10) - parseInt(bMinor, 10) || 0;
    }
    if (aIsSemver) {
      return -1;
    }
    if (bIsSemver) {
      return 1;
    }
    return 0;
  })[0];
}

/**
 * Get the full sha of the ref provided.
 *
 * example: 1bc0c1a6c01ede7168f22fa9b3508ba51f1f464e
 */
function getShaFromRef(ref) {
  return exec(`git rev-parse ${ref}`);
}

/**
 * Get the list of branches which contain the provided sha, sorted in descending order
 * by committerdate.
 *
 * example:
 *   upstream/master
 *   upstream/9.0.x
 *   upstream/test
 *   upstream/1.1.x
 */
function getBranchListForSha(sha, remote) {
  return exec(`git branch -r '${remote}/*' --sort=-committerdate --contains ${sha}`);
}

/** Get the common ancestor sha of the two provided shas. */
function getCommonAncestorSha(sha1, sha2) {
  return exec(`git merge-base ${sha1} ${sha2}`);
}

/**
 * Adds the remote to git, if it doesn't already exist. Returns a boolean indicating
 * whether the remote was added by the command.
 */
function addAndFetchRemote(owner, name) {
  const remoteName = `${owner}_${name}`;
  exec(`git remote add ${remoteName} https://github.com/${owner}/${name}.git`, true);
  exec(`git fetch ${remoteName}`);
  return remoteName;
}


/** Get the ref and latest shas for the provided sha on a specific remote. */
function getRefAndShas(sha, owner, name) {
  const remoteName = addAndFetchRemote(owner, name);

  // Get the ref on the remote for the sha provided.
  const branches = getBranchListForSha(sha, remoteName);
  const ref = getRefFromBranchList(branches);

  // Get the latest sha on the discovered remote ref.
  const latestSha = getShaFromRef(`${remoteName}/${ref}`);

  return {remote: remoteName, ref, latestSha, sha};
}


/** Gets the refs and shas for the base and target of the current environment. */
function getRefsAndShasForChange() {
  const base = getRefAndShas(
      process.env['CI_GIT_BASE_REVISION'], process.env['CI_REPO_OWNER'],
      process.env['CI_REPO_NAME']);
  const target = getRefAndShas(
      process.env['CI_GIT_REVISION'], process.env['CI_PR_USERNAME'], process.env['CI_PR_REPONAME']);
  const commonAncestorSha = getCommonAncestorSha(base.sha, target.sha);
  return {
    base,
    target,
    commonAncestorSha,
  };
}


/**
 * Synchronously executes the command.
 *
 * Return the trimmed stdout as a string, with an added attribute of the exit code.
 */
function exec(command, ignoreError = false) {
  try {
    return execSync(command, {stdio: 'pipe'}).toString().trim();
  } catch (err) {
    if (ignoreError) {
      return '';
    }

    throw err;
  }
}
