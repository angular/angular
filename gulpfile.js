var broccoliBuild = require('./tools/broccoli/gulp');

var format = require('gulp-clang-format');
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var madge = require('madge');
var merge = require('merge');
var path = require('path');

var gulpTraceur = require('./tools/transpiler/gulp-traceur');
var clean = require('./tools/build/clean');
var transpile = require('./tools/build/transpile');
var html = require('./tools/build/html');
var pubget = require('./tools/build/pubget');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var rundartpackage = require('./tools/build/rundartpackage');
var copy = require('./tools/build/copy');
var file2moduleName = require('./tools/build/file2modulename');
var karma = require('karma').server;
var minimist = require('minimist');
var es5build = require('./tools/build/es5build');
var runServerDartTests = require('./tools/build/run_server_dart_tests');
var sourcemaps = require('gulp-sourcemaps');
var transformCJSTests = require('./tools/build/transformCJSTests');
var tsc = require('gulp-typescript');
var ts2dart = require('gulp-ts2dart');
var util = require('./tools/build/util');
var bundler = require('./tools/build/bundle');
var replace = require('gulp-replace');
var insert = require('gulp-insert');

// Note: when DART_SDK is not found, all gulp tasks ending with `.dart` will be skipped.

var DART_SDK = require('./tools/build/dartdetect')(gulp);

// -----------------------
// configuration

var _COMPILER_CONFIG_JS_DEFAULT = {
  sourceMaps: true,
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true, // parse class fields
  modules: 'instantiate'
};

