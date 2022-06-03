import {SemVer} from 'semver';
import {ReleaseConfig} from '@angular/dev-infra-private/ng-dev';
import {assertValidFrameworkPeerDependency} from '../tools/release-checks/check-framework-peer-dependency';
import {assertValidUpdateMigrationCollections} from '../tools/release-checks/check-migration-collections';
import {assertValidNpmPackageOutput} from '../tools/release-checks/npm-package-output';

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
  prereleaseCheck: async (newVersionStr, builtPackagesWithInfo) => {
    const newVersion = new SemVer(newVersionStr);

    await assertValidFrameworkPeerDependency(newVersion);
    await assertValidUpdateMigrationCollections(newVersion);
    await assertValidNpmPackageOutput(builtPackagesWithInfo, newVersion);
  },
};
