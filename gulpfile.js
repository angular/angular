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
var exec = require('child_process').exec;
var Q = require('q');

var js2es5Options = {
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  modules: 'register',
  typeAssertionModule: 'rtts_assert/rtts_assert',
  typeAssertions: true
};

var js2dartOptions = {
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  outputLanguage: 'dart'
};

var gulpTraceur = require('./tools/transpiler/gulp-traceur');

function execWithLog(command, options, done) {
  exec(command, options, function (err, stdout, stderr) {
    stdout && console.log(stdout);
    stderr && console.log(stderr);
    done(err);
  });
}

// ---------
// traceur runtime

gulp.task('jsRuntime/build', function() {
  var traceurRuntime = gulp.src(gulpTraceur.RUNTIME_PATH)
    .pipe(gulp.dest('build/js'));
  return traceurRuntime;
});

// -----------------------
// modules
var sourceTypeConfigs = {
  dart: {
    compilerOptions: js2dartOptions,
    transpileSrc: ['modules/**/*.js'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['modules/**/*.dart', 'modules/**/*.yaml'],
    outputDir: 'build/dart',
    outputExt: 'dart',
    mimeType: 'application/dart',
    postProcess: function(file, done) {
      if (file.path.match(/pubspec\.yaml/)) {
        console.log('pub get ' + file.path);
        execWithLog('pub get', {
          cwd: path.dirname(file.path)
        }, done);
      } else {
        done();
      }
    }
  },
  js: {
    compilerOptions: js2es5Options,
    transpileSrc: ['modules/**/*.js', 'modules/**/*.es6'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['modules/**/*.es5'],
    outputDir: 'build/js',
    outputExt: 'js',
    postProcess: null
  }
};


gulp.task('modules/clean', function() {
  return gulp.src('build', {read: false})
      .pipe(clean());
});

gulp.task('modules/build.dart/src', function() {
  return createModuleTask(sourceTypeConfigs.dart);
});

gulp.task('modules/build.dart/analyzer', function() {
  var baseDir = sourceTypeConfigs.dart.outputDir;
  var files = [].slice.call(glob.sync('*/lib/*.dart', {
    cwd: baseDir
  }));
  files = files.filter(function(fileName) {
    return fileName.match(/(\w+)\/lib\/\1/);
  });
  return Q.all(files.map(function(fileName) {
    var deferred = Q.defer();
    execWithLog('dartanalyzer '+baseDir+'/'+fileName, {}, deferred.makeNodeResolver());
    return deferred.promise;
  }));
});

gulp.task('modules/build.dart', function(done) {
  runSequence('modules/build.dart/src', 'modules/build.dart/analyzer', done);
});

gulp.task('modules/build.js', function() {
  return createModuleTask(sourceTypeConfigs.js);
});

function renameSrcToLib(file) {
  file.dirname = file.dirname.replace(/\bsrc\b/, 'lib');
}

function createModuleTask(sourceTypeConfig) {
  var transpile = gulp.src(sourceTypeConfig.transpileSrc)
    .pipe(rename({extname: '.'+sourceTypeConfig.outputExt}))
    .pipe(rename(renameSrcToLib))
    .pipe(gulpTraceur(sourceTypeConfig.compilerOptions, file2moduleName))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  var copy = gulp.src(sourceTypeConfig.copySrc)
    .pipe(rename(renameSrcToLib))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));
  // TODO: provide the list of files to the template
  // automatically!
  var html = gulp.src(sourceTypeConfig.htmlSrc)
    .pipe(rename(renameSrcToLib))
    .pipe(ejs({
      type: sourceTypeConfig.outputExt
    }))
    .pipe(gulp.dest(sourceTypeConfig.outputDir));

  var s = mergeStreams(transpile, copy, html);
  if (!sourceTypeConfig.postProcess) {
    return s;
  }
  return s.pipe(through2.obj(function(file, enc, done) {
    sourceTypeConfig.postProcess(file, done);
  }));
}

// ------------------
// WEB SERVER
gulp.task('serve', connect.server({
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
}));

// --------------
// general targets

gulp.task('clean', ['modules/clean']);

gulp.task('build', ['jsRuntime/build', 'modules/build.dart', 'modules/build.js']);
