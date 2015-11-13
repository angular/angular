'use strict';

var autoprefixer = require('gulp-autoprefixer');
var clangFormat = require('clang-format');
var del = require('del');
var exec = require('child_process').exec;
var fork = require('child_process').fork;
var gulp = require('gulp');
var gulpFormat = require('gulp-clang-format');
var gulpPlugins = require('gulp-load-plugins')();
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var spawn = require('child_process').spawn;
var runSequence = require('run-sequence');
var madge = require('madge');
var merge = require('merge');
var merge2 = require('merge2');
var path = require('path');
var q = require('q');
var licenseWrap = require('./tools/build/licensewrap');
var analytics = require('./tools/analytics/analytics');

var watch = require('./tools/build/watch');

var pubget = require('./tools/build/pubget');
var proto = require('./tools/build/proto');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
var dartapidocs = require('./tools/build/dartapidocs');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var karma = require('karma');
var minimist = require('minimist');
var runServerDartTests = require('./tools/build/run_server_dart_tests');
var sourcemaps = require('gulp-sourcemaps');
var tsc = require('gulp-typescript');
var util = require('./tools/build/util');
var bundler = require('./tools/build/bundle');
var replace = require('gulp-replace');
var insert = require('gulp-insert');
var buildRouter = require('./modules/angular1_router/build');
var uglify = require('gulp-uglify');
var shouldLog = require('./tools/build/logging');
var dartSdk = require('./tools/build/dart');
var browserProvidersConf = require('./browser-providers.conf.js');
var os = require('os');

require('./tools/check-environment')({
  requiredNpmVersion: '>=2.14.7',
  requiredNodeVersion: '>=4.2.1'
});

// Make it easy to quiet down portions of the build.
// --logs=all -> log everything (This is the default)
// --logs=quiet -> log nothing
// --logs=<comma-separated-list> -> log listed items.
//
// Not all commands support optional logging, feel free
// to add support by adding a new key to this list,
// and toggling output from the command based on it.
var logs = {
  dartfmt: shouldLog('dartfmt')
};

// dynamic require in build.tools so we can bootstrap TypeScript compilation
function throwToolsBuildMissingError() {
  throw new Error('ERROR: build.tools task should have been run before using angularBuilder');
}

var angularBuilder = {
  rebuildBrowserDevTree: throwToolsBuildMissingError,
  rebuildBrowserProdTree: throwToolsBuildMissingError,
  rebuildNodeTree: throwToolsBuildMissingError,
  rebuildDartTree: throwToolsBuildMissingError,
  uninitialized: true
};


function sequenceComplete(done) {
  return function (err) {
    if (err) {
      var error = new Error('build sequence failed');
      error.showStack = false;
      done(error);
    } else {
      done();
    }
  };
}


var treatTestErrorsAsFatal = true;

function runJasmineTests(globs, done) {
  var args = ['--'].concat(globs);
  fork('./tools/cjs-jasmine', args, {stdio: 'inherit'})
      .on('close', function jasmineCloseHandler(exitCode) {
        if (exitCode && treatTestErrorsAsFatal) {
          var err = new Error('Jasmine tests failed');
          // Mark the error for gulp similar to how gulp-utils.PluginError does it.
          // The stack is not useful in this context.
          err.showStack = false;
          done(err);
        } else {
          done();
        }
      });
}

// Note: when DART_SDK is not found, all gulp tasks ending with `.dart` will be skipped.
var DART_SDK = dartSdk.detect(gulp);

// -----------------------
// configuration

var CONFIG = {
  dest: {
    js: {
      all: 'dist/js',
      dev: {
        es6: 'dist/js/dev/es6',
        es5: 'dist/js/dev/es5'
      },
      prod: {
        es6: 'dist/js/prod/es6',
        es5: 'dist/js/prod/es5'
      },
      cjs: 'dist/js/cjs',
      dart2js: 'dist/js/dart2js'
    },
    dart: 'dist/dart',
    docs: 'dist/docs',
    docs_angular_io: 'dist/angular.io',
    benchpress_bundle: 'dist/build/benchpress_bundle/'
  }
};

var BENCHPRESS_BUNDLE_CONFIG = {
  entries: ['./dist/js/cjs/benchpress/index.js'],
  packageJson: './dist/js/cjs/benchpress/package.json',
  includes: [
    'angular2'
  ],
  excludes: [
    'reflect-metadata',
    'selenium-webdriver',
    'zone.js'
  ],
  ignore: [
    '@reactivex/rxjs'
  ],
  dest: CONFIG.dest.benchpress_bundle
};

// ------------
// clean

gulp.task('build/clean.tools', function() {
  del(path.join('dist', 'tools'));
});

gulp.task('build/clean.js', function(done) {
  del(CONFIG.dest.js.all, done);
});

gulp.task('build/clean.dart', function(done) {
  del(CONFIG.dest.dart, done);
});

gulp.task('build/clean.docs',  function(done) {
  del(CONFIG.dest.docs, done);
});

gulp.task('build/clean.docs_angular_io', function(done) {
  del(CONFIG.dest.docs_angular_io, done);
});

gulp.task('build/clean.benchpress.bundle', function(done) {
  del(CONFIG.dest.benchpress_bundle, done);
});

// ------------
// transpile

