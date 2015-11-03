
angular.module('ngComponentRouter').
    value('$route', null). // can be overloaded with ngRouteShim
    factory('$router', ['$q', '$location', '$$directiveIntrospector', '$browser', '$rootScope', '$injector', routerFactory]);

function routerFactory($q, $location, $$directiveIntrospector, $browser, $rootScope, $injector) {

  // When this file is processed, the line below is replaced with
  // the contents of `../lib/facades.es5`.
  //{{FACADES}}

  var exports = {Injectable: function () {}};
  var require = function () {return exports;};

  // When this file is processed, the line below is replaced with
  // the contents of the compiled TypeScript classes.
  //{{SHARED_CODE}}

  //TODO: this is a hack to replace the exiting implementation at run-time
  exports.getCanActivateHook = function (directiveName) {
    var factory = $$directiveIntrospector.getTypeByName(directiveName);
    return factory && factory.$canActivate && function (next, prev) {
      return $injector.invoke(factory.$canActivate, null, {
        $nextInstruction: next,
        $prevInstruction: prev
      });
    };
  };

  // This hack removes assertions about the type of the "component"
  // property in a route config
  exports.assertComponentExists = function () {};

  angular.stringifyInstruction = function (instruction) {
    return instruction.toRootUrl();
  };

  var RouteRegistry = exports.RouteRegistry;
  var RootRouter = exports.RootRouter;

  var registry = new RouteRegistry();
  var location = new Location();

  $$directiveIntrospector(function (name, factory) {
    if (angular.isArray(factory.$routeConfig)) {
      factory.$routeConfig.forEach(function (config) {
        registry.config(name, config);
      });
    }
  });

  // Because Angular 1 has no notion of a root component, we use an object with unique identity
  // to represent this.
  var ROOT_COMPONENT_OBJECT = new Object();

  var router = new RootRouter(registry, location, ROOT_COMPONENT_OBJECT);
  $rootScope.$watch(function () { return $location.path(); }, function (path) {
    if (router.lastNavigationAttempt !== path) {
      router.navigateByUrl(path);
    }
  });

  router.subscribe(function () {
    $rootScope.$broadcast('$routeChangeSuccess', {});
  });

  return router;
}
