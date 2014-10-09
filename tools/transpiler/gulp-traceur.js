'use strict';
var through = require('through2');
var compiler = require('./index');

module.exports = gulpTraceur;
gulpTraceur.RUNTIME_PATH = compiler.RUNTIME_PATH;
gulpTraceur.sourcesChanged = compiler.sourcesChanged;

function gulpTraceur(options, resolveModuleName) {
  options = options || {};

  return through.obj(function (file, enc, done) {
    if (file.isNull()) {
      done();
      return;
    }

    if (file.isStream()) {
      throw new Error('gulp-traceur: Streaming not supported');
    }

    try {
      var originalFilePath = file.history[0];
      var moduleName = resolveModuleName ? resolveModuleName(file.relative) : null;
      var compiled = compiler.compile(options, {
        inputPath: file.relative,
        outputPath: file.relative,
        moduleName: moduleName
      }, file.contents.toString());
      file.contents = new Buffer(compiled);
      this.push(file);
      done();
    } catch (errors) {
      if (errors.join) {
         throw new Error('gulp-traceur: '+errors.join('\n'));
      } else {
        console.error('Error when transpiling:\n  ' + originalFilePath);
        throw errors;
      }
    }
  });
};
