var rename = require('gulp-rename');
var watch = require('gulp-watch');
var gulpTraceur = require('./gulp-traceur');
var shell = require('gulp-shell');
var clean = require('gulp-rimraf');
var mergeStreams = require('event-stream').merge;
var ejs = require('gulp-ejs');
var glob = require('glob');

var baseDir = __dirname;
var traceurDir = baseDir+'/../traceur';
var buildDir = baseDir + '/build';

var paths = {
  traceurSrc: traceurDir+'/src/**/*.js',
  js2dartSrc: baseDir + '/src/**/*.js',
  specTranspile: baseDir + '/spec/**/*.js',
  specTemplates: baseDir + '/spec/**/*.template',
  specCopy: baseDir + '/spec/**/*.dart'
};
paths.specSrc = [paths.specTranspile, paths.specTemplates, paths.specCopy];

module.exports.install = install;
module.exports.paths = paths;

function install(gulp) {
  var runSequence = require('run-sequence').use(gulp);

  // -- js2dart
  var buildJs2DartOptions = {
    modules: 'register',
    moduleName: true,
    referrer: 'js2dart/src/',
    script: false // parse as a module
  };

  var js2dartOptions = {
    annotations: true, // parse annotations
    types: true, // parse types
    script: false, // parse as a module
    outputLanguage: 'dart',
    moduleName: true
  };

  var js2es5Options = {
    annotations: true, // parse annotations
    types: true, // parse types
    script: false, // parse as a module
    modules: 'register',
    typeAssertions: true,
    moduleName: true
  };

  gulp.task('js2dart/clean', function() {
    return gulp.src(buildDir, {read: false})
        .pipe(clean());
  });

  gulp.task('js2dart/build', function() {
    return gulp
      .src(paths.js2dartSrc)
      .pipe(gulpTraceur(buildJs2DartOptions, false))
      .pipe(gulp.dest(buildDir + '/js2dart'))
      .on('end', gulpTraceur.reloadPatches);
  });

  gulp.task('js2dart/test/build', function() {
    return mergeStreams(specTranspile(false), specCopy(false), specRunner(false));
  });

  gulp.task('js2dart/test/run', shell.task([
    'cd '+baseDir+' && dart --checked run_specs.dart'
  ]));

  gulp.task('js2dart/test', function(done) {
    runSequence('js2dart/test/build', 'js2dart/test/run', done);
  });

  gulp.task('js2dart/test/watch', function(done) {
    var streams = [];
    streams.push(specTranspile(true)
      .on('data', specRunner));
    streams.push(specCopy(true));
    streams.push(specRunner(true));
    streams.forEach(function(stream) {
      stream.on('error', done);
      stream.on('data', function() {
        runSequence('js2dart/test/run');
      });
    });
  });

  function specTranspile(isWatch) {
    var srcFn = isWatch ? watch : gulp.src.bind(gulp);
    return srcFn(paths.specTranspile)
      .pipe(gulpTraceur(js2dartOptions, true))
      .pipe(rename({extname: '.dart'}))
      .pipe(gulp.dest(buildDir+'/spec'));
  }

  function specCopy(isWatch) {
   var srcFn = isWatch ? watch : gulp.src.bind(gulp);
   return srcFn(paths.specCopy).pipe(gulp.dest(buildDir+'/spec'));
  }

  function specRunner(isWatch) {
    var srcFn = isWatch ? watch : gulp.src.bind(gulp);
    var builtSpecFiles = glob.sync('**/*_spec.js', {
      cwd: baseDir+'/spec'
    }).map(function(fileName) {
      return fileName.replace('.js', '.dart');
    });
    return srcFn(paths.specTemplates)
      .pipe(ejs({
        files: builtSpecFiles
      }))
      .pipe(rename(function(path) {
        path.basename = path.basename.replace(/\..*/g, '');
        path.extname = '.dart';
      }))
      .pipe(gulp.dest(buildDir+'/spec'));
  }
}

