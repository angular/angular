'use strict';

// THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// This is to ensure that we catch env issues before we error while requiring other dependencies.
require('./tools/check-environment')(
    {requiredNpmVersion: '>=2.14.7 <3.0.0', requiredNodeVersion: '>=4.2.1 <5.0.0'});


var del = require('del');
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var merge = require('merge');
var merge2 = require('merge2');
var minimist = require('minimist');
var os = require('os');
var path = require('path');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');

var licenseWrap = require('./tools/build/licensewrap');
var analytics = require('./tools/analytics/analytics');
var pubget = require('./tools/build/pubget');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var runServerDartTests = require('./tools/build/run_server_dart_tests');
var util = require('./tools/build/util');
var buildRouter = require('./modules/angular1_router/build');
var shouldLog = require('./tools/build/logging');
var dartSdk = require('./tools/build/dart');
var browserProvidersConf = require('./browser-providers.conf.js');



var cliArgs = minimist(process.argv.slice(2));

if (cliArgs.projects) {
  // normalize for analytics
  cliArgs.projects.split(',').sort().join(',');
}

// --projects=angular2,angular2_material => {angular2: true, angular2_material: true}
var allProjects =
    'angular1_router,angular2,angular2_material,benchmarks,benchmarks_external,benchpress,playground,bundle_deps';
var cliArgsProjects = (cliArgs.projects || allProjects)
                          .split(',')
                          .reduce((map, projectName) => {
                            map[projectName] = true;
                            return map;
                          }, {});
var generateEs6 = !cliArgs.projects;

function printModulesWarning() {
  if (!cliArgs.projects && !process.env.CI) {
    // if users didn't specify projects to build, tell them why and how they should
    console.warn(
        "Pro Tip: Did you know that you can speed up your build by specifying project name(s)?");
    console.warn("         It's like pressing the turbo button in the old days, but better!");
    console.warn("         Examples: --project=angular2 or --project=angular2,angular2_material");
  }
}


// Make it easy to quiet down portions of the build.
// --logs=all -> log everything (This is the default)
// --logs=quiet -> log nothing
// --logs=<comma-separated-list> -> log listed items.
//
// Not all commands support optional logging, feel free
// to add support by adding a new key to this list,
// and toggling output from the command based on it.
var logs = {dartfmt: shouldLog('dartfmt')};

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
  return function(err) {
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
  var fork = require('child_process').fork;
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
      dev: {es6: 'dist/js/dev/es6', es5: 'dist/js/dev/es5'},
      prod: {es6: 'dist/js/prod/es6', es5: 'dist/js/prod/es5'},
      cjs: 'dist/js/cjs',
      dart2js: 'dist/js/dart2js'
    },
    dart: 'dist/dart',
    docs: 'dist/docs',
    docs_angular_io: 'dist/angular.io',
    bundles: {all: 'dist/build', benchpress: 'dist/build/benchpress_bundle/'}
  }
};

var ANGULAR2_BUNDLE_CONFIG = [
  'angular2/common',
  'angular2/core',
  'angular2/compiler',
  'angular2/instrumentation',
  'angular2/platform/browser',
  'angular2/platform/common_dom'
];

var NG2_BUNDLE_CONTENT = ANGULAR2_BUNDLE_CONFIG.join(' + ') + ' - rxjs/*';
var HTTP_BUNDLE_CONTENT = 'angular2/http - rxjs/* - ' + ANGULAR2_BUNDLE_CONFIG.join(' - ');
var ROUTER_BUNDLE_CONTENT = 'angular2/router + angular2/router/router_link_dsl - rxjs/* - ' +
                            ANGULAR2_BUNDLE_CONFIG.join(' - ');
var TESTING_BUNDLE_CONTENT =
    'angular2/testing + angular2/http/testing + angular2/router/testing - rxjs/* - ' +
    ANGULAR2_BUNDLE_CONFIG.join(' - ');
var UPGRADE_BUNDLE_CONTENT = 'angular2/upgrade - rxjs/* - ' + ANGULAR2_BUNDLE_CONFIG.join(' - ');

var BENCHPRESS_BUNDLE_CONFIG = {
  entries: ['./dist/js/cjs/benchpress/index.js'],
  packageJson: './dist/js/cjs/benchpress/package.json',
  includes: ['angular2'],
  excludes: ['reflect-metadata', 'selenium-webdriver', 'zone.js'],
  ignore: [],
  dest: CONFIG.dest.bundles.benchpress
};

// ------------
// clean

gulp.task('build/clean.tools', function() { del(path.join('dist', 'tools')); });

gulp.task('build/clean.js', function(done) { del(CONFIG.dest.js.all, done); });

gulp.task('build/clean.dart', function(done) { del(CONFIG.dest.dart, done); });

gulp.task('build/clean.docs', function(done) { del(CONFIG.dest.docs, done); });

gulp.task('build/clean.docs_angular_io',
          function(done) { del(CONFIG.dest.docs_angular_io, done); });

gulp.task('build/clean.bundles', function(done) { del(CONFIG.dest.bundles.all, done); });

gulp.task('build/clean.bundles.benchpress',
          function(done) { del(CONFIG.dest.bundles.benchpress, done); });

// ------------
// transpile

gulp.task('build/tree.dart', ['build/clean.dart', 'build.tools'],
          function(done) { runSequence('!build/tree.dart', sequenceComplete(done)); });


gulp.task('!build/tree.dart',
          function() { return angularBuilder.rebuildDartTree(cliArgsProjects); });


// ------------
// pubspec

// Run a top-level `pub get` for this project.
gulp.task('pubget.dart', pubget.dir(gulp, gulpPlugins, {dir: '.', command: DART_SDK.PUB}));