gulp.task('build/tree.dart', ['build/clean.dart', 'build.tools'], function(done) {
  runSequence('!build/tree.dart', sequenceComplete(done));
});


gulp.task('!build/tree.dart', function() {
  return angularBuilder.rebuildDartTree();
});


// ------------
// pubspec

// Run a top-level `pub get` for this project.
gulp.task('pubget.dart', pubget.dir(gulp, gulpPlugins, { dir: '.', command: DART_SDK.PUB }));

// Run `pub get` only on the angular2 dir of CONFIG.dest.dart
gulp.task('!build/pubget.angular2.dart', pubget.dir(gulp, gulpPlugins, {
  dir: path.join(CONFIG.dest.dart, 'angular2'),
  command: DART_SDK.PUB
}));

// Run `pub get` over CONFIG.dest.dart
gulp.task('build/pubspec.dart', pubget.subDir(gulp, gulpPlugins, {
  dir: CONFIG.dest.dart,
  command: DART_SDK.PUB
}));


// This is a hacky way to work around dart's pub that creates `packages` symlink in every directory
// that contains a dart file with the main method. For our tests this means that every test subfolder
// has a link to the root `packages` directory which causes Karma to sift through 80k files during
// each `karma run` invocation.
//
// Since these directories are not needed for karma tests to run, it's safe to delete them without
// breaking any functionality.
//
// See #2437 for more info.
gulp.task('!build/remove-pub-symlinks', function(done) {
  if (process.platform == 'win32') {
    done();
    return;
  }

  exec('find dist/dart/angular2/test/ -name packages | xargs rm -r', function (error, stdout, stderr) {
    if (error) {
      done(stderr);
      return;
    }
    done();
  });
});

// ------------
// dartanalyzer

gulp.task('build/analyze.dart', dartanalyzer(gulp, gulpPlugins, {
  dest: CONFIG.dest.dart,
  command: DART_SDK.ANALYZER
}));

gulp.task('build/analyze.ddc.dart', dartanalyzer(gulp, gulpPlugins, {
  dest: CONFIG.dest.dart,
  command: DART_SDK.ANALYZER,
  use_ddc: true
}));

gulp.task('build/check.apidocs.dart', dartapidocs(gulp, gulpPlugins, {
  dest: CONFIG.dest.dart,
  output: os.tmpdir(),
  command: DART_SDK.DARTDOCGEN
}));

// ------------
// pubbuild
// WARNING: this task is very slow (~15m as of July 2015)

gulp.task('build/pubbuild.dart', pubbuild(gulp, gulpPlugins, {
  src: CONFIG.dest.dart,
  dest: CONFIG.dest.js.dart2js,
  command: DART_SDK.PUB
}));

// ------------
// formatting

function doCheckFormat() {
  return gulp.src(['modules/**/*.ts', 'tools/**/*.ts', '!**/typings/**/*.d.ts'])
      .pipe(gulpFormat.checkFormat('file', clangFormat));
}

gulp.task('check-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("NOTE: this will be promoted to an ERROR in the continuous build");
  });
});

gulp.task('enforce-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("ERROR: You forgot to run clang-format on your change.");
    console.log("See https://github.com/angular/angular/blob/master/DEVELOPER.md#clang-format");
    process.exit(1);
  });
});

gulp.task('lint', ['build.tools'], function() {
  var tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  var tslintConfig = {
    "rules": {
      "requireInternalWithUnderscore": true,
      "requireParameterType": true,
      "requireReturnType": true,
      "semicolon": true,
      "variable-name": [true, "ban-keywords"]
    }
  };
  return gulp.src(['modules/angular2/src/**/*.ts', '!modules/angular2/src/testing/**'])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: tslintConfig,
        rulesDirectory: 'dist/tools/tslint'
      }))
      .pipe(tslint.report('prose', {emitError: true}));
});

// ------------
// check circular dependencies in Node.js context
gulp.task('build/checkCircularDependencies', function (done) {
  var dependencyObject = madge(CONFIG.dest.js.dev.es6, {
    format: 'es6',
    paths: [CONFIG.dest.js.dev.es6],
    extensions: ['.js'],
    onParseFile: function(data) {
      data.src = data.src.replace(/import \* as/g, "//import * as");
    }
  });
  var circularDependencies = dependencyObject.circular().getArray();
  if (circularDependencies.length > 0) {
    console.log(circularDependencies);
    process.exit(1);
  }
  done();
});

function jsServeDev() {
  return jsserve(gulp, gulpPlugins, {
    path: CONFIG.dest.js.dev.es5,
    port: 8000
  })();
}

function jsServeProd() {
  return jsserve(gulp, gulpPlugins, {
    path: CONFIG.dest.js.prod.es5,
    port: 8001
  })();
}

function jsServeDartJs() {
  return jsserve(gulp, gulpPlugins, {
    path: CONFIG.dest.js.dart2js,
    port: 8002
  })();
}

function proxyServeDart() {
  return jsserve(gulp, gulpPlugins, {
    port: 8002,
    proxies: [
      {route: '/playground', url: 'http://localhost:8004'},
      {route: '/benchmarks_external', url: 'http://localhost:8008'},
      {route: '/benchmarks', url: 'http://localhost:8006'}
    ]
  })();
}

