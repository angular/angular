var benchpress = require('angular-benchpress/lib/cli');
var es = require('event-stream');
var file2moduleName = require('./file2modulename');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var merge = require('merge');
var mergeStreams = require('event-stream').merge;
var path = require('path');
var Q = require('q');
var readline = require('readline');
var runSequence = require('run-sequence');
var spawn = require('child_process').spawn;
var through2 = require('through2');
var which = require('which');

var js2es5Options = {
  sourceMaps: true,
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true, // parse class fields
  modules: 'instantiate'
};

var js2es5OptionsProd = merge(true, js2es5Options, {
  typeAssertions: false
});

var js2es5OptionsDev = merge(true, js2es5Options, {
  typeAssertionModule: 'rtts_assert/rtts_assert',
  typeAssertions: true
});

var js2dartOptions = {
  sourceMaps: true,
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true, // parse class fields
  outputLanguage: 'dart'
};

var DART_SDK = false;

try {
  which.sync('dart');
  console.log('Dart SDK detected');
  if (process.platform === 'win32') {
    DART_SDK = {
      PUB: 'pub.bat',
      ANALYZER: 'dartanalyzer.bat'
    };
  } else {
    DART_SDK = {
      PUB: 'pub',
      ANALYZER: 'dartanalyzer'
    };
  }
} catch (e) {
  console.log('Dart SDK is not available, Dart tasks will be skipped.');
  var gulpTaskFn = gulp.task.bind(gulp);
  gulp.task = function (name, deps, fn) {
    if (name.indexOf('.dart') === -1) {
      return gulpTaskFn(name, deps, fn);
    } else {
      return gulpTaskFn(name, function() {
        console.log('Dart SDK is not available. Skipping task: ' + name);
      });
    }
  };
}

var gulpTraceur = require('./tools/transpiler/gulp-traceur');

// ---------
// traceur runtime

gulp.task('jsRuntime/build', function() {
  var traceurRuntime = gulp.src([
    gulpTraceur.RUNTIME_PATH,
    "node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js",
    "node_modules/systemjs/dist/system.src.js",
    "node_modules/systemjs/lib/extension-register.js"
  ]).pipe(gulp.dest('build/js'));
  return traceurRuntime;
});

// -----------------------
// modules
var sourceTypeConfigs = {
  dart: {
    transpileSrc: ['modules/**/*.js'],
    // pub serve uses project_root/web for static serving.
    htmlSrc: ['modules/*/src/**/*.html', 'modules/*/web/*.html'],
    copySrc: ['modules/**/*.dart'],
    outputDir: 'build/dart',
    outputExt: 'dart',
    mimeType: 'application/dart'
  },
  js: {
    transpileSrc: ['modules/**/*.js', 'modules/**/*.es6'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['modules/**/*.es5'],
    outputDir: 'build/js',
    outputExt: 'js'
  }
};


gulp.task('modules/clean', function() {
  return gulp.src('build', {read: false})
      .pipe($.rimraf());
});

gulp.task('modules/build.dart/src', function() {
  return createModuleTask(merge(sourceTypeConfigs.dart, {compilerOptions: js2dartOptions}));
});

gulp.task('modules/build.dart/pubspec', function() {
  var outputDir = sourceTypeConfigs.dart.outputDir;
  var files = [];
  var changedStream = gulp.src('modules/*/pubspec.yaml')
    .pipe($.changed(outputDir)) // Only forward files that changed.
    .pipe(through2.obj(function(file, enc, done) {
      files.push(path.resolve(process.cwd(), outputDir, file.relative));
      this.push(file);
      done();
    }))
    .pipe(gulp.dest(outputDir));
  // We need to wait for all pubspecs to be present before executing
  // `pub get` as it checks the folders of the dependencies!
  return streamToPromise(changedStream)
    .then(function() {
      return Q.all(files.map(function(file) {
        return processToPromise(spawn(DART_SDK.PUB, ['get'], {
          stdio: 'inherit',
          cwd: path.dirname(file)
        }));
      }));
    });
});

function processToPromise(process) {
  var defer = Q.defer();
  process.on('close', function(code) {
    if (code) {
      defer.reject(code);
    } else {
      defer.resolve();
    }
  });
  return defer.promise;
}

function streamToPromise(stream) {
  var defer = Q.defer();
  stream.on('end', defer.resolve);
  stream.on('error', defer.reject);
  return defer.promise;
}

gulp.task('modules/build.dart', ['modules/build.dart/src', 'modules/build.dart/pubspec']);

gulp.task('modules/build.dev.js', function() {
  return createModuleTask(merge(true, sourceTypeConfigs.js, {compilerOptions: js2es5OptionsDev}));
});

gulp.task('modules/build.prod.js', function() {
  return createModuleTask(merge(true, sourceTypeConfigs.js, {compilerOptions: js2es5OptionsProd}));
});

function renameSrcToLib(file) {
  file.dirname = file.dirname.replace(/\bsrc\b/, 'lib');
}

function renameEs5ToJs(file) {
  if (file.extname == '.es5') {
    file.extname = '.js';
  }
}

function createModuleTask(sourceTypeConfig) {
  var transpile = gulp.src(sourceTypeConfig.transpileSrc)
    .pipe($.rename({extname: '.'+sourceTypeConfig.outputExt}))
    .pipe($.rename(renameSrcToLib))
    .pipe(gulpTraceur(sourceTypeConfig.compilerOptions, file2moduleName))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  var copy = gulp.src(sourceTypeConfig.copySrc)
    .pipe($.rename(renameSrcToLib))
    .pipe($.rename(renameEs5ToJs))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  // TODO: provide the list of files to the template
  // automatically!
  var html = gulp.src(sourceTypeConfig.htmlSrc)
    .pipe($.rename(renameSrcToLib))
    .pipe($.ejs({
      type: sourceTypeConfig.outputExt
    }))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));

  return mergeStreams(transpile, copy, html);
}