// Run `pub get` only on the angular2 dir of CONFIG.dest.dart
gulp.task('!build/pubget.angular2.dart',
          pubget.dir(gulp, gulpPlugins,
                     {dir: path.join(CONFIG.dest.dart, 'angular2'), command: DART_SDK.PUB}));

// Run `pub get` over CONFIG.dest.dart
gulp.task('build/pubspec.dart',
          pubget.subDir(gulp, gulpPlugins, {dir: CONFIG.dest.dart, command: DART_SDK.PUB}));


// This is a hacky way to work around dart's pub that creates `packages` symlink in every directory
// that contains a dart file with the main method. For our tests this means that every test
// subfolder
// has a link to the root `packages` directory which causes Karma to sift through 80k files during
// each `karma run` invocation.
//
// Since these directories are not needed for karma tests to run, it's safe to delete them without
// breaking any functionality.
//
// See #2437 for more info.
gulp.task('!build/remove-pub-symlinks', function(done) {
  var exec = require('child_process').exec;

  if (process.platform == 'win32') {
    done();
    return;
  }

  exec('find dist/dart/angular2/test/ -name packages | xargs rm -r',
       function(error, stdout, stderr) {
         if (error) {
           done(stderr);
           return;
         }
         done();
       });
});

// ------------
// dartanalyzer


gulp.task('build/analyze.dart', () => {
  var dartanalyzer = require('./tools/build/dartanalyzer');

  return dartanalyzer(gulp, gulpPlugins, {dest: CONFIG.dest.dart, command: DART_SDK.ANALYZER});
});


gulp.task('build/analyze.ddc.dart', () => {
  var dartanalyzer = require('./tools/build/dartanalyzer');

  return dartanalyzer(gulp, gulpPlugins,
                      {dest: CONFIG.dest.dart, command: DART_SDK.ANALYZER, use_ddc: true});
});


gulp.task('build/check.apidocs.dart', () => {
  var dartapidocs = require('./tools/build/dartapidocs');

  return dartapidocs(gulp, gulpPlugins,
                     {dest: CONFIG.dest.dart, output: os.tmpdir(), command: DART_SDK.DARTDOCGEN});
});


// ------------
// pubbuild
// WARNING: this task is very slow (~15m as of July 2015)

gulp.task(
    'build/pubbuild.dart',
    pubbuild.subdirs(gulp, gulpPlugins,
                     {src: CONFIG.dest.dart, dest: CONFIG.dest.js.dart2js, command: DART_SDK.PUB}));

// ------------
// formatting

function doCheckFormat() {
  var clangFormat = require('clang-format');
  var gulpFormat = require('gulp-clang-format');

  return gulp.src(['modules/**/*.ts', 'tools/**/*.ts', '!**/typings/**/*.d.ts', 'gulpfile.js'])
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
gulp.task('build/checkCircularDependencies', function(done) {
  var madge = require('madge');

  var dependencyObject = madge(CONFIG.dest.js.dev.es5, {
    format: 'cjs',
    paths: [CONFIG.dest.js.dev.es5],
    extensions: ['.js'],
    onParseFile: function(data) { data.src = data.src.replace(/\/\* circular \*\//g, "//"); }
  });
  var circularDependencies = dependencyObject.circular().getArray();
  if (circularDependencies.length > 0) {
    console.log(circularDependencies);
    process.exit(1);
  }
  done();
});

function jsServeDev() {
  return jsserve(gulp, gulpPlugins, {path: CONFIG.dest.js.dev.es5, port: 8000})();
}

function jsServeProd() {
  return jsserve(gulp, gulpPlugins, {path: CONFIG.dest.js.prod.es5, port: 8001})();
}

function jsServeDartJs() {
  return jsserve(gulp, gulpPlugins, {path: CONFIG.dest.js.dart2js, port: 8002})();
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
  var watch = require('./tools/build/watch');

  watch('modules/**', {ignoreInitial: true}, '!broccoli.js.dev');
  jsServeDev();
});

gulp.task('serve.js.prod', jsServeProd);

gulp.task('serve.e2e.dev', ['build.js.dev', 'build.js.cjs', 'build.css.material'],
          function(neverDone) {
            var watch = require('./tools/build/watch');

            watch('modules/**', {ignoreInitial: true}, ['!broccoli.js.dev', '!build.js.cjs']);
            jsServeDev();
          });

gulp.task('serve.e2e.prod', ['build.js.prod', 'build.js.cjs', 'build.css.material'],
          function(neverDone) {
            var watch = require('./tools/build/watch');

            watch('modules/**', {ignoreInitial: true}, ['!broccoli.js.prod', '!build.js.cjs']);
            jsServeProd();
          });

gulp.task('serve.js.dart2js', jsServeDartJs);

gulp.task('!proxyServeDart', proxyServeDart);

gulp.task('serve.dart', function(done) {
  runSequence(
      [
        '!proxyServeDart',
        'serve/playground.dart',
        'serve/benchmarks.dart',
        'serve/benchmarks_external.dart'
      ],
      done);
});

gulp.task('serve/playground.dart',
          pubserve(gulp, gulpPlugins,
                   {command: DART_SDK.PUB, path: CONFIG.dest.dart + '/playground', port: 8004}));

gulp.task('serve/benchmarks.dart',
          pubserve(gulp, gulpPlugins,
                   {command: DART_SDK.PUB, path: CONFIG.dest.dart + '/benchmarks', port: 8006}));

gulp.task(
    'serve/benchmarks_external.dart',
    pubserve(gulp, gulpPlugins,
             {command: DART_SDK.PUB, path: CONFIG.dest.dart + '/benchmarks_external', port: 8008}));

gulp.task('serve.e2e.dart', ['build.js.cjs'], function(neverDone) {
  var watch = require('./tools/build/watch');

  // Note: we are not using build.dart as the dart analyzer takes too long...
  watch('modules/**', {ignoreInitial: true}, ['!build/tree.dart', '!build.js.cjs']);
  runSequence('build/packages.dart', 'build/pubspec.dart', 'build.dart.material.css', 'serve.dart');
});


// ------------------
// CI tests suites

function runKarma(configFile, done) {
  var exec = require('child_process').exec;

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
              'test.dart.angular2_testing/ci', sequenceComplete(done));
});

