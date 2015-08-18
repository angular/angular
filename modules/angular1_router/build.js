'use strict';

var fs = require('fs');
var ts = require('typescript');

var files = [
  'lifecycle_annotations_impl.ts',
  'url_parser.ts',
  'path_recognizer.ts',
  'route_config_impl.ts',
  'async_route_handler.ts',
  'sync_route_handler.ts',
  'route_recognizer.ts',
  'instruction.ts',
  'route_config_nomalizer.ts',
  'route_lifecycle_reflector.ts',
  'route_registry.ts',
  'router.ts'
];

var PRELUDE = '(function(){\n';
var POSTLUDE = '\n}());\n';
var FACADES = fs.readFileSync(__dirname + '/lib/facades.es5', 'utf8');
var TRACEUR_RUNTIME = fs.readFileSync(__dirname + '/../../node_modules/traceur/bin/traceur-runtime.js', 'utf8');
var DIRECTIVES = fs.readFileSync(__dirname + '/src/ng_outlet.js', 'utf8');
function main() {
  var dir = __dirname + '/../angular2/src/router/';

  var out = '';

  var sharedCode = '';
  files.forEach(function (file) {
    var moduleName = 'router/' + file.replace(/\.ts$/, '');

    sharedCode += transform(moduleName, fs.readFileSync(dir + file, 'utf8'));
  });

  out += "angular.module('ngComponentRouter')";
  out += angularFactory('$router', ['$q', '$location', '$$controllerIntrospector',
                                    '$browser', '$rootScope', '$injector'], [
    FACADES,
    "var exports = {Injectable: function () {}};",
    "var require = function () {return exports;};",
    sharedCode,
    "var RouteConfig = exports.RouteConfig;",
    "angular.annotations = {RouteConfig: RouteConfig, CanActivate: exports.CanActivate};",
    "angular.stringifyInstruction = exports.stringifyInstruction;",
    "var RouteRegistry = exports.RouteRegistry;",
    "var RootRouter = exports.RootRouter;",
    //TODO: move this code into a templated JS file
    "var registry = new RouteRegistry();",
    "var location = new Location();",

    "$$controllerIntrospector(function (name, constructor) {",
      "if (constructor.$canActivate) {",
        "constructor.annotations = constructor.annotations || [];",
        "constructor.annotations.push(new angular.annotations.CanActivate(function (instruction) {",
          "return $injector.invoke(constructor.$canActivate, constructor, {",
            "$routeParams: instruction.component ? instruction.component.params : instruction.params",
          "});",
        "}));",
      "}",
      "if (constructor.$routeConfig) {",
        "constructor.annotations = constructor.annotations || [];",
        "constructor.annotations.push(new angular.annotations.RouteConfig(constructor.$routeConfig));",
      "}",
      "if (constructor.annotations) {",
        "constructor.annotations.forEach(function(annotation) {",
          "if (annotation instanceof RouteConfig) {",
            "annotation.configs.forEach(function (config) {",
              "registry.config(constructor, config);",
            "});",
          "}",
        "});",
      "}",
    "});",

    "var router = new RootRouter(registry, undefined, location, new Object());",
    "$rootScope.$watch(function () { return $location.path(); }, function (path) {",
      "if (router.lastNavigationAttempt !== path) {",
        "router.navigate(path);",
      "}",
    "});",

    "return router;"
  ].join('\n'));

  return PRELUDE + TRACEUR_RUNTIME + DIRECTIVES + out + POSTLUDE;
}


/*
 * Given a directory name and a file's TypeScript content, return an object with the ES5 code,
 * sourcemap, anf exported variable identifier name for the content.
 */
var IMPORT_RE = new RegExp("import \\{?([\\w\\n_, ]+)\\}? from '(.+)';?", 'g');
function transform(dir, contents) {
  contents = contents.replace(IMPORT_RE, function (match, imports, includePath) {
    //TODO: remove special-case
    if (isFacadeModule(includePath) || includePath === './router_outlet') {
      return '';
    }
    return match;
  });
  return ts.transpile(contents, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    sourceRoot: dir
  });
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
  var dist = __dirname + '/../../dist';
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }
  fs.writeFileSync(dist + '/angular_1_router.js', main(files));
};
