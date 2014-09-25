'use strict';
var through = require('through2');
var fs = require('fs');
var path = require('path');
var originalTraceur = require('traceur');
var glob = require('glob');

module.exports = gulpTraceur;
gulpTraceur.reloadPatches = function() {
  loadPatches(true);
};
gulpTraceur.loadPatches = loadPatches;


/// usePatches: whether to use plain traceur or apply
/// our patches...
function gulpTraceur(options, usePatches) {
  var lastLoadCounter = loadCounter;
  var lastCompiler = null;
  options = options || {};

  return through.obj(function (file, enc, done) {
    if (file.isNull()) {
      done();
      return;
    }

    if (file.isStream()) {
      throw new Error('gulp-traceur: Streaming not supported');
    }

    var compiler = createCompilerIfNeeded();
    var ret;
    try {
      var fileName = file.relative;
      if (options.referrer) {
        fileName = options.referrer + '/' + fileName;
      }
      var compiled = compiler.compile(file.contents.toString(), fileName, fileName);
      file.contents = new Buffer(compiled);
      this.push(file);
      done();
    } catch (errors) {
      if (errors.join) {
         throw new Error('gulp-traceur: '+errors.join('\n'));
      } else {
        throw errors;
      }
    }
  });

  function createCompilerIfNeeded() {
    loadPatches(false);
    if (!lastCompiler || lastLoadCounter !== loadCounter) {
      lastLoadCounter = loadCounter;
      var CompilerBase;
      if (usePatches) {
        CompilerBase = System.get('js2dart/src/compiler').Compiler;
      } else {
        CompilerBase = System.get(System.map.traceur+'/src/Compiler').Compiler;
      }
      var Compiler = createCompilerConstructor(CompilerBase);
      lastCompiler = new Compiler(options);
    }
    return lastCompiler;
  }
};

function createCompilerConstructor(CompilerBase) {
  // See traceur/src/NodeCompiler.js
  // Needed here as we want to be able to reload
  // traceur sources once they changed
  function NodeCompiler(options, sourceRoot) {
    var sourceRoot = sourceRoot || process.cwd();
    CompilerBase.call(this, options, sourceRoot);
  }

  NodeCompiler.prototype = {
    __proto__: CompilerBase.prototype,

    resolveModuleName: function(filename) {
      debugger;
      if (!filename)
        return;
      var moduleName = filename.replace(/\.js$/, '');
      return path.relative(this.sourceRoot, moduleName).replace(/\\/g,'/');
    },

    sourceName: function(filename) {
      return path.relative(this.sourceRoot, filename);
    }
  }

  return NodeCompiler;
}

var loadCounter = 0;
function loadPatches(reload) {
  if (loadCounter && !reload) {
    return;
  }
  loadCounter++;
  // see traceur/src/traceur.js
  // To reload the js2dart modules we need
  // to clear the registry. To do that we
  // reload the traceur module...
  loadModule(path.dirname(module.filename), './node_modules/traceur/bin/traceur.js');

  var buildDir = __dirname + '/build/js2dart';
  var moduleNames = [].slice.call(glob.sync('**/*.js', {
    cwd: buildDir
  }));
  moduleNames.forEach(function(filename) {
    loadModule(buildDir, filename);
  });

  function loadModule(baseFolder, filename) {
    filename = path.join(baseFolder, filename);
    var data = fs.readFileSync(filename, 'utf8');
    if (!data)
      throw new Error('Failed to import ' + filename);

    ('global', eval)(data);
  }

}
