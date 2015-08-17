'use strict';

/*
 * A module for adding new a routing system Angular 1.
 */
angular.module('ngComponentRouter', [])
  .factory('$componentMapper', $componentMapperFactory)
  .directive('ngOutlet', ngOutletDirective)
  .directive('ngOutlet', ngOutletFillContentDirective)
  .directive('ngLink', ngLinkDirective)
  .directive('a', anchorLinkDirective); // TODO: make the anchor link feature configurable

/*
 * A module for inspecting controller constructors
 */
angular.module('ng')
  .provider('$$controllerIntrospector', $$controllerIntrospectorProvider)
  .config(controllerProviderDecorator);

/*
 * decorates with routing info
 */
function controllerProviderDecorator($controllerProvider, $$controllerIntrospectorProvider) {
  var register = $controllerProvider.register;
  $controllerProvider.register = function (name, ctrl) {
    $$controllerIntrospectorProvider.register(name, ctrl);
    return register.apply(this, arguments);
  };
}

// TODO: decorate $controller ?
/*
 * private service that holds route mappings for each controller
 */
function $$controllerIntrospectorProvider() {
  var controllers = [];
  var controllersByName = {};
  var onControllerRegistered = null;
  return {
    register: function (name, constructor) {
      if (angular.isArray(constructor)) {
        constructor = constructor[constructor.length - 1];
      }
      controllersByName[name] = constructor;
      constructor.$$controllerName = name;
      if (onControllerRegistered) {
        onControllerRegistered(name, constructor);
      } else {
        controllers.push({name: name, constructor: constructor});
      }
    },
    $get: ['$componentMapper', function ($componentMapper) {
      var fn = function (newOnControllerRegistered) {
        onControllerRegistered = function (name, constructor) {
          name = $componentMapper.component(name);
          return newOnControllerRegistered(name, constructor);
        };
        while (controllers.length > 0) {
          var rule = controllers.pop();
          onControllerRegistered(rule.name, rule.constructor);
        }
      };

      fn.getTypeByName = function (name) {
        return controllersByName[name];
      };

      return fn;
    }]
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
function ngOutletDirective($animate, $injector, $q, $router, $componentMapper, $controller,
                           $$controllerIntrospector, $templateRequest) {
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

    var childRouter,
      currentInstruction,
      currentScope,
      currentController,
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

    router.registerOutlet({
      commit: function (instruction) {
        var next = $q.when(true);
        var componentInstruction = instruction.component;
        if (componentInstruction.reuse) {
          var previousInstruction = currentInstruction;
          currentInstruction = componentInstruction;
          if (currentController.onReuse) {
            next = $q.when(currentController.onReuse(currentInstruction, previousInstruction));
          }
        } else {
          var self = this;
          next = this.deactivate(instruction).then(function () {
            return self.activate(componentInstruction);
          });
        }
        return next.then(function () {
          if (childRouter) {
            return childRouter.commit(instruction.child);
          } else {
            return $q.when(true);
          }
        });
      },
      canReuse: function (nextInstruction) {
        var result;
        var componentInstruction = nextInstruction.component;
        if (!currentInstruction ||
            currentInstruction.componentType !== componentInstruction.componentType) {
          result = false;
        } else if (currentController.canReuse) {
          result = currentController.canReuse(componentInstruction, currentInstruction);
        } else {
          result = componentInstruction === currentInstruction ||
                   angular.equals(componentInstruction.params, currentInstruction.params);
        }
        return $q.when(result).then(function (result) {
          // TODO: this is a hack
          componentInstruction.reuse = result;
          return result;
        });
      },
      canDeactivate: function (instruction) {
        if (currentInstruction && currentController && currentController.canDeactivate) {
          return $q.when(currentController.canDeactivate(instruction && instruction.component, currentInstruction));
        }
        return $q.when(true);
      },
      deactivate: function (instruction) {
        // todo(shahata): childRouter.dectivate, dispose component?
        var result = $q.when();
        return result.then(function () {
          if (currentController && currentController.onDeactivate) {
            return currentController.onDeactivate(instruction && instruction.component, currentInstruction);
          }
        });
      },
      activate: function (instruction) {
        var previousInstruction = currentInstruction;
        currentInstruction = instruction;
        childRouter = router.childRouter(instruction.componentType);

        var controllerConstructor, componentName;
        controllerConstructor = instruction.componentType;
        componentName = $componentMapper.component(controllerConstructor.$$controllerName);

        var componentTemplateUrl = $componentMapper.template(componentName);
        return $templateRequest(componentTemplateUrl).then(function (templateHtml) {
          myCtrl.$$router = childRouter;
          myCtrl.$$template = templateHtml;
        }).then(function () {
          var newScope = scope.$new();
          var locals = {
            $scope: newScope,
            $router: childRouter,
            $routeParams: (instruction.params || {})
          };

          // todo(shahata): controllerConstructor is not minify friendly
          currentController = $controller(controllerConstructor, locals);

          var clone = $transclude(newScope, function (clone) {
            $animate.enter(clone, null, currentElement || $element);
            cleanupLastView();
          });

          var controllerAs = $componentMapper.controllerAs(componentName) || componentName;
          newScope[controllerAs] = currentController;
          currentElement = clone;
          currentScope = newScope;

          if (currentController.onActivate) {
            return currentController.onActivate(instruction, previousInstruction);
          }
        });
      }
    }, outletName);
  }
}

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
function ngLinkDirective($router, $location, $parse) {
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

    var link = attrs.ngLink || '';

    function getLink(params) {
      return './' + angular.stringifyInstruction(router.generate(params));
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
  }
}


function anchorLinkDirective($router) {
  return {
    restrict: 'E',
    link: function (scope, element) {
      // If the linked element is not an anchor tag anymore, do nothing
      if (element[0].nodeName.toLowerCase() !== 'a') {
        return;
      }

      // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
      var hrefAttrName = Object.prototype.toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
        'xlink:href' : 'href';

      element.on('click', function (event) {
        if (event.which !== 1) {
          return;
        }

        var href = element.attr(hrefAttrName);
        if (href && $router.recognize(href)) {
          $router.navigate(href);
          event.preventDefault();
        }
      });
    }
  };
}

/**
 * @name $componentMapperFactory
 * @description
 *
 * This lets you configure conventions for what controllers are named and where to load templates from.
 *
 * The default behavior is to dasherize and serve from `./components`. A component called `myWidget`
 * uses a controller named `MyWidgetController` and a template loaded from `./components/my-widget/my-widget.html`.
 *
 * A component is:
 * - a controller
 * - a template
 * - an optional router
 *
 * This service makes it easy to group all of them into a single concept.
 */
function $componentMapperFactory() {

  var DEFAULT_SUFFIX = 'Controller';

  var componentToCtrl = function componentToCtrlDefault(name) {
    return name[0].toUpperCase() + name.substr(1) + DEFAULT_SUFFIX;
  };

  var componentToTemplate = function componentToTemplateDefault(name) {
    var dashName = dashCase(name);
    return './components/' + dashName + '/' + dashName + '.html';
  };

  var ctrlToComponent = function ctrlToComponentDefault(name) {
    return name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
  };

  var componentToControllerAs = function componentToControllerAsDefault(name) {
    return name;
  };

  return {
    controllerName: function (name) {
      return componentToCtrl(name);
    },

    controllerAs: function (name) {
      return componentToControllerAs(name);
    },

    template: function (name) {
      return componentToTemplate(name);
    },

    component: function (name) {
      return ctrlToComponent(name);
    },

    /**
     * @name $componentMapper#setCtrlNameMapping
     * @description takes a function for mapping component names to component controller names
     */
    setCtrlNameMapping: function (newFn) {
      componentToCtrl = newFn;
      return this;
    },

    /**
     * @name $componentMapper#setCtrlAsMapping
     * @description takes a function for mapping component names to controllerAs name in the template
     */
    setCtrlAsMapping: function (newFn) {
      componentToControllerAs = newFn;
      return this;
    },

    /**
     * @name $componentMapper#setComponentFromCtrlMapping
     * @description takes a function for mapping component controller names to component names
     */
    setComponentFromCtrlMapping: function (newFn) {
      ctrlToComponent = newFn;
      return this;
    },

    /**
     * @name $componentMapper#setTemplateMapping
     * @description takes a function for mapping component names to component template URLs
     */
    setTemplateMapping: function (newFn) {
      componentToTemplate = newFn;
      return this;
    }
  };
}


function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return '-' + $1.toLowerCase();
  });
}