// ------------------
// web servers
gulp.task('serve.js.dev', ['build.js'], function(neverDone) {
  watch('modules/**', { ignoreInitial: true }, '!broccoli.js.dev');
  jsServeDev();
});

gulp.task('serve.js.prod', jsServeProd);

gulp.task('serve.e2e.dev', ['build.js.dev', 'build.js.cjs', 'build.css.material'], function(neverDone) {
  watch('modules/**', { ignoreInitial: true }, ['!broccoli.js.dev', '!build.js.cjs']);
  jsServeDev();
});

gulp.task('serve.e2e.prod', ['build.js.prod', 'build.js.cjs', 'build.css.material'], function(neverDone) {
  watch('modules/**', { ignoreInitial: true }, ['!broccoli.js.prod', '!build.js.cjs']);
  jsServeProd();
});

gulp.task('serve.js.dart2js', jsServeDartJs);

gulp.task('!proxyServeDart', proxyServeDart);

gulp.task('serve.dart', function(done) {
  runSequence([
    '!proxyServeDart',
    'serve/playground.dart',
    'serve/benchmarks.dart',
    'serve/benchmarks_external.dart'
  ], done);
});

gulp.task('serve/playground.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/playground',
  port: 8004
}));

gulp.task('serve/benchmarks.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/benchmarks',
  port: 8006
}));

gulp.task('serve/benchmarks_external.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/benchmarks_external',
  port: 8008
}));

gulp.task('serve.e2e.dart', ['build.js.cjs'], function(neverDone) {
  // Note: we are not using build.dart as the dart analyzer takes too long...
  watch('modules/**', { ignoreInitial: true }, ['!build/tree.dart', '!build.js.cjs']);
  runSequence('build/packages.dart', 'build/pubspec.dart', 'build.dart.material.css', 'serve.dart');
});


// ------------------
// CI tests suites

function runKarma(configFile, done) {
  var cmd = process.platform === 'win32' ? 'node_modules\\.bin\\karma run ' :
                                           'node node_modules/.bin/karma run ';
  cmd += configFile;
  exec(cmd, function(e, stdout) {
    // ignore errors, we don't want to fail the build in the interactive (non-ci) mode
    // karma server will print all test failures
    done();
  });
}

gulp.task('test.js', function(done) {
  runSequence('test.unit.tools/ci', 'test.transpiler.unittest', 'test.unit.js/ci',
              'test.unit.cjs/ci', 'test.typings', sequenceComplete(done));
});

gulp.task('test.dart', function(done) {
  runSequence('versions.dart', 'test.transpiler.unittest', 'test.unit.dart/ci',
              sequenceComplete(done));
});

gulp.task('versions.dart', function() {
  dartSdk.logVersion(DART_SDK);
});

// Reuse the Travis scripts
// TODO: rename test_*.sh to test_all_*.sh
gulp.task('test.all.js', shell.task(['./scripts/ci/test_js.sh']));
gulp.task('test.all.dart', shell.task(['./scripts/ci/test_dart.sh']));

// karma tests
//     These tests run in the browser and are allowed to access
//     HTML DOM APIs.
function getBrowsersFromCLI(provider) {
  var isProvider = false;
  var args = minimist(process.argv.slice(2));
  var rawInput = args.browsers ? args.browsers : 'DartiumWithWebPlatform';
  var inputList = rawInput.replace(' ', '').split(',');
  var outputList = [];
  for (var i = 0; i < inputList.length; i++) {
    var input = inputList[i];
    var karmaChromeLauncher = require('karma-chrome-launcher');
    if (browserProvidersConf.customLaunchers.hasOwnProperty(input) || karmaChromeLauncher.hasOwnProperty("launcher:" + input)) {
      // In case of non-sauce browsers, or browsers defined in karma-chrome-launcher (Chrome, ChromeCanary and Dartium):
      // overrides everything, ignoring other options
      outputList = [input];
      isProvider = false;
      break;
    } else if (provider && browserProvidersConf.customLaunchers.hasOwnProperty(provider + "_" + input.toUpperCase())) {
      isProvider = true;
      outputList.push(provider + "_" + input.toUpperCase());
    } else if (provider && provider == 'SL' && browserProvidersConf.sauceAliases.hasOwnProperty(input.toUpperCase())) {
      outputList = outputList.concat(browserProvidersConf.sauceAliases[input.toUpperCase()]);
      isProvider = true;
    } else if (provider && provider == 'BS' && browserProvidersConf.browserstackAliases.hasOwnProperty(input.toUpperCase())) {
      outputList = outputList.concat(browserProvidersConf.browserstackAliases[input.toUpperCase()]);
      isProvider = true;
    } else {
      throw new Error('ERROR: unknown browser found in getBrowsersFromCLI()');
    }
  }
  return {
    browsersToRun: outputList.filter(function(item, pos, self) {return self.indexOf(item) == pos;}),
    isProvider: isProvider
  };
}

gulp.task('test.unit.js', ['build.js.dev'], function (done) {
  runSequence(
    '!test.unit.js/karma-server',
    function() {
      watch('modules/**', { ignoreInitial: true }, [
        '!broccoli.js.dev',
        '!test.unit.js/karma-run'
      ]);
    }
  );
});

gulp.task('watch.js.dev', ['build.js.dev'], function (done) {
  watch('modules/**', ['!broccoli.js.dev']);
});

