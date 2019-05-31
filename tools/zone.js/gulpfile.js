/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
'use strict';

var gulp = require('gulp');
var rollup = require('gulp-rollup');
var rename = require('gulp-rename');
var terser = require('gulp-terser');
var pump = require('pump');
var path = require('path');
var spawn = require('child_process').spawn;
const os = require('os');

function generateScript(inFile, outFile, minify, callback, format, inDir) {
  if (!format) {
    format = 'umd';
  }
  if (!inDir) {
    inDir = './build-esm/'
  }
  inFile = path.join(inDir, inFile).replace(/\.ts$/, '.js');
  var parts = [
    gulp.src(inDir + 'lib/**/*.js')
        .pipe(rollup({
          input: inFile,
          onwarn: function(warning) {
            // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
            if (warning.code === 'THIS_IS_UNDEFINED') {
              return;
            }
            console.error(warning.message);
          },
          output: {
            format: format,
            name: 'zone',
            banner: '/**\n' +
                '* @license\n' +
                '* Copyright Google Inc. All Rights Reserved.\n' +
                '*\n' +
                '* Use of this source code is governed by an MIT-style license that can be\n' +
                '* found in the LICENSE file at https://angular.io/license\n' +
                '*/',
            globals: {
              'rxjs/Observable': 'Rx',
              'rxjs/Subscriber': 'Rx',
              'rxjs/Subscription': 'Rx',
              'rxjs/Scheduler': 'Rx.Scheduler',
              'rxjs/scheduler/asap': 'Rx.Scheduler',
              'rxjs/scheduler/async': 'Rx.Scheduler',
              'rxjs/symbol/rxSubscriber': 'Rx.Symbol'
            }
          },
          external: id => {
            if (/build-esm/.test(id)) {
              return false;
            }
            return /rxjs/.test(id);
          }
        }))
        .pipe(rename(outFile)),
  ];
  if (minify) {
    parts.push(terser({
      ecma: format === 'es' ? 6 : 5, // specify one of: 5, 6, 7 or 8
    }));
  }
  parts.push(gulp.dest('./dist'));
  pump(parts, callback);
}

// returns the script path for the current platform
function platformScriptPath(path) {
  return /^win/.test(os.platform()) ? `${path}.cmd` : path;
}

function tsc(config, cb) {
  spawn(path.normalize(platformScriptPath('./node_modules/.bin/tsc')), ['-p', config], {
    stdio: 'inherit'
  }).on('close', function(exitCode) {
    if (exitCode) {
      var err = new Error('TypeScript compiler failed');
      // The stack is not useful in this context.
      err.showStack = false;
      cb(err);
    } else {
      cb();
    }
  });
}

// This is equivalent to `npm run tsc`.
gulp.task('compile', function(cb) {
  tsc('tsconfig.json', cb);
});

gulp.task('compile-node', function(cb) {
  tsc('tsconfig-node.json', cb);
});

gulp.task('compile-esm', function(cb) {
  tsc('tsconfig-esm.json', cb);
});

gulp.task('compile-esm-2015', function(cb) {
  tsc('tsconfig-esm-2015.json', cb);
});

gulp.task('compile-esm-node', function(cb) {
  tsc('tsconfig-esm-node.json', cb);
});

gulp.task('build/zone.js.d.ts', ['compile-esm'], function() {
  return gulp.src('./build-esm/lib/zone.d.ts')
      .pipe(rename('zone.js.d.ts'))
      .pipe(gulp.dest('./dist'));
});

// Zone for Node.js environment.
gulp.task('build/zone-node.js', ['compile-esm-node'], function(cb) {
  return generateScript('./lib/node/rollup-main.ts', 'zone-node.js', false, cb);
});

// Zone for the browser.
gulp.task('build/zone.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/rollup-legacy-main.ts', 'zone.js', false, cb);
});

gulp.task('build/zone.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/rollup-legacy-main.ts', 'zone.min.js', true, cb);
});

// Zone for the evergreen browser.
gulp.task('build/zone-evergreen.js', ['compile-esm-2015'], function(cb) {
  return generateScript('./lib/browser/rollup-main.ts', 'zone-evergreen.js', false, cb, 'es', './build-esm-2015/');
});

gulp.task('build/zone-evergreen.min.js', ['compile-esm-2015'], function(cb) {
  return generateScript('./lib/browser/rollup-main.ts', 'zone-evergreen.min.js', true, cb, 'es', './build-esm-2015/');
});

// Zone legacy patch for the legacy browser.
gulp.task('build/zone-legacy.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/browser-legacy.ts', 'zone-legacy.js', false, cb);
});