// ------------------
// ANALYZE

gulp.task('analyze/analyzer.dart', function(done) {
  var pubSpecs = [].slice.call(glob.sync('build/dart/*/pubspec.yaml', {
    cwd: __dirname
  }));
  var tempFile = '_analyzer.dart';
  // analyze in parallel!
  return Q.all(pubSpecs.map(function(pubSpecFile) {
    var dir = path.dirname(pubSpecFile);
    var srcFiles = [].slice.call(glob.sync('lib/**/*.dart', {
      cwd: dir
    }));
    var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {
      cwd: dir
    }));
    var analyzeFile = ['library _analyzer;'];
    srcFiles.concat(testFiles).forEach(function(fileName, index) {
      if (fileName !== tempFile) {
        analyzeFile.push('import "./'+fileName+'" as mod'+index+';');
      }
    });
    fs.writeFileSync(path.join(dir, tempFile), analyzeFile.join('\n'));
    var defer = Q.defer();
    analyze(dir, defer.makeNodeResolver());
    return defer.promise;
  }));

  function analyze(dirName, done) {
    var stream = spawn(DART_SDK.ANALYZER, ['--fatal-warnings', tempFile], {
      // inherit stdin and stderr, but filter stdout
      stdio: [process.stdin, 'pipe', process.stderr],
      cwd: dirName
    });
    // Filter out unused imports from our generated file.
    // We don't reexports from the generated file
    // as this could lead to name clashes when two files
    // export the same thing.
    var rl = readline.createInterface({
      input: stream.stdout,
      output: process.stdout,
      terminal: false
    });
    var hintCount = 0;
    rl.on('line', function(line) {
      if (line.match(/Unused import/)) {
        return;
      }
      if (line.match(/\[hint\]/)) {
        hintCount++;
      }
      console.log(dirName + ':' + line);
    });
    stream.on('close', function(code) {
      var error;
      if (code !== 0) {
        error = new Error('Dartanalyzer failed with exit code ' + code);
      }
      if (hintCount > 0) {
        error = new Error('Dartanalyzer showed hints');
      }
      done(error);
    });
  }
});



// ------------------
// BENCHMARKS JS

