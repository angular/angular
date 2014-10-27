var benchpress = require('angular-benchpress/lib/cli');
var clean = require('gulp-rimraf');
var connect = require('gulp-connect');
var ejs = require('gulp-ejs');
var es = require('event-stream');
var file2moduleName = require('./file2modulename');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var merge = require('merge');
var mergeStreams = require('event-stream').merge;
var path = require('path');
var Q = require('q');
var readline = require('readline');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var spawn = require('child_process').spawn;
var through2 = require('through2');
var watch = require('gulp-watch');

var js2es5Options = {
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
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
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  outputLanguage: 'dart'
};

var gulpTraceur = require('./tools/transpiler/gulp-traceur');

// ---------
// traceur runtime

gulp.task('jsRuntime/build', function() {
  var traceurRuntime = gulp.src([
    gulpTraceur.RUNTIME_PATH,
    "node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js",
    "node_modules/systemjs/lib/extension-register.js"
  ]).pipe(gulp.dest('build/js'));
  return traceurRuntime;
});

// -----------------------
// modules
var sourceTypeConfigs = {
  dart: {
    transpileSrc: ['modules/**/*.js'],
    htmlSrc: ['modules/*/src/**/*.html'],
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
      .pipe(clean());
});

gulp.task('modules/build.dart/src', function() {
  return createModuleTask(merge(sourceTypeConfigs.dart, {compilerOptions: js2dartOptions}));
});

gulp.task('modules/build.dart/pubspec', function(done) {
  var outputDir = sourceTypeConfigs.dart.outputDir;
  return gulp.src('modules/*/pubspec.yaml')
    .pipe(through2.obj(function(file, enc, done) {
      var targetFile = path.join(outputDir, file.relative);
      if (fs.existsSync(targetFile)) {
        file.previousContents = fs.readFileSync(targetFile);
      } else {
        file.previousContents = '';
      }
      this.push(file);
      done();
    }))
    .pipe(gulp.dest(outputDir))
    .pipe(through2.obj(function(file, enc, done) {
      if (file.previousContents.toString() !== file.contents.toString()) {
        console.log(file.path + ' changed, calling pub get');
        var pubCmd = (process.platform === "win32" ? "pub.bat" : "pub");
        var stream = spawn(pubCmd, ['get'], {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: path.dirname(file.path)
        });
        stream.on('close', done);
      } else {
        done();
      }
    }));
});

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
    .pipe(rename({extname: '.'+sourceTypeConfig.outputExt}))
    .pipe(rename(renameSrcToLib))
    .pipe(gulpTraceur(sourceTypeConfig.compilerOptions, file2moduleName))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  var copy = gulp.src(sourceTypeConfig.copySrc)
    .pipe(rename(renameSrcToLib))
    .pipe(rename(renameEs5ToJs))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  // TODO: provide the list of files to the template
  // automatically!
  var html = gulp.src(sourceTypeConfig.htmlSrc)
    .pipe(rename(renameSrcToLib))
    .pipe(ejs({
      type: sourceTypeConfig.outputExt
    }))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));

  return mergeStreams(transpile, copy, html);
}

// ------------------
// ANALYZE

gulp.task('analyze/dartanalyzer', function(done) {
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
    var dartanalyzerCmd = (process.platform === "win32" ? "dartanalyzer.bat" : "dartanalyzer");
    var stream = spawn(dartanalyzerCmd, ['--fatal-warnings', tempFile], {
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
      if (line.match(/Unused import .*_analyzer\.dart/)) {
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

gulp.task('benchmarks/build.benchpress.js', function () {
  benchpress.build({
    benchmarksPath: 'build/js/benchmarks/lib',
    buildPath: 'build/benchpress/js'
  })
});

gulp.task('benchmarks/build.js', function() {
  runSequence(
    ['jsRuntime/build', 'modules/build.prod.js'],
    'benchmarks/build.benchpress.js'
  );
});


// ------------------
// BENCHMARKS DART

gulp.task('benchmarks/build.dart2js.dart', function () {
  return gulp.src([
    "build/dart/benchmarks/lib/**/benchmark.dart"
  ]).pipe(shell(['dart2js --package-root="build/dart/benchmarks/packages" -o "<%= file.path %>.js" <%= file.path %>']));
});

gulp.task('benchmarks/create-bpconf.dart', function () {
  var bpConfContent = "module.exports = function(c) {c.set({scripts: [{src: 'benchmark.dart.js'}]});}";
  var createBpConfJs = es.map(function(file, cb) {
    var dir = path.dirname(file.path);
    fs.writeFileSync(path.join(dir, "bp.conf.js"), bpConfContent);
    cb();
  });

  return gulp.src([
    "build/dart/benchmarks/lib/**/benchmark.dart"
  ]).pipe(createBpConfJs);
});

gulp.task('benchmarks/build.benchpress.dart', function () {
  benchpress.build({
    benchmarksPath: 'build/dart/benchmarks/lib',
    buildPath: 'build/benchpress/dart'
  })
});

gulp.task('benchmarks/build.dart', function() {
  runSequence(
    'modules/build.dart',
    'benchmarks/build.dart2js.dart',
    'benchmarks/create-bpconf.dart',
    'benchmarks/build.benchpress.dart'
  );
});



// ------------------
// WEB SERVER

gulp.task('serve', function() {
  connect.server({
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



// --------------
// general targets

gulp.task('clean', ['modules/clean']);

gulp.task('build', function(done) {
  runSequence(
    // parallel
    ['jsRuntime/build', 'modules/build.dart', 'modules/build.dev.js'],
    // sequential
    'analyze/dartanalyzer'
  );
});

gulp.task('analyze', function(done) {
  runSequence('analyze/dartanalyzer');
});