gulp.task('build/zone-legacy.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/browser-legacy.ts', 'zone-legacy.min.js', true, cb);
});

// Zone test bundle for the browser.
gulp.task('build/zone-testing-bundle.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/rollup-legacy-test-main.ts', 'zone-testing-bundle.js', false, cb);
});

// Zone test bundle for the evergreen browser.
gulp.task('build/zone-evergreen-testing-bundle.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/rollup-test-main.ts', 'zone-evergreen-testing-bundle.js', false, cb);
});

// Zone test bundle for node.
gulp.task('build/zone-testing-node-bundle.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/node/rollup-test-main.ts', 'zone-testing-node-bundle.js', false, cb);
});

// Zone test related files for the browser.
gulp.task('build/zone-testing.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/testing/zone-testing.ts', 'zone-testing.js', false, cb);
});

// Zone for electron/nw environment.
gulp.task('build/zone-mix.js', ['compile-esm-node'], function(cb) {
  return generateScript('./lib/mix/rollup-mix.ts', 'zone-mix.js', false, cb);
});

gulp.task('build/zone-error.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/common/error-rewrite.ts', 'zone-error.js', false, cb);
});

gulp.task('build/zone-error.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/common/error-rewrite.ts', 'zone-error.min.js', true, cb);
});

gulp.task('build/zone-patch-canvas.js', ['compile-esm'], function(cb) {
  return generateScript(
    './lib/browser/canvas.ts', 'zone-patch-canvas.js', false, cb);
});

gulp.task('build/zone-patch-canvas.min.js', ['compile-esm'], function(cb) {
  return generateScript(
    './lib/browser/canvas.ts', 'zone-patch-canvas.min.js', true, cb);
});

gulp.task('build/zone-patch-fetch.js', ['compile-esm'], function(cb) {
  return generateScript(
    './lib/common/fetch.ts', 'zone-patch-fetch.js', false, cb);
});

gulp.task('build/zone-patch-fetch.min.js', ['compile-esm'], function(cb) {
  return generateScript(
    './lib/common/fetch.ts', 'zone-patch-fetch.min.js', true, cb);
});


gulp.task('build/webapis-media-query.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-media-query.ts', 'webapis-media-query.js', false, cb);
});

gulp.task('build/webapis-media-query.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-media-query.ts', 'webapis-media-query.min.js', true, cb);
});

gulp.task('build/webapis-notification.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-notification.ts', 'webapis-notification.js', false, cb);
});

gulp.task('build/webapis-notification.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-notification.ts', 'webapis-notification.min.js', true, cb);
});

gulp.task('build/webapis-rtc-peer-connection.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-rtc-peer-connection.ts', 'webapis-rtc-peer-connection.js', false, cb);
});

gulp.task('build/webapis-rtc-peer-connection.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-rtc-peer-connection.ts', 'webapis-rtc-peer-connection.min.js', true,
      cb);
});

gulp.task('build/webapis-shadydom.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/shadydom.ts', 'webapis-shadydom.js', false, cb);
});

gulp.task('build/webapis-shadydom.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/browser/shadydom.ts', 'webapis-shadydom.min.js', true, cb);
});

gulp.task('build/zone-patch-cordova.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/cordova.ts', 'zone-patch-cordova.js', false, cb);
});

gulp.task('build/zone-patch-cordova.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/cordova.ts', 'zone-patch-cordova.min.js', true, cb);
});

gulp.task('build/zone-patch-electron.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/electron.ts', 'zone-patch-electron.js', false, cb);
});

gulp.task('build/zone-patch-electron.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/electron.ts', 'zone-patch-electron.min.js', true, cb);
});

gulp.task('build/zone-patch-user-media.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-user-media.ts', 'zone-patch-user-media.js', false, cb);
});

gulp.task('build/zone-patch-user-media.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-user-media.ts', 'zone-patch-user-media.min.js', true, cb);
});

gulp.task('build/zone-patch-socket-io.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/socket-io.ts', 'zone-patch-socket-io.js', false, cb);
});

gulp.task('build/zone-patch-socket-io.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/socket-io.ts', 'zone-patch-socket-io.min.js', true, cb);
});

gulp.task('build/zone-patch-promise-testing.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/testing/promise-testing.ts', 'zone-patch-promise-test.js', false, cb);
});

gulp.task('build/zone-patch-promise-testing.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/testing/promise-testing.ts', 'zone-patch-promise-test.min.js', true, cb);
});

gulp.task('build/zone-patch-resize-observer.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-resize-observer.ts', 'zone-patch-resize-observer.js', false, cb);
});

gulp.task('build/zone-patch-resize-observer.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/browser/webapis-resize-observer.ts', 'zone-patch-resize-observer.min.js', true, cb);
});

