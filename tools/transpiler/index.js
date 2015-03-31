// Entry point for Node.

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var traceur = require('traceur');
var assert = require('assert');

exports.RUNTIME_PATH = traceur.RUNTIME_PATH;
var TRACEUR_PATH = traceur.RUNTIME_PATH.replace('traceur-runtime.js', 'traceur.js');
var SELF_SOURCE_REGEX = /transpiler\/src/;
var SELF_COMPILE_OPTIONS = {
  modules: 'register',
  memberVariables: false,
  moduleName: true,
  script: false // parse as a module
};

var needsReload = true;
var oldSystemGet = System.get;
var currentOptions;

exports.reloadSources = function() {
  needsReload = true;
};

exports.compile = function compile(options, paths, source, reloadTraceur) {
  if (needsReload) {
    reloadCompiler(reloadTraceur);
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

  var CompilerCls = System.get('transpiler/src/compiler').Compiler;

  var compiler = new CompilerCls(options, moduleName);
  currentOptions = options;
  var result = {
    js: compiler.compile(source, inputPath, outputPath),
    sourceMap: null
  };
  currentOptions = null;

  var sourceMapString = compiler.getSourceMap();
  if (sourceMapString) {
    result.sourceMap = JSON.parse(sourceMapString);
  }

  if (options.outputLanguage === 'es6' && source.indexOf('$traceurRuntime') === -1) {
    assert(result.js.indexOf('$traceurRuntime') === -1,
      'Transpile to ES6 must not add references to $traceurRuntime, '
        + inputPath + ' is transpiled to:\n' + result.js);
  }
  return result;
};

exports.init = function() {
  if (needsReload) {
    reloadCompiler();
    needsReload = false;
  }
}

// Transpile and evaluate the code in `src`.
// Use existing traceur to compile our sources.
function reloadCompiler(reloadTraceur) {
  if (reloadTraceur) {
    loadModule(TRACEUR_PATH, false);
  }
  glob.sync(__dirname + '/src/**/*.js').forEach(function(fileName) {
    loadModule(fileName, true);
  });

  // Traceur modules are register with the ".js" extension but we don't want
  // to add it to all the import statements.
  System.get = function get(normalizedName) {
    var m = oldSystemGet.call(this, normalizedName);
    if (!m && normalizedName.indexOf('traceur') == 0) {
      m = oldSystemGet.call(this, normalizedName + '.js');
    }
    return m;
  };

  useRttsAssertModuleForConvertingTypesToExpressions();
  supportSuperCallsInEs6Patch();
  convertTypesToExpressionsInEs6Patch();
  disableGetterSetterAssertionPatch();
  patchCommonJSModuleTransformerToSupportExportStar();
}

function loadModule(filepath, transpile) {
  var data = fs.readFileSync(filepath, 'utf8');

  if (!data) {
    throw new Error('Failed to import ' + filepath);
  }

  if (transpile) {
    var moduleName = path.normalize(filepath)
      .replace(__dirname, 'transpiler')
      .replace(/\\/g, '/')
      .replace(/\.\w*$/, '');
    data = traceur.compile(data, SELF_COMPILE_OPTIONS, moduleName);
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

// TODO(tbosch): remove when traceur is fixed.
// see https://github.com/google/traceur-compiler/issues/1700
function supportSuperCallsInEs6Patch() {
  var traceurVersion = System.map['traceur'];
  var ParseTreeMapWriter = System.get(traceurVersion+'/src/outputgeneration/ParseTreeMapWriter').ParseTreeMapWriter;
  var _enterBranch = ParseTreeMapWriter.prototype.enterBranch;
  ParseTreeMapWriter.prototype.enterBranch = function(location) {
    if (!location.start) {
      // This would throw...
      return;
    }
    return _enterBranch.apply(this, arguments);
  }
}

// TODO(tbosch): Remove when traceur is fixed.
// see https://github.com/google/traceur-compiler/issues/1699
function convertTypesToExpressionsInEs6Patch() {
  var traceurVersion = System.map['traceur'];
  var TypeToExpressionTransformer = System.get(traceurVersion+'/src/codegeneration/TypeToExpressionTransformer').TypeToExpressionTransformer;
  var PureES6Transformer = System.get(traceurVersion+'/src/codegeneration/PureES6Transformer').PureES6Transformer;
  var UniqueIdentifierGenerator = System.get(traceurVersion+'/src/codegeneration/UniqueIdentifierGenerator').UniqueIdentifierGenerator;

  var _transform = PureES6Transformer.prototype.transform;
  PureES6Transformer.prototype.transform = function() {
    if (!this._patched) {
      this._patched = true;
      var self = this;
      this.treeTransformers_.splice(0,0, function(tree) {
        return new TypeToExpressionTransformer(new UniqueIdentifierGenerator(), self.reporter_, self.options_).transformAny(tree);
      });
    }
    return _transform.apply(this, arguments);
  };
}

// TODO(tbosch): Disable getter/setters for assertions until traceur has a flag
// that allows to disable them while keeping assertions and member fields enabled.
// see https://github.com/google/traceur-compiler/issues/1625
// Why:
// - traceur uses field names based on numbers, which can lead to collisions when creating a subclass in a separate compiler run.
// - this rename of fields makes debugging via the repl harder (e.g. via DevTools console)
// - this rename can break JSON conversion of instances
function disableGetterSetterAssertionPatch() {
  var traceurVersion = System.map['traceur'];
  var MemberVariableTransformer = System.get(traceurVersion+'/src/codegeneration/MemberVariableTransformer').MemberVariableTransformer;
  var AnonBlock = System.get(traceurVersion+'/src/syntax/trees/ParseTrees.js').AnonBlock;
  MemberVariableTransformer.prototype.transformPropertyVariableDeclaration = function(tree) {
    return new AnonBlock(tree.location, []);
  }
}

// TODO(tbosch): Get all types from `assert` module and not from `$traceurRuntime`.
// With this a transpile to ES6 does no more include the `$traceurRuntime`.
// see https://github.com/google/traceur-compiler/issues/1706
function useRttsAssertModuleForConvertingTypesToExpressions() {
  var traceurVersion = System.map['traceur'];
  var original = System.get(traceurVersion+'/src/codegeneration/TypeToExpressionTransformer').TypeToExpressionTransformer;
  var patch = System.get('transpiler/src/patch/TypeToExpressionTransformer').TypeToExpressionTransformer;
  for (var prop in patch.prototype) {
    original.prototype[prop] = patch.prototype[prop];
  }
  original.prototype.getOptions = function() { return currentOptions; };

  var TypeAssertionTransformer = System.get(traceurVersion+'/src/codegeneration/TypeAssertionTransformer').TypeAssertionTransformer;
  var createIdentifierExpression = System.get(traceurVersion+'/src/codegeneration/ParseTreeFactory').createIdentifierExpression;
  var parseExpression = System.get(traceurVersion+'/src/codegeneration/PlaceholderParser.js').parseExpression;
  TypeAssertionTransformer.prototype.transformBindingElementParameter_ = function(element, typeAnnotation) {
    // Copied from https://github.com/google/traceur-compiler/commits/master/src/codegeneration/TypeAssertionTransformer.js
    if (!element.binding.isPattern()) {
      if (typeAnnotation) {
        this.paramTypes_.atLeastOneParameterTyped = true;
      } else {
        // PATCH start
        var typeModule = currentOptions.outputLanguage === 'es6' ? 'assert' : '$traceurRuntime';
        typeAnnotation = parseExpression([typeModule + ".type.any"]);
        // PATCH end
      }

      this.paramTypes_.arguments.push(
        createIdentifierExpression(element.binding.identifierToken),
        typeAnnotation);
      return;
    }

    // NYI
  }
}

// TODO(tbosch): patch exports for CommonJS to support `export * from ...`
// see https://github.com/google/traceur-compiler/issues/1042
function patchCommonJSModuleTransformerToSupportExportStar() {
  var traceurVersion = System.map['traceur'];
  var CommonJsModuleTransformer = System.get(traceurVersion+'/src/codegeneration/CommonJsModuleTransformer').CommonJsModuleTransformer;
  var parseStatement = System.get(traceurVersion+'/src/codegeneration/PlaceholderParser.js').parseStatement;
  var prependStatements = System.get(traceurVersion+"/src/codegeneration/PrependStatements.js").prependStatements;

  var _wrapModule = CommonJsModuleTransformer.prototype.wrapModule;
  CommonJsModuleTransformer.prototype.wrapModule = function(statements) {
    if (this.hasStarExports()) {
      var last = statements[statements.length - 1];
      statements = statements.slice(0, -1);
      var exportObject = last.expression;
      if (exportObject.propertyNameAndValues) {
        throw new Error('Don\'t support export * with named exports right now...');
      }
      statements.push(parseStatement(['module.exports = ', ';'], exportObject));
      return statements;
    } else {
      return _wrapModule.apply(this, arguments);
    }
  }
}

