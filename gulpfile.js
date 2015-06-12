'use strict';

var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var format = require('gulp-clang-format');
var exec = require('child_process').exec;
var fork = require('child_process').fork;
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var spawn = require('child_process').spawn;
var runSequence = require('run-sequence');
var madge = require('madge');
var merge = require('merge');
var merge2 = require('merge2');
var path = require('path');

var watch = require('./tools/build/watch');

var transpile = require('./tools/build/transpile');
var pubget = require('./tools/build/pubget');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
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
var uglify = require('gulp-uglify');
var shouldLog = require('./tools/build/logging');

require('./tools/check-environment')({
  requiredNpmVersion: '>=2.9.0',
  requiredNodeVersion: '>=0.12.2'
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
  mock: true
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
  fork('./tools/traceur-jasmine', args, {
    stdio: 'inherit'
  }).on('close', function jasmineCloseHandler(exitCode) {
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
var DART_SDK = require('./tools/build/dartdetect')(gulp);

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
    docs: 'dist/docs'
  }
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

// ------------
// dartanalyzer

gulp.task('build/analyze.dart', dartanalyzer(gulp, gulpPlugins, {
  dest: CONFIG.dest.dart,
  command: DART_SDK.ANALYZER
}));

// ------------
// pubbuild

gulp.task('build/pubbuild.dart', pubbuild(gulp, gulpPlugins, {
  src: CONFIG.dest.dart,
  dest: CONFIG.dest.js.dart2js,
  command: DART_SDK.PUB
}));

// ------------
// formatting

function doCheckFormat() {
  return gulp.src(['modules/**/*.ts', 'tools/**/*.ts', '!**/typings/**/*.d.ts'])
      .pipe(format.checkFormat('file'));
}

gulp.task('check-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("NOTE: this will be promoted to an ERROR in the continuous build");
  });
});

gulp.task('enforce-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("ERROR: You forgot to run clang-format on your change.");
    console.log("See https://github.com/angular/angular/blob/master/DEVELOPER.md#formatting");
    process.exit(1);
  });
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

// ------------------
// web servers
gulp.task('serve.js.dev', ['build.js.dev'], function(neverDone) {
  watch('modules/**', { ignoreInitial: true }, '!broccoli.js.dev');

  jsserve(gulp, gulpPlugins, {
    path: CONFIG.dest.js.dev.es5,
    port: 8000
  })();
});

gulp.task('serve.e2e.dev', ['build.js.dev', 'build.js.cjs', 'build.css.material'], function(neverDone) {
  watch('modules/**', { ignoreInitial: true }, '!broccoli.js.dev');
  watch('modules/**', { ignoreInitial: true }, '!build.js.cjs');

  jsserve(gulp, gulpPlugins, {
    path: CONFIG.dest.js.dev.es5,
    port: 8000
  })();
});

gulp.task('serve.js.prod', jsserve(gulp, gulpPlugins, {
  path: CONFIG.dest.js.prod.es5,
  port: 8001
}));

gulp.task('serve.js.dart2js', jsserve(gulp, gulpPlugins, {
  path: CONFIG.dest.js.dart2js,
  port: 8002
}));

gulp.task('serve/examples.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/examples'
}));

gulp.task('serve/benchmarks.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/benchmarks'
}));

gulp.task('serve/benchmarks_external.dart', pubserve(gulp, gulpPlugins, {
  command: DART_SDK.PUB,
  path: CONFIG.dest.dart + '/benchmarks_external'
}));

// --------------
// doc generation
var Dgeni = require('dgeni');
var bower = require('bower');
var webserver = require('gulp-webserver');

gulp.task('docs/bower', function() {
  var bowerTask = bower.commands.install(undefined, undefined, { cwd: 'docs' });
  bowerTask.on('log', function (result) {
    console.log('bower:', result.id, result.data.endpoint.name);
  });
  bowerTask.on('error', function(error) {
    console.log(error);
  });
  return bowerTask;
});


