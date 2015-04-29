'use strict';

/*
 * A module for adding new a routing system Angular 1.
 */
angular.module('ngComponentRouter', [])
  .factory('$componentMapper', $componentMapperFactory)
  .provider('$pipeline', pipelineProvider)
  .factory('$setupRoutersStep', setupRoutersStepFactory)
  .factory('$initLocalsStep', initLocalsStepFactory)
  .value('$runCanDeactivateHookStep', runCanDeactivateHookStep)
  .factory('$runCanActivateHookStep', runCanActivateHookStepFactory)
  .factory('$loadTemplatesStep', loadTemplatesStepFactory)
  .value('$activateStep', activateStepValue)
  .directive('ngOutlet', ngOutletDirective)
  .directive('ngOutlet', ngOutletFillContentDirective)
  .directive('ngLink', ngLinkDirective) // TODO: make this configurable ?
  .directive('a', anchorLinkDirective);

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
        while(controllers.length > 0) {
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
function ngOutletDirective($animate, $injector, $q, $router, $componentMapper, $controller) {
  var rootRouter = $router;

  return {
    restrict: 'AE',
    transclude: 'element',
    terminal: true,
    priority: 400,
    require: ['?^^ngOutlet', 'ngOutlet'],
    link: outletLink,
    controller: function() {},
    controllerAs: '$$ngOutlet'
  };

  function invoke(method, context, instruction) {
    return $injector.invoke(method, context, instruction.locals);
  }

  function boolToPromise(val) {
    return $q.when(val).then(function (res) {
      if (res == false) {
        return $q.reject(false);
      }
      return res;
    });
  }

  function outletLink(scope, $element, attrs, ctrls, $transclude) {
    var outletName = attrs.ngOutlet || 'default',
      parentCtrl = ctrls[0],
      myCtrl = ctrls[1],
      router = (parentCtrl && parentCtrl.$$router) || rootRouter;

    var currentScope,
      newScope,
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
        previousLeaveAnimation.then(function() {
          previousLeaveAnimation = null;
        });
        currentElement = null;
      }
    }

    router.registerOutlet({
      canDeactivate: function(instruction) {
        if (currentController && currentController.canDeactivate) {
          return boolToPromise(invoke(currentController.canDeactivate, currentController, instruction));
        }
        return true;
      },
      activate: function(instruction) {
        var controllerConstructor = instruction.controllerConstructor;

        newScope = instruction.locals.$scope = scope.$new();

        var ctrl = $controller(controllerConstructor, instruction.locals);
        instruction.controllerAs = $componentMapper.controllerAs(instruction.component);
        instruction.controller = ctrl;

        myCtrl.$$router = instruction.router;
        myCtrl.$$template = instruction.template;
        var controllerAs = instruction.controllerAs || instruction.component;
        var clone = $transclude(newScope, function(clone) {
          $animate.enter(clone, null, currentElement || $element);
          cleanupLastView();
        });

        var newController = instruction.controller;
        newScope[controllerAs] = newController;

        var result;
        if (currentController && currentController.deactivate) {
          result = $q.when(invoke(currentController.deactivate, currentController, instruction));
        }

        currentController = newController;

        currentElement = clone;
        currentScope = newScope;

        // finally, run the hook
        if (newController.activate) {
          var activationResult = $q.when(invoke(newController.activate, newController, instruction));
          if (result) {
            return result.then(activationResult);
          } else {
            return activationResult;
          }
        }
        return result;
      }
    }, outletName);
  }
}

function ngOutletFillContentDirective($compile) {
  return {
    restrict: 'EA',
    priority: -400,
    require: 'ngOutlet',
    link: function(scope, $element, attrs, ctrl) {
      var template = ctrl.$$template;
      $element.html(template);
      var link = $compile($element.contents());
      link(scope);
    }
  };
}


var LINK_MICROSYNTAX_RE = /^(.+?)(?:\((.*)\))?$/;
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
    var parts = link.match(LINK_MICROSYNTAX_RE);
    var routeName = parts[1];
    var routeParams = parts[2];
    var url;

    if (routeParams) {
      var routeParamsGetter = $parse(routeParams);
      // we can avoid adding a watcher if it's a literal
      if (routeParamsGetter.constant) {
        var params = routeParamsGetter();
        url = '.' + router.generate(routeName, params);
        elt.attr('href', url);
      } else {
        scope.$watch(function() {
          return routeParamsGetter(scope);
        }, function(params) {
          url = '.' + router.generate(routeName, params);
          elt.attr('href', url);
        }, true);
      }
    } else {
      url = '.' + router.generate(routeName);
      elt.attr('href', url);
    }
  }
}


