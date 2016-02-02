'use strict';

var fs = require('fs');
var ts = require('typescript');

var files = [
  'lifecycle_annotations_impl.ts',
  'url_parser.ts',
  'route_recognizer.ts',
  'route_config_impl.ts',
  'async_route_handler.ts',
  'sync_route_handler.ts',
  'component_recognizer.ts',
  'instruction.ts',
  'path_recognizer.ts',
  'route_config_nomalizer.ts',
  'route_lifecycle_reflector.ts',
  'route_registry.ts',
  'router.ts'
];

var PRELUDE = '(function(){\n';
var POSTLUDE = '\n}());\n';

function main(modulesDirectory) {
  var angular1RouterModuleDirectory = modulesDirectory + '/angular1_router';

  var facades = fs.readFileSync(
      angular1RouterModuleDirectory + '/lib/facades.es5', 'utf8');
  var directives = fs.readFileSync(
      angular1RouterModuleDirectory + '/src/ng_outlet.ts', 'utf8');
  var moduleTemplate = fs.readFileSync(
      angular1RouterModuleDirectory + '/src/module_template.js', 'utf8');

  var dir = modulesDirectory + '/angular2/src/router/';
  var sharedCode = files.reduce(function (prev, file) {
    return prev + transform(fs.readFileSync(dir + file, 'utf8'));
  }, '');

  var out = moduleTemplate.replace('//{{FACADES}}', facades)
                .replace('//{{SHARED_CODE}}', sharedCode);
  return PRELUDE + transform(directives) + out + POSTLUDE;
}

/*
 * Given a directory name and a file's TypeScript content, return an object with the ES5 code,
 * sourcemap, and exported variable identifier name for the content.
 */
var IMPORT_RE = new RegExp("import \\{?([\\w\\n_, ]+)\\}? from '(.+)';?", 'g');
var INJECT_RE = new RegExp("@Inject\\(ROUTER_PRIMARY_COMPONENT\\)", 'g');
var IMJECTABLE_RE = new RegExp("@Injectable\\(\\)", 'g');
function transform(contents) {
  contents = contents.replace(INJECT_RE, '').replace(IMJECTABLE_RE, '');
  contents = contents.replace(IMPORT_RE, function (match, imports, includePath) {
    //TODO: remove special-case
    if (isFacadeModule(includePath) || includePath === './router_outlet') {
      return '';
    }
    return match;
  });
  return ts.transpile(contents, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
  });
}

function isFacadeModule(modulePath) {
  return modulePath.indexOf('facade') > -1 ||
    modulePath === 'angular2/src/core/reflection/reflection';
}

module.exports = function(modulesDirectory, outputDirectory) {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }
  fs.writeFileSync(
      outputDirectory + '/angular_1_router.js', main(modulesDirectory));
};

// CLI entry point
if (require.main === module) {
  try {
    var args = process.argv;
    args.shift();  // node
    args.shift();  // scriptfile.js
    if (args.length < 2) {
      console.log("usage: $0 outFile path/to/modules");
      process.exit(1);
    }
    var outfile = args.shift();
    var directory = args.shift();
    fs.writeFileSync(outfile, main(directory));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}