function createDocsTasks(publicBuild) {
  var dgeniPackage = publicBuild ? './docs/public-docs-package' : './docs/dgeni-package';
  var distDocsPath = publicBuild ? 'dist/public_docs' : 'dist/docs';
  var taskPrefix = publicBuild ? 'public_docs' : 'docs';

  gulp.task(taskPrefix + '/dgeni', function() {
    try {
      var dgeni = new Dgeni([require(dgeniPackage)]);
      return dgeni.generate();
    } catch(x) {
      console.log(x);
      console.log(x.stack);
      throw x;
    }
  });

  gulp.task(taskPrefix + '/assets', ['docs/bower'], function() {
    return gulp.src('docs/bower_components/**/*')
      .pipe(gulp.dest(distDocsPath + '/lib'));
  });

  gulp.task(taskPrefix + '/app', function() {
    return gulp.src('docs/app/**/*')
      .pipe(gulp.dest(distDocsPath));
  });

  gulp.task(taskPrefix, [taskPrefix + '/assets', taskPrefix + '/app', taskPrefix + '/dgeni']);
  gulp.task(taskPrefix + '/watch', function() {
    return watch('docs/app/**/*', [taskPrefix + '/app']);
  });

  gulp.task(taskPrefix + '/test', function (done) {
    runJasmineTests(['docs/**/*.spec.js'], done);
  });

  gulp.task(taskPrefix + '/serve', function() {
    gulp.src(distDocsPath + '/')
      .pipe(webserver({
        fallback: 'index.html'
      }));
  });
}

createDocsTasks(true);
createDocsTasks(false);

gulp.task('docs/angular.io', function() {
  try {
    var dgeni = new Dgeni([require('./docs/angular.io-package')]);
    return dgeni.generate();
  } catch(x) {
    console.log(x);
    console.log(x.stack);
    throw x;
  }
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
  runSequence('test.unit.tools/ci', 'test.transpiler.unittest', 'docs/test', 'test.unit.js/ci',
              'test.unit.cjs/ci', sequenceComplete(done));
});

gulp.task('test.dart', function(done) {
  runSequence('test.transpiler.unittest', 'docs/test', 'test.unit.dart/ci', sequenceComplete(done));
});

// Reuse the Travis scripts
// TODO: rename test_*.sh to test_all_*.sh
gulp.task('test.all.js', shell.task(['./scripts/ci/test_js.sh']))
gulp.task('test.all.dart', shell.task(['./scripts/ci/test_dart.sh']))

// karma tests
//     These tests run in the browser and are allowed to access
//     HTML DOM APIs.
function getBrowsersFromCLI() {
  var args = minimist(process.argv.slice(2));
  return [args.browsers?args.browsers:'DartiumWithWebPlatform']
}


gulp.task('test.unit.js', ['build.js.dev'], function (neverDone) {

  runSequence(
    '!test.unit.js/karma-server',
    function() {
      watch('modules/**', [
        '!broccoli.js.dev',
        '!test.unit.js/karma-run'
      ]);
    }
  );
});


gulp.task('!test.unit.js/karma-server', function() {
  karma.server.start({configFile: __dirname + '/karma-js.conf.js', reporters: 'dots'});
});


gulp.task('!test.unit.js/karma-run', function(done) {
  // run the run command in a new process to avoid duplicate logging by both server and runner from
  // a single process
  runKarma('karma-js.conf.js', done);
});


