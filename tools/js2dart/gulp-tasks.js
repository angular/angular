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

  var spec2dartOptions = {
    annotations: true, // parse annotations
    types: true, // parse types
    script: false, // parse as a module
    outputLanguage: 'dart'
  };

  gulp.task('js2dart/clean', function() {
    return gulp.src(buildDir, {read: false})
        .pipe(clean());
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

  gulp.task('js2dart/src/watch', function(done) {
    return watch(paths.js2dartSrc, function(changes, done) {
      gulpTraceur.sourcesChanged();
      runSequence('js2dart/test', done);
    });
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
      .pipe(gulpTraceur(spec2dartOptions))
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

