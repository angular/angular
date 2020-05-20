import {join} from 'path';
import * as semver from 'semver';
import {exec} from 'shelljs';

/** Regular expression that matches remote head refs. */
const UPSTREAM_HEAD_REF = /refs\/heads\/(.*)$/;

/** Determines merge branches based on the current project version. */
export function determineMergeBranches(
    owner: string, name: string): {minor: string, patch: string} {
  const projectRoot = join(__dirname, '../');
  const currentVersion = semver.parse(require('../package.json').version);

  if (currentVersion === null) {
    throw Error('Cannot parse version set in project "package.json" file.');
  }

  const {major, minor, patch, prerelease} = currentVersion;
  const isMajor = minor === 0 && patch === 0;
  const isMinor = minor !== 0 && patch === 0;

  // If there is no prerelease, then we compute patch and minor branches based
  // on the current version major and minor.
  if (prerelease.length === 0) {
    return {minor: `${major}.x`, patch: `${major}.${minor}.x`};
  }

  // If current version is set to a minor prerelease, we can compute the merge branches
  // statically. e.g. if we are set to `9.3.0-next.0`, then our merge branches should
  // be set to `9.x` and `9.2.x`.
  if (isMinor) {
    return {minor: `${major}.x`, patch: `${major}.${minor - 1}.x`};
  } else if (!isMajor) {
    throw Error('Unexpected version. Cannot have prerelease for patch version.');
  }

  // If we are set to a major prerelease, we cannot statically determine the stable
  // patch branch (as the latest minor segment is unknown). We determine it by looking
  // for existing patch branches upstream.
  const upstreamRefs = exec(
                           `git ls-remote --heads https://github.com/${owner}/${name}.git`,
                           {silent: true, cwd: projectRoot})
                           .trim()
                           .split('\n');

  // Iterate over retrieved upstream refs in reverse. Git sorts them lexicographically ascending.
  // We are interested in the greatest semver version starting with the given prefix.
  for (let i = upstreamRefs.length - 1; i >= 0; i--) {
    const matches = upstreamRefs[i].match(UPSTREAM_HEAD_REF);
    if (matches === null) {
      continue;
    }
    const branchName = matches[1];
    const branchVersion = branchName.split('.');

    // Look for the most recent stable branch that has been created before the new major
    // prerelease version. e.g. if the current major is `10.0.0-next.0`, then we need to
    // look for a previous patch branch that matches `9.{minor}.x`.
    if (branchVersion[0] === `${major - 1}` && branchVersion[1] !== 'x' &&
        branchVersion[2] === 'x') {
      return {minor: `${major - 1}.x`, patch: branchName};
    }
  }

  throw Error('Could not determine merge branches.');
}
