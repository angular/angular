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
var pubbuild = require('./tools/build/pubbuild');
var dartanalyzer = require('./tools/build/dartanalyzer');
var jsserve = require('./tools/build/jsserve');
var pubserve = require('./tools/build/pubserve');
var rundartpackage = require('./tools/build/rundartpackage');
var karma = require('karma').server;
var minimist = require('minimist');

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

var CJS_COMPILER_OPTIONS = {
  sourceMaps: true,
  annotations: false, // parse annotations
  types: false, // parse types
  // TODO(tbosch): Right now, traceur generates imports that
  // rely on absolute paths. This is why we are not using this...
  script: true, // parse as a script
  memberVariables: false, // parse class fields
  typeAssertions: false,
  modules: null // not needed
};

var _HTLM_DEFAULT_SCRIPTS_JS = [
  {src: '/deps/traceur-runtime.js', mimeType: 'text/javascript'},
  {src: '/rtts_assert/lib/rtts_assert.js', mimeType: 'text/javascript'},
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
      dev: 'dist/js/dev',
      prod: 'dist/js/prod',
      dart2js: 'dist/js/dart2js'
    },
    dart: 'dist/dart',
    cjs: {
      all: 'dist/cjs',
      tools: 'dist/cjs/tools',
      e2eTest: 'dist/cjs/e2e_test'
    },
    docs: 'dist/docs'
  },
  srcFolderMapping: {
    'default': 'lib',
    '**/benchmarks/**': 'web',
    '**/benchmarks_external/**': 'web',
    '**/example*/**': 'web'
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
      js: ['modules/**/*.js', 'modules/**/*.es6', '!modules/**/e2e_test/**'],
      dart: ['modules/**/*.js', '!modules/**/e2e_test/**'],
      cjs: {
        tools: ['tools/**/*.es6', '!tools/transpiler/**'],
        e2eTest: ['modules/**/e2e_test/**/*.es6']
      }
    },
    copy: {
      js: ['modules/**/*.es5', '!modules/**/e2e_test/**'],
      dart: ['modules/**/*.dart', '!modules/**/e2e_test/**'],
      cjs: {
        tools: ['tools/**/*.es5', '!tools/transpiler/**'],
        e2eTest: ['modules/**/e2e_test/**/*.es5']
      }
    },
    options: {
      js: {
        dev: merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
          typeAssertionModule: 'rtts_assert/rtts_assert',
          typeAssertions: true
        }),
        prod: merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
          typeAssertions: false
        })
      },
      dart: {
        sourceMaps: true,
        annotations: true, // parse annotations
        types: true, // parse types
        script: false, // parse as a module
        memberVariables: true, // parse class fields
        outputLanguage: 'dart'
      },
      cjs: CJS_COMPILER_OPTIONS
    }
  },
  html: {
    src: {
      js: ['modules/*/src/**/*.html'],
      dart: ['modules/*/src/**/*.html']
    },
    scriptsPerFolder: {
      js: {
        default: _HTLM_DEFAULT_SCRIPTS_JS,
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
        default: _HTML_DEFAULT_SCRIPTS_DART,
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

gulp.task('build/clean.cjs', clean(gulp, gulpPlugins, {
  path: CONFIG.dest.cjs.all
}));

gulp.task('build/clean.docs', clean(gulp, gulpPlugins, {
    path: CONFIG.dest.docs
}));


// ------------
// deps

gulp.task('build/deps.js.dev', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.js,
  dest: CONFIG.dest.js.dev
}));

gulp.task('build/deps.js.prod', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.js,
  dest: CONFIG.dest.js.prod
}));

gulp.task('build/deps.js.dart2js', deps(gulp, gulpPlugins, {
  src: CONFIG.deps.dart,
  dest: CONFIG.dest.js.dart2js
}));

// ------------
// transpile

gulp.task('build/transpile.js.dev', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js,
  copy: CONFIG.transpile.copy.js,
  dest: CONFIG.dest.js.dev,
  outputExt: 'js',
  options: CONFIG.transpile.options.js.dev,
  srcFolderMapping: CONFIG.srcFolderMapping
}));