gulp.task('versions.dart', function() { dartSdk.logVersion(DART_SDK); });

// Reuse the Travis scripts
// TODO: rename test_*.sh to test_all_*.sh
gulp.task('test.all.js', shell.task(['./scripts/ci/test_js.sh']));
gulp.task('test.all.dart', shell.task(['./scripts/ci/test_dart.sh']));

// karma tests
//     These tests run in the browser and are allowed to access
//     HTML DOM APIs.
function getBrowsersFromCLI(provider, isDart) {
  var isProvider = false;
  var rawInput =
      cliArgs.browsers ? cliArgs.browsers : (isDart ? 'DartiumWithWebPlatform' : 'Chrome');
  var inputList = rawInput.replace(' ', '').split(',');
  var outputList = [];
  for (var i = 0; i < inputList.length; i++) {
    var input = inputList[i];
    var karmaChromeLauncher = require('karma-chrome-launcher');
    if (browserProvidersConf.customLaunchers.hasOwnProperty(input) ||
        karmaChromeLauncher.hasOwnProperty("launcher:" + input)) {
      // In case of non-sauce browsers, or browsers defined in karma-chrome-launcher (Chrome,
      // ChromeCanary and Dartium):
      // overrides everything, ignoring other options
      outputList = [input];
      isProvider = false;
      break;
    } else if (provider &&
               browserProvidersConf.customLaunchers.hasOwnProperty(provider + "_" +
                                                                   input.toUpperCase())) {
      isProvider = true;
      outputList.push(provider + "_" + input.toUpperCase());
    } else if (provider && provider == 'SL' &&
               browserProvidersConf.sauceAliases.hasOwnProperty(input.toUpperCase())) {
      outputList = outputList.concat(browserProvidersConf.sauceAliases[input.toUpperCase()]);
      isProvider = true;
    } else if (provider && provider == 'BS' &&
               browserProvidersConf.browserstackAliases.hasOwnProperty(input.toUpperCase())) {
      outputList = outputList.concat(browserProvidersConf.browserstackAliases[input.toUpperCase()]);
      isProvider = true;
    } else {
      throw new Error('ERROR: unknown browser found in getBrowsersFromCLI()');
    }
  }
  return {
    browsersToRun:
        outputList.filter(function(item, pos, self) { return self.indexOf(item) == pos; }),
    isProvider: isProvider
  };
}

gulp.task('test.unit.js', ['build.js.dev'], function(neverDone) {
  var watch = require('./tools/build/watch');

  printModulesWarning();
  runSequence('!test.unit.js/karma-server', function() {
    watch('modules/**', {ignoreInitial: true}, ['!broccoli.js.dev', '!test.unit.js/karma-run']);
  });
});

gulp.task('watch.js.dev', ['build.js.dev'], function(neverDone) {
  var watch = require('./tools/build/watch');

  printModulesWarning();
  watch('modules/**', ['!broccoli.js.dev']);
});

gulp.task('test.unit.js.sauce', ['build.js.dev'], function(done) {
  printModulesWarning();
  var browserConf = getBrowsersFromCLI('SL');
  if (browserConf.isProvider) {
    launchKarmaWithExternalBrowsers(['dots'], browserConf.browsersToRun, done);
  } else {
    throw new Error('ERROR: no Saucelabs browsers provided, add them with the --browsers option');
  }
});

gulp.task('test.unit.js.browserstack', ['build.js.dev'], function(done) {
  printModulesWarning();
  var browserConf = getBrowsersFromCLI('BS');
  if (browserConf.isProvider) {
    launchKarmaWithExternalBrowsers(['dots'], browserConf.browsersToRun, done);
  } else {
    throw new Error(
        'ERROR: no Browserstack browsers provided, add them with the --browsers option');
  }
});

function launchKarmaWithExternalBrowsers(reporters, browsers, done) {
  var karma = require('karma');

  new karma.Server(
               {
                 configFile: __dirname + '/karma-js.conf.js',
                 singleRun: true,
                 browserNoActivityTimeout: 240000,
                 captureTimeout: 120000,
                 reporters: reporters,
                 browsers: browsers
               },
               function(err) {
                 done();
                 process.exit(err ? 1 : 0);
               })
      .start();
}

