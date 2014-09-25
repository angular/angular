var js2dart = require('./index.js');

module.exports = {
  'preprocessor:traceur': ['factory', createJs2DartPreprocessor]
};

function createJs2DartPreprocessor(logger, basePath, config) {
  var log = logger.create('traceur');

  return function(content, file, done) {

    try {
      var moduleName = config.resolveModuleName(file.originalPath);
      if (config.transformPath) {
        file.path = config.transformPath(file.originalPath);
      }
      done(null, js2dart.compile(config.options, {
        inputPath: file.originalPath,
        moduleName: moduleName
      }, content));
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

createJs2DartPreprocessor.$inject = ['logger', 'config.basePath', 'config.traceurPreprocessor'];
