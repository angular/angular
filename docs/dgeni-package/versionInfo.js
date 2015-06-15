'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var semver = require('semver');
var _ = require('lodash');

var currentPackage, previousVersions, gitRepoInfo;


/**
 * Load information about this project from the package.json
 * @return {Object} The package information
 */
var getPackage = function() {
  // Search up the folder hierarchy for the first package.json
  var packageFolder = path.resolve('.');
  while (!fs.existsSync(path.join(packageFolder, 'package.json'))) {
    var parent = path.dirname(packageFolder);
    if (parent === packageFolder) { break; }
    packageFolder = parent;
  }
  return JSON.parse(fs.readFileSync(path.join(packageFolder,'package.json'), 'UTF-8'));
};


/**
 * Parse the github URL for useful information
 * @return {Object} An object containing the github owner and repository name
 */
var getGitRepoInfo = function() {
  var GITURL_REGEX = /^https:\/\/github.com\/([^\/]+)\/(.+).git$/;
  var match = GITURL_REGEX.exec(currentPackage.repository.url);
  var git = {
    owner: match[1],
    repo: match[2]
  };
  return git;
};



/**
 * Extract the code name from the tagged commit's message - it should contain the text of the form:
 * "codename(some-code-name)"
 * @param  {String} tagName Name of the tag to look in for the codename
 * @return {String}         The codename if found, otherwise null/undefined
 */
var getCodeName = function(tagName) {
  var gitCatOutput = shell.exec('git cat-file -p ' + tagName, {silent:true}).output;
  var tagMatch = gitCatOutput.match(/^.*codename.*$/mg);
  // The angular repo doesn't have annotated tags.
  if (!tagMatch) {
    return '';
  }
  var tagMessage = tagMatch[0];
  var codeName = tagMessage && tagMessage.match(/codename\((.*)\)/)[1];
  if (!codeName) {
    throw new Error("Could not extract release code name. The message of tag " + tagName +
      " must match '*codename(some release name)*'");
  }
  return codeName;
};

/**
 * Grab the commitSHA for the current commit.
 * @return {String} The commit HASH
 */
function getCommitSHA() {
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');
  return hash;
}

/**
 * Compute a build segment for the version, from the Jenkins build number and current commit SHA
 * @return {String} The build segment of the version
 */
function getBuild() {
  return 'sha.' + getCommitSHA();
}


/**
 * If the current commit is tagged as a version get that version
 * @return {SemVer} The version or null
 */
var getTaggedVersion = function() {
  // The angular repo doesn't have annotated tags.
  var gitTagResult = shell.exec('git describe --tags --exact-match', {silent:true});

  if (gitTagResult.code === 0) {
    var tag = gitTagResult.output.trim();
    var version = semver.parse(tag);

    if (version && semver.satisfies(version, currentPackage.version)) {
      version.codeName = getCodeName(tag);
      version.full = version.version;
      version.branch = 'v' + currentPackage.branchPattern.replace('*', 'x');
      version.SHA = getCommitSHA();
      return version;
    }
  }

  return null;
};

/**
 * Get a collection of all the previous versions sorted by semantic version
 * @return {Array.<SemVer>} The collection of previous versions
 */
var getPreviousVersions =  function() {
  // always use the remote tags as the local clone might
  // not contain all commits when cloned with git clone --depth=...
  // Needed e.g. for Travis
  var repo_url = currentPackage.repository.url;
  var tagResults = shell.exec('git ls-remote --tags ' + repo_url,
                              {silent: true});
  if (tagResults.code === 0) {
    return _(tagResults.output.match(/[0-9].*[0-9]$/mg))
      .map(function(tag) {
        var version = semver.parse(tag);
        return version;
      })
      .filter()
      .map(function(version) {
        // angular.js didn't follow semantic version until 1.20rc1
        if ((version.major === 1 && version.minor === 0 && version.prerelease.length > 0) || (version.major === 1 && version.minor === 2 && version.prerelease[0] === 'rc1')) {
          version.version = [version.major, version.minor, version.patch].join('.') + version.prerelease.join('');
          version.raw = 'v' + version.version;
        }
        version.docsUrl = 'http://code.angularjs.org/' + version.version + '/docs';
        // Versions before 1.0.2 had a different docs folder name
        if (version.major < 1 || (version.major === 1 && version.minor === 0 && version.patch < 2)) {
          version.docsUrl += '-' + version.version;
          version.isOldDocsUrl = true;
        }
        return version;
      })
      .sort(semver.compare)
      .value();
  } else {
    return [];
  }
};

/**
 * Get the unstable snapshot version
 * @return {SemVer} The snapshot version
 */
var getSnapshotVersion = function() {
  var version = _(previousVersions)
    .filter(function(tag) {
      return semver.satisfies(tag, currentPackage.version);
    })
    .last();

  if (!version) {
    // a snapshot version before the first tag on the branch
    version = semver(currentPackage.branchPattern.replace('*','0-alpha.1'));
  }

  // We need to clone to ensure that we are not modifying another version
  version = semver(version.raw);

  var jenkinsBuild = process.env.TRAVIS_BUILD_NUMBER || process.env.BUILD_NUMBER;
  if (!version.prerelease || !version.prerelease.length) {
    // last release was a non beta release. Increment the patch level to
    // indicate the next release that we will be doing.
    // E.g. last release was 1.3.0, then the snapshot will be
    // 1.3.1-build.1, which is lesser than 1.3.1 accorind the semver!

    // If the last release was a beta release we don't update the
    // beta number by purpose, as otherwise the semver comparison
    // does not work any more when the next beta is released.
    // E.g. don't generate 1.3.0-beta.2.build.1
    // as this is bigger than 1.3.0-beta.2 according to semver
    version.patch++;
  }
  version.prerelease = jenkinsBuild ? ['build', jenkinsBuild] : ['local'];
  version.build = getBuild();
  version.SHA = getCommitSHA();
  version.codeName = 'snapshot';
  version.isSnapshot = true;
  version.format();
  version.full = version.version + '+' + version.build;
  version.branch = 'master';

  return version;
};


exports.currentPackage = currentPackage = getPackage();
exports.gitRepoInfo = gitRepoInfo = getGitRepoInfo();
exports.previousVersions = previousVersions = getPreviousVersions();
exports.currentVersion = getTaggedVersion() || getSnapshotVersion();