var _HTML_DEFAULT_SCRIPTS_JS = [
  {src: gulpTraceur.RUNTIME_PATH, mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
      mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/zone.js/zone.js', mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/zone.js/long-stack-trace-zone.js', mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/systemjs/dist/system.src.js', mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/systemjs/lib/extension-register.js', mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/systemjs/lib/extension-cjs.js', mimeType: 'text/javascript', copy: true},
  {src: 'node_modules/rx/dist/rx.all.js', mimeType: 'text/javascript', copy: true},
  {src: 'tools/build/snippets/runtime_paths.js', mimeType: 'text/javascript', copy: true},
  {
    inline: 'System.import(\'$MODULENAME$\').then(function(m) { m.main(); }, console.error.bind(console))',
    mimeType: 'text/javascript'
  }
];

var _HTML_DEFAULT_SCRIPTS_DART = [
  {src: '$MODULENAME_WITHOUT_PATH$.dart', mimeType: 'application/dart'},
  {src: 'packages/browser/dart.js', mimeType: 'text/javascript'}
];

var BASE_PACKAGE_JSON = require('./package.json');
var COMMON_PACKAGE_JSON = {
  version: BASE_PACKAGE_JSON.version,
  homepage: BASE_PACKAGE_JSON.homepage,
  bugs: BASE_PACKAGE_JSON.bugs,
  license: BASE_PACKAGE_JSON.license,
  contributors: BASE_PACKAGE_JSON.contributors,
  dependencies: BASE_PACKAGE_JSON.dependencies,
  devDependencies: {
    "yargs": BASE_PACKAGE_JSON.devDependencies['yargs'],
    "gulp-sourcemaps": BASE_PACKAGE_JSON.devDependencies['gulp-sourcemaps'],
    "gulp-traceur": BASE_PACKAGE_JSON.devDependencies['gulp-traceur'],
    "gulp": BASE_PACKAGE_JSON.devDependencies['gulp'],
    "gulp-rename": BASE_PACKAGE_JSON.devDependencies['gulp-rename'],
    "through2": BASE_PACKAGE_JSON.devDependencies['through2']
  }
};

var SRC_FOLDER_INSERTION = {
    js: {
      '**': ''
    },
    dart: {
      '**': 'lib',
      '*/test/**': '',
      'benchmarks/**': 'web',
      'benchmarks/test/**': '',
      'benchmarks_external/**': 'web',
      'benchmarks_external/test/**': '',
      'example*/**': 'web',
      'example*/test/**': ''
    }
  };

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
  srcFolderInsertion: SRC_FOLDER_INSERTION,
  transpile: {
    src: {
      js: ['modules/**/*.js', 'modules/**/*.es6'],
      ts: ['modules/**/*.ts'],
      dart: ['modules/**/*.js']
    },
    options: {
      js: {
        dev: merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
          typeAssertionModule: 'rtts_assert/rtts_assert',
          typeAssertions: true,
          outputLanguage: 'es6'
        }),
        prod: merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
          typeAssertions: false,
          outputLanguage: 'es6'
        }),
        cjs: merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
          typeAssertionModule: 'rtts_assert/rtts_assert',
          // Don't use type assertions since this is partly transpiled by typescript
          typeAssertions: false,
          modules: 'commonjs'
        })
      }
    }
  },
  copy: {
    js: {
      cjs: {
        src: [
          'modules/**/*.md', '!modules/**/*.dart.md', 'modules/**/*.png',
          'modules/**/package.json'
        ],
        pipes: {
          '**/*.js.md': gulpPlugins.rename(function(file) {
            file.basename = file.basename.substring(0, file.basename.lastIndexOf('.'));
          }),
          '**/package.json': gulpPlugins.template({ 'packageJson': COMMON_PACKAGE_JSON })
        }
      },
      dev: {
        src: ['modules/**/*.css'],
        pipes: {}
      },
      prod: {
        src: ['modules/**/*.css'],
        pipes: {}
      }
    },
    dart: {
      src: [
        'modules/**/*.md', '!modules/**/*.js.md', 'modules/**/*.png', 'modules/**/*.html',
        'modules/**/*.dart', 'modules/*/pubspec.yaml', 'modules/**/*.css', '!modules/**/e2e_test/**'
      ],
      pipes: {
        '**/*.dart': util.insertSrcFolder(gulpPlugins, SRC_FOLDER_INSERTION.dart),
        '**/*.dart.md': gulpPlugins.rename(function(file) {
          file.basename = file.basename.substring(0, file.basename.lastIndexOf('.'));
        }),
        '**/pubspec.yaml': gulpPlugins.template({ 'packageJson': COMMON_PACKAGE_JSON })
      }
    }
  },
  multicopy: {
    js: {
      cjs: {
        src: [
          'LICENSE'
        ],
        pipes: {}
      },
      dev: {
        es6: {
          src: ['tools/build/es5build.js'],
          pipes: {}
        }
      },
      prod: {
        es6: {
          src: ['tools/build/es5build.js'],
          pipes: {}
        }
      }
    },
    dart: {
      src: ['LICENSE'],
      exclude: ['rtts_assert'],
      pipes: {}
    }
  },
  html: {
    src: {
      js: ['modules/*/src/**/*.html'],
      dart: ['modules/*/src/**/*.html']
    },
    scriptsPerFolder: {
      js: {
        '**': _HTML_DEFAULT_SCRIPTS_JS,
        'benchmarks/**':
          [
            { src: 'tools/build/snippets/url_params_to_form.js', mimeType: 'text/javascript', copy: true }
          ].concat(_HTML_DEFAULT_SCRIPTS_JS),
        'benchmarks_external/**':
          [
            { src: 'node_modules/angular/angular.js', mimeType: 'text/javascript', copy: true },
            { src: 'tools/build/snippets/url_params_to_form.js', mimeType: 'text/javascript', copy: true }
          ].concat(_HTML_DEFAULT_SCRIPTS_JS),
        'benchmarks_external/**/*polymer*/**':
          [
            { src: 'bower_components/polymer/lib/polymer.html', copyOnly: true },
            { src: 'tools/build/snippets/url_params_to_form.js', mimeType: 'text/javascript', copy: true }
          ]
      },
      dart: {
        '**': _HTML_DEFAULT_SCRIPTS_DART,
        'benchmarks*/**':
          [
            { src: 'tools/build/snippets/url_params_to_form.js', mimeType: 'text/javascript', copy: true }
          ].concat(_HTML_DEFAULT_SCRIPTS_DART)
      }
    }
  },
  formatDart: {
    packageName: 'dart_style',
    args: ['dart_style:format', '-w', 'dist/dart']
  },
  test: {
    js: {
      cjs: [
        '/angular2/test/change_detection/**/*_spec.js',
        '/angular2/test/core/annotations/**/*_spec.js',
        '/angular2/test/core/compiler/**/*_spec.js',
        '/angular2/test/di/**/*_spec.js',
        '/angular2/test/directives/**/*_spec.js',
        '/angular2/test/facade/**/*_spec.js',
        '/angular2/test/forms/**/*_spec.js',
        '/angular2/test/mock/**/*_spec.js',
        '/angular2/test/reflection/**/*_spec.js',
        '/angular2/test/services/**/*_spec.js',
        '/angular2/test/test_lib/**/*_spec.js'
      ]
    }
  }
};
CONFIG.test.js.cjs = CONFIG.test.js.cjs.map(function(s) {return CONFIG.dest.js.cjs + s});

