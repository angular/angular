import {BuiltPackage, ReleaseConfig} from '@angular/dev-infra-private/release/config';
import {ReleaseAction} from '@angular/dev-infra-private/release/publish/actions';
import {SemVer} from 'semver';

import {
  assertValidFrameworkPeerDependency
} from '../tools/release-checks/check-framework-peer-dependency';
import {
  assertValidUpdateMigrationCollections
} from '../tools/release-checks/check-migration-collections';
import {assertValidNpmPackageOutput} from '../tools/release-checks/npm-package-output';

const actionProto = ReleaseAction.prototype as any;
const _origStageFn = actionProto.stageVersionForBranchAndCreatePullRequest;
const _origVerifyFn = actionProto._verifyPackageVersions;

// Patches the `@angular/dev-infra-private` release tool to perform sanity checks
// before staging a release. This is temporary until the dev-infra team has implemented
// a more generic solution to running sanity checks before releasing (potentially building
// some of the checks we have in the components repository into the release tool).
actionProto.stageVersionForBranchAndCreatePullRequest = async function(newVersion: SemVer) {
  await assertValidFrameworkPeerDependency(newVersion);
  await assertValidUpdateMigrationCollections(newVersion);

  return await _origStageFn.apply(this, arguments);
};

// Patches the `@angular/dev-infra-private` release tool to perform sanity
// checks of the NPM package output, before publishing to NPM.
actionProto._verifyPackageVersions =
    async function(newVersion: SemVer, builtPackages: BuiltPackage[]) {
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
  releaseNotes: {useReleaseTitle: true, groupOrder: releasePackages},
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  npmPackages: releasePackages.map(pkg => `@angular/${pkg}`),
  buildPackages: async () => {
    // The `performNpmReleaseBuild` function is loaded at runtime as loading of the
    // script results in an invocation of Bazel for any `yarn ng-dev` command.
    const {performNpmReleaseBuild} = await import('../scripts/build-packages-dist');
    return performNpmReleaseBuild();
  }
};
