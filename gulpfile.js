var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var merge = require('merge');
var gulpTraceur = require('./tools/transpiler/gulp-traceur');

var clean = require('./tools/build/clean');
var deps = require('./tools/build/deps');
var transpile = require('./tools/build/transpile');
var html = require('./tools/build/html');
var pubspec = require('./tools/build/pubspec');
var linknodemodules = require('./tools/build/linknodemodules');
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var rundartpackage = require('./tools/build/rundartpackage');
var multicopy = require('./tools/build/multicopy');
var karma = require('karma').server;
var minimist = require('minimist');
var es5build = require('./tools/build/es5build');

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

var _HTLM_DEFAULT_SCRIPTS_JS = [
  {src: '/deps/traceur-runtime.js', mimeType: 'text/javascript'},
  {src: '/rtts_assert/rtts_assert.js', mimeType: 'text/javascript'},
  {src: '/deps/es6-module-loader-sans-promises.src.js', mimeType: 'text/javascript'},
  {src: '/deps/zone.js', mimeType: 'text/javascript'},
  {src: '/deps/long-stack-trace-zone.js', mimeType: 'text/javascript'},
  {src: '/deps/system.src.js', mimeType: 'text/javascript'},
  {src: '/deps/extension-register.js', mimeType: 'text/javascript'},
  {src: '/deps/runtime_paths.js', mimeType: 'text/javascript'},
  {
    inline: 'System.import(\'$MODULENAME$\').then(function(m) { m.main(); }, console.log.bind(console))',
    mimeType: 'text/javascript'
  }
];

var _HTML_DEFAULT_SCRIPTS_DART = [
  {src: '$MODULENAME_WITHOUT_PATH$.dart', mimeType: 'application/dart'},
  {src: 'packages/browser/dart.js', mimeType: 'text/javascript'}
];

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
  srcFolderInsertion: {
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
  },
  deps: {
    js: [
      gulpTraceur.RUNTIME_PATH,
      "node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js",
      "node_modules/systemjs/dist/system.src.js",
      "node_modules/systemjs/lib/extension-register.js",
      "node_modules/zone.js/zone.js",
      "node_modules/zone.js/long-stack-trace-zone.js",
      "tools/build/snippets/runtime_paths.js",
      "tools/build/snippets/url_params_to_form.js",
      "node_modules/angular/angular.js"
    ],
    dart: [
      "tools/build/snippets/url_params_to_form.js"
    ]
  },
  transpile: {
    src: {
      js: ['modules/**/*.js', 'modules/**/*.es6'],
      dart: ['modules/**/*.js'],
    },
    copy: {
      js: ['modules/**/*.es5'],
      dart: ['modules/**/*.dart', '!modules/**/e2e_test/**'],
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
          typeAssertions: true,
          modules: 'commonjs'
        })
      },
      dart: {
        sourceMaps: true,
        annotations: true, // parse annotations
        types: true, // parse types
        script: false, // parse as a module
        memberVariables: true, // parse class fields
        outputLanguage: 'dart'
      }
    }
  },
  copy: {
    js: ['modules/**/README.md', 'modules/**/package.json'],
    dart: []
  },
  multicopy: {
    src: {
      dart: ['LICENSE'],
      js: ['LICENSE', 'tools/build/es5build.js']
    }
  },
  html: {
    src: {
      js: ['modules/*/src/**/*.html'],
      dart: ['modules/*/src/**/*.html']
    },
    scriptsPerFolder: {
      js: {
        '**': _HTLM_DEFAULT_SCRIPTS_JS,
        'benchmarks/**':
          [
            { src: '/deps/url_params_to_form.js', mimeType: 'text/javascript' }
          ].concat(_HTLM_DEFAULT_SCRIPTS_JS),
        'benchmarks_external/**':
          [
            { src: '/deps/angular.js', mimeType: 'text/javascript' },
            { src: '/deps/url_params_to_form.js', mimeType: 'text/javascript' }
          ].concat(_HTLM_DEFAULT_SCRIPTS_JS)
      },
      dart: {
        '**': _HTML_DEFAULT_SCRIPTS_DART,
        'benchmarks*/**':
          [
            { src: '/deps/url_params_to_form.js', mimeType: 'text/javascript' }
          ].concat(_HTML_DEFAULT_SCRIPTS_DART)
      }
    }
  },
  pubspec: {
    src: 'modules/*/pubspec.yaml'
  },
  formatDart: {
    packageName: 'dart_style',
    args: ['dart_style:format', '-w', 'dist/dart']
  }
};

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
// deps

gulp.task('build/deps.js.dev', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.js,
  dest: CONFIG.dest.js.dev.es5
}));

gulp.task('build/deps.js.prod', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.js,
  dest: CONFIG.dest.js.prod.es5
}));

gulp.task('build/deps.js.dart2js', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.dart,
  dest: CONFIG.dest.js.dart2js
}));

// ------------
// transpile

gulp.task('build/transpile.js.dev.es6', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js,
  copy: CONFIG.transpile.copy.js,
  dest: CONFIG.dest.js.dev.es6,
  outputExt: 'es6',
  options: CONFIG.transpile.options.js.dev,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js
}));

gulp.task('build/transpile.js.dev.es5', function() {
  return es5build({
    src: CONFIG.dest.js.dev.es6,
    dest: CONFIG.dest.js.dev.es5,
    modules: 'instantiate'
  });
});

gulp.task('build/transpile.js.dev', function(done) {
  runSequence(
    'build/transpile.js.dev.es6',
    'build/transpile.js.dev.es5',
    done
  );
});

