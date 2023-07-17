import {ReleaseConfig} from '@angular/ng-dev';

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  representativeNpmPackage: '@angular/core',
  npmPackages: [
    {name: '@angular/animations'},
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
    // The buildTargetPackages function is loaded at runtime as the loading the script
    // causes an invocation of Bazel.
    const {performNpmReleaseBuild} = await import('../scripts/build/package-builder.mjs');
    return performNpmReleaseBuild();
  },
  releaseNotes: {
    hiddenScopes: ['aio', 'bazel', 'dev-infra', 'docs-infra', 'zone.js', 'devtools'],
  },
  releasePrLabels: ['area: build & ci', 'action: merge', 'PullApprove: disable'],
};
