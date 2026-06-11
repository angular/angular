/**
 * Configuration for the `ng-dev release` command.
 *
 * @type { import("@angular/ng-dev").ReleaseConfig }
 */
export const release = {
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  representativeNpmPackage: '@angular/core',
  npmPackages: [
    {
      name: '@angular/animations',
      deprecated: {
        version: '>=20.2.0-next.3',
        message:
          '@angular/animations is deprecated. Use `animate.enter` and `animate.leave` instead. For more information see: https://v22.angular.dev/guide/animations.',
      },
    },
    {name: '@angular/common'},
    {name: '@angular/compiler-cli'},
    {name: '@angular/compiler'},
    {name: '@angular/core'},
    {name: '@angular/elements'},
    {name: '@angular/forms'},
    {name: '@angular/language-server'},
    {name: '@angular/language-service'},
    {name: '@angular/localize'},
    {
      name: '@angular/platform-browser-dynamic',
      deprecated: {
        version: '>=20.1.0-next.0',
        message:
          '@angular/platform-browser-dynamic is deprecated. Use `@angular/platform-browser` instead.',
      },
    },
    {name: '@angular/platform-browser'},
    {name: '@angular/platform-server'},
    {name: '@angular/router'},
    {name: '@angular/service-worker'},
    {name: '@angular/upgrade'},
  ],
  buildPackages: async () => {
    // The buildTargetPackages function is loaded at runtime as the loading the script
    // causes an invocation of Bazel.
    const {performNpmReleaseBuild} = await import('../scripts/build/package-builder.mts');
    return performNpmReleaseBuild();
  },
  releaseNotes: {
    hiddenScopes: [
      'dev-infra',
      'docs-infra',
      'zone.js',
      'devtools',
      'vscode-extension',
      'benchpress',
    ],
  },
  releasePrLabels: ['area: build & ci', 'action: merge', 'PullApprove: disable'],
};