gulp.task('build/bluebird.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/bluebird.ts', 'zone-bluebird.js', false, cb);
});

gulp.task('build/bluebird.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/bluebird.ts', 'zone-bluebird.min.js', true, cb);
});

gulp.task('build/zone-patch-jsonp.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/jsonp.ts', 'zone-patch-jsonp.js', false, cb);
});

gulp.task('build/zone-patch-jsonp.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/extra/jsonp.ts', 'zone-patch-jsonp.min.js', true, cb);
});

gulp.task('build/jasmine-patch.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/jasmine/jasmine.ts', 'jasmine-patch.js', false, cb);
});

gulp.task('build/jasmine-patch.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/jasmine/jasmine.ts', 'jasmine-patch.min.js', true, cb);
});

gulp.task('build/mocha-patch.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/mocha/mocha.ts', 'mocha-patch.js', false, cb);
});

gulp.task('build/mocha-patch.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/mocha/mocha.ts', 'mocha-patch.min.js', true, cb);
});

gulp.task('build/long-stack-trace-zone.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/zone-spec/long-stack-trace.ts', 'long-stack-trace-zone.js', false, cb);
});

gulp.task('build/long-stack-trace-zone.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/zone-spec/long-stack-trace.ts', 'long-stack-trace-zone.min.js', true, cb);
});

gulp.task('build/proxy-zone.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/proxy.ts', 'proxy.js', false, cb);
});

gulp.task('build/proxy-zone.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/proxy.ts', 'proxy.min.js', true, cb);
});

gulp.task('build/task-tracking.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/task-tracking.ts', 'task-tracking.js', false, cb);
});

gulp.task('build/task-tracking.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/task-tracking.ts', 'task-tracking.min.js', true, cb);
});

gulp.task('build/wtf.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/wtf.ts', 'wtf.js', false, cb);
});

gulp.task('build/wtf.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/wtf.ts', 'wtf.min.js', true, cb);
});

gulp.task('build/async-test.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/testing/async-testing.ts', 'async-test.js', false, cb);
});

gulp.task('build/fake-async-test.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/testing/fake-async.ts', 'fake-async-test.js', false, cb);
});

gulp.task('build/sync-test.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/zone-spec/sync-test.ts', 'sync-test.js', false, cb);
});

gulp.task('build/rxjs.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/rxjs/rxjs.ts', 'zone-patch-rxjs.js', false, cb);
});

gulp.task('build/rxjs.min.js', ['compile-esm'], function(cb) {
  return generateScript('./lib/rxjs/rxjs.ts', 'zone-patch-rxjs.min.js', true, cb);
});

gulp.task('build/rxjs-fake-async.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/rxjs/rxjs-fake-async.ts', 'zone-patch-rxjs-fake-async.js', false, cb);
});

gulp.task('build/rxjs-fake-async.min.js', ['compile-esm'], function(cb) {
  return generateScript(
      './lib/rxjs/rxjs-fake-async.ts', 'zone-patch-rxjs-fake-async.min.js', true, cb);
});

gulp.task('build/closure.js', function() {
  return gulp.src('./lib/closure/zone_externs.js').pipe(gulp.dest('./dist'));
});

gulp.task('build', [
  'build/zone.js',
  'build/zone.js.d.ts',
  'build/zone.min.js',
  'build/zone-evergreen.js',
  'build/zone-evergreen.min.js',
  'build/zone-legacy.js',
  'build/zone-legacy.min.js',
  'build/zone-testing.js',
  'build/zone-testing-bundle.js',
  'build/zone-evergreen-testing-bundle.js',
  'build/zone-testing-node-bundle.js',
  'build/zone-error.js',
  'build/zone-error.min.js',
  'build/zone-node.js',
  'build/zone-patch-canvas.js',
  'build/zone-patch-canvas.min.js',
  'build/zone-patch-fetch.js',
  'build/zone-patch-fetch.min.js',
  'build/webapis-media-query.js',
  'build/webapis-media-query.min.js',
  'build/webapis-notification.js',
  'build/webapis-notification.min.js',
  'build/webapis-rtc-peer-connection.js',
  'build/webapis-rtc-peer-connection.min.js',
  'build/webapis-shadydom.js',
  'build/webapis-shadydom.min.js',
  'build/zone-patch-cordova.js',
  'build/zone-patch-cordova.min.js',
  'build/zone-patch-electron.js',
  'build/zone-patch-electron.min.js',
  'build/zone-patch-user-media.js',
  'build/zone-patch-user-media.min.js',
  'build/zone-patch-socket-io.js',
  'build/zone-patch-socket-io.min.js',
  'build/zone-patch-promise-testing.js',
  'build/zone-patch-promise-testing.min.js',
  'build/zone-patch-resize-observer.js',
  'build/zone-patch-resize-observer.min.js',
  'build/zone-mix.js',
  'build/bluebird.js',
  'build/bluebird.min.js',
  'build/zone-patch-jsonp.js',
  'build/zone-patch-jsonp.min.js',
  'build/jasmine-patch.js',
  'build/jasmine-patch.min.js',
  'build/mocha-patch.js',
  'build/mocha-patch.min.js',
  'build/long-stack-trace-zone.js',
  'build/long-stack-trace-zone.min.js',
  'build/proxy-zone.js',
  'build/proxy-zone.min.js',
  'build/task-tracking.js',
  'build/task-tracking.min.js',
  'build/wtf.js',
  'build/wtf.min.js',
  'build/async-test.js',
  'build/fake-async-test.js',
  'build/sync-test.js',
  'build/rxjs.js',
  'build/rxjs.min.js',
  'build/rxjs-fake-async.js',
  'build/rxjs-fake-async.min.js',
  'build/closure.js'
]);