gulp.task('benchmarks/internal.benchpress.js', function () {
  benchpress.build({
    benchmarksPath: 'build/js/benchmarks/lib',
    buildPath: 'build/benchpress/js'
  })
});

gulp.task('benchmarks/external.benchpress.js', function () {
  benchpress.build({
    benchmarksPath: 'build/js/benchmarks_external/lib',
    buildPath: 'build/benchpress/js'
  })
});

gulp.task('benchmarks/internal.js', function() {
  runSequence(
    ['jsRuntime/build', 'modules/build.prod.js'],
    'benchmarks/internal.benchpress.js'
  );
});

gulp.task('benchmarks/external.js', function() {
  runSequence(
    ['jsRuntime/build', 'modules/build.prod.js'],
    'benchmarks/external.benchpress.js'
  );
});


// ------------------
// BENCHMARKS DART

function benchmarkDart2Js(buildPath, done) {

  mergeStreams(dart2jsStream(), bpConfStream())
    .on('end', function() {
      runBenchpress();
      done();
    });

  function dart2jsStream() {
    return gulp.src([
      buildPath+"/lib/**/benchmark.dart"
    ]).pipe($.shell(['dart2js --package-root="'+buildPath+'/packages" -o "<%= file.path %>.js" <%= file.path %>']));
  }

  function bpConfStream() {
    var bpConfContent = "module.exports = function(c) {c.set({scripts: [{src: 'benchmark.dart.js'}]});}";
    var createBpConfJs = es.map(function(file, cb) {
      var dir = path.dirname(file.path);
      fs.writeFileSync(path.join(dir, "bp.conf.js"), bpConfContent);
      cb();
    });

    return gulp.src([
      buildPath+"/lib/**/benchmark.dart"
    ]).pipe(createBpConfJs);
  }

  function runBenchpress() {
    benchpress.build({
        benchmarksPath: buildPath+'/lib',
        buildPath: 'build/benchpress/dart'
    });
  }
}

gulp.task('benchmarks/internal.dart', ['modules/build.dart'], function(done) {
  benchmarkDart2Js('build/dart/benchmarks', done);
});

gulp.task('benchmarks/external.dart', ['modules/build.dart'], function(done) {
  benchmarkDart2Js('build/dart/benchmarks_external', done);
});

gulp.task('benchmarks/build.dart', ['benchmarks/internal.dart', 'benchmarks/external.dart']);



// ------------------
// WEB SERVERS

gulp.task('serve', function() {
  $.connect.server({
    root: [__dirname+'/build'],
    port: 8000,
    livereload: false,
    open: false,
    middleware: function() {
      return [function(req, resp, next){
        if (req.url.match(/\.dart$/)) {
          resp.setHeader("Content-Type", "application/dart");
        }
        next();
      }];
    }
  })();
});

gulp.task('examples/pub.serve', function(done) {
  spawn(DART_SDK.PUB, ['serve'], {cwd: 'build/dart/examples', stdio: 'inherit'})
    .on('done', done);
});



// --------------
// general targets

gulp.task('clean', ['modules/clean']);

gulp.task('build', function(done) {
  runSequence(
    // parallel
    ['jsRuntime/build', 'modules/build.dart', 'modules/build.dev.js'],
    // sequential
    'analyze/analyzer.dart'
  );
});

gulp.task('analyze', function(done) {
  runSequence('analyze/analyzer.dart');
});


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
    .pipe(gulp.dest('build/docs/lib'));
});

gulp.task('docs/app', function() {
  return gulp.src('docs/app/**/*')
    .pipe(gulp.dest('build/docs'));
});

gulp.task('docs', ['docs/assets', 'docs/app', 'docs/dgeni']);
gulp.task('docs-watch', function() {
  return gulp.watch('docs/app/**/*', ['docs-app']);
});

var jasmine = require('gulp-jasmine');
gulp.task('docs/test', function () {
  return gulp.src('docs/**/*.spec.js')
      .pipe(jasmine());
});

var webserver = require('gulp-webserver');
gulp.task('docs/serve', function() {
  gulp.src('build/docs/')
    .pipe(webserver({
      fallback: 'index.html'
    }));
});
