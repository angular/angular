import {ReleaseConfig} from '@angular/dev-infra-private/ng-dev';
import {join} from 'path';

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  representativeNpmPackage: '@angular/core',
  npmPackages: [
    {name: '@angular/animations'},
    {name: '@angular/bazel'},
    {name: '@angular/common'},
    {name: '@angular/compiler'},
    {name: '@angular/compiler-cli'},
    {name: '@angular/core'},
    {name: '@angular/elements'},
    {name: '@angular/forms'},
    {name: '@angular/language-service'},
    {name: '@angular/localize'},
    {name: '@angular/platform-browser'},
    {name: '@angular/platform-browser-dynamic'},
    {name: '@angular/platform-server'},
    {name: '@angular/router'},
    {name: '@angular/service-worker'},
    {name: '@angular/upgrade'},
  ],
  buildPackages: async () => {
    // The buildTargetPackages function is loaded at runtime as the loading the script causes an
    // invocation of bazel.
    const {buildTargetPackages} = require(join(__dirname, '../scripts/build/package-builder'));
    return buildTargetPackages('dist/release-output', false, 'Release', /* isRelease */ true);
  },
  releaseNotes: {
    hiddenScopes: ['aio', 'bazel', 'dev-infra', 'docs-infra', 'zone.js', 'devtools'],
  },
  releasePrLabels: ['comp: build & ci', 'action: merge', 'PullApprove: disable'],
};