gulp.task('build/transpile.js.prod.es6', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js,
  copy: CONFIG.transpile.copy.js,
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
  src: CONFIG.transpile.src.js.concat(['tools/benchp*/**/*.es6']),
  copy: CONFIG.transpile.copy.js,
  dest: CONFIG.dest.js.cjs,
  outputExt: 'js',
  options: CONFIG.transpile.options.js.cjs,
  srcFolderInsertion: CONFIG.srcFolderInsertion.js
}));

gulp.task('build/transpile.dart', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.dart,
  copy: CONFIG.transpile.copy.dart,
  dest: CONFIG.dest.dart,
  outputExt: 'dart',
  options: CONFIG.transpile.options.dart,
  srcFolderInsertion: CONFIG.srcFolderInsertion.dart
}));

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

gulp.task('build/copy.js.dev', function() {
  return gulp.src(CONFIG.copy.js)
    .pipe(gulpPlugins.template({
      'channel': 'dev',
      'packageJson': require('./package.json')
    }))
    .pipe(gulp.dest(CONFIG.dest.js.dev.es6));
});

gulp.task('build/copy.js.prod', function() {
  return gulp.src(CONFIG.copy.js)
    .pipe(gulpPlugins.template({
      'channel': 'prod',
      'packageJson': require('./package.json')
    }))
    .pipe(gulp.dest(CONFIG.dest.js.prod.es6));
});

// ------------
// multicopy

gulp.task('build/multicopy.js.dev', multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.src.js,
  dest: CONFIG.dest.js.dev.es6
}));

gulp.task('build/multicopy.js.prod', multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.src.js,
  dest: CONFIG.dest.js.prod.es6
}));

gulp.task('build/multicopy.dart', multicopy(gulp, gulpPlugins, {
  src: CONFIG.multicopy.src.dart,
  dest: CONFIG.dest.dart
}));


// ------------
// pubspec

gulp.task('build/pubspec.dart', pubspec(gulp, gulpPlugins, {
  src: CONFIG.pubspec.src,
  dest: CONFIG.dest.dart,
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
// format dart

gulp.task('build/format.dart', rundartpackage(gulp, gulpPlugins, {
  pub: DART_SDK.PUB,
  packageName: CONFIG.formatDart.packageName,
  args: CONFIG.formatDart.args
}));

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
gulp.task('docs/dgeni', function() {
  try {
    var dgeni = new Dgeni([require('./docs/dgeni-package')]);
    return dgeni.generate();
  } catch(x) {
    console.log(x.stack);
    throw x;
  }
});

var bower = require('bower');
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

gulp.task('docs/assets', ['docs/bower'], function() {
  return gulp.src('docs/bower_components/**/*')
    .pipe(gulp.dest('dist/docs/lib'));
});

gulp.task('docs/app', function() {
  return gulp.src('docs/app/**/*')
    .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs', ['docs/assets', 'docs/app', 'docs/dgeni']);
gulp.task('docs/watch', function() {
  return gulp.watch('docs/app/**/*', ['docs/app']);
});

var jasmine = require('gulp-jasmine');
gulp.task('docs/test', function () {
  return gulp.src('docs/**/*.spec.js')
      .pipe(jasmine({
        includeStackTrace: true
      }));
});

var webserver = require('gulp-webserver');
gulp.task('docs/serve', function() {
  gulp.src('dist/docs/')
    .pipe(webserver({
      fallback: 'index.html'
    }));
});

// ------------------
// tests
function getBrowsersFromCLI() {
  var args = minimist(process.argv.slice(2));
  return [args.browsers?args.browsers:'DartiumWithWebPlatform']
}
gulp.task('test.js', function (done) {
  karma.start({configFile: __dirname + '/karma-js.conf.js'}, done);
});
gulp.task('test.dart', function (done) {
  karma.start({configFile: __dirname + '/karma-dart.conf.js'}, done);
});
gulp.task('test.js/ci', function (done) {
  karma.start({configFile: __dirname + '/karma-js.conf.js', singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
});
gulp.task('test.dart/ci', function (done) {
  karma.start({configFile: __dirname + '/karma-dart.conf.js', singleRun: true, reporters: ['dots'], browsers: getBrowsersFromCLI()}, done);
});
gulp.task('test.transpiler.unittest', function (done) {
  return gulp.src('tools/transpiler/unittest/**/*.js')
      .pipe(jasmine({
        includeStackTrace: true
      }))
});
gulp.task('ci', function(done) {
  runSequence(
    'test.transpiler.unittest',
    'test.js/ci',
    'test.dart/ci',
    done
  );
});

// -----------------
// orchestrated targets
gulp.task('build.dart', function(done) {
  runSequence(
    ['build/deps.js.dart2js', 'build/transpile.dart', 'build/html.dart'],
    'build/pubspec.dart',
    'build/multicopy.dart',
    'build/pubbuild.dart',
    'build/analyze.dart',
    'build/format.dart',
    done
  );
});

gulp.task('build.js.dev', function(done) {
  runSequence(
    ['build/deps.js.dev', 'build/transpile.js.dev', 'build/html.js.dev', 'build/copy.js.dev'],
    'build/multicopy.js.dev',
    done
  );
});

gulp.task('build.js.prod', function(done) {
  runSequence(
    ['build/deps.js.prod', 'build/transpile.js.prod', 'build/html.js.prod', 'build/copy.js.prod'],
    'build/multicopy.js.prod',
    done
  );
});

gulp.task('build.js.cjs', function(done) {
  runSequence(
    'build/transpile.js.cjs',
    'build/linknodemodules.js.cjs',
    done
  );;
});

gulp.task('build.js', ['build.js.dev', 'build.js.prod', 'build.js.cjs']);

gulp.task('clean', ['build/clean.js', 'build/clean.dart', 'build/clean.docs']);

gulp.task('build', ['build.js', 'build.dart']);
