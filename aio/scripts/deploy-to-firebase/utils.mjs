import fs from 'fs';
import {dirname} from 'path';
import sh from 'shelljs';
import {fileURLToPath} from 'url';


// Constants
const REPO_SLUG = 'angular/angular';
const NG_REMOTE_URL = `https://github.com/${REPO_SLUG}.git`;
const ORIGINS = {
  Next: 'https://next.angular.io',
  Rc: 'https://rc.angular.io',
  Stable: 'https://angular.io',
};
const _GIT_REMOTE_REFS_CACHE = new Map();

// Exports
const exp = {
  _GIT_REMOTE_REFS_CACHE,
  NG_REMOTE_URL,
  ORIGINS,
  REPO_SLUG,

  computeMajorVersion,
  getDirname,
  getLatestCommit,
  getMostRecentMinorBranch,
  getRemoteRefs,
  loadJson,
  logSectionHeader,
  nameFunction,
  yarn,
};
export default exp;

// Helpers
function computeMajorVersion(versionPattern) {
  return +versionPattern.split('.', 1)[0];
}

function getDirname(fileUrl) {
  return dirname(fileURLToPath(fileUrl));
}

function getRemoteRefs(
    refOrPattern, {remote = exp.NG_REMOTE_URL, retrieveFromCache = true} = {}) {
  // If remote refs for the same `refOrPattern` and `remote` have been requested before, return the
  // cached results. This improves the performance and ensures a more stable behavior.
  //
  // NOTE:
  // This shouldn't make any difference during normal execution (since there are no duplicate
  // requests atm), but makes the tests more stable (for example, avoiding errors caused by pushing
  // a new commit on a branch while the tests execute, which would cause `getLatestCommit()` to
  // return a different value).
  const cmd = `git ls-remote ${remote} ${refOrPattern}`;
  const result = (retrieveFromCache && exp._GIT_REMOTE_REFS_CACHE.has(cmd)) ?
    exp._GIT_REMOTE_REFS_CACHE.get(cmd) :
    sh.exec(cmd, {silent: true}).trim().split('\n');

  // Cache the result for future use (regardless of the value of `retrieveFromCache`).
  exp._GIT_REMOTE_REFS_CACHE.set(cmd, result);

  return result;
}

function getMostRecentMinorBranch(major = '*', options = undefined) {
  // List the branches that start with the given major version (or any major if none given).
  return exp.getRemoteRefs(`refs/heads/${major}.*.x`, options)
      // Extract the branch name.
      .map(line => line.split('/')[2])
      // Filter out branches that are not of the format `<number>.<number>.x`.
      .filter(name => /^\d+\.\d+\.x$/.test(name))
      // Sort by version.
      .sort((a, b) => {
        const [majorA, minorA] = a.split('.');
        const [majorB, minorB] = b.split('.');
        return (majorA - majorB) || (minorA - minorB);
      })
      // Get the branch corresponding to the highest version.
      .pop();
}

function getLatestCommit(branchName, options = undefined) {
  return exp.getRemoteRefs(branchName, options)[0].slice(0, 40);
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function logSectionHeader(message) {
  console.log(`\n\n\n==== ${message} ====\n`);
}

function nameFunction(name, fn) {
  // Overwrite the function's `name` property to make debugging easier (and allow tests that relied
  // on `Function#name` to continue to work for dynamically generated functions).
  return Object.defineProperty(fn, 'name', {value: name});
}

function yarn(cmd) {
  // Using `--silent` to ensure no secret env variables are printed.
  //
  // NOTE:
  // This is not strictly necessary, since CircleCI will mask secret environment variables in the
  // output (see https://circleci.com/docs/2.0/env-vars/#secrets-masking), but is an extra
  // precaution.
  return sh.exec(`yarn --silent ${cmd}`);
}