// ------------
// clean

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

gulp.task('build/transpile.ts.cjs', function() {
  var tsResult = gulp.src(CONFIG.transpile.src.ts)
      .pipe(sourcemaps.init())
      .pipe(tsc({
        target: 'ES5',
        module: /*system.js*/'commonjs',
        allowNonTsExtensions: false,
        typescript: require('typescript'),
        //declarationFiles: true,
        noEmitOnError: true
      }));
  var dest = gulp.dest(CONFIG.dest.js.cjs);
  return merge([
    // Write external sourcemap next to the js file
    tsResult.js.pipe(sourcemaps.write('.')).pipe(dest),
    tsResult.js.pipe(dest),
    tsResult.dts.pipe(dest),
  ]);
});

gulp.task('build/transpile.ts.dev.es5', function() {
  var tsResult = gulp.src(CONFIG.transpile.src.ts)
                     .pipe(sourcemaps.init())
                     .pipe(tsc({

                       target: 'ES5',
                       module: 'commonjs',
                       typescript: require('typescript'),
                       noEmitOnError: true
                     }));
  return merge([
    tsResult.js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(CONFIG.dest.js.dev.es5)),
    tsResult.js.pipe(gulp.dest(CONFIG.dest.js.dev.es5))
  ]);
});

gulp.task('build/transpile.js.dev.es5', function() {
  return es5build({
    src: CONFIG.dest.js.dev.es6,
    dest: CONFIG.dest.js.dev.es5,
    modules: 'instantiate'
  });
});

gulp.task('build/transpile.js.prod.es6', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js,
  dest: CONFIG.dest.js.prod.es6,
  outputExt: 'es6',
  options: CONFIG.transpile.options.js.prod,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js
}));

gulp.task('build/transpile.js.prod.es5', function() {
  return es5build({
    src: CONFIG.dest.js.prod.es6,
    dest: CONFIG.dest.js.prod.es5,
    modules: 'instantiate'
  });
});

gulp.task('build/transpile.js.prod', function(done) {
  runSequence(
    'build/transpile.js.prod.es6',
    'build/transpile.js.prod.es5',
    done
  );
});

gulp.task('build/transpile.js.cjs', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js.concat(['modules/**/*.cjs']),
  dest: CONFIG.dest.js.cjs,
  outputExt: 'js',
  options: CONFIG.transpile.options.js.cjs,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js
}));
gulp.task('build/transformCJSTests', function() {
  return gulp.src(CONFIG.dest.js.cjs + '/angular2/test/**/*_spec.js')
      .pipe(transformCJSTests())
      .pipe(gulp.dest(CONFIG.dest.js.cjs + '/angular2/test/'));
});

gulp.task('build/transpile.dart', function() {
  return gulp.src(CONFIG.transpile.src.dart)
      .pipe(ts2dart.transpile())
      .pipe(util.insertSrcFolder(gulpPlugins, CONFIG.srcFolderInsertion.dart))
      .pipe(gulp.dest(CONFIG.dest.dart));
});

// ------------
// html

gulp.task('build/html.js.dev', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.js,
  dest: CONFIG.dest.js.dev.es5,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.js
}));

