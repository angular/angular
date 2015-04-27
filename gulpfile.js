'use strict';

var autoprefixer = require('gulp-autoprefixer');
var format = require('gulp-clang-format');
var fork = require('child_process').fork;
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var madge = require('madge');
var merge = require('merge');
var merge2 = require('merge2');
var path = require('path');

var clean = require('./tools/build/clean');
var transpile = require('./tools/build/transpile');
var pubget = require('./tools/build/pubget');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var rundartpackage = require('./tools/build/rundartpackage');
var file2moduleName = require('./tools/build/file2modulename');
var karma = require('karma').server;
var minimist = require('minimist');
var runServerDartTests = require('./tools/build/run_server_dart_tests');
var sourcemaps = require('gulp-sourcemaps');
var tsc = require('gulp-typescript');
var util = require('./tools/build/util');
var bundler = require('./tools/build/bundle');
var replace = require('gulp-replace');
var insert = require('gulp-insert');


// dynamic require in build.tools so we can bootstrap TypeScript compilation
function throwToolsBuildMissingError() {
  throw new Error('ERROR: build.tools task should have been run before using angularBuilder');
}

var angularBuilder = {
  rebuildBrowserDevTree: throwToolsBuildMissingError,
  rebuildBrowserProdTree: throwToolsBuildMissingError,
  rebuildNodeTree: throwToolsBuildMissingError,
  rebuildDartTree: throwToolsBuildMissingError,
  cleanup: function() {}
};

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
  },
  formatDart: {
    packageName: 'dart_style',
    args: ['dart_style:format', '-w', 'dist/dart']
  }
};

// ------------
// clean

gulp.task('build/clean.tools', clean(gulp, gulpPlugins, {
  path: path.join('dist', 'tools')
}));

gulp.task('build/clean.js', clean(gulp, gulpPlugins, {
  path: CONFIG.dest.js.all
}));

gulp.task('build/clean.dart', clean(gulp, gulpPlugins, {
  path: CONFIG.dest.dart
}));

gulp.task('build/clean.docs', clean(gulp, gulpPlugins, {
    path: CONFIG.dest.docs
}));


// ------------
// transpile

gulp.task('build/tree.dart', ['build.tools'], function() {
  return angularBuilder.rebuildDartTree();
});

// ------------
// pubspec

// Run a top-level `pub get` for this project.
gulp.task('pubget.dart', pubget.dir(gulp, gulpPlugins, { dir: '.', command: DART_SDK.PUB }));

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

gulp.task('build/format.dart', rundartpackage(gulp, gulpPlugins, {
  pub: DART_SDK.PUB,
  packageName: CONFIG.formatDart.packageName,
  args: CONFIG.formatDart.args
}));

function doCheckFormat() {
  return gulp.src(['Brocfile*.js', 'modules/**/*.ts', 'tools/**/*.ts', '!**/typings/**/*.d.ts',
                   '!tools/broccoli/tree-differ.ts']) // See https://github.com/angular/clang-format/issues/4
    .pipe(format.checkFormat('file'));
}

gulp.task('check-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("NOTE: this will be promoted to an ERROR in the continuous build");
  });
});

gulp.task('enforce-format', function() {
  return doCheckFormat().on('warning', function(e) {
    console.log("ERROR: Some files need formatting");
    process.exit(1);
  });
});