gulp.task('!test.unit.js/karma-server', function(done) {
  var karma = require('karma');

  var watchStarted = false;
  var server = new karma.Server({configFile: __dirname + '/karma-js.conf.js'});
  server.on('run_complete', function() {
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

gulp.task('test.unit.router', function(neverDone) {
  var watch = require('./tools/build/watch');

  runSequence('!test.unit.router/karma-server', function() {
    watch('modules/**', ['buildRouter.dev', '!test.unit.router/karma-run']);
  });
});

gulp.task('!test.unit.router/karma-server', function() {
  var karma = require('karma');

  new karma.Server({configFile: __dirname + '/modules/angular1_router/karma-router.conf.js'})
      .start();
});


gulp.task('!test.unit.router/karma-run', function(done) {
  var karma = require('karma');

  karma.runner.run({configFile: __dirname + '/modules/angular1_router/karma-router.conf.js'},
                   function(exitCode) {
                     // ignore exitCode, we don't want to fail the build in the interactive (non-ci)
                     // mode
                     // karma will print all test failures
                     done();
                   });
});

gulp.task('buildRouter.dev', function() { buildRouter(); });

gulp.task('test.unit.dart', function(done) {
  printModulesWarning();
  runSequence('build/tree.dart', 'build/pure-packages.dart', '!build/pubget.angular2.dart',
              '!build/change_detect.dart', '!build/remove-pub-symlinks', 'build.dart.material.css',
              '!test.unit.dart/karma-server', '!test.unit.dart/karma-run', function(error) {
                var watch = require('./tools/build/watch');

                // if initial build failed (likely due to build or formatting step) then exit
                // otherwise karma server doesn't start and we can't continue running properly
                if (error) {
                  done(error);
                  return;
                }

                watch(['modules/angular2/**'], {ignoreInitial: true},
                      ['!build/tree.dart', '!test.unit.dart/karma-run']);
              });
});

// Dart Payload Size Test
// This test will fail if the size of our hello_world app goes beyond one of
// these values when compressed at the specified level.
// Measure in bytes.
var _DART_PAYLOAD_SIZE_LIMITS = {'uncompressed': 320 * 1024, 'gzip level=6': 90 * 1024};
gulp.task('test.payload.dart/ci', function(done) {
  runSequence('build/packages.dart', '!pubget.payload.dart', '!pubbuild.payload.dart',
              '!checkAndReport.payload.dart', done);
});

gulp.task('!pubget.payload.dart',
          pubget.dir(gulp, gulpPlugins,
                     {dir: 'modules_dart/payload/hello_world', command: DART_SDK.PUB}));

gulp.task('!pubbuild.payload.dart',
          pubbuild.single(gulp, gulpPlugins,
                          {command: DART_SDK.PUB, src: 'modules_dart/payload/hello_world'}));

gulp.task('!checkAndReport.payload.dart', function() {
  var reportSize = require('./tools/analytics/reportsize');
  return reportSize('modules_dart/payload/hello_world/build/web/*.dart.js',
                    {failConditions: _DART_PAYLOAD_SIZE_LIMITS, prefix: 'hello_world'});
});

gulp.task('watch.dart.dev', function(done) {
  runSequence('build/tree.dart', 'build/pure-packages.dart', '!build/pubget.angular2.dart',
              '!build/change_detect.dart', '!build/remove-pub-symlinks', 'build.dart.material.css',
              function(error) {
                var watch = require('./tools/build/watch');

                // if initial build failed (likely due to build or formatting step) then exit
                // otherwise karma server doesn't start and we can't continue running properly
                if (error) {
                  done(error);
                  return;
                }

                watch(['modules/angular2/**'], {ignoreInitial: true}, ['!build/tree.dart']);
              });
});

gulp.task('!test.unit.dart/karma-run', function(done) {
  // run the run command in a new process to avoid duplicate logging by both server and runner from
  // a single process
  runKarma('karma-dart.conf.js', done);
});


gulp.task('!test.unit.dart/karma-server', function() {
  var karma = require('karma');

  new karma.Server({configFile: __dirname + '/karma-dart.conf.js', reporters: 'dots'}).start();
});


gulp.task('test.unit.router/ci', function(done) {
  var karma = require('karma');

  var browserConf = getBrowsersFromCLI();
  new karma.Server(
               {
                 configFile: __dirname + '/modules/angular1_router/karma-router.conf.js',
                 singleRun: true,
                 reporters: ['dots'],
                 browsers: browserConf.browsersToRun
               },
               done)
      .start();
});

gulp.task('test.unit.js/ci', function(done) {
  var karma = require('karma');

  var browserConf = getBrowsersFromCLI();
  new karma.Server(
               {
                 configFile: __dirname + '/karma-js.conf.js',
                 singleRun: true,
                 reporters: ['dots'],
                 browsers: browserConf.browsersToRun
               },
               done)
      .start();
});

gulp.task('test.unit.js.sauce/ci', function(done) {
  launchKarmaWithExternalBrowsers(['dots', 'saucelabs'], browserProvidersConf.sauceAliases.CI,
                                  done);
});

gulp.task('test.unit.js.browserstack/ci', function(done) {
  launchKarmaWithExternalBrowsers(['dots'], browserProvidersConf.browserstackAliases.CI, done);
});

gulp.task('test.unit.dart/ci', function(done) {
  var karma = require('karma');

  var browserConf = getBrowsersFromCLI(null, true);
  new karma.Server(
               {
                 configFile: __dirname + '/karma-dart.conf.js',
                 singleRun: true,
                 reporters: ['dots'],
                 browsers: browserConf.browsersToRun
               },
               done)
      .start();
});


gulp.task('test.unit.cjs/ci', function(done) {
  runJasmineTests(['dist/js/cjs/{angular2,benchpress}/test/**/*_spec.js'], done);
});


gulp.task('test.unit.cjs', ['build/clean.js', 'build.tools'], function(neverDone) {
  var watch = require('./tools/build/watch');

  printModulesWarning();
  treatTestErrorsAsFatal = false;
  watch('modules/**', ['!build.js.cjs', 'test.unit.cjs/ci']);
});

// Use this target to continuously run dartvm unit-tests (such as transformer
// tests) while coding. Note: these tests do not use Karma.
gulp.task('test.unit.dartvm', function(neverDone) {
  var watch = require('./tools/build/watch');

  runSequence(
      'build/tree.dart', 'build/pure-packages.dart', '!build/pubget.angular2.dart',
      '!build/change_detect.dart', '!test.unit.dartvm/run', function(error) {
        // Watch for changes made in the TS and Dart code under "modules" and
        // run ts2dart and test change detector generator prior to rerunning the
        // tests.
        watch('modules/angular2/**', {ignoreInitial: true},
              ['!build/tree.dart', '!build/change_detect.dart', '!test.unit.dartvm/run']);

        // Watch for changes made in Dart code under "modules_dart", then copy it
        // to dist and run test change detector generator prior to retunning the
        // tests.
        watch('modules_dart/**', {ignoreInitial: true},
              ['build/pure-packages.dart', '!build/change_detect.dart', '!test.unit.dartvm/run']);
      });
});

gulp.task('!test.unit.dartvm/run',
          runServerDartTests(gulp, gulpPlugins, {dir: 'dist/dart/angular2'}));


gulp.task('test.unit.tools/ci', function(done) {
  runJasmineTests(['dist/tools/**/*.spec.js', 'tools/**/*.spec.js'], done);
});


gulp.task('test.unit.tools', ['build/clean.tools'], function(neverDone) {
  var watch = require('./tools/build/watch');
  treatTestErrorsAsFatal = false;

  watch(['tools/**', '!tools/**/test-fixtures/**'], ['!build.tools', 'test.unit.tools/ci']);
});


// ------------------
// server tests
//     These tests run on the VM on the command-line and are
//     allowed to access the file system and network.
gulp.task('test.server.dart', runServerDartTests(gulp, gulpPlugins, {dest: 'dist/dart'}));

// -----------------
// test builders
gulp.task('test.transpiler.unittest',
          function(done) { runJasmineTests(['tools/transpiler/unittest/**/*.js'], done); });

// At the moment, dart test requires dartium to be an executable on the path.
// Make a temporary directory and symlink dartium from there (just for this command)
// so that it can run.
var dartiumTmpdir = path.join(os.tmpdir(), 'dartium' + new Date().getTime().toString());
gulp.task('test.dart.angular2_testing/ci', ['build/pubspec.dart'], function(done) {
  runSequence('test.dart.angular2_testing_symlink', 'test.dart.angular2_testing',
              sequenceComplete(done));
});

gulp.task(
    'test.dart.angular2_testing_symlink',
    shell.task(['mkdir ' + dartiumTmpdir, 'ln -s $DARTIUM_BIN ' + dartiumTmpdir + '/dartium']));

gulp.task('test.dart.angular2_testing',
          shell.task(['PATH=$PATH:' + dartiumTmpdir + ' pub run test -p dartium'],
                     {'cwd': 'dist/dart/angular2_testing'}));


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
      ['enforce-format', 'lint'], sequenceComplete(done));
});


// -----------------
// Tests for the typings we deliver for TS users
//
// Typings are contained in individual .d.ts files produced by the compiler,
// distributed in our npm package, and loaded from node_modules by
// the typescript compiler.

// Make sure the two typings tests are isolated, by running this one in a tempdir
var tmpdir = path.join(os.tmpdir(), 'test.typings', new Date().getTime().toString());
gulp.task('!pre.test.typings.layoutNodeModule', ['build.js.cjs'], function() {
  return gulp.src(['dist/js/cjs/angular2/**/*', 'node_modules/rxjs/**'], {base: 'dist/js/cjs'})
      .pipe(gulp.dest(path.join(tmpdir, 'node_modules')));
});
gulp.task('!pre.test.typings.copyTypingsSpec', function() {
  return gulp.src(['typing_spec/*.ts'], {base: 'typing_spec'}).pipe(gulp.dest(path.join(tmpdir)));
});
gulp.task('test.typings',
          ['!pre.test.typings.layoutNodeModule', '!pre.test.typings.copyTypingsSpec'], function() {
            var tsc = require('gulp-typescript');

            return gulp.src([tmpdir + '/**'])
                .pipe(tsc({
                  target: 'ES5',
                  module: 'commonjs',
                  experimentalDecorators: true,
                  noImplicitAny: true,
                  moduleResolution: 'node',
                  typescript: require('typescript')
                }));
          });

// -----------------
// orchestrated targets

// Pure Dart packages only contain Dart code and conform to pub package layout.
// These packages need no transpilation. All code is copied over to `dist`
// unmodified and directory structure is preserved.
//
// This task is expected to be run after build/tree.dart
gulp.task('build/pure-packages.dart', function(done) {
  runSequence('build/pure-packages.dart/standalone', 'build/pure-packages.dart/license',
              'build/pure-packages.dart/angular2', sequenceComplete(done));
});


gulp.task('build/pure-packages.dart/standalone', function() {
  return gulp.src([
               'modules_dart/**/*',
               '!modules_dart/**/*.proto',
               '!modules_dart/**/packages{,/**}',
               '!modules_dart/payload{,/**}',
               '!modules_dart/transform{,/**}',
             ])
      .pipe(gulp.dest(CONFIG.dest.dart));
});

gulp.task('build/pure-packages.dart/license',
          function() {
            return gulp.src(['LICENSE'])
                .pipe(gulp.dest(path.join(CONFIG.dest.dart, 'angular2_testing')));
          })


    gulp.task('build/pure-packages.dart/angular2', function() {
      var yaml = require('js-yaml');

      return gulp.src([
                   'modules_dart/transform/**/*',
                   '!modules_dart/transform/**/*.proto',
                   '!modules_dart/transform/pubspec.yaml',
                   '!modules_dart/transform/**/packages{,/**}',
                 ])
          .pipe(gulp.dest(path.join(CONFIG.dest.dart, 'angular2')));
    });

// Builds all Dart packages, but does not compile them
gulp.task('build/packages.dart', function(done) {
  runSequence('lint_protos.dart', 'build/tree.dart', 'build/pure-packages.dart',
              // Run after 'build/tree.dart' because broccoli clears the dist/dart folder
              '!build/pubget.angular2.dart', '!build/change_detect.dart', sequenceComplete(done));
});

// Builds and compiles all Dart packages
gulp.task('build.dart', function(done) {
  runSequence('build/packages.dart', 'build/pubspec.dart', 'build/analyze.dart',
              'build/check.apidocs.dart', 'build.dart.material.css', sequenceComplete(done));
});


// public task to build tools
gulp.task('build.tools', ['build/clean.tools'],
          function(done) { runSequence('!build.tools', sequenceComplete(done)); });


// private task to build tools
gulp.task('!build.tools', function() {
  var sourcemaps = require('gulp-sourcemaps');
  var tsc = require('gulp-typescript');

  var stream = gulp.src(['tools/**/*.ts'])
                   .pipe(sourcemaps.init())
                   .pipe(tsc({
                     target: 'ES5',
                     module: 'commonjs',
                     // Don't use the version of typescript that gulp-typescript depends on
                     // see https://github.com/ivogabe/gulp-typescript#typescript-version
                     typescript: require('typescript')
                   }))
                   .on('error',
                       function(error) {
                         // nodejs doesn't propagate errors from the src stream into the final
                         // stream so we are
                         // forwarding the error into the final stream
                         stream.emit('error', error);
                       })
                   .pipe(sourcemaps.write('.'))
                   .pipe(gulp.dest('dist/tools'))
                   .on('end', function() {
                     var AngularBuilder =
                         require('./dist/tools/broccoli/angular_builder').AngularBuilder;
                     angularBuilder =
                         new AngularBuilder({outputPath: 'dist', dartSDK: DART_SDK, logs: logs});
                   });

  return stream;
});

gulp.task('broccoli.js.dev', ['build.tools'],
          function(done) { runSequence('!broccoli.js.dev', sequenceComplete(done)); });

gulp.task(
    '!broccoli.js.dev',
    () => angularBuilder.rebuildBrowserDevTree(
        {generateEs6: generateEs6, projects: cliArgsProjects, noTypeChecks: cliArgs.noTypeChecks}));

gulp.task(
    '!broccoli.js.prod',
    () => angularBuilder.rebuildBrowserProdTree(
        {generateEs6: generateEs6, projects: cliArgsProjects, noTypeChecks: cliArgs.noTypeChecks}));

gulp.task('build.js.dev', ['build/clean.js'], function(done) {
  runSequence('broccoli.js.dev', 'build.css.material', sequenceComplete(done));
});

gulp.task('build.js.prod', ['build.tools'],
          function(done) { runSequence('!broccoli.js.prod', sequenceComplete(done)); });


/**
 * public task
 */
gulp.task('build.js.cjs', ['build.tools'],
          function(done) { runSequence('!build.js.cjs', sequenceComplete(done)); });


var firstBuildJsCjs = true;

/**
 * private task
 */
gulp.task('!build.js.cjs', function() {
  return angularBuilder
      .rebuildNodeTree(
          {generateEs6: generateEs6, projects: cliArgsProjects, noTypeChecks: cliArgs.noTypeChecks})
      .then(function() {
        if (firstBuildJsCjs) {
          firstBuildJsCjs = false;
          console.log('creating node_modules symlink hack');
          // linknodemodules is all sync
          linknodemodules(gulp, gulpPlugins, {dir: CONFIG.dest.js.cjs})();
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
  var bundler = require('./tools/build/bundle');
  var bundlerConfig = {sourceMaps: true};

  return bundler.bundle(bundleConfig, NG2_BUNDLE_CONTENT, './dist/build/angular2.js', bundlerConfig)
      .then(function() {
        return Promise.all([
          bundler.bundle(bundleConfig, HTTP_BUNDLE_CONTENT, './dist/build/http.js', bundlerConfig),
          bundler.bundle(bundleConfig, ROUTER_BUNDLE_CONTENT, './dist/build/router.js',
                         bundlerConfig),
          bundler.bundle(bundleConfig, UPGRADE_BUNDLE_CONTENT, './dist/build/upgrade.js',
                         bundlerConfig)
        ]);
      });
});

// minified production build
gulp.task('!bundle.js.min', ['build.js.prod'], function() {
  var bundler = require('./tools/build/bundle');
  var bundlerConfig = {sourceMaps: true, minify: true};

  return bundler.bundle(bundleConfig, NG2_BUNDLE_CONTENT, './dist/build/angular2.min.js',
                        bundlerConfig)
      .then(function() {
        return Promise.all([
          bundler.bundle(bundleConfig, HTTP_BUNDLE_CONTENT, './dist/build/http.min.js',
                         bundlerConfig),
          bundler.bundle(bundleConfig, ROUTER_BUNDLE_CONTENT, './dist/build/router.min.js',
                         bundlerConfig),
          bundler.bundle(bundleConfig, UPGRADE_BUNDLE_CONTENT, './dist/build/upgrade.min.js',
                         bundlerConfig)
        ]);
      });
});

// development build
gulp.task('!bundle.js.dev', ['build.js.dev'], function() {
  var bundler = require('./tools/build/bundle');
  var bundlerConfig = {sourceMaps: true};

  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {"*": "dist/js/dev/es5/*.js"});

  return bundler.bundle(devBundleConfig, NG2_BUNDLE_CONTENT, './dist/build/angular2.dev.js',
                        bundlerConfig)
      .then(function() {
        return Promise.all([
          bundler.bundle(devBundleConfig, HTTP_BUNDLE_CONTENT, './dist/build/http.dev.js',
                         bundlerConfig),
          bundler.bundle(devBundleConfig, ROUTER_BUNDLE_CONTENT, './dist/build/router.dev.js',
                         bundlerConfig),
          bundler.bundle(devBundleConfig, UPGRADE_BUNDLE_CONTENT, './dist/build/upgrade.dev.js',
                         bundlerConfig)
        ]);
      });
});

// WebWorker build
gulp.task("!bundle.web_worker.js.dev", ["build.js.dev"], function() {
  var bundler = require('./tools/build/bundle');
  var devBundleConfig = merge(true, bundleConfig);

  devBundleConfig.paths = merge(true, devBundleConfig.paths, {"*": "dist/js/dev/es5/*.js"});

  return bundler.bundle(devBundleConfig, 'angular2/web_worker/ui',
                        './dist/build/web_worker/ui.dev.js', {sourceMaps: true})
      .then(function() {
        return bundler.bundle(devBundleConfig, 'angular2/web_worker/worker',
                              './dist/build/web_worker/worker.dev.js', {sourceMaps: true});
      });
});

gulp.task('!bundle.testing', ['build.js.dev'], function() {
  var bundler = require('./tools/build/bundle');

  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths = merge(true, devBundleConfig.paths, {"*": "dist/js/dev/es5/*.js"});

  return bundler.bundle(devBundleConfig, TESTING_BUNDLE_CONTENT, './dist/js/bundle/testing.dev.js',
                        {sourceMaps: true});
});

gulp.task('!bundles.js.docs', function() {
  gulp.src('modules/angular2/docs/bundles/*').pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundles.js.umd', ['build.js.dev'], function() {
  var q = require('q');
  var webpack = q.denodeify(require('webpack'));

  function resolveOptions(devOrProd) {
    return {
      root: __dirname + '/dist/js/' + devOrProd + '/es5',
      packageAlias: ''  // this option is added to ignore "broken" package.json in our dist folder
    };
  }

  function outputOptions(outFileName, devOrProd) {
    return {
      filename:
          'dist/js/bundle/' + outFileName + '.umd' + (devOrProd === 'dev' ? '.dev' : '') + '.js',
      library: 'ng',
      libraryTarget: 'umd'
    };
  }

  function webPackConf(entryPoints, outFileName, devOrProd) {
    return {
      entry: entryPoints,
      resolve: resolveOptions(devOrProd),
      module: {preLoaders: [{test: /\.js$/, loader: 'source-map-loader'}]},
      devtool: devOrProd === 'dev' ? 'inline-source-map' : undefined,
      output: outputOptions(outFileName, devOrProd),
      externals: {
        'rxjs/Observable': 'umd Rx',
        'rxjs/Subject': 'umd Rx',
        'rxjs/subject/ReplaySubject': {
          commonjs: 'rxjs/subject/ReplaySubject',
          commonjs2: 'rxjs/subject/ReplaySubject',
          amd: 'rxjs/subject/ReplaySubject',
          root: ['Rx']
        },
        'rxjs/operator/take': {
          commonjs: 'rxjs/operator/take',
          commonjs2: 'rxjs/operator/take',
          amd: 'rxjs/operator/take',
          root: ['Rx', 'Observable', 'prototype']
        },
        'rxjs/observable/fromPromise': {
          commonjs: 'rxjs/observable/fromPromise',
          commonjs2: 'rxjs/observable/fromPromise',
          amd: 'rxjs/observable/fromPromise',
          root: ['Rx', 'Observable']
        },
        'rxjs/operator/toPromise': {
          commonjs: 'rxjs/operator/toPromise',
          commonjs2: 'rxjs/operator/toPromise',
          amd: 'rxjs/operator/toPromise',
          root: ['Rx', 'Observable', 'prototype']
        }
      }
    };
  }

  return q.all([
    webpack(webPackConf([__dirname + '/tools/build/webpack/angular2-all.umd.js'], 'angular2-all',
                        'dev')),
    webpack(webPackConf([__dirname + '/tools/build/webpack/angular2-all.umd.js'], 'angular2-all',
                        'prod')),
    webpack(webPackConf([__dirname + '/tools/build/webpack/angular2-all-testing.umd.js'],
                        'angular2-all-testing', 'dev'))
  ]);
});

gulp.task('bundles.js.umd.min', ['!bundles.js.umd', '!bundle.ng.polyfills'], function() {
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');

  // minify production bundles
  return gulp.src(['dist/js/bundle/angular2-polyfills.js', 'dist/js/bundle/angular2-all.umd.js'])
      .pipe(uglify())
      .pipe(rename({extname: '.min.js'}))
      .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.js.prod.deps', ['!bundle.js.prod'], function() {
  var bundler = require('./tools/build/bundle');

  return merge2(bundler.modify(['dist/build/angular2.js'], 'angular2.js'),
                bundler.modify(['dist/build/http.js'], 'http.js'),
                bundler.modify(['dist/build/router.js'], 'router.js'),
                bundler.modify(['dist/build/upgrade.js'], 'upgrade.js'))
      .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.js.min.deps', ['!bundle.js.min'], function() {
  var bundler = require('./tools/build/bundle');
  var uglify = require('gulp-uglify');

  return merge2(bundler.modify(['dist/build/angular2.min.js'], 'angular2.min.js'),
                bundler.modify(['dist/build/http.min.js'], 'http.min.js'),
                bundler.modify(['dist/build/router.min.js'], 'router.min.js'),
                bundler.modify(['dist/build/upgrade.min.js'], 'upgrade.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.ng.polyfills', ['clean'],
          function() { return addDevDependencies('angular2-polyfills.js'); });

var JS_DEV_DEPS = [
  licenseWrap('node_modules/zone.js/LICENSE', true),
  'node_modules/zone.js/dist/zone-microtask.js',
  'node_modules/zone.js/dist/long-stack-trace-zone.js',
  licenseWrap('node_modules/reflect-metadata/LICENSE', true),
  'node_modules/reflect-metadata/Reflect.js'
];


function addDevDependencies(outputFile) {
  var bundler = require('./tools/build/bundle');
  var insert = require('gulp-insert');

  return bundler.modify(JS_DEV_DEPS.concat(['dist/build/' + outputFile]), outputFile)
      .pipe(gulp.dest('dist/js/bundle'));
}

gulp.task('!bundle.js.dev.deps', ['!bundle.js.dev'], function() {
  var bundler = require('./tools/build/bundle');

  return merge2(bundler.modify(['dist/build/angular2.dev.js'], 'angular2.dev.js'),
                bundler.modify(['dist/build/http.dev.js'], 'http.dev.js'),
                bundler.modify(['dist/build/router.dev.js'], 'router.dev.js'),
                bundler.modify(['dist/build/upgrade.dev.js'], 'upgrade.dev.js'))
      .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.web_worker.js.dev.deps', ['!bundle.web_worker.js.dev'], function() {
  var bundler = require('./tools/build/bundle');
  return merge2(bundler.modify(['dist/build/web_worker/ui.dev.js'], "web_worker/ui.dev.js"),
                bundler.modify(['dist/build/web_worker/worker.dev.js'], "web_worker/worker.dev.js"))
      .pipe(gulp.dest('dist/js/bundle'));
});

gulp.task('!bundle.copy', function() {
  return merge2(gulp.src('dist/js/bundle/**').pipe(gulp.dest('dist/js/prod/es5/bundle')),
                gulp.src('dist/js/bundle/**').pipe(gulp.dest('dist/js/dev/es5/bundle')));
});

gulp.task('!bundles.js.checksize', function(done) {
  var reportSize = require('./tools/analytics/reportsize');
  return reportSize('dist/js/bundle/**', {printToConsole: ['gzip level=2']});
});

gulp.task('bundles.js',
          [
            '!bundle.js.prod.deps',
            '!bundle.js.dev.deps',
            '!bundle.js.min.deps',
            '!bundle.web_worker.js.dev.deps',
            'bundles.js.umd.min',
            '!bundle.testing',
            '!bundle.ng.polyfills',
            '!bundles.js.docs'
          ],
          function(done) { runSequence('!bundle.copy', '!bundles.js.checksize', done); });

gulp.task('build.js',
          ['build.js.dev', 'build.js.prod', 'build.js.cjs', 'bundles.js', 'benchpress.bundle']);

gulp.task('clean', [
  'build/clean.tools',
  'build/clean.js',
  'build/clean.dart',
  'build/clean.docs',
  'build/clean.bundles'
]);

gulp.task('build', ['build.js', 'build.dart']);

// ------------
// transform codegen
gulp.task('lint_protos.dart', function(done) {
  var proto = require('./tools/build/proto');

  return proto.lint({dir: 'modules_dart/transform/lib/src/transform/common/model/'}, done);
});

gulp.task('gen_protos.dart', function(done) {
  var proto = require('./tools/build/proto');

  return proto.generate(
      {
        dir: 'modules_dart/transform/lib/src/transform/common/model/',
        plugin: 'tools/build/protoc-gen-dart'
      },
      done);
});

// change detection codegen
gulp.task('build.change_detect.dart', function(done) {
  return runSequence('build/packages.dart', '!build/pubget.angular2.dart',
                     '!build/change_detect.dart', done);
});

gulp.task('!build/change_detect.dart', function(done) {
  var fs = require('fs');
  var spawn = require('child_process').spawn;

  var changeDetectDir = path.join(CONFIG.dest.dart, 'angular2/test/core/change_detection/');
  var srcDir = path.join(changeDetectDir, 'generator');
  var destDir = path.join(changeDetectDir, 'generated');

  var dartStream = fs.createWriteStream(path.join(destDir, 'change_detector_classes.dart'));
  var genMain = path.join(srcDir, 'gen_change_detectors.dart');
  var proc = spawn(DART_SDK.VM, [genMain], {stdio: ['ignore', 'pipe', 'inherit']});
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
  var autoprefixer = require('gulp-autoprefixer');
  var sass = require('gulp-sass');

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
  var autoprefixer = require('gulp-autoprefixer');
  var sass = require('gulp-sass');

  return gulp.src('dist/dart/angular2_material/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/dart/angular2_material/lib/src'));
});

gulp.task('build.dart.material', ['build/packages.dart'], function(done) {
  runSequence('build/packages.dart', 'build.dart.material.css', sequenceComplete(done));
});

gulp.task('cleanup.builder', function() { return angularBuilder.cleanup(); });

gulp.task('benchpress.bundle', ['build/clean.bundles.benchpress', 'build.js.cjs'], function(cb) {
  var bundler = require('./tools/build/bundle');

  bundler.benchpressBundle(BENCHPRESS_BUNDLE_CONFIG.entries, BENCHPRESS_BUNDLE_CONFIG.packageJson,
                           BENCHPRESS_BUNDLE_CONFIG.includes, BENCHPRESS_BUNDLE_CONFIG.excludes,
                           BENCHPRESS_BUNDLE_CONFIG.ignore, BENCHPRESS_BUNDLE_CONFIG.dest, cb);
});


// register cleanup listener for ctrl+c/kill used to quit any persistent task (autotest or serve
// tasks)
process.on('SIGINT', function() {
  if (!angularBuilder.uninitialized) {
    runSequence('cleanup.builder', function() { process.exit(); });
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
