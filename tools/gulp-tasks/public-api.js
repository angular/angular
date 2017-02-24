const entrypoints = [
  'dist/packages-dist/core/typings/core.d.ts', 'dist/packages-dist/core/typings/testing/index.d.ts',
  'dist/packages-dist/common/typings/common.d.ts',
  'dist/packages-dist/common/typings/testing/index.d.ts',
  // The API surface of the compiler is currently unstable - all of the important APIs are exposed
  // via @angular/core, @angular/platform-browser or @angular/platform-browser-dynamic instead.
  //'dist/packages-dist/compiler/index.d.ts',
  //'dist/packages-dist/compiler/testing.d.ts',
  'dist/packages-dist/upgrade/typings/upgrade.d.ts',
  'dist/packages-dist/upgrade/typings/static/static.d.ts',
  'dist/packages-dist/platform-browser/typings/platform-browser.d.ts',
  'dist/packages-dist/platform-browser/typings/testing/index.d.ts',
  'dist/packages-dist/platform-browser-dynamic/typings/platform-browser-dynamic.d.ts',
  'dist/packages-dist/platform-browser-dynamic/typings/testing/index.d.ts',
  'dist/packages-dist/platform-webworker/typings/platform-webworker.d.ts',
  'dist/packages-dist/platform-webworker-dynamic/typings/platform-webworker-dynamic.d.ts',
  'dist/packages-dist/platform-server/typings/platform-server.d.ts',
  'dist/packages-dist/platform-server/typings/testing/index.d.ts',
  'dist/packages-dist/http/typings/http.d.ts', 'dist/packages-dist/http/typings/testing/index.d.ts',
  'dist/packages-dist/forms/typings/forms.d.ts', 'dist/packages-dist/router/typings/router.d.ts',
  'dist/packages-dist/animations/typings/animations.d.ts',
  'dist/packages-dist/platform-browser/typings/animations/animations.d.ts',
  'dist/packages-dist/platform-browser/typings/animations/testing/index.d.ts'
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
