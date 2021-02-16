import {join} from 'path';
import {exec} from 'shelljs';
import {ReleaseConfig} from '../dev-infra/release/config';

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  npmPackages: [
    '@angular/animations',
    '@angular/bazel',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/core',
    '@angular/elements',
    '@angular/forms',
    '@angular/language-service',
    '@angular/localize',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/platform-server',
    '@angular/router',
    '@angular/service-worker',
    '@angular/upgrade',
  ],
  buildPackages: async () => {
    // The buildTargetPackages function is loaded at runtime as the loading the script causes an
    // invocation of bazel.
    const {buildTargetPackages} = require(join(__dirname, '../scripts/build/package-builder'));
    return buildTargetPackages('dist/release-output', false, 'Release', true);
  },
  // TODO: This can be removed once there is an org-wide tool for changelog generation.
  generateReleaseNotesForHead: async () => {
    exec('yarn -s gulp changelog', {cwd: join(__dirname, '../')});
  },
  releasePrLabels: ['comp: build & ci', 'action: merge', 'PullApprove: disable'],
};