// ------------
// check circular dependencies in Node.js context
gulp.task('build/checkCircularDependencies', function (done) {
  var dependencyObject = madge(CONFIG.dest.js.dev.es6, {
    format: 'es6',
    paths: [CONFIG.dest.js.dev.es6],
    extensions: ['.js', '.es6'],
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
gulp.task('serve.js.dev', jsserve(gulp, gulpPlugins, {
  path: CONFIG.dest.js.dev.es5,
  port: 8000
}));

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
    return gulp.watch('docs/app/**/*', [taskPrefix + '/app']);
  });

  gulp.task(taskPrefix + '/test', function (done) {
    fork('./tools/traceur-jasmine', ['docs/**/*.spec.js'], {
      stdio: 'inherit'
    }).on('close', function (exitCode) {
      done(exitCode);
    });
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

// ------------------
// CI tests suites

gulp.task('test.js', function(done) {
  runSequence('test.unit.tools/ci', 'test.transpiler.unittest', 'docs/test', 'test.unit.js/ci',
              'test.unit.cjs/ci', done);
});

gulp.task('test.dart', function(done) {
  runSequence('test.transpiler.unittest', 'docs/test', 'test.unit.dart/ci', done);
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
gulp.task('test.unit.js', function (done) {
  karma.start({configFile: __dirname + '/karma-js.conf.js'}, done);
});
gulp.task('test.unit.dart', function (done) {
  karma.start({configFile: __dirname + '/karma-dart.conf.js'}, done);
});
gulp.task('test.unit.js/ci', function (done) {
  karma.start({configFile: __dirname + '/karma-js.conf.js',
      singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
});
gulp.task('test.unit.dart/ci', function (done) {
  karma.start({configFile: __dirname + '/karma-dart.conf.js',
      singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
});


gulp.task('test.unit.cjs/ci', function(done) {
  fork('./tools/traceur-jasmine', ['dist/js/cjs/angular2/test/**/*_spec.js'], {
    stdio: 'inherit'
  }).on('close', function (exitCode) {
    done(exitCode);
  });
});


gulp.task('test.unit.cjs', ['test.unit.cjs/ci'], function () {
  gulp.watch('modules/**', ['test.unit.cjs/ci']);
});


gulp.task('test.unit.tools/ci', function(done) {
  fork('./tools/traceur-jasmine', ['dist/tools/**/*.spec.js'], {
    stdio: 'inherit'
  }).on('close', done);
});


gulp.task('test.unit.tools', function(done) {
  function buildAndTest() {
    runSequence(
      'build.tools',
      'test.unit.tools/ci'
    );
  }

  buildAndTest();

  gulp.watch('tools/**', buildAndTest);
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
  fork('./tools/traceur-jasmine', ['tools/transpiler/unittest/**/*.js'], {
    stdio: 'inherit'
  }).on('close', function (exitCode) {
    done(exitCode);
  });
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
    'build/pure-packages.dart',
    'build/format.dart',
    done);
});

// Builds and compiles all Dart packages
gulp.task('build.dart', function(done) {
  runSequence(
    'build/packages.dart',
    'build/pubspec.dart',
    'build/analyze.dart',
    'build/pubbuild.dart',
    done
  );
});


gulp.task('build.tools', ['build/clean.tools'], function() {
  var mergedStream;

  var tsResult = gulp.src('tools/**/*.ts')
                     .pipe(sourcemaps.init())
                     .pipe(tsc({target: 'ES5', module: 'commonjs', reporter: tsc.reporter.nullReporter()}))
                     .on('error', function(error) {
                        // gulp-typescript doesn't propagate errors from the src stream into the js stream so we are
                        // forwarding the error into the merged stream
                        mergedStream.emit('error', error);
                     });

  var destDir = gulp.dest('dist/tools/');

  mergedStream = merge2([
    tsResult.js.pipe(sourcemaps.write('.')).pipe(destDir),
    tsResult.js.pipe(destDir)
  ]).on('end', function() {
    var AngularBuilder = require('./dist/tools/broccoli/angular_builder').AngularBuilder;
    angularBuilder = new AngularBuilder('dist');
  });

  return mergedStream;
});

gulp.task('broccoli.js.dev', ['build.tools'], function() {
  return angularBuilder.rebuildBrowserDevTree();
});


gulp.task('build.js.dev', function(done) {
  runSequence(
    'broccoli.js.dev',
    'build/checkCircularDependencies',
    'check-format',
    done
  );
});

gulp.task('build.js.prod', ['build.tools'], function() {
  return angularBuilder.rebuildBrowserProdTree();
});


var firstBuildJsCjs = true;

gulp.task('build.js.cjs', ['build.tools'], function() {
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
    "*": "dist/js/prod/es6/*.es6",
    "rx/*": "node_modules/rx/*.js"
  },
  meta: {
    // auto-detection fails to detect properly here - https://github.com/systemjs/builder/issues/123
    'rx/dist/rx.all': {
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
// TODO: minify zone.js
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
       "*": "dist/js/dev/es6/*.es6"
      });
  return bundler.bundle(
      devBundleConfig,
      'angular2/angular2',
      './dist/build/angular2.dev.js',
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
       '*': 'dist/js/dev/es6/*.es6'
      });
  return bundler.bundle(
      devBundleConfig,
      'angular2/angular2_sfx',
      './dist/build/angular2.sfx.dev.js',
      { sourceMaps: true },
      /* self-exectuting */ true);
});

gulp.task('bundle.js.prod.deps', ['bundle.js.prod'], function() {
  return bundler.modify(
      ['node_modules/zone.js/zone.js', 'dist/build/angular2.js'], 'angular2.js')
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.min.deps', ['bundle.js.min'], function() {
  return bundler.modify(
      ['node_modules/zone.js/zone.js', 'dist/build/angular2.min.js'], 'angular2.min.js')
      .pipe(gulp.dest('dist/bundle'));
});

var JS_DEV_DEPS = ['node_modules/zone.js/zone.js', 'node_modules/zone.js/long-stack-trace-zone.js'];

gulp.task('bundle.js.dev.deps', ['bundle.js.dev'], function() {
  return bundler.modify(JS_DEV_DEPS.concat(['dist/build/angular2.dev.js']), 'angular2.dev.js')
      .pipe(insert.append('\nzone = zone.fork(Zone.longStackTraceZone);\n'))
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.sfx.dev.deps', ['bundle.js.sfx.dev'], function() {
  return bundler.modify(JS_DEV_DEPS.concat(['dist/build/angular2.sfx.dev.js']),
                        'angular2.sfx.dev.js')
      .pipe(insert.append('\nzone = zone.fork(Zone.longStackTraceZone);\n'))
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.deps', ['bundle.js.prod.deps', 'bundle.js.dev.deps', 'bundle.js.min.deps', 'bundle.js.sfx.dev.deps']);

gulp.task('build.js', ['build.js.dev', 'build.js.prod', 'build.js.cjs', 'bundle.js.deps']);

gulp.task('clean', ['build/clean.tools', 'build/clean.js', 'build/clean.dart', 'build/clean.docs']);

gulp.task('build', ['build.js', 'build.dart']);


// ------------
// angular material testing rules
gulp.task('build/css.js.dev', function() {
  return gulp.src('modules/*/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest(CONFIG.dest.js.dev.es5));
});

// TODO: this target is temporary until we find a way to use the SASS transformer
gulp.task('build/css.dart', function() {
  return gulp.src('dist/dart/angular2_material/lib/src/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/dart/angular2_material/lib/src'));
});

gulp.task('build.material', ['build.js.dev', 'build/css.js.dev']);


gulp.task('cleanup.builder', function() {
  angularBuilder.cleanup();
});


// register cleanup listener for ctrl+c/kill used to quit any persistent task (autotest or serve tasks)
process.on('SIGINT', function() {
  gulp.start('cleanup.builder');
  process.exit();
});

// register cleanup listener for all non-persistent tasks
process.on('beforeExit', function() {
  gulp.start('cleanup.builder');
});
