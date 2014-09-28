// Entry point for Node.

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var traceur = require('traceur');

exports.RUNTIME_PATH = traceur.RUNTIME_PATH;
var TRACEUR_PATH = traceur.RUNTIME_PATH.replace('traceur-runtime.js', 'traceur.js');
var SELF_SOURCE_REGEX = /transpiler\/src/;
var SELF_COMPILE_OPTIONS = {
  modules: 'register',
  moduleName: true,
  script: false // parse as a module
};

var needsReload = true;

exports.reloadSources = function() {
  needsReload = true;
};

exports.compile = function compile(options, paths, source) {
  if (needsReload) {
    reloadCompiler();
    needsReload = false;
  }
  var inputPath, outputPath, moduleName;
  if (typeof paths === 'string') {
    inputPath = outputPath = paths;
  } else {
    inputPath = paths.inputPath;
    outputPath = paths.inputPath;
    moduleName = paths.moduleName;
  }
  outputPath = outputPath || inputPath;
  moduleName = moduleName || inputPath;
  moduleName = moduleName.replace(/\.\w*$/, '');

  var localOptions = extend(options, {
    moduleName: moduleName
  });
  var CompilerCls = System.get('transpiler/src/compiler').Compiler;
  return (new CompilerCls(localOptions)).compile(source, inputPath, outputPath);
};

// Transpile and evaluate the code in `src`.
// Use existing traceur to compile our sources.
function reloadCompiler() {
  loadModule(TRACEUR_PATH, false);
  glob.sync(__dirname + '/src/**/*.js').forEach(function(fileName) {
    loadModule(fileName, true);
  });
}

function loadModule(filepath, transpile) {
  var data = fs.readFileSync(filepath, 'utf8');

  if (!data) {
    throw new Error('Failed to import ' + filepath);
  }

  if (transpile) {
    var moduleName = filepath
      .replace(__dirname, 'transpiler')
      .replace(/\.\w*$/, '');
    data = (new traceur.NodeCompiler(
      extend(SELF_COMPILE_OPTIONS, { moduleName: moduleName } )
    )).compile(data, filepath, filepath);
  }

  ('global', eval)(data);
}

function extend(source, props) {
  var res = {};
  for (var prop in source) {
    res[prop] = source[prop];
  }
  for (var prop in props) {
    res[prop] = props[prop];
  }
  return res;
}