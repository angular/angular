'use strict';
var through = require('through2');
var compiler = require('./index');
var path = require('path');

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
      var result = compiler.compile(options, {
        inputPath: originalFilePath,
        outputPath: file.relative,
        moduleName: moduleName
      }, file.contents.toString());

      var transpiledContent = result.js;
      var sourceMap = result.sourceMap;

      if (sourceMap) {
        var sourceMapFile = cloneFile(file, {
          path: file.path.replace(/\.js$/, '.map'),
          contents: JSON.stringify(sourceMap)
        });

        transpiledContent += '\n//# sourceMappingURL=./' + path.basename(sourceMapFile.path);
        this.push(sourceMapFile);
      }

      this.push(cloneFile(file, {contents: transpiledContent}));
      done();
    } catch (errors) {
      if (errors.join) {
         throw new Error('gulp-traceur:\n  ' + errors.join('\n  '));
      } else {
        console.error('Error when transpiling:\n  ' + originalFilePath);
        throw errors;
      }
    }
  });
};

function cloneFile(file, override) {
  var File = file.constructor;
  return new File({path: override.path || file.path, cwd: override.cwd || file.cwd, contents: new Buffer(override.contents || file.contents), base: override.base || file.base});
}
