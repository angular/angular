#!/usr/bin/env node

// Attention: This file will be distributed with our npm packages!
var gulp = require('gulp');
var traceur = require('gulp-traceur');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var through2 = require('through2');
var fs = require('fs');
var path = require('path');

module.exports = run;

if (!module.parent) {
  var argv = require('yargs')
      .usage('Transpile to es5.\n\n'+
        'Usage: $0 -m [format] -s [folder] -d [folder]')
      .example('$0 -d tmp', 'transpile in `instantate` format to tmp/')
      .options({
        's': {
          alias: 'source',
          describe: 'source folder',
          default: '.'
        },
        'd': {
          alias: 'dest',
          describe: 'output folder',
          demand: true
        },
        'm': {
          alias: 'modules',
          describe: 'module format, https://github.com/google/traceur-compiler/wiki/Options-for-Compiling',
          default: 'instantiate'
        }
      })
      .help('help')
      .wrap(40)
      .strict()
      .argv
  ;
  run({
    src: argv.s,
    dest: argv.d,
    modules: argv.m
  });
}

function run(config) {
  var src = ['!node_modules', '!node_modules/**', './**/*.js'];
  return gulp.src(src, {cwd: config.src})
    // TODO(tbosch): Using sourcemaps.init({loadMaps:true}) does not combine
    // the sourcemaps correctly!
    .pipe(sourcemaps.init())
    .pipe(through2.obj(function(file, encoding, done) {
      var self = this;
      fs.readFile(file.path.replace('.js', '.map'), function(error, buffer) {
        if (error) {
          return done(error);
        }
        file.sourceMap = JSON.parse(buffer.toString());
        // The filename needs to be the same as the one that is transpiled
        // so that gulp-sourcemaps can update the mapping
        file.sourceMap.file = file.relative;
        file.sourceMap.sourceRoot = path.dirname(file.relative);
        self.push(file);
        done();
      });
    }))
    .pipe(traceur({
      modules: config.modules,
      sourceMaps: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dest));
};