gulp.task('test.unit.js.sauce', ['build.js.dev'], function (done) {
  var browserConf = getBrowsersFromCLI('SL');
  if (browserConf.isProvider) {
    launchKarmaWithExternalBrowsers(['dots'], browserConf.browsersToRun, done);
  } else {
    throw new Error('ERROR: no Saucelabs browsers provided, add them with the --browsers option');
  }
});

gulp.task('test.unit.js.browserstack', ['build.js.dev'], function (done) {
  var browserConf = getBrowsersFromCLI('BS');
  if (browserConf.isProvider) {
    launchKarmaWithExternalBrowsers(['dots'], browserConf.browsersToRun, done);
  } else {
    throw new Error('ERROR: no Browserstack browsers provided, add them with the --browsers option');
  }
});

function launchKarmaWithExternalBrowsers(reporters, browsers, done) {
  new karma.Server({
    configFile: __dirname + '/karma-js.conf.js',
    singleRun: true,
    browserNoActivityTimeout: 240000,
    captureTimeout: 120000,
    reporters: reporters,
    browsers: browsers},
  function(err) {done(); process.exit(err ? 1 : 0);}).start();
}

gulp.task('!test.unit.js/karma-server', function(done) {
  var watchStarted = false;
  var server = new karma.Server({configFile: __dirname + '/karma-js.conf.js', reporters: 'dots'});
  server.on('run_complete', function () {
    if (!watchStarted) {
      watchStarted = true;
      done();
    }
  });
  server.start();
});


gulp.task('!test.unit.js/karma-run', function(done) {
  // run the run command in a new process to avoid duplicate logging by both server and runner from
  // a single process
  runKarma('karma-js.conf.js', done);
});

gulp.task('test.unit.router', function (done) {
  runSequence(
    '!test.unit.router/karma-server',
    function() {
      watch('modules/**', [
        'buildRouter.dev',
        '!test.unit.router/karma-run'
      ]);
    }
  );
});

gulp.task('!test.unit.router/karma-server', function() {
  new karma.Server({
        configFile: __dirname + '/modules/angular1_router/karma-router.conf.js',
        reporters: 'dots'
      }
  ).start();
});


gulp.task('!test.unit.router/karma-run', function(done) {
  karma.runner.run({configFile: __dirname + '/modules/angular1_router/karma-router.conf.js'}, function(exitCode) {
    // ignore exitCode, we don't want to fail the build in the interactive (non-ci) mode
    // karma will print all test failures
    done();
  });
});

gulp.task('buildRouter.dev', function () {
  buildRouter();
});

gulp.task('test.unit.dart', function (done) {
  runSequence(
    'build/tree.dart',
    'build/pure-packages.dart',
    '!build/pubget.angular2.dart',
    '!build/change_detect.dart',
    '!build/remove-pub-symlinks',
    'build.dart.material.css',
    '!test.unit.dart/karma-server',
    '!test.unit.dart/karma-run',
    function(error) {
      // if initial build failed (likely due to build or formatting step) then exit
      // otherwise karma server doesn't start and we can't continue running properly
      if (error) {
        done(error);
        return;
      }

      watch(['modules/angular2/**'], { ignoreInitial: true }, [
        '!build/tree.dart',
        '!test.unit.dart/karma-run'
      ]);
    }
  );
});

gulp.task('watch.dart.dev', function (done) {
  runSequence(
      'build/tree.dart',
      'build/pure-packages.dart',
      '!build/pubget.angular2.dart',
      '!build/change_detect.dart',
      '!build/remove-pub-symlinks',
      'build.dart.material.css',
      function(error) {
        // if initial build failed (likely due to build or formatting step) then exit
        // otherwise karma server doesn't start and we can't continue running properly
        if (error) {
          done(error);
          return;
        }

        watch(['modules/angular2/**'], { ignoreInitial: true }, [
          '!build/tree.dart'
        ]);
      }
  );
});

gulp.task('!test.unit.dart/karma-run', function (done) {
  // run the run command in a new process to avoid duplicate logging by both server and runner from
  // a single process
  runKarma('karma-dart.conf.js', done);
});


gulp.task('!test.unit.dart/karma-server', function() {
  new karma.Server({configFile: __dirname + '/karma-dart.conf.js', reporters: 'dots'}).start();
});


gulp.task('test.unit.router/ci', function (done) {
  var browserConf = getBrowsersFromCLI();
  new karma.Server({
        configFile: __dirname + '/modules/angular1_router/karma-router.conf.js',
        singleRun: true,
        reporters: ['dots'],
        browsers: browserConf.browsersToRun
      },
      done
  ).start();
});

gulp.task('test.unit.js/ci', function (done) {
  var browserConf = getBrowsersFromCLI();
  new karma.Server({
        configFile: __dirname + '/karma-js.conf.js',
        singleRun: true,
        reporters: ['dots'],
        browsers: browserConf.browsersToRun
      },
      done
  ).start();
});

gulp.task('test.unit.js.sauce/ci', function (done) {
  launchKarmaWithExternalBrowsers(['dots', 'saucelabs'], browserProvidersConf.sauceAliases.CI, done);
});

