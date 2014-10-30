var transpiler = require('./index.js');

module.exports = {
  'preprocessor:traceur': ['factory', createJs2DartPreprocessor]
};

function createJs2DartPreprocessor(logger, basePath, config, emitter) {
  var log = logger.create('traceur');
  // Reload the transpiler sources so we don't need to
  // restart karma when we made changes to traceur.
  // As there is no event that is called before any preprocessor runs,
  // we listen for the end event in karma to reload the
  // transpiler sources.
  emitter.on('run_complete', function(filesPromise) {
    transpiler.reloadSources();
  });
  return function(content, file, done) {
    try {
      var moduleName = config.resolveModuleName(file.originalPath);
      if (config.transformPath) {
        file.path = config.transformPath(file.originalPath);
      }

      var result = transpiler.compile(config.options, {
        inputPath: file.originalPath,
        outputPath: file.path,
        moduleName: moduleName
      }, content);

      var transpiledContent = result.js;
      var sourceMap = result.sourceMap;

      if (sourceMap) {
        transpiledContent += '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,';
        transpiledContent += new Buffer(JSON.stringify(sourceMap)).toString('base64') + '\n';
        file.sourceMap = sourceMap;
      }

      done(null, transpiledContent);
    } catch (errors) {
      var errorString;
      if (errors.forEach) {
        errors.forEach(function(error) {
          log.error(error);
        });
        errorString = errors.join('\n');
      } else {
        log.error(errors);
        errorString = errors;
      }
      done(new Error('TRACEUR COMPILE ERRORS\n' + errorString));
    }
  };
}

createJs2DartPreprocessor.$inject = ['logger', 'config.basePath', 'config.traceurPreprocessor', 'emitter'];
