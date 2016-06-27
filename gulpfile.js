'use strict';

// THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// This is to ensure that we catch env issues before we error while requiring other dependencies.
require('./tools/check-environment')(
    {requiredNpmVersion: '>=3.5.3 <4.0.0', requiredNodeVersion: '>=5.4.1 <6.0.0'});


const gulp = require('gulp');
const path = require('path');
const os = require('os');

const srcsToFmt =
    ['tools/**/*.ts', 'modules/@angular/**/*.ts', '!tools/public_api_guard/**/*.d.ts'];

gulp.task('format:enforce', () => {
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp.src(srcsToFmt).pipe(
    format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
});

gulp.task('format', () => {
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp.src(srcsToFmt, { base: '.' }).pipe(
    format.format('file', clangFormat)).pipe(gulp.dest('.'));
});

const entrypoints = [
  'dist/packages-dist/core/index.d.ts',
  'dist/packages-dist/core/testing.d.ts',
  'dist/packages-dist/common/index.d.ts',
  'dist/packages-dist/common/testing.d.ts',
  'dist/packages-dist/compiler/index.d.ts',
  'dist/packages-dist/compiler/testing.d.ts',
  'dist/packages-dist/upgrade/index.d.ts',
  'dist/packages-dist/platform-browser/index.d.ts',
  'dist/packages-dist/platform-browser/testing.d.ts',
  'dist/packages-dist/platform-browser/testing_e2e.d.ts',
  'dist/packages-dist/platform-browser-dynamic/index.d.ts',
  'dist/packages-dist/platform-browser-dynamic/testing.d.ts',
  'dist/packages-dist/platform-server/index.d.ts',
  'dist/packages-dist/platform-server/testing.d.ts',
  'dist/packages-dist/http/index.d.ts',
  'dist/packages-dist/http/testing.d.ts',
  'dist/packages-dist/forms/index.d.ts',
  'dist/packages-dist/router/index.d.ts'
];
const publicApiDir = 'tools/public_api_guard';
const publicApiArgs = [
  '--rootDir', 'dist/packages-dist',
  '--stripExportPattern', '^__',
  '--allowModuleIdentifiers', 'jasmine',
  '--allowModuleIdentifiers', 'protractor',
  '--allowModuleIdentifiers', 'angular',
  '--onStabilityMissing', 'warn'
].concat(entrypoints);

// Note that these two commands work on built d.ts files instead of the source
gulp.task('public-api:enforce', (done) => {
  const child_process = require('child_process');
  child_process
      .spawn(
          `${__dirname}/node_modules/.bin/ts-api-guardian`,
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

gulp.task('public-api:update', (done) => {
  const child_process = require('child_process');
  child_process
      .spawn(
          `${__dirname}/node_modules/.bin/ts-api-guardian`,
          ['--outDir', publicApiDir].concat(publicApiArgs), {stdio: 'inherit'})
      .on('close', (errorCode) => done(errorCode));
});

gulp.task('lint', ['format:enforce', 'tools:build'], () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  const tslintConfig = require('./tslint.json');
  return gulp.src(['modules/@angular/**/*.ts', '!modules/@angular/*/test/**'])
    .pipe(tslint({
      tslint: require('tslint').default,
      configuration: tslintConfig,
      rulesDirectory: 'dist/tools/tslint'
    }))
    .pipe(tslint.report('prose', {emitError: true}));
});

gulp.task('tools:build', (done) => { tsc('tools/', done); });


gulp.task('serve', () => {
  let connect = require('gulp-connect');
  let cors = require('cors');

  connect.server({
    root: `${__dirname}/dist`,
    port: 8000,
    livereload: false,
    open: false,
    middleware: (connect, opt) => [cors()]
  });
});


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
  let child_process = require('child_process');

  child_process
      .spawn(
          path.normalize(`${__dirname}/node_modules/.bin/tsc`) + (/^win/.test(os.platform()) ? '.cmd' : ''),
          ['-p', path.join(__dirname, projectPath)],
          {stdio: 'inherit'})
      .on('close', (errorCode) => done(errorCode));
}
