import {BuiltPackage, ReleaseConfig} from '@angular/dev-infra-private/ng-dev/release/config';
import {ReleaseAction} from '@angular/dev-infra-private/ng-dev/release/publish/actions';
import {SemVer} from 'semver';
import {assertValidNpmPackageOutput} from '../tools/release-checks/npm-package-output';
import {fork} from 'child_process';
import {join} from 'path';
import {FatalReleaseActionError} from '@angular/dev-infra-private/ng-dev/release/publish/actions-error';

const actionProto = ReleaseAction.prototype as any;
const _origStageFn = actionProto.stageVersionForBranchAndCreatePullRequest;
const _origVerifyFn = actionProto._verifyPackageVersions;

/** Runs the staging sanity release checks for the given new version. */
async function runStagingReleaseChecks(newVersion: SemVer) {
  return new Promise<void>((resolve, reject) => {
    // Note: We run the staging release checks in a new node process. This is necessary
    // because before staging, the correct publish branch is checked out. If we'd
    // directly call into the release checks, the `.ng-dev/release` config would be
    // cached by NodeJS and release checks would potentially check for packages which
    // no longer exist in the publish branch (or the other way around).
    const releaseChecksProcess = fork(join(__dirname, '../tools/release-checks/index.js'), [
      newVersion.format(),
    ]);

    releaseChecksProcess.on('close', code => {
      if (code !== 0) {
        reject(new FatalReleaseActionError());
      } else {
        resolve();
      }
    });
  });
}

// Patches the `@angular/dev-infra-private` release tool to perform sanity checks
// before staging a release. This is temporary until the dev-infra team has implemented
// a more generic solution to running sanity checks before releasing (potentially building
// some of the checks we have in the components repository into the release tool).
actionProto.stageVersionForBranchAndCreatePullRequest = async function (newVersion: SemVer) {
  await runStagingReleaseChecks(newVersion);

  return await _origStageFn.apply(this, arguments);
};

// Patches the `@angular/dev-infra-private` release tool to perform sanity
// checks of the NPM package output, before publishing to NPM.
actionProto._verifyPackageVersions = async function (
  newVersion: SemVer,
  builtPackages: BuiltPackage[],
) {
  await assertValidNpmPackageOutput(builtPackages, newVersion);

  return await _origVerifyFn.apply(this, arguments);
};

/**
 * Packages that will be published as part of the project.
 *
 * Note: The order of packages here will control how sections
 * appear in the changelog.
 */
export const releasePackages = [
  'cdk',
  'material',
  'google-maps',
  'youtube-player',
  'cdk-experimental',
  'material-experimental',
  'material-moment-adapter',
  'material-luxon-adapter',
  'material-date-fns-adapter',
];

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  releaseNotes: {
    useReleaseTitle: true,
    groupOrder: releasePackages,
    categorizeCommit: commit => {
      const [packageName, entryPointName] = commit.scope.split('/');
      const entryPointPrefix = entryPointName ? `**${entryPointName}:** ` : '';

      // In the `angular/components` repository, commit messages may include entry-point
      // information in the scope. We expect commits to be grouped based on their package
      // name. Commits are then described with their subject and optional entry-point name.
      return {
        groupName: packageName,
        description: `${entryPointPrefix}${commit.subject}`,
      };
    },
  },
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  representativeNpmPackage: '@angular/cdk',
  npmPackages: releasePackages.map(pkg => ({name: `@angular/${pkg}`})),
  buildPackages: async () => {
    // The `performNpmReleaseBuild` function is loaded at runtime as loading of the
    // script results in an invocation of Bazel for any `yarn ng-dev` command.
    const {performNpmReleaseBuild} = await import('../scripts/build-packages-dist');
    return performNpmReleaseBuild();
  },
};