gulp.task('test.unit.js.browserstack/ci', function (done) {
  launchKarmaWithExternalBrowsers(['dots'], browserProvidersConf.browserstackAliases.CI, done);
});

gulp.task('test.unit.dart/ci', function (done) {
  var browserConf = getBrowsersFromCLI();
  new karma.Server({
        configFile: __dirname + '/karma-dart.conf.js',
        singleRun: true,
        reporters: ['dots'],
        browsers: browserConf.browsersToRun
      },
      done
  ).start();
});


gulp.task('test.unit.cjs/ci', function(done) {
  runJasmineTests(['dist/js/cjs/{angular2,benchpress}/test/**/*_spec.js'], done);
});


gulp.task('test.unit.cjs', ['build/clean.js', 'build.tools'], function (neverDone) {

  treatTestErrorsAsFatal = false;

  var buildAndTest = [
    '!build.js.cjs',
    'test.unit.cjs/ci'
  ];

  watch('modules/**', buildAndTest);
});

// Use this target to continuously run dartvm unit-tests (such as transformer
// tests) while coding. Note: these tests do not use Karma.
gulp.task('test.unit.dartvm', function (done) {
  runSequence(
    'build/tree.dart',
    'build/pure-packages.dart',
    '!build/pubget.angular2.dart',
    '!build/change_detect.dart',
    '!test.unit.dartvm/run',
    function(error) {
      // Watch for changes made in the TS and Dart code under "modules" and
      // run ts2dart and test change detector generator prior to rerunning the
      // tests.
      watch('modules/angular2/**', { ignoreInitial: true }, [
        '!build/tree.dart',
        '!build/change_detect.dart',
        '!test.unit.dartvm/run'
      ]);

      // Watch for changes made in Dart code under "modules_dart", then copy it
      // to dist and run test change detector generator prior to retunning the
      // tests.
      watch('modules_dart/**', { ignoreInitial: true }, [
        'build/pure-packages.dart',
        '!build/change_detect.dart',
        '!test.unit.dartvm/run'
      ]);
    }
  );
});

gulp.task('!test.unit.dartvm/run', runServerDartTests(gulp, gulpPlugins, {
  dir: 'dist/dart/angular2'
}));


gulp.task('test.unit.tools/ci', function(done) {
  runJasmineTests(['dist/tools/**/*.spec.js', 'tools/**/*.spec.js'], done);
});


gulp.task('test.unit.tools', ['build/clean.tools'],  function(done) {

  treatTestErrorsAsFatal = false;

  var buildAndTest = [
    '!build.tools',
    'test.unit.tools/ci'
  ];

  watch(['tools/**', '!tools/**/test-fixtures/**'], buildAndTest);
});


// ------------------
// server tests
//     These tests run on the VM on the command-line and are
//     allowed to access the file system and network.
gulp.task('test.server.dart', runServerDartTests(gulp, gulpPlugins, {
  dest: 'dist/dart'
}));

// -----------------
// test builders
gulp.task('test.transpiler.unittest', function(done) {
  runJasmineTests(['tools/transpiler/unittest/**/*.js'], done);
});

// -----------------
// Pre-test checks

gulp.task('pre-test-checks', function(done) {
  runSequence('build/checkCircularDependencies', sequenceComplete(done));
});

// -----------------
// Checks which should fail the build, but should not block us running the tests.
// This task is run in a separate travis worker, so these checks provide faster
// feedback while allowing tests to execute.
gulp.task('static-checks', ['!build.tools'], function(done) {
  runSequence(
    // We do not run test.typings here because it requires building, which is too slow.
    ['enforce-format', 'lint'],
    sequenceComplete(done));
});


// -----------------
// Tests for the typings we deliver for TS users
//
// Typings are contained in individual .d.ts files produced by the compiler,
// distributed in our npm package, and loaded from node_modules by
// the typescript compiler.

// Make sure the two typings tests are isolated, by running this one in a tempdir
var tmpdir = path.join(os.tmpdir(), 'test.typings',  new Date().getTime().toString());
gulp.task('!pre.test.typings.layoutNodeModule', ['build.js.cjs'], function() {
  return gulp
    .src(['dist/js/cjs/angular2/**/*', 'node_modules/@reactivex/rxjs/dist/cjs/**'], {base: 'dist/js/cjs'})
    .pipe(gulp.dest(path.join(tmpdir, 'node_modules')));
});
gulp.task('!pre.test.typings.copyTypingsSpec', function() {
  return gulp
    .src(['typing_spec/*.ts'], {base: 'typing_spec'})
    .pipe(gulp.dest(path.join(tmpdir)));
});
gulp.task('test.typings', [
  '!pre.test.typings.layoutNodeModule',
  '!pre.test.typings.copyTypingsSpec'
], function() {
  return gulp.src([tmpdir + '/**'])
    .pipe(tsc({target: 'ES5', module: 'commonjs',
      experimentalDecorators: true,
      noImplicitAny: true,
      moduleResolution: 'node',
      typescript: require('typescript')}));
});

// -----------------
// orchestrated targets

