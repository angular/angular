var fs = require('fs');
var transpiler = require('../../tools/transpiler');

var files = [
  'url.js',
  'instruction.js',
  'route_config_impl.js',
  'path_recognizer.js',
  'route_recognizer.js',
  'route_registry.js',
  'pipeline.js',
  'router.js'
];

var PRELUDE = '(function(){\n';
var POSTLUDE = '\n}());\n';
var FACADES = fs.readFileSync(__dirname + '/lib/facades.es5', 'utf8');
var TRACEUR_RUNTIME = fs.readFileSync(__dirname + '/../../node_modules/traceur/bin/traceur-runtime.js', 'utf8');
var DIRECTIVES = fs.readFileSync(__dirname + '/src/ng_outlet.js', 'utf8');
function main() {
  var dir = __dirname + '/../angular2/src/router/';

  var modules = {};

  var out = '';

  var sharedCode = '';
  files.forEach(function (file) {
    var moduleName = 'router/' + file.replace(/\.js$/, '');

    modules[moduleName] = transform(moduleName, fs.readFileSync(dir + file, 'utf8'));
    sharedCode += modules[moduleName].js;
  });

  out += "angular.module('ngComponentRouter')";
  out += angularFactory('$router', ['$q', '$pipeline', '$location', '$$controllerIntrospector', '$browser', '$rootScope'], [
    FACADES,
    sharedCode,
    "var RouteConfig = " + modules['router/route_config_impl'].exportedAs + ".RouteConfig;",
    "angular.annotations = {RouteConfig: RouteConfig};",
    "var RouteRegistry = " + modules['router/route_registry'].exportedAs + ".RouteRegistry;",
    "var RootRouter = " + modules['router/router'].exportedAs + ".RootRouter;",
    //TODO: move this code into a templated JS file
    "var registry = new RouteRegistry();",
    "var location = new Location();",

    "$$controllerIntrospector(function (name, constructor) {",
      "if (constructor.annotations) {",
        "constructor.annotations.forEach(function(annotation) {",
          "if (annotation instanceof RouteConfig) {",
            "annotation.configs.forEach(function (config) {",
              "registry.config(name, config);",
            "});",
          "}",
        "});",
      "}",
    "});",

    "var router = new RootRouter(registry, $pipeline, location, new Object());",
    "$rootScope.$watch(function () { return $location.path(); }, function (path) { router.navigate(path); });",

    "return router;"
  ].join('\n'));

  return PRELUDE + TRACEUR_RUNTIME + DIRECTIVES + out + POSTLUDE;
}


/*
 * Given a directory name and a file's TypeScript content, return an object with the ES5 code,
 * sourcemap, anf exported variable identifier name for the content.
 */
var TRACEUR_OPTIONS = {
  outputLanguage: 'es5',
  sourceMaps: true,
  script: false,
  memberVariables: true,
  modules: 'inline',
  types: true,
  typeAssertions: false,
  annotations: true
};
var IMPORT_RE = new RegExp("import \\{?([\\w_, ]+)\\}? from '(.+)';?", 'g');
function transform (dir, contents) {
  contents = contents.replace(IMPORT_RE, function (match, imports, includePath) {
    //TODO: remove special-case
    if (isFacadeModule(includePath) || includePath === './router_outlet') {
      return '';
    }
    return match;
  });
  contents = transpiler.compile(TRACEUR_OPTIONS, {
    inputPath: dir
  }, contents, true);

  contents.exportedAs = exportedAs(contents.js);

  return contents;
}


/*
 * given a string containing ES5 source code like: `var $__X_Y_Z = ...`
 * returns `$__X_Y_Z`
 */
var VAR_RE = /^var ([$\w]+) =/;
function exportedAs(js) {
  var match = js.match(VAR_RE);
  return match ? match[1] : '';
}


function angularFactory(name, deps, body) {
  return ".factory('" + name + "', [" +
    deps.map(function (service) {
      return "'" + service + "', ";
    }).join('') +
    "function (" + deps.join(', ') + ") {\n" + body + "\n}])";
}


function isFacadeModule(modulePath) {
  return modulePath.indexOf('facade') > -1 ||
    modulePath === 'angular2/src/reflection/reflection';
}

module.exports = function () {
  fs.writeFileSync(__dirname + '/../../dist/angular_1_router.js', main(files));
};
