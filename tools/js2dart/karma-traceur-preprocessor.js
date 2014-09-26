var traceur = require('traceur');

var createTraceurPreprocessor = function(args, config, logger, helper) {
  config = config || {};

  var log = logger.create('preprocessor.traceur');
  var defaultOptions = {
    sourceMaps: false,
    modules: 'amd'
  };
  var options = helper.merge(defaultOptions, args.options || {}, config.options || {});

  var transformPath = args.transformPath || config.transformPath || function(filepath) {
    return filepath.replace(/\.es6.js$/, '.js').replace(/\.es6$/, '.js');
  };

  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);
    file.path = transformPath(file.originalPath);
    options.filename = file.originalPath;

    var result = traceur.compile(content, options);
    var transpiledContent = result.js;

    result.errors.forEach(function(err) {
      log.error(err);
    });

    if (result.errors.length) {
      return done(new Error('TRACEUR COMPILE ERRORS\n' + result.errors.join('\n')));
    }

    // TODO(vojta): Tracer should return JS object, rather than a string.
    if (result.generatedSourceMap) {
      var map = JSON.parse(result.generatedSourceMap);
      map.file = file.path;
      transpiledContent += '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,';
      transpiledContent += new Buffer(JSON.stringify(map)).toString('base64') + '\n';

      file.sourceMap = map;
    }

    return done(null, transpiledContent);
  };
};

createTraceurPreprocessor.$inject = ['args', 'config.traceurPreprocessor', 'logger', 'helper'];


var initTraceurFramework = function(files) {
  files.unshift({pattern: traceur.RUNTIME_PATH, included: true, served: true, watched: false});
};

initTraceurFramework.$inject = ['config.files'];


// PUBLISH DI MODULE
module.exports = {
  'preprocessor:traceur': ['factory', createTraceurPreprocessor],
  'framework:traceur': ['factory', initTraceurFramework]
};