import {join} from 'path';
import {ReleaseConfig} from '@angular/dev-infra-private/release/config';
import {releasePackages} from '../tools/release/release-output/release-packages';
import {promptAndGenerateChangelog} from '../tools/release/changelog';

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  npmPackages: releasePackages.map(pkg => `@angular/${pkg}`),
  buildPackages: async () => {
    // The performNpmReleaseBuild function is loaded at runtime as the loading the script causes an
    // invocation of bazel.
    const {performNpmReleaseBuild} = require(join(__dirname, '../scripts/build-packages-dist'));
    return performNpmReleaseBuild();
  },
  // TODO: This can be removed once there is an org-wide tool for changelog generation.
  generateReleaseNotesForHead: async () => {
    await promptAndGenerateChangelog(join(__dirname, '../CHANGELOG.md'));
  },
};