function nodeTest(specFiles, cb) {
  require('./build/test/node-env-setup');

  // load zone-node here to let jasmine be able to use jasmine.clock().install()
  // without throw error
  require('./build/lib/node/rollup-main');
  var args = process.argv;
  if (args.length > 3) {
    require('./build/test/test-env-setup-jasmine' + args[3]);
  }
  var JasmineRunner = require('jasmine');
  var jrunner = new JasmineRunner();

  jrunner.configureDefaultReporter({showColors: true});

  jrunner.onComplete(function(passed) {
    if (!passed) {
      var err = new Error('Jasmine node tests failed.');
      // The stack is not useful in this context.
      err.showStack = false;
      cb(err);
    } else {
      cb();
    }
  });
  jrunner.print = function(value) {
    process.stdout.write(value);
  };
  jrunner.addReporter(new JasmineRunner.ConsoleReporter(jrunner));
  jrunner.projectBaseDir = __dirname;
  jrunner.specDir = '';
  jrunner.addSpecFiles(specFiles);
  jrunner.execute();
}

gulp.task('test/node', ['compile-node'], function(cb) {
  var specFiles = ['build/test/node_entry_point.js'];
  nodeTest(specFiles, cb);
});

gulp.task('test/bluebird', ['compile-node'], function(cb) {
  var specFiles = ['build/test/node_bluebird_entry_point.js'];
  nodeTest(specFiles, cb);
});

gulp.task('test/node/disableerror', ['compile-node'], function(cb) {
  process.env.errorpolicy = 'disable';
  var specFiles = ['build/test/node_error_entry_point.js'];
  nodeTest(specFiles, cb);
});

gulp.task('test/node/lazyerror', ['compile-node'], function(cb) {
  process.env.errorpolicy = 'lazy';
  var specFiles = ['build/test/node_error_entry_point.js'];
  nodeTest(specFiles, cb);
});

// Check the coding standards and programming errors
gulp.task('lint', () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  const tslintConfig = require('./tslint.json');

  return gulp.src(['lib/**/*.ts', 'test/**/*.ts'])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: tslintConfig,
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
});

// clang-format entry points
const srcsToFmt = [
  'lib/**/*.ts',
  'test/**/*.ts',
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
  return gulp.src(srcsToFmt, {base: '.'})
      .pipe(format.format('file', clangFormat))
      .pipe(gulp.dest('.'));
});

// Update the changelog with the latest changes
gulp.task('changelog', () => {
  const conventionalChangelog = require('gulp-conventional-changelog');

  return gulp.src('CHANGELOG.md')
      .pipe(conventionalChangelog({preset: 'angular', releaseCount: 1}, {
        // Conventional Changelog Context
        // We have to manually set version number so it doesn't get prefixed with `v`
        // See https://github.com/conventional-changelog/conventional-changelog-core/issues/10
        currentTag: require('./package.json').version
      }))
      .pipe(gulp.dest('./'));
});

// run promise aplus test
gulp.task('promisetest', ['build/zone-node.js'], (cb) => {
  const promisesAplusTests = require('promises-aplus-tests');
  const adapter = require('./promise-adapter');
  promisesAplusTests(adapter, {reporter: 'dot'}, function(err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
});

// check dist file size limitation
gulp.task('filesize', ['build'], (cb) => {
  const checker = require('./check-file-size');
  const result = checker(require('./file-size-limit.json'));
  if (result) {
    cb();
  } else {
    cb('check file size failed');
  }
});