// Pure Dart packages only contain Dart code and conform to pub package layout.
// These packages need no transpilation. All code is copied over to `dist`
// unmodified and directory structure is preserved.
//
// This task is expected to be run after build/tree.dart
gulp.task('build/pure-packages.dart', function() {
  var through2 = require('through2');
  var yaml = require('js-yaml');
  var originalPrefix = '../../dist/dart/';

  return gulp
    .src([
      'modules_dart/transform/**/*',
      '!modules_dart/transform/**/*.proto',
      '!modules_dart/transform/pubspec.yaml',
      '!modules_dart/transform/**/packages{,/**}',
    ])
    .pipe(gulp.dest(path.join(CONFIG.dest.dart, 'angular2')));
});

// Builds all Dart packages, but does not compile them
gulp.task('build/packages.dart', function(done) {
  runSequence(
    'lint_protos.dart',
    'build/tree.dart',
    'build/pure-packages.dart',
    // Run after 'build/tree.dart' because broccoli clears the dist/dart folder
    '!build/pubget.angular2.dart',
    '!build/change_detect.dart',
    sequenceComplete(done));
});

// Builds and compiles all Dart packages
gulp.task('build.dart', function(done) {
  runSequence(
    'build/packages.dart',
    'build/pubspec.dart',
    'build/analyze.dart',
    'build/check.apidocs.dart',
    'build.dart.material.css',
    sequenceComplete(done)
  );
});


// public task to build tools
gulp.task('build.tools', ['build/clean.tools'], function(done) {
  runSequence('!build.tools', sequenceComplete(done));
});


// private task to build tools
gulp.task('!build.tools', function() {
  var stream = gulp.src(['tools/**/*.ts'])
      .pipe(sourcemaps.init())
      .pipe(tsc({target: 'ES5', module: 'commonjs',
                 // Don't use the version of typescript that gulp-typescript depends on
                 // see https://github.com/ivogabe/gulp-typescript#typescript-version
                 typescript: require('typescript')}))
      .on('error', function(error) {
        // nodejs doesn't propagate errors from the src stream into the final stream so we are
        // forwarding the error into the final stream
        stream.emit('error', error);
      })
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/tools'))
      .on('end', function() {
        var AngularBuilder = require('./dist/tools/broccoli/angular_builder').AngularBuilder;
        angularBuilder = new AngularBuilder({
          outputPath: 'dist',
          dartSDK: DART_SDK,
          logs: logs
        });
      });

  return stream;
});

gulp.task('broccoli.js.dev', ['build.tools'], function(done) {
  runSequence('!broccoli.js.dev', sequenceComplete(done));
});

gulp.task('!broccoli.js.dev', function() {
  return angularBuilder.rebuildBrowserDevTree();
});

gulp.task('!broccoli.js.prod', function() {
  return angularBuilder.rebuildBrowserProdTree();
});

gulp.task('build.js.dev', ['build/clean.js'], function(done) {
  runSequence(
    'broccoli.js.dev',
    'build.css.material',
    sequenceComplete(done)
  );
});

gulp.task('build.js.prod', ['build.tools'], function(done) {
  runSequence('!broccoli.js.prod', sequenceComplete(done));
});


/**
 * public task
 */
gulp.task('build.js.cjs', ['build.tools'], function(done) {
  runSequence('!build.js.cjs', sequenceComplete(done));
});


var firstBuildJsCjs = true;

/**
 * private task
 */
gulp.task('!build.js.cjs', function() {
  return angularBuilder.rebuildNodeTree().then(function() {
    if (firstBuildJsCjs) {
      firstBuildJsCjs = false;
      console.log('creating node_modules symlink hack');
      // linknodemodules is all sync
      linknodemodules(gulp, gulpPlugins, {
        dir: CONFIG.dest.js.cjs
      })();
    }
  });
});


var bundleConfig = {
  paths: {"*": "dist/js/prod/es5/*.js"},
  // Files that end up empty after transpilation confuse system-builder
  // and need to be explitily listed here.
  // TODO: upgrade system builder and find a way to declare all input as cjs.
  meta: {
    'angular2/src/router/route_definition': {format: 'cjs'},
    'angular2/src/common/directives/observable_list_diff': {format: 'cjs'},
    'angular2/lifecycle_hooks': {format: 'cjs'}
  }
};

// production build
gulp.task('!bundle.js.prod', ['build.js.prod'], function() {
  var bundlerConfig = {
    sourceMaps: true
  };
  
  return bundler.bundle(bundleConfig, 'angular2/angular2', './dist/build/angular2.js', bundlerConfig)
    .then(function(){
      return q.all([
        bundler.bundle(bundleConfig, 'angular2/http - angular2/angular2', './dist/build/http.js', bundlerConfig),
        bundler.bundle(bundleConfig, 'angular2/router - angular2/angular2', './dist/build/router.js', bundlerConfig)
      ]);
    });
});

// minified production build
gulp.task('!bundle.js.min', ['build.js.prod'], function() {
  var bundlerConfig = {
    sourceMaps: true,
    minify: true
  };
  
  return bundler.bundle(bundleConfig, 'angular2/angular2', './dist/build/angular2.min.js', bundlerConfig)
    .then(function(){
      return q.all([
        bundler.bundle(bundleConfig, 'angular2/http - angular2/angular2', './dist/build/http.min.js', bundlerConfig),
        bundler.bundle(bundleConfig, 'angular2/router - angular2/angular2', './dist/js/build/router.min.js', bundlerConfig)
      ]);
    });
});