gulp.task('test.unit.dart', function (done) {
  runSequence(
    'build/tree.dart',
    '!build/pubget.angular2.dart',
    '!build/change_detect.dart',
    '!test.unit.dart/karma-server',
    '!test.unit.dart/karma-run',
    function(error) {
      // if initial build failed (likely due to build or formatting step) then exit
      // otherwise karma server doesn't start and we can't continue running properly
      if (error) {
        done(error);
        return;
      }

      watch('modules/angular2/**', { ignoreInitial: true }, [
        '!build/tree.dart',
        '!test.unit.dart/karma-run'
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
  karma.server.start({configFile: __dirname + '/karma-dart.conf.js', reporters: 'dots'});
});


gulp.task('test.unit.js/ci', function (done) {
  karma.server.start({configFile: __dirname + '/karma-js.conf.js',
    singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
});

gulp.task('test.unit.dart/ci', function (done) {
  karma.server.start({configFile: __dirname + '/karma-dart.conf.js',
    singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
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


gulp.task('test.unit.dartvm', function (done) {
  runSequence(
    'build/tree.dart',
    'build/pubspec.dart',
    '!build/change_detect.dart',
    '!test.unit.dartvm/run',
    function(error) {
      // if initial build failed (likely due to build or formatting step) then exit
      // otherwise karma server doesn't start and we can't continue running properly
      if (error) {
        done(error);
        return;
      }

      watch('modules/angular2/**', { ignoreInitial: true }, [
        '!build/tree.dart',
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
// orchestrated targets

// Pure Dart packages only contain Dart code and conform to pub package layout.
// These packages need no transpilation. All code is copied over to `dist`
// unmodified and directory structure is preserved.
//
// This task also fixes relative `dependency_overrides` paths in `pubspec.yaml`
// files.
gulp.task('build/pure-packages.dart', function() {
  var through2 = require('through2');
  var yaml = require('js-yaml');
  var originalPrefix = '../../dist/dart/';

  return gulp
    .src([
      'modules_dart/**/*.dart',
      'modules_dart/**/pubspec.yaml',
    ])
    .pipe(through2.obj(function(file, enc, done) {
      if (file.path.endsWith('pubspec.yaml')) {
        // Pure packages specify dependency_overrides relative to
        // `modules_dart`, so they have to walk up and into `dist`.
        //
        // Example:
        //
        // dependency_overrides:
        //   angular2:
        //     path: ../../dist/dart/angular2
        //
        // When we copy a pure package into `dist` the relative path
        // must be updated. The code below replaces paths accordingly.
        // So the example above is turned into:
        //
        // dependency_overrides:
        //   angular2:
        //     path: ../angular2
        //
        var pubspec = yaml.safeLoad(file.contents.toString());
        var overrides = pubspec['dependency_overrides'];
        if (overrides) {
          Object.keys(overrides).forEach(function(pkg) {
            var overridePath = overrides[pkg]['path'];
            if (overridePath.startsWith(originalPrefix)) {
              overrides[pkg]['path'] = overridePath.replace(originalPrefix, '../');
            }
          });
          file.contents = new Buffer(yaml.safeDump(pubspec));
        }
      }
      this.push(file);
      done();
    }))
    .pipe(gulp.dest('dist/dart'));
});

// Builds all Dart packages, but does not compile them
gulp.task('build/packages.dart', function(done) {
  runSequence(
    'build/tree.dart',
    // Run after 'build/tree.dart' because broccoli clears the dist/dart folder
    '!build/pubget.angular2.dart',
    '!build/change_detect.dart',
    'build/pure-packages.dart',
    sequenceComplete(done));
});

// Builds and compiles all Dart packages
gulp.task('build.dart', function(done) {
  runSequence(
    'build/packages.dart',
    'build/pubspec.dart',
    'build/analyze.dart',
    'build/pubbuild.dart',
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
                 // Don't use the version of typescript that gulp-typescript depends on, we need 1.5
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


gulp.task('build.js.dev', ['build/clean.js'], function(done) {
  runSequence(
    'broccoli.js.dev',
    'build/checkCircularDependencies',
    'check-format',
    sequenceComplete(done)
  );
});

gulp.task('build.js.prod', ['build.tools'], function() {
  return angularBuilder.rebuildBrowserProdTree();
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
  paths: {
    "*": "dist/js/prod/es6/*.js",
    "rx": "node_modules/rx/dist/rx.js"
  },
  meta: {
    // auto-detection fails to detect properly here - https://github.com/systemjs/builder/issues/123
    'rx': {
        format: 'cjs'
      }
    }
};

// production build
gulp.task('bundle.js.prod', ['build.js.prod'], function() {
  return bundler.bundle(
      bundleConfig,
      'angular2/angular2',
      './dist/build/angular2.js',
      {
        sourceMaps: true
      });
});

// minified production build
gulp.task('bundle.js.min', ['build.js.prod'], function() {
  return bundler.bundle(
      bundleConfig,
      'angular2/angular2',
      './dist/build/angular2.min.js',
      {
        sourceMaps: true,
        minify: true
      });
});

// development build
gulp.task('bundle.js.dev', ['build.js.dev'], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths =
      merge(true, devBundleConfig.paths, {
       "*": "dist/js/dev/es6/*.js"
      });
  return bundler.bundle(
      devBundleConfig,
      'angular2/angular2',
      './dist/build/angular2.dev.js',
      { sourceMaps: true });
});

gulp.task('router.bundle.js.dev', ['build.js.dev'], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths =
    merge(true, devBundleConfig.paths, {
      "*": "dist/js/dev/es6/*.js"
    });
  return bundler.bundle(
    devBundleConfig,
    'angular2/router - angular2/angular2',
    './dist/bundle/router.dev.js',
    { sourceMaps: true });
});

// self-executing development build
// This bundle executes its main module - angular2_sfx, when loaded, without
// a corresponding System.import call. It is aimed at ES5 developers that do not
// use System loader polyfills (like system.js and es6 loader).
// see: https://github.com/systemjs/builder (SFX bundles).
gulp.task('bundle.js.sfx.dev', ['build.js.dev'], function() {
  var devBundleConfig = merge(true, bundleConfig);
  devBundleConfig.paths =
      merge(true, devBundleConfig.paths, {
       '*': 'dist/js/dev/es6/*.js'
      });
  return bundler.bundle(
      devBundleConfig,
      'angular2/angular2_sfx',
      './dist/build/angular2.sfx.dev.js',
      { sourceMaps: true },
      /* self-executing */ true);
});

gulp.task('bundle.js.prod.deps', ['bundle.js.prod'], function() {
  return bundler.modify(
      ['node_modules/zone.js/dist/zone-microtask.js', 'node_modules/reflect-metadata/Reflect.js',
      'dist/build/angular2.js'],
      'angular2.js'
  ).pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.min.deps', ['bundle.js.min'], function() {
  return bundler.modify(
      ['node_modules/zone.js/dist/zone-microtask.min.js',
      'node_modules/reflect-metadata/Reflect.js', 'dist/build/angular2.min.js'],
      'angular2.min.js'
  )
  .pipe(uglify())
  .pipe(gulp.dest('dist/bundle'));
});

var JS_DEV_DEPS = [
    'node_modules/zone.js/dist/zone-microtask.js',
    'node_modules/zone.js/dist/long-stack-trace-zone.js',
    'node_modules/reflect-metadata/Reflect.js'
];

gulp.task('bundle.js.dev.deps', ['bundle.js.dev'], function() {
  return bundler.modify(JS_DEV_DEPS.concat(['dist/build/angular2.dev.js']), 'angular2.dev.js')
      .pipe(insert.append('\nSystem.config({"paths":{"*":"*.js","angular2/*":"angular2/*"}});\n'))
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.sfx.dev.deps', ['bundle.js.sfx.dev'], function() {
  return bundler.modify(JS_DEV_DEPS.concat(['dist/build/angular2.sfx.dev.js']),
                        'angular2.sfx.dev.js')
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.deps', ['bundle.js.prod.deps', 'bundle.js.dev.deps', 'bundle.js.min.deps', 'bundle.js.sfx.dev.deps', 'router.bundle.js.dev']);

gulp.task('build.js', ['build.js.dev', 'build.js.prod', 'build.js.cjs', 'bundle.js.deps']);

gulp.task('clean', ['build/clean.tools', 'build/clean.js', 'build/clean.dart', 'build/clean.docs']);

gulp.task('build', ['build.js', 'build.dart']);

// ------------
// change detection codegen


gulp.task('build.change_detect.dart', function(done) {
  return runSequence('build/packages.dart', '!build/pubget.angular2.dart',
                     '!build/change_detect.dart', done);
});

gulp.task('!build/change_detect.dart', function(done) {
  var fs = require('fs');
  var changeDetectDir = path.join(CONFIG.dest.dart, 'angular2/test/change_detection/');
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

// TODO: this target is temporary until we find a way to use the SASS transformer
gulp.task('build.dart.material', ['build/packages.dart'], function() {
  return gulp.src('dist/dart/angular2_material/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/dart/angular2_material/lib/src'));
});


gulp.task('cleanup.builder', function(done) {
  angularBuilder.cleanup().then(function() {
    del('tmp', done); // TODO(iminar): remove after 2015-06-01
                      // this is here just to cleanup old files that we leaked in the past
  });
});


// register cleanup listener for ctrl+c/kill used to quit any persistent task (autotest or serve tasks)
process.on('SIGINT', function() {
  if (!angularBuilder.mock) {
    runSequence('cleanup.builder', function () {
      process.exit();
    });
  }
});


// register cleanup listener for all non-persistent tasks
var beforeExitRan = false;

process.on('beforeExit', function() {
  if (beforeExitRan) return;

  beforeExitRan = true;

  if (!angularBuilder.mock) {
    gulp.start('cleanup.builder');
  }
});
