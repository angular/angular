
angular.module('ngComponentRouter').
    value('$route', null). // can be overloaded with ngRouteShim
    // Because Angular 1 has no notion of a root component, we use an object with unique identity
    // to represent this. Can be overloaded with a component name
    value('$routerRootComponent', new Object()).
    factory('$rootRouter', ['$q', '$location', '$browser', '$rootScope', '$injector', '$routerRootComponent', routerFactory]);

function routerFactory($q, $location, $browser, $rootScope, $injector, $routerRootComponent) {

  // When this file is processed, the line below is replaced with
  // the contents of `../lib/facades.es5`.
  //{{FACADES}}

  var exports = {
    Injectable: function () {},
    OpaqueToken: function () {},
    Inject: function () {}
  };
  var routerRequire = function () {return exports;};

  // When this file is processed, the line below is replaced with
  // the contents of the compiled TypeScript classes.
  //{{SHARED_CODE}}

  function getComponentConstructor(name) {
    var serviceName = name + 'Directive';
    if ($injector.has(serviceName)) {
      var definitions = $injector.get(serviceName);
      if (definitions.length > 1) {
        throw new BaseException('too many directives named "' + name + '"');
      }
      return definitions[0].controller;
    } else {
      throw new BaseException('directive "' + name + '" is not registered');
    }
  }

  //TODO: this is a hack to replace the exiting implementation at run-time
  exports.getCanActivateHook = function (directiveName) {
    var controller = getComponentConstructor(directiveName);
    return controller.$canActivate && function (next, prev) {
      return $injector.invoke(controller.$canActivate, null, {
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

  // Override this method to actually get hold of the child routes
  RouteRegistry.prototype.configFromComponent = function (component) {
    var that = this;
    if (isString(component)) {
      // Don't read the annotations component a type more than once –
      // this prevents an infinite loop if a component routes recursively.
      if (this._rules.has(component)) {
        return;
      }
      var controller = getComponentConstructor(component);
      if (angular.isArray(controller.$routeConfig)) {
        controller.$routeConfig.forEach(function (config) {
          var loader = config.loader;
          if (isPresent(loader)) {
            config = angular.extend({}, config, { loader: () => $injector.invoke(loader) });
          }
          that.config(component, config);
        });
      }
    }

  }

  var registry = new RouteRegistry($routerRootComponent);
  var location = new Location();

  var router = new RootRouter(registry, location, $routerRootComponent);
  $rootScope.$watch(function () { return $location.url(); }, function (path) {
    if (router.lastNavigationAttempt !== path) {
      router.navigateByUrl(path);
    }
  });

  router.subscribe(function () {
    $rootScope.$broadcast('$routeChangeSuccess', {});
  });

  return router;
}
