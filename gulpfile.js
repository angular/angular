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
require('./tools/js2dart/gulpfile').install(gulp);

var traceurJsOptions = {
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  modules: 'register',
  typeAssertionModule: 'assert',
  typeAssertions: true,
  moduleName: true,
  reload: true
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
    transpileSrc: ['modules/*/src/**/*.es6d'],
    htmlSrc: ['modules/*/src/**/*.html'],
    copySrc: ['modules/*/src/**/*.dart'],
    outputDir: 'build/dart',
    outputExt: 'dart',
    mimeType: 'application/dart'
  },
  js: {
    compiler: function() {
      return traceur(traceurJsOptions);
    },
    transpileSrc: ['modules/*/src/**/*.es*', 'tools/rtts-assert/src/assert.js'],
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

function removeSrc(path) {
  path.dirname = path.dirname.replace('/src', '');
}

function createModuleTask(sourceTypeConfig, isWatch) {
  var start = isWatch ? watch : gulp.src.bind(gulp);
  return function(done) {
    var transpile = start(sourceTypeConfig.transpileSrc)
      .pipe(rename({extname: '.'+sourceTypeConfig.outputExt}))
      .pipe(rename(removeSrc))
      .pipe(sourceTypeConfig.compiler())
      .pipe(gulp.dest(sourceTypeConfig.outputDir));
    var copy = start(sourceTypeConfig.copySrc)
      .pipe(rename(removeSrc))
      .pipe(gulp.dest(sourceTypeConfig.outputDir));
    // TODO: provide the list of files to the template
    var html = start(sourceTypeConfig.htmlSrc)
      .pipe(rename(removeSrc))
      .pipe(ejs({
        type: sourceTypeConfig.outputExt
      }))
      .pipe(gulp.dest(sourceTypeConfig.outputDir));

    return mergeStreams(transpile, copy, html);
  };
}

gulp.task('modules/build.dart', createModuleTask(sourceTypeConfigs.dart, false));
gulp.task('modules/watch.dart', createModuleTask(sourceTypeConfigs.dart, true));
gulp.task('modules/build.js', createModuleTask(sourceTypeConfigs.js, false));
gulp.task('modules/watch.js', createModuleTask(sourceTypeConfigs.js, true));

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
        console.log('now', req.url);
      }
      next();
    }];
  }
}));

// --------------
// general targets

gulp.task('clean', function(done) {
  return runSequence(['traceur/clean', 'modules/clean'], done);
});

gulp.task('build', function(done) {
  // By using runSequence here we are decoupling the cleaning from the rest of the build tasks
  // Otherwise, we have to add clean as a dependency on every task to ensure that it completes
  // before they begin.
  runSequence(
    'js2dart/build',
    ['modules/build.dart', 'modules/build.js'],
    done
  );
});

gulp.task('watch', function(done) {
  // By using runSequence here we are decoupling the cleaning from the rest of the build tasks
  // Otherwise, we have to add clean as a dependency on every task to ensure that it completes
  // before they begin.
  runSequence(
    'build',
    ['js2dart/watch', 'modules/watch.dart', 'modules/watch.js'],
    done
  );
});
