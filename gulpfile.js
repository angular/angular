var gulp = require('gulp');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var mergeStreams = require('event-stream').merge;
var connect = require('gulp-connect');
var clean = require('gulp-rimraf');
var runSequence = require('run-sequence');
var glob = require('glob');
var ejs = require('gulp-ejs');
var path = require('path');
var through2 = require('through2');
var file2moduleName = require('./file2modulename');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var Q = require('q');
var merge = require('merge');
var benchpress = require('angular-benchpress/lib/cli');

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
        var stream = spawn('pub', ['get'], {
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
    var stream = spawn('dartanalyzer', ['--fatal-warnings', tempFile], {
      // inherit stdin and stderr, but filter stdout
      stdio: [process.stdin, 'pipe', process.stderr],
      cwd: dirName
    });
    // Filter out unused imports from our generated file.
    // We don't reexports from the generated file
    // as this could lead to name clashes when two files
    // export the same thing.
    var rl = require('readline').createInterface({
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
// BENCHMARKS

var benchmarksBuildPath = 'build/benchpress';
var benchmarksCompiledJsPath = 'build/js/benchmarks/lib';

gulp.task('benchmarks/build.benchpress', function () {
  benchpress.build({
    benchmarksPath: benchmarksCompiledJsPath,
    buildPath: benchmarksBuildPath
  })
});

gulp.task('benchmarks/build', function() {
  runSequence(
    ['jsRuntime/build', 'modules/build.prod.js'],
    'benchmarks/build.benchpress'
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