gulp.task('build/html.js.prod', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.js,
  dest: CONFIG.dest.js.prod.es5,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.js
}));

gulp.task('build/html.dart', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.dart,
  dest: CONFIG.dest.dart,
  srcFolderInsertion: CONFIG.srcFolderInsertion.dart,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.dart
}));

// ------------
// copy

gulp.task('build/copy.js.cjs', copy.copy(gulp, gulpPlugins, {
  src: CONFIG.copy.js.cjs.src,
  pipes: CONFIG.copy.js.cjs.pipes,
  dest: CONFIG.dest.js.cjs
}));

gulp.task('build/copy.js.dev', copy.copy(gulp, gulpPlugins, {
  src: CONFIG.copy.js.dev.src,
  pipes: CONFIG.copy.js.dev.pipes,
  dest: CONFIG.dest.js.dev.es5
}));

gulp.task('build/copy.js.prod', copy.copy(gulp, gulpPlugins, {
  src: CONFIG.copy.js.prod.src,
  pipes: CONFIG.copy.js.prod.pipes,
  dest: CONFIG.dest.js.prod.es5
}));

gulp.task('build/copy.dart', copy.copy(gulp, gulpPlugins, {
  src: CONFIG.copy.dart.src,
  pipes: CONFIG.copy.dart.pipes,
  dest: CONFIG.dest.dart
}));


// ------------
// multicopy

gulp.task('build/multicopy.js.cjs', copy.multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.js.cjs.src,
  pipes: CONFIG.multicopy.js.cjs.pipes,
  exclude: CONFIG.multicopy.js.cjs.exclude,
  dest: CONFIG.dest.js.cjs
}));

gulp.task('build/multicopy.js.dev.es6', copy.multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.js.dev.es6.src,
  pipes: CONFIG.multicopy.js.dev.es6.pipes,
  exclude: CONFIG.multicopy.js.dev.es6.exclude,
  dest: CONFIG.dest.js.dev.es6
}));

gulp.task('build/multicopy.js.prod.es6', copy.multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.js.prod.es6.src,
  pipes: CONFIG.multicopy.js.prod.es6.pipes,
  exclude: CONFIG.multicopy.js.prod.es6.exclude,
  dest: CONFIG.dest.js.prod.es6
}));

gulp.task('build/multicopy.dart', copy.multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.dart.src,
  pipes: CONFIG.multicopy.dart.pipes,
  exclude: CONFIG.multicopy.dart.exclude,
  dest: CONFIG.dest.dart
}));

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
// linknodemodules

