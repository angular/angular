const entrypoints = [
  'dist/packages-dist/core/core.d.ts', 'dist/packages-dist/core/testing.d.ts',
  'dist/packages-dist/common/common.d.ts', 'dist/packages-dist/common/testing.d.ts',
  // The API surface of the compiler is currently unstable - all of the important APIs are exposed
  // via @angular/core, @angular/platform-browser or @angular/platform-browser-dynamic instead.
  //'dist/packages-dist/compiler/index.d.ts',
  //'dist/packages-dist/compiler/testing.d.ts',
  'dist/packages-dist/upgrade/upgrade.d.ts', 'dist/packages-dist/upgrade/static.d.ts',
  'dist/packages-dist/platform-browser/platform-browser.d.ts',
  'dist/packages-dist/platform-browser/testing.d.ts',
  'dist/packages-dist/platform-browser-dynamic/platform-browser-dynamic.d.ts',
  'dist/packages-dist/platform-browser-dynamic/testing.d.ts',
  'dist/packages-dist/platform-webworker/platform-webworker.d.ts',
  'dist/packages-dist/platform-webworker-dynamic/platform-webworker-dynamic.d.ts',
  'dist/packages-dist/platform-server/platform-server.d.ts',
  'dist/packages-dist/platform-server/testing.d.ts', 'dist/packages-dist/http/http.d.ts',
  'dist/packages-dist/http/testing.d.ts', 'dist/packages-dist/forms/forms.d.ts',
  'dist/packages-dist/router/router.d.ts', 'dist/packages-dist/animations/animations.d.ts',
  'dist/packages-dist/animations/browser.d.ts',
  'dist/packages-dist/animations/browser/testing.d.ts',
  'dist/packages-dist/platform-browser/animations.d.ts'
];

const publicApiDir = 'tools/public_api_guard';
const publicApiArgs = [
  '--rootDir',
  'dist/packages-dist',
  '--stripExportPattern',
  '^(__|ɵ)',
  '--allowModuleIdentifiers',
  'jasmine',
  '--allowModuleIdentifiers',
  'protractor',
  '--allowModuleIdentifiers',
  'angular',
  '--onStabilityMissing',
  'error',
].concat(entrypoints);

module.exports = {

  // Enforce that the public API matches the golden files
  // Note that these two commands work on built d.ts files instead of the source
  enforce: (gulp) => (done) => {
    const platformScriptPath = require('./platform-script-path');
    const childProcess = require('child_process');
    const path = require('path');

    childProcess
        .spawn(
            path.join(__dirname, platformScriptPath(`../../node_modules/.bin/ts-api-guardian`)),
            ['--verifyDir', path.normalize(publicApiDir)].concat(publicApiArgs), {stdio: 'inherit'})
        .on('close', (errorCode) => {
          if (errorCode !== 0) {
            done(new Error(
                'Public API differs from golden file. Please run `gulp public-api:update`.'));
          } else {
            done();
          }
        });
  },

  // Generate the public API golden files
  update: (gulp) => (done) => {
    const platformScriptPath = require('./platform-script-path');
    const childProcess = require('child_process');
    const path = require('path');

    childProcess
        .spawn(
            path.join(__dirname, platformScriptPath(`../../node_modules/.bin/ts-api-guardian`)),
            ['--outDir', path.normalize(publicApiDir)].concat(publicApiArgs), {stdio: 'inherit'})
        .on('close', done);
  }
};
