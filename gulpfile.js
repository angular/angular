'use strict';

// THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// This is to ensure that we catch env issues before we error while requiring other dependencies.
require('./tools/check-environment')({
  requiredNpmVersion: '>=3.5.3 <4.0.0',
  requiredNodeVersion: '>=5.4.1 <7.0.0',
});

const gulp = require('gulp');
const path = require('path');
const os = require('os');

// clang-format entry points
const srcsToFmt = [
  'modules/@angular/**/*.ts',
  'modules/benchmarks/**/*.ts',
  'modules/e2e_util/**/*.ts',
  'modules/playground/**/*.ts',
  'tools/**/*.ts',
  '!tools/public_api_guard/**/*.d.ts',
];

// Check source code for formatting errors (clang-format)
gulp.task('format:enforce', () => {
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp.src(srcsToFmt).pipe(
    format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
});

// Format the source code with clang-format (see .clang-format)
gulp.task('format', () => {
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp.src(srcsToFmt, { base: '.' }).pipe(
    format.format('file', clangFormat)).pipe(gulp.dest('.'));
});

const entrypoints = [
  'dist/packages-dist/core/index.d.ts',
  'dist/packages-dist/core/testing/index.d.ts',
  'dist/packages-dist/common/index.d.ts',
  'dist/packages-dist/common/testing/index.d.ts',
  // The API surface of the compiler is currently unstable - all of the important APIs are exposed
  // via @angular/core, @angular/platform-browser or @angular/platform-browser-dynamic instead.
  //'dist/packages-dist/compiler/index.d.ts',
  //'dist/packages-dist/compiler/testing.d.ts',
  'dist/packages-dist/upgrade/index.d.ts',
  'dist/packages-dist/platform-browser/index.d.ts',
  'dist/packages-dist/platform-browser/testing/index.d.ts',
  'dist/packages-dist/platform-browser-dynamic/index.d.ts',
  'dist/packages-dist/platform-browser-dynamic/testing/index.d.ts',
  'dist/packages-dist/platform-webworker/index.d.ts',
  'dist/packages-dist/platform-webworker-dynamic/index.d.ts',
  'dist/packages-dist/platform-server/index.d.ts',
  'dist/packages-dist/platform-server/testing/index.d.ts',
  'dist/packages-dist/http/index.d.ts',
  'dist/packages-dist/http/testing/index.d.ts',
  'dist/packages-dist/forms/index.d.ts',
  'dist/packages-dist/router/index.d.ts',
];
const publicApiDir = path.normalize('tools/public_api_guard');
const publicApiArgs = [
  '--rootDir', 'dist/packages-dist',
  '--stripExportPattern', '^__',
  '--allowModuleIdentifiers', 'jasmine',
  '--allowModuleIdentifiers', 'protractor',
  '--allowModuleIdentifiers', 'angular',
  '--onStabilityMissing', 'error',
].concat(entrypoints);

// Build angular
gulp.task('build.sh', (done) => {
  const childProcess = require('child_process');

  childProcess.exec(path.join(__dirname, 'build.sh'), done);
});

// Enforce that the public API matches the golden files
// Note that these two commands work on built d.ts files instead of the source
gulp.task('public-api:enforce', (done) => {
  const childProcess = require('child_process');

  childProcess
    .spawn(
      path.join(__dirname, platformScriptPath(`/node_modules/.bin/ts-api-guardian`)),
      ['--verifyDir', publicApiDir].concat(publicApiArgs), {stdio: 'inherit'})
    .on('close', (errorCode) => {
      if (errorCode !== 0) {
        done(new Error(
          'Public API differs from golden file. Please run `gulp public-api:update`.'));
      } else {
        done();
      }
    });
});

// Generate the public API golden files
gulp.task('public-api:update', ['build.sh'], (done) => {
  const childProcess = require('child_process');

  childProcess
    .spawn(
      path.join(__dirname, platformScriptPath(`/node_modules/.bin/ts-api-guardian`)),
      ['--outDir', publicApiDir].concat(publicApiArgs), {stdio: 'inherit'})
    .on('close', done);
});

// Checks tests for presence of ddescribe, fdescribe, fit, iit and fails the build if one of the focused tests is found.
// Currently xdescribe and xit are _not_ reported as errors since there are a couple of excluded tests in our code base.
gulp.task('check-tests', function() {
  const ddescribeIit = require('gulp-ddescribe-iit');
  return gulp.src([
    'modules/**/*.spec.ts',
    'modules/**/*_spec.ts',
  ]).pipe(ddescribeIit({allowDisabledTests: true}));
});

// Check the coding standards and programming errors
gulp.task('lint', ['check-tests', 'format:enforce', 'tools:build'], () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  const tslintConfig = require('./tslint.json');
  return gulp.src(['modules/@angular/**/*.ts', 'modules/benchpress/**/*.ts'])
    .pipe(tslint({
      tslint: require('tslint').default,
      configuration: tslintConfig,
      rulesDirectory: 'dist/tools/tslint',
      formatter: 'prose',
    }))
    .pipe(tslint.report({emitError: true}));
});

gulp.task('tools:build', (done) => { tsc('tools/', done); });

// Check for circular dependency in the source code
gulp.task('check-cycle', (done) => {
  const madge = require('madge');

  const dependencyObject = madge(['dist/all/'], {
    format: 'cjs',
    extensions: ['.js'],
    onParseFile: function(data) { data.src = data.src.replace(/\/\* circular \*\//g, "//"); }
  });
  const circularDependencies = dependencyObject.circular().getArray();
  if (circularDependencies.length > 0) {
    console.log('Found circular dependencies!');
    console.log(circularDependencies);
    process.exit(1);
  }
  done();
});

// Serve the built files
gulp.task('serve', () => {
  const connect = require('gulp-connect');
  const cors = require('cors');

  connect.server({
    root: `${__dirname}/dist`,
    port: 8000,
    livereload: false,
    open: false,
    middleware: (connect, opt) => [cors()],
  });
});

// Serve the examples
gulp.task('serve-examples', () => {
  const connect = require('gulp-connect');
  const cors = require('cors');

  connect.server({
      root: `${__dirname}/dist/examples`,
      port: 8001,
      livereload: false,
      open: false,
      middleware: (connect, opt) => [cors()],
  });
});


// Update the changelog with the latest changes
gulp.task('changelog', () => {
  const conventionalChangelog = require('gulp-conventional-changelog');

  return gulp.src('CHANGELOG.md')
    .pipe(conventionalChangelog({
      preset: 'angular',
      releaseCount: 1
    }, {
      // Conventional Changelog Context
      // We have to manually set version number so it doesn't get prefixed with `v`
      // See https://github.com/conventional-changelog/conventional-changelog-core/issues/10
      currentTag: require('./package.json').version
    }))
    .pipe(gulp.dest('./'));
});

function tsc(projectPath, done) {
  const childProcess = require('child_process');

  childProcess
      .spawn(
          path.normalize(platformScriptPath(`${__dirname}/node_modules/.bin/tsc`)),
          ['-p', path.join(__dirname, projectPath)],
          {stdio: 'inherit'})
      .on('close', done);
}

// returns the script path for the current platform
function platformScriptPath(path) {
  return /^win/.test(os.platform()) ? `${path}.cmd` : path;
}
