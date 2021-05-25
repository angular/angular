import {join} from 'path';
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
  buildPackages: async (stampForRelease: boolean) => {
    // The buildTargetPackages function is loaded at runtime as the loading the script causes an
    // invocation of bazel.
    const {buildTargetPackages} = require(join(__dirname, '../scripts/build/package-builder'));
    return buildTargetPackages('dist/release-output', false, 'Release', stampForRelease);
  },
  releaseNotes: {
    hiddenScopes: ['aio', 'dev-infra', 'docs-infra', 'zone.js'],
  },
  releasePrLabels: ['comp: build & ci', 'action: merge', 'PullApprove: disable'],
};
