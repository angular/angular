var gulp = require('gulp');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var mergeStreams = require('event-stream').merge;
var connect = require('gulp-connect');
var clean = require('gulp-rimraf');
var runSequence = require('run-sequence');
var glob = require('glob');
var ejs = require('gulp-ejs');
var path = require('path');

// import js2dart and traceur build tasks
var js2dartTasks = require('./tools/js2dart/gulp-tasks');
js2dartTasks.install(gulp);

var traceurJsOptions = {
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  modules: 'register',
  typeAssertionModule: 'assert',
  typeAssertions: true,
  moduleName: true
};

var traceur = require('./tools/js2dart/gulp-traceur');
var js2dart = require('./tools/js2dart/gulp-js2dart');

// -----------------------
// modules
var sourceTypeConfigs = {
  dart: {
    compiler: function() {
      return js2dart({replace: true});
    },
    transpileSrc: ['modules/**/*.es6d'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['modules/**/*.dart'],
    outputDir: 'build/dart',
    outputExt: 'dart',
    mimeType: 'application/dart'
  },
  js: {
    compiler: function() {
      return traceur(traceurJsOptions);
    },
    transpileSrc: ['modules/**/*.es*', 'tools/rtts-assert/src/assert.js'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['tools/traceur/bin/traceur-runtime.js'],
    outputDir: 'build/js',
    outputExt: 'js'
  }
};

gulp.task('modules/clean', function() {
  return gulp.src('build', {read: false})
      .pipe(clean());
});

function createModuleTask(sourceTypeConfig, isWatch) {
  var start = isWatch ? watch : gulp.src.bind(gulp);
  return function(done) {
    var transpile = start(sourceTypeConfig.transpileSrc)
      .pipe(rename({extname: '.'+sourceTypeConfig.outputExt}))
      .pipe(sourceTypeConfig.compiler())
      .pipe(gulp.dest(sourceTypeConfig.outputDir));
    var copy = start(sourceTypeConfig.copySrc)
      .pipe(gulp.dest(sourceTypeConfig.outputDir));
    // TODO: provide the list of files to the template
    // automatically!
    var html = start(sourceTypeConfig.htmlSrc)
      .pipe(ejs({
        type: sourceTypeConfig.outputExt
      }))
      .pipe(gulp.dest(sourceTypeConfig.outputDir));

    return mergeStreams(transpile, copy, html);
  };
}

gulp.task('modules/build.dart', createModuleTask(sourceTypeConfigs.dart, false));
gulp.task('modules/build.js', createModuleTask(sourceTypeConfigs.js, false));

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

gulp.task('clean', function(done) {
  return runSequence(['traceur/clean', 'js2dart/clean', 'modules/clean'], done);
});

gulp.task('build', function() {
  return runSequence(
    // sequential
    'traceur/build', 'js2dart/build',
    // parallel
    ['modules/build.dart', 'modules/build.js']
  );
});

gulp.task('watch', function() {
  var traceurWatch = watch(js2dartTasks.paths.traceurSrc, function(_, done) {
    runSequence(
      // sequential
      'traceur/build', 'js2dart/build', 'js2dart/test',
      // parallel
      ['modules/build.dart', 'modules/build.js'],
      done);
  });
  var js2dartWatch = watch(js2dartTasks.paths.js2dartSrc, function(_, done) {
    runSequence(
      // sequential
      'js2dart/build', 'js2dart/test',
      // parallel
      ['modules/build.dart', 'modules/build.js'],
      done);
  });
  var dartModuleWatch = createModuleTask(sourceTypeConfigs.dart, true)();
  var jsModuleWatch = createModuleTask(sourceTypeConfigs.js, true)();
  return mergeStreams(traceurWatch, js2dartWatch, dartModuleWatch, jsModuleWatch);
});