function anchorLinkDirective($router) {
  return {
    restrict: 'E',
    link: function(scope, element) {
      // If the linked element is not an anchor tag anymore, do nothing
      if (element[0].nodeName.toLowerCase() !== 'a') return;

      // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
      var hrefAttrName = Object.prototype.toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
        'xlink:href' : 'href';

      element.on('click', function(event) {
        if (event.which !== 1)
          return;

        var href = element.attr(hrefAttrName);
        if (href && $router.recognize(href)) {
          $router.navigate(href);
          event.preventDefault();
        }
      });
    }
  }
}

function setupRoutersStepFactory() {
  return function(instruction) {
    return instruction.traverseSync(function (parentInstruction, childInstruction) {
      childInstruction.router = parentInstruction.router.childRouter(childInstruction.component);
    });
  }
}

/*
 * $initLocalsStep
 */
function initLocalsStepFactory($componentMapper, $$controllerIntrospector) {
  return function initLocals(instruction) {
    return instruction.traverseSync(function(parentInstruction, instruction) {
      if (typeof instruction.component === 'function') {
        instruction.controllerConstructor = instruction.component;
      } else {
        var controllerName = $componentMapper.controllerName(instruction.component);
        if (typeof controllerName === 'function') {
          instruction.controllerConstructor = controllerName;
        } else {
          instruction.controllerConstructor = $$controllerIntrospector.getTypeByName(controllerName) || angular.noop;
        }
      }
      return instruction.locals = {
        $router: instruction.router,
        $routeParams: (instruction.params || {})
      };
    });
  }
}


function runCanDeactivateHookStep(instruction) {
  return instruction.router.traverseOutlets(function (outlet, name) {
    return outlet.canDeactivate(instruction.getChildInstruction(name));
  });
}

function runCanActivateHookStepFactory($injector, $q) {
  function boolToPromise(val) {
    return $q.when(val).then(function (res) {
      if (res == false) {
        return $q.reject(false);
      }
      return res;
    });
  }
  function invoke(method, context, instruction) {
    return $injector.invoke(method, context, instruction.locals);
  }
  return function(instruction) {
    return instruction.traverseAsync(function (childInstruction) {
      var canActivateHook = childInstruction.controllerConstructor.canActivate;
      return !canActivateHook || boolToPromise(invoke(canActivateHook, null, childInstruction));
    });
  }
}

function loadTemplatesStepFactory($componentMapper, $templateRequest) {
  return function loadTemplates(instruction) {
    return instruction.traverseAsync(function(instruction) {
      var componentTemplateUrl = $componentMapper.template(instruction.component);
      return $templateRequest(componentTemplateUrl).then(function (templateHtml) {
        return instruction.template = templateHtml;
      });
    });
  };
}


function activateStepValue(instruction) {
  return instruction.router.activateOutlets(instruction);
}


function pipelineProvider() {
  var stepConfiguration;

  var protoStepConfiguration = [
    '$setupRoutersStep',
    '$initLocalsStep',
    '$runCanDeactivateHookStep',
    '$runCanActivateHookStep',
    '$loadTemplatesStep',
    '$activateStep'
  ];

  return {
    steps: protoStepConfiguration.slice(0),
    config: function (newConfig) {
      protoStepConfiguration = newConfig;
    },
    $get: function ($injector, $q) {
      stepConfiguration = protoStepConfiguration.map(function (step) {
        return $injector.get(step);
      });

      return {
        process: function(instruction) {
          // make a copy
          var steps = stepConfiguration.slice(0);

          function processOne(result) {
            if (steps.length === 0) {
              return result;
            }
            var step = steps.shift();
            return $q.when(step(instruction)).then(processOne);
          }

          return processOne();
        }
      }
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
    setCtrlNameMapping: function(newFn) {
      componentToCtrl = newFn;
      return this;
    },

    /**
     * @name $componentMapper#setCtrlAsMapping
     * @description takes a function for mapping component names to controllerAs name in the template
     */
    setCtrlAsMapping: function(newFn) {
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
    setTemplateMapping: function(newFn) {
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