gulp.task('build/transpile.js.prod', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.js,
  copy: CONFIG.transpile.copy.js,
  dest: CONFIG.dest.js.prod,
  outputExt: 'js',
  options: CONFIG.transpile.options.js.prod,
  srcFolderMapping: CONFIG.srcFolderMapping
}));

gulp.task('build/transpile.dart', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.dart,
  copy: CONFIG.transpile.copy.dart,
  dest: CONFIG.dest.dart,
  outputExt: 'dart',
  options: CONFIG.transpile.options.dart,
  srcFolderMapping: CONFIG.srcFolderMapping
}));

gulp.task('build/transpile/tools.cjs', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.cjs.tools,
  copy: CONFIG.transpile.copy.cjs.tools,
  dest: CONFIG.dest.cjs.tools,
  outputExt: 'js',
  options: CONFIG.transpile.options.cjs,
  srcFolderMapping: {
    'default': 'src'
  }
}));

gulp.task('build/transpile/e2eTest.cjs', transpile(gulp, gulpPlugins, {
  src: CONFIG.transpile.src.cjs.e2eTest,
  copy: CONFIG.transpile.copy.cjs.e2eTest,
  dest: CONFIG.dest.cjs.e2eTest,
  outputExt: 'js',
  options: CONFIG.transpile.options.cjs,
  srcFolderMapping: {
    'default': 'src'
  }
}));

// ------------
// html

gulp.task('build/html.js.dev', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.js,
  dest: CONFIG.dest.js.dev,
  srcFolderMapping: CONFIG.srcFolderMapping,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.js
}));

gulp.task('build/html.js.prod', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.js,
  dest: CONFIG.dest.js.prod,
  srcFolderMapping: CONFIG.srcFolderMapping,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.js
}));

gulp.task('build/html.dart', html(gulp, gulpPlugins, {
  src: CONFIG.html.src.dart,
  dest: CONFIG.dest.dart,
  srcFolderMapping: CONFIG.srcFolderMapping,
  scriptsPerFolder: CONFIG.html.scriptsPerFolder.dart
}));

// ------------
// pubspec

gulp.task('build/pubspec.dart', pubspec(gulp, gulpPlugins, {
  src: CONFIG.pubspec.src,
  dest: CONFIG.dest.dart,
  command: DART_SDK.PUB
}));

// ------------
// dartanalyzer

gulp.task('build/analyze.dart', dartanalyzer(gulp, gulpPlugins, {
  dest: CONFIG.dest.dart,
  command: DART_SDK.ANALYZER,
  srcFolderMapping: CONFIG.srcFolderMapping
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
  path: CONFIG.dest.js.dev,
  port: 8000
}));

gulp.task('serve.js.prod', jsserve(gulp, gulpPlugins, {
  path: CONFIG.dest.js.prod,
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
gulp.task('ci', function(done) {
  runSequence(
    'test.js/ci',
    'test.dart/ci'
  );
});

// -----------------
// orchestrated targets
gulp.task('build.dart', function() {
  return runSequence(
    ['build/deps.js.dart2js', 'build/transpile.dart', 'build/html.dart'],
    'build/pubspec.dart',
    'build/pubbuild.dart',
    'build/analyze.dart',
    'build/format.dart'
  );
});

gulp.task('build.js.dev', function() {
  return runSequence(
    ['build/deps.js.dev', 'build/transpile.js.dev', 'build/html.js.dev']
  );
});

gulp.task('build.js.prod', function() {
  return runSequence(
    ['build/deps.js.prod', 'build/transpile.js.prod', 'build/html.js.prod']
  );
});

gulp.task('build.cjs', function() {
  return runSequence(
    ['build/transpile/tools.cjs', 'build/transpile/e2eTest.cjs']
  );
});

gulp.task('build.js', ['build.js.dev', 'build.js.prod']);

gulp.task('clean', ['build/clean.js', 'build/clean.dart', 'build/clean.cjs', 'build/clean.docs']);

gulp.task('build', ['build.js', 'build.dart', 'build.cjs']);
