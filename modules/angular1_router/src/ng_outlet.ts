'use strict';

/*
 * A module for adding new a routing system Angular 1.
 */
angular.module('ngComponentRouter', [])
  .directive('ngOutlet', ngOutletDirective)
  .directive('ngOutlet', ngOutletFillContentDirective)
  .directive('ngLink', ngLinkDirective);

/*
 * A module for inspecting controller constructors
 */
angular.module('ng')
  .provider('$$directiveIntrospector', $$directiveIntrospectorProvider)
  .config(compilerProviderDecorator);

/*
 * decorates $compileProvider so that we have access to routing metadata
 */
function compilerProviderDecorator($compileProvider, $$directiveIntrospectorProvider) {
  var directive = $compileProvider.directive;
  $compileProvider.directive = function (name, factory) {
    $$directiveIntrospectorProvider.register(name, factory);
    return directive.apply(this, arguments);
  };
}


/*
 * private service that holds route mappings for each controller
 */
function $$directiveIntrospectorProvider() {
  var directiveBuffer = [];
  var directiveFactoriesByName = {};
  var onDirectiveRegistered = null;
  return {
    register: function (name, factory) {
      if (angular.isArray(factory)) {
        factory = factory[factory.length - 1];
      }
      directiveFactoriesByName[name] = factory;
      if (onDirectiveRegistered) {
        onDirectiveRegistered(name, factory);
      } else {
        directiveBuffer.push({name: name, factory: factory});
      }
    },
    $get: function () {
      var fn = function (newOnControllerRegistered) {
        onDirectiveRegistered = newOnControllerRegistered;
        while (directiveBuffer.length > 0) {
          var directive = directiveBuffer.pop();
          onDirectiveRegistered(directive.name, directive.factory);
        }
      };

      fn.getTypeByName = function (name) {
        return directiveFactoriesByName[name];
      };

      return fn;
    }
  };
}


/**
 * @name ngOutlet
 *
 * @description
 * An ngOutlet is where resolved content goes.
 *
 * ## Use
 *
 * ```html
 * <div ng-outlet="name"></div>
 * ```
 *
 * The value for the `ngOutlet` attribute is optional.
 */
function ngOutletDirective($animate, $q, $router) {
  var rootRouter = $router;

  return {
    restrict: 'AE',
    transclude: 'element',
    terminal: true,
    priority: 400,
    require: ['?^^ngOutlet', 'ngOutlet'],
    link: outletLink,
    controller: function () {},
    controllerAs: '$$ngOutlet'
  };

  function outletLink(scope, $element, attrs, ctrls, $transclude) {
    var outletName = attrs.ngOutlet || 'default',
      parentCtrl = ctrls[0],
      myCtrl = ctrls[1],
      router = (parentCtrl && parentCtrl.$$router) || rootRouter;

    myCtrl.$$currentComponent = null;

    var childRouter,
      currentController,
      currentInstruction,
      currentScope,
      currentElement,
      previousLeaveAnimation;

    function cleanupLastView() {
      if (previousLeaveAnimation) {
        $animate.cancel(previousLeaveAnimation);
        previousLeaveAnimation = null;
      }

      if (currentScope) {
        currentScope.$destroy();
        currentScope = null;
      }
      if (currentElement) {
        previousLeaveAnimation = $animate.leave(currentElement);
        previousLeaveAnimation.then(function () {
          previousLeaveAnimation = null;
        });
        currentElement = null;
      }
    }

    router.registerPrimaryOutlet({
      reuse: function (instruction) {
        var next = $q.when(true);
        var previousInstruction = currentInstruction;
        currentInstruction = instruction;
        if (currentController && currentController.$onReuse) {
          next = $q.when(currentController.$onReuse(currentInstruction, previousInstruction));
        }

        return next;
      },
      canReuse: function (nextInstruction) {
        var result;
        if (!currentInstruction ||
            currentInstruction.componentType !== nextInstruction.componentType) {
          result = false;
        } else if (currentController && currentController.$canReuse) {
          result = currentController.$canReuse(nextInstruction, currentInstruction);
        } else {
          result = nextInstruction === currentInstruction ||
                   angular.equals(nextInstruction.params, currentInstruction.params);
        }
        return $q.when(result);
      },
      canDeactivate: function (instruction) {
        if (currentController && currentController.$canDeactivate) {
          return $q.when(currentController.$canDeactivate(instruction, currentInstruction));
        }
        return $q.when(true);
      },
      deactivate: function (instruction) {
        if (currentController && currentController.$onDeactivate) {
          return $q.when(currentController.$onDeactivate(instruction, currentInstruction));
        }
        return $q.when();
      },
      activate: function (instruction) {
        var previousInstruction = currentInstruction;
        currentInstruction = instruction;

        var componentName = myCtrl.$$componentName = instruction.componentType;

        if (typeof componentName != 'string') {
          throw new Error('Component is not a string for ' + instruction.urlPath);
        }

        myCtrl.$$routeParams = instruction.params;

        myCtrl.$$template = '<div ' + dashCase(componentName) + '></div>';

        myCtrl.$$router = router.childRouter(instruction.componentType);

        var newScope = scope.$new();

        var clone = $transclude(newScope, function (clone) {
          $animate.enter(clone, null, currentElement || $element);
          cleanupLastView();
        });


        currentElement = clone;
        currentScope = newScope;

        // TODO: prefer the other directive retrieving the controller
        // by debug mode
        currentController = currentElement.children().eq(0).controller(componentName);

        if (currentController && currentController.$onActivate) {
          return currentController.$onActivate(instruction, previousInstruction);
        }
        return $q.when();
      }
    });
  }
}
/**
 * This directive is responsible for compiling the contents of ng-outlet
 */