gulp.task('build/linknodemodules.js.cjs', linknodemodules(gulp, gulpPlugins, {
  dir: CONFIG.dest.js.cjs
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

gulp.task('check-format', function() {
  return gulp.src(['Brocfile*.js', 'modules/**/*.ts', '!**/typings/**/*.d.ts'])
      .pipe(format.checkFormat('file'));
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
var jasmine = require('gulp-jasmine');
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


function createDocsTasks(public) {
  var dgeniPackage = public ? './docs/public-docs-package' : './docs/dgeni-package';
  var distDocsPath = public ? 'dist/public_docs' : 'dist/docs';
  var taskPrefix = public ? 'public_docs' : 'docs';

  gulp.task(taskPrefix + '/dgeni', function() {
    try {
      var dgeni = new Dgeni([require(dgeniPackage)]);
      return dgeni.generate();
    } catch(x) {
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

  gulp.task(taskPrefix + '/test', function () {
    return gulp.src('docs/**/*.spec.js')
        .pipe(jasmine({
          includeStackTrace: true
        }));
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
  runSequence('test.transpiler.unittest', 'docs/test', 'test.unit.js/ci',
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
gulp.task('test.unit.cjs/ci', function () {
  return gulp.src(CONFIG.test.js.cjs).pipe(jasmine({includeStackTrace: true, timeout: 1000}));
});
gulp.task('test.unit.cjs', ['build.js.cjs'], function () {
  //Run tests once
  runSequence('test.unit.cjs/ci', function() {});
  //Watcher to transpile file changed
  gulp.watch(CONFIG.transpile.src.js.concat(['modules/**/*.cjs']), function(event) {
    var relPath = path.relative(__dirname, event.path).replace(/\\/g, "/");
    gulp.src(relPath)
      .pipe(gulpPlugins.rename({extname: '.'+ 'js'}))
      .pipe(util.insertSrcFolder(gulpPlugins, CONFIG.srcFolderInsertion.js))
      .pipe(gulpTraceur(CONFIG.transpile.options.js.cjs, file2moduleName))
      .pipe(transformCJSTests())
      .pipe(gulp.dest(CONFIG.dest.js.cjs + path.dirname(relPath.replace("modules", ""))));
  });
  //Watcher to run tests when dist/js/cjs/angular2 is updated by the first watcher (after clearing the node cache)
  gulp.watch(CONFIG.dest.js.cjs + '/angular2/**/*.js', function(event) {
    for (var id in require.cache) {
      if (id.replace(/\\/g, "/").indexOf(CONFIG.dest.js.cjs) > -1) {
        delete require.cache[id];
      }
    }
    runSequence('test.unit.cjs/ci', function() {});
  });

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
gulp.task('test.transpiler.unittest', function() {
  return gulp.src('tools/transpiler/unittest/**/*.js')
      .pipe(jasmine({
        includeStackTrace: true
      }))
});

// -----------------
// orchestrated targets

// Builds all Dart packages, but does not compile them
gulp.task('build/packages.dart', function(done) {
  runSequence(
    ['build/transpile.dart', 'build/html.dart', 'build/copy.dart', 'build/multicopy.dart'],
    'build/format.dart',
    'build/pubspec.dart',
    done
  );
});

// Builds and compiles all Dart packages
gulp.task('build.dart', function(done) {
  runSequence(
    'build/packages.dart',
    'build/analyze.dart',
    'build/pubbuild.dart',
    done
  );
});

gulp.task('build.broccoli.tools', function() {
  var tsResult = gulp.src('tools/broccoli/**/*.ts')
    .pipe(tsc({ target: 'ES5', module: 'commonjs' }));
  return tsResult.js.pipe(gulp.dest('dist/broccoli'));
});

gulp.task('broccoli.js.dev', ['build.broccoli.tools'], function() {
  return broccoliBuild(require('./Brocfile-js_dev.js'), path.join('js', 'dev'));
});

gulp.task('broccoli.js.prod', ['build.broccoli.tools'], function() {
  return broccoliBuild(require('./Brocfile-js_prod.js'), path.join('js', 'prod'));
});

gulp.task('build.js.dev', function(done) {
  runSequence(
    'broccoli.js.dev',
    'build/checkCircularDependencies',
    done
  );
});

gulp.task('build.js.prod', ['broccoli.js.prod']);

gulp.task('broccoli.js.cjs', ['build.broccoli.tools'], function() {
  return broccoliBuild(require('./Brocfile-js_cjs.js'), path.join('js', 'cjs'));
});
gulp.task('build.js.cjs', function(done) {
  runSequence(
    'broccoli.js.cjs',
    ['build/linknodemodules.js.cjs'],
    'build/transformCJSTests',
    done
  );
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
      {
        sourceMaps: true
      });
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

gulp.task('bundle.js.dev.deps', ['bundle.js.dev'], function() {
  return bundler.modify(
      ['node_modules/zone.js/zone.js', 'node_modules/zone.js/long-stack-trace-zone.js', 'dist/build/angular2.dev.js'],
      'angular2.dev.js')
      .pipe(insert.append('\nzone = zone.fork(Zone.longStackTraceZone);\n'))
      .pipe(gulp.dest('dist/bundle'));
});

gulp.task('bundle.js.deps', ['bundle.js.prod.deps', 'bundle.js.dev.deps', 'bundle.js.min.deps']);

gulp.task('build.js', ['build.js.dev', 'build.js.prod', 'build.js.cjs']);

gulp.task('clean', ['build/clean.js', 'build/clean.dart', 'build/clean.docs']);

gulp.task('build', ['build.js', 'build.dart']);
