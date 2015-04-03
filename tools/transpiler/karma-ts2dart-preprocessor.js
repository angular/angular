// Transpiles JavaScript and TypeScript code to Dart using ts2dart.

var ts2dart = require('ts2dart');
var rundartpackage = require('../build/rundartpackage.js');

module.exports = {
  'preprocessor:ts2dart': ['factory', createTs2DartPreprocessor]
};

function createTs2DartPreprocessor(logger, basePath, config, emitter) {
  var log = logger.create('ts2dart');
  return function(content, file, done) {
    try {
      var moduleName = config.resolveModuleName(file.originalPath);
      file.path = config.transformPath(file.originalPath);
      var transpiler = new ts2dart.Transpiler(
          {failFast: false, generateLibraryName: true, generateSourceMap: true});
      var transpiledContent = transpiler.translateFile(file.originalPath, moduleName);
      // TODO(martinprobst): Source maps.
      done(null, transpiledContent);
    } catch (errors) {
      var errorString;
      if (errors.forEach) {
        errors.forEach(function(error) { log.error(error); });
        errorString = errors.join('\n');
      } else {
        log.error(errors);
        errorString = errors;
      }
      done(new Error('ts2dart compile errors:\n' + errorString));
    }
  };
}

createTs2DartPreprocessor
    .$inject = ['logger', 'config.basePath', 'config.ts2dartPreprocessor', 'emitter'];