function ngOutletFillContentDirective($compile) {
  return {
    restrict: 'EA',
    priority: -400,
    require: 'ngOutlet',
    link: function (scope, $element, attrs, ctrl) {
      var template = ctrl.$$template;
      $element.html(template);
      var link = $compile($element.contents());
      link(scope);

      // TODO: move to primary directive
      var componentInstance = scope[ctrl.$$componentName];
      if (componentInstance) {
        ctrl.$$currentComponent = componentInstance;

        componentInstance.$router = ctrl.$$router;
        componentInstance.$routeParams = ctrl.$$routeParams;
      }
    }
  };
}


/**
 * @name ngLink
 * @description
 * Lets you link to different parts of the app, and automatically generates hrefs.
 *
 * ## Use
 * The directive uses a simple syntax: `ng-link="componentName({ param: paramValue })"`
 *
 * ## Example
 *
 * ```js
 * angular.module('myApp', ['ngFuturisticRouter'])
 *   .controller('AppController', ['$router', function($router) {
 *     $router.config({ path: '/user/:id' component: 'user' });
 *     this.user = { name: 'Brian', id: 123 };
 *   });
 * ```
 *
 * ```html
 * <div ng-controller="AppController as app">
 *   <a ng-link="user({id: app.user.id})">{{app.user.name}}</a>
 * </div>
 * ```
 */
function ngLinkDirective($router, $parse) {
  var rootRouter = $router;

  return {
    require: '?^^ngOutlet',
    restrict: 'A',
    link: ngLinkDirectiveLinkFn
  };

  function ngLinkDirectiveLinkFn(scope, elt, attrs, ctrl) {
    var router = (ctrl && ctrl.$$router) || rootRouter;
    if (!router) {
      return;
    }

    var instruction = null;
    var link = attrs.ngLink || '';

    function getLink(params) {
      instruction = router.generate(params);
      return './' + angular.stringifyInstruction(instruction);
    }

    var routeParamsGetter = $parse(link);
    // we can avoid adding a watcher if it's a literal
    if (routeParamsGetter.constant) {
      var params = routeParamsGetter();
      elt.attr('href', getLink(params));
    } else {
      scope.$watch(function () {
        return routeParamsGetter(scope);
      }, function (params) {
        elt.attr('href', getLink(params));
      }, true);
    }

    elt.on('click', function (event) {
      if (event.which !== 1 || !instruction) {
        return;
      }

      $router.navigateByInstruction(instruction);
      event.preventDefault();
    });
  }
}


function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return '-' + $1.toLowerCase();
  });
}