// development build
gulp.task('!bundle.js.dev', ['build.js.dev'], function() {
  var bundlerConfig = {
    sourceMaps: true
  };

  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {
       "*": "dist/js/dev/es5/*.js"
      });

  return bundler.bundle(devBundleConfig, 'angular2/angular2', './dist/build/angular2.dev.js', bundlerConfig)
    .then(function(){
      return q.all([
        bundler.bundle(devBundleConfig, 'angular2/http - angular2/angular2', './dist/build/http.dev.js', bundlerConfig),
        bundler.bundle(bundleConfig, 'angular2/router - angular2/angular2', './dist/build/router.dev.js', bundlerConfig)
      ]);
    });
});

// WebWorker build
gulp.task("!bundle.web_worker.js.dev", ["build.js.dev"], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {"*": "dist/js/dev/es5/*.js"});
  return bundler.bundle(
      devBundleConfig,
      'angular2/web_worker/ui',
      './dist/build/web_worker/ui.dev.js',
      { sourceMaps: true }).
      then(function() {
        return bundler.bundle(
          devBundleConfig,
          'angular2/web_worker/worker',
          './dist/build/web_worker/worker.dev.js',
          { sourceMaps: true});
      });
});

gulp.task('!bundle.testing', ['build.js.dev'], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {"*": "dist/js/dev/es5/*.js"});
  return bundler.bundle(
    devBundleConfig,
    'angular2/testing + angular2/mock - angular2/angular2',
    './dist/js/bundle/testing.js',
    { sourceMaps: true });
});

// self-executing development build
// This bundle executes its main module - angular2_sfx, when loaded, without
// a corresponding System.import call. It is aimed at ES5 developers that do not
// use System loader polyfills (like system.js and es6 loader).
// see: https://github.com/systemjs/builder (SFX bundles).
gulp.task('!bundle.js.sfx.dev', ['build.js.dev'], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {'*': 'dist/js/dev/es5/*.js'});
  return bundler.bundle(devBundleConfig, 'angular2/angular2_sfx',
                        './dist/build/angular2.sfx.dev.js', {sourceMaps: true},
                        /* self-executing */ true)
      .then(function() {
        return bundler.bundle(devBundleConfig, 'angular2/http', './dist/build/http.sfx.dev.js',
                              {sourceMaps: true},
                              /* self-executing */ true);
      });
});

gulp.task('!bundle.js.prod.deps', ['!bundle.js.prod'], function() {
  return merge2(
    addDevDependencies('angular2.js'),
    bundler.modify(['dist/build/http.js'], 'http.js'),
    bundler.modify(['dist/build/router.js'], 'router.js')
  )
    .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.js.min.deps', ['!bundle.js.min'], function() {
  return merge2(
    addDevDependencies('angular2.min.js'),
    bundler.modify(['dist/build/http.min.js'], 'http.min.js'),
    bundler.modify(['dist/build/router.min.js'], 'router.min.js')
  )
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/bundle'));
});

var JS_DEV_DEPS = [
  licenseWrap('node_modules/zone.js/LICENSE', true),
  'node_modules/zone.js/dist/zone-microtask.js',
  'node_modules/zone.js/dist/long-stack-trace-zone.js',
  licenseWrap('node_modules/reflect-metadata/LICENSE', true),
  'node_modules/reflect-metadata/Reflect.js'
];

// Splice in RX license if rx is in the bundle.
function insertRXLicense(source) {
  var n = source.indexOf('System.register("@reactivex/rxjs/dist/cjs/Subject"');
  if (n >= 0) {
    var rxLicense = licenseWrap('node_modules/@reactivex/rxjs/LICENSE.txt');
    return source.slice(0, n) + rxLicense + source.slice(n);
  } else {
    return source;
  }
}

function addDevDependencies(outputFile) {
  return bundler.modify(
    JS_DEV_DEPS.concat(['dist/build/' + outputFile]),
    outputFile)
      .pipe(insert.transform(insertRXLicense))
      .pipe(gulp.dest('dist/js/bundle'));
}

gulp.task('!bundle.js.dev.deps', ['!bundle.js.dev'], function() {
  return merge2(
    addDevDependencies('angular2.dev.js'),
    bundler.modify(['dist/build/http.dev.js'], 'http.dev.js'),
    bundler.modify(['dist/build/router.dev.js'], 'router.dev.js')
  )
    .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.js.sfx.dev.deps', ['!bundle.js.sfx.dev'], function() {
  return merge2(
    bundler.modify(JS_DEV_DEPS.concat(['dist/build/angular2.sfx.dev.js']),
                        'angular2.sfx.dev.js')
      .pipe(gulp.dest('dist/js/bundle')),
    bundler.modify(['dist/build/http.sfx.dev.js'],
                        'http.sfx.dev.js')
      .pipe(gulp.dest('dist/js/bundle')));
});

gulp.task('!bundle.web_worker.js.dev.deps', ['!bundle.web_worker.js.dev'], function() {
  return merge2(addDevDependencies("web_worker/ui.dev.js",
                addDevDependencies("web_worker/worker.dev.js")));
});

// We need to duplicate the deps of bundles.js so that this task runs after
// all the bundle files are created.
gulp.task('!bundle.copy', [
  '!bundle.js.prod.deps',
  '!bundle.js.dev.deps',
  '!bundle.js.min.deps',
  '!bundle.web_worker.js.dev.deps',
  '!bundle.js.sfx.dev.deps'
],
          function() {
            return merge2(gulp.src('dist/js/bundle/**').pipe(gulp.dest('dist/js/prod/es5/bundle')),
                          gulp.src('dist/js/bundle/**').pipe(gulp.dest('dist/js/dev/es5/bundle')));
          });

gulp.task('bundles.js', [
  '!bundle.js.prod.deps',
  '!bundle.js.dev.deps',
  '!bundle.js.min.deps',
  '!bundle.web_worker.js.dev.deps',
  '!bundle.js.sfx.dev.deps',
  '!bundle.testing',
  '!bundle.copy']);

gulp.task('build.js', ['build.js.dev', 'build.js.prod', 'build.js.cjs', 'bundles.js', 'benchpress.bundle']);

gulp.task('clean', ['build/clean.tools', 'build/clean.js', 'build/clean.dart', 'build/clean.docs', 'build/clean.benchpress.bundle']);

gulp.task('build', ['build.js', 'build.dart']);

// ------------
// transform codegen
gulp.task('lint_protos.dart', function(done) {
  return proto.lint({
    dir: 'modules_dart/transform/lib/src/transform/common/model/'
  }, done);
});

gulp.task('gen_protos.dart', function(done) {
  return proto.generate({
    dir: 'modules_dart/transform/lib/src/transform/common/model/',
    plugin: 'tools/build/protoc-gen-dart'
  }, done);
});

// change detection codegen
gulp.task('build.change_detect.dart', function(done) {
  return runSequence('build/packages.dart', '!build/pubget.angular2.dart',
                     '!build/change_detect.dart', done);
});

gulp.task('!build/change_detect.dart', function(done) {
  var fs = require('fs');
  var changeDetectDir = path.join(CONFIG.dest.dart, 'angular2/test/core/change_detection/');
  var srcDir = path.join(changeDetectDir, 'generator');
  var destDir = path.join(changeDetectDir, 'generated');

  var dartStream = fs.createWriteStream(path.join(destDir, 'change_detector_classes.dart'));
  var genMain = path.join(srcDir, 'gen_change_detectors.dart');
  var proc = spawn(DART_SDK.VM, [genMain], { stdio:['ignore', 'pipe', 'inherit'] });
  proc.on('error', function(code) {
    done(new Error('Failed while generating change detector classes. Please run manually: ' +
                   DART_SDK.VM + ' ' + dartArgs.join(' ')));
  });
  proc.on('close', function() {
    dartStream.close();
    done();
  });
  proc.stdout.pipe(dartStream);
});

// ------------
// angular material testing rules
gulp.task('build.css.material', function() {
  return gulp.src('modules/*/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest(CONFIG.dest.js.prod.es5))
      .pipe(gulp.dest(CONFIG.dest.js.dev.es5))
      .pipe(gulp.dest(CONFIG.dest.js.dart2js + '/examples/packages'));
});


gulp.task('build.js.material', function(done) {
  runSequence('build.js.dev', 'build.css.material', sequenceComplete(done));
});

gulp.task('build.dart2js.material', function(done) {
  runSequence('build.dart', 'build.css.material', sequenceComplete(done));
});

gulp.task('build.dart.material.css', function() {
  return gulp.src('dist/dart/angular2_material/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/dart/angular2_material/lib/src'));
});

gulp.task('build.dart.material', ['build/packages.dart'], function(done) {
  runSequence('build/packages.dart', 'build.dart.material.css', sequenceComplete(done));
});

gulp.task('cleanup.builder', function() {
  return angularBuilder.cleanup();
});

gulp.task('benchpress.bundle', ['build/clean.benchpress.bundle', 'build.js.cjs'], function(cb) {
  bundler.benchpressBundle(
    BENCHPRESS_BUNDLE_CONFIG.entries,
    BENCHPRESS_BUNDLE_CONFIG.packageJson,
    BENCHPRESS_BUNDLE_CONFIG.includes,
    BENCHPRESS_BUNDLE_CONFIG.excludes,
    BENCHPRESS_BUNDLE_CONFIG.ignore,
    BENCHPRESS_BUNDLE_CONFIG.dest,
    cb
  );
});


// register cleanup listener for ctrl+c/kill used to quit any persistent task (autotest or serve tasks)
process.on('SIGINT', function() {
  if (!angularBuilder.uninitialized) {
    runSequence('cleanup.builder', function () {
      process.exit();
    });
  } else {
    process.exit();
  }
});


// register cleanup listener for all non-persistent tasks
var beforeExitRan = false;

process.on('beforeExit', function() {
  if (beforeExitRan) return;

  beforeExitRan = true;

  if (!angularBuilder.uninitialized) {
    gulp.start('cleanup.builder');
  }
});


var firstTask = true;
gulp.on('task_start', (e) => {
  if (firstTask) {
    firstTask = false;
    analytics.buildSuccess('gulp <startup>', process.uptime() * 1000);
  }

  analytics.buildStart('gulp ' + e.task)
});
gulp.on('task_stop', (e) => {analytics.buildSuccess('gulp ' + e.task, e.duration * 1000)});
gulp.on('task_err', (e) => {analytics.buildError('gulp ' + e.task, e.duration * 1000)});
