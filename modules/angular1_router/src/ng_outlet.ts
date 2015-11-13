///<reference path="../typings/angularjs/angular.d.ts"/>

/*
 * decorates $compileProvider so that we have access to routing metadata
 */
function compilerProviderDecorator($compileProvider,
                                   $$directiveIntrospectorProvider: DirectiveIntrospectorProvider) {
  let directive = $compileProvider.directive;
  $compileProvider.directive = function(name: string, factory: Function) {
    $$directiveIntrospectorProvider.register(name, factory);
    return directive.apply(this, arguments);
  };
}

/*
 * private service that holds route mappings for each controller
 */
class DirectiveIntrospectorProvider {
  private directiveBuffer: any[] = [];
  private directiveFactoriesByName: {[name: string]: Function} = {};
  private onDirectiveRegistered: (name: string, factory: Function) => any = null;

  register(name: string, factory: Function) {
    if (angular.isArray(factory)) {
      factory = factory[factory.length - 1];
    }
    this.directiveFactoriesByName[name] = factory;
    if (this.onDirectiveRegistered) {
      this.onDirectiveRegistered(name, factory);
    } else {
      this.directiveBuffer.push({name: name, factory: factory});
    }
  }

  $get() {
    let fn: any = newOnControllerRegistered => {
      this.onDirectiveRegistered = newOnControllerRegistered;
      while (this.directiveBuffer.length > 0) {
        let directive = this.directiveBuffer.pop();
        this.onDirectiveRegistered(directive.name, directive.factory);
      }
    };

    fn.getTypeByName = name => this.directiveFactoriesByName[name];

    return fn;
  }
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
function ngOutletDirective($animate, $q: ng.IQService, $router) {
  let rootRouter = $router;

  return {
    restrict: 'AE',
    transclude: 'element',
    terminal: true,
    priority: 400,
    require: ['?^^ngOutlet', 'ngOutlet'],
    link: outletLink,
    controller: class {},
    controllerAs: '$$ngOutlet'
  };

  function outletLink(scope, element, attrs, ctrls, $transclude) {
    class Outlet {
      constructor(private controller, private router) {}

      private currentController;
      private currentInstruction;
      private currentScope;
      private currentElement;
      private previousLeaveAnimation;

      private cleanupLastView() {
        if (this.previousLeaveAnimation) {
          $animate.cancel(this.previousLeaveAnimation);
          this.previousLeaveAnimation = null;
        }

        if (this.currentScope) {
          this.currentScope.$destroy();
          this.currentScope = null;
        }
        if (this.currentElement) {
          this.previousLeaveAnimation = $animate.leave(this.currentElement);
          this.previousLeaveAnimation.then(() => this.previousLeaveAnimation = null);
          this.currentElement = null;
        }
      }

      reuse(instruction) {
        let next = $q.when(true);
        let previousInstruction = this.currentInstruction;
        this.currentInstruction = instruction;
        if (this.currentController && this.currentController.$onReuse) {
          next = $q.when(
              this.currentController.$onReuse(this.currentInstruction, previousInstruction));
        }

        return next;
      }

      canReuse(nextInstruction) {
        let result;
        if (!this.currentInstruction ||
            this.currentInstruction.componentType !== nextInstruction.componentType) {
          result = false;
        } else if (this.currentController && this.currentController.$canReuse) {
          result = this.currentController.$canReuse(nextInstruction, this.currentInstruction);
        } else {
          result = nextInstruction === this.currentInstruction ||
                   angular.equals(nextInstruction.params, this.currentInstruction.params);
        }
        return $q.when(result);
      }

      canDeactivate(instruction) {
        if (this.currentController && this.currentController.$canDeactivate) {
          return $q.when(
              this.currentController.$canDeactivate(instruction, this.currentInstruction));
        }
        return $q.when(true);
      }

      deactivate(instruction) {
        if (this.currentController && this.currentController.$onDeactivate) {
          return $q.when(
              this.currentController.$onDeactivate(instruction, this.currentInstruction));
        }
        return $q.when();
      }

      activate(instruction) {
        let previousInstruction = this.currentInstruction;
        this.currentInstruction = instruction;

        let componentName = this.controller.$$componentName = instruction.componentType;

        if (typeof componentName !== 'string') {
          throw new Error('Component is not a string for ' + instruction.urlPath);
        }

        this.controller.$$routeParams = instruction.params;
        this.controller.$$template =
            '<' + dashCase(componentName) + '></' + dashCase(componentName) + '>';
        this.controller.$$router = this.router.childRouter(instruction.componentType);

        let newScope = scope.$new();

        let clone = $transclude(newScope, clone => {
          $animate.enter(clone, null, this.currentElement || element);
          this.cleanupLastView();
        });

        this.currentElement = clone;
        this.currentScope = newScope;

        // TODO: prefer the other directive retrieving the controller
        // by debug mode
        this.currentController = this.currentElement.children().eq(0).controller(componentName);

        if (this.currentController && this.currentController.$onActivate) {
          return this.currentController.$onActivate(instruction, previousInstruction);
        }
        return $q.when();
      }
    }

    let parentCtrl = ctrls[0], myCtrl = ctrls[1],
        router = (parentCtrl && parentCtrl.$$router) || rootRouter;

    myCtrl.$$currentComponent = null;

    router.registerPrimaryOutlet(new Outlet(myCtrl, router));
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
    link: (scope, element, attrs, ctrl) => {
      let template = ctrl.$$template;
      element.html(template);
      let link = $compile(element.contents());
      link(scope);

      // TODO: move to primary directive
      let componentInstance = scope[ctrl.$$componentName];
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
 * ### Example
 *
 * ```js
 * angular.module('myApp', ['ngComponentRouter'])
 *   .controller('AppController', ['$router', function($router) {
 *     $router.config({ path: '/user/:id', component: 'user' });
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
  let rootRouter = $router;

  return {require: '?^^ngOutlet', restrict: 'A', link: ngLinkDirectiveLinkFn};

  function ngLinkDirectiveLinkFn(scope, element, attrs, ctrl) {
    let router = (ctrl && ctrl.$$router) || rootRouter;
    if (!router) {
      return;
    }

    let instruction = null;
    let link = attrs.ngLink || '';

    function getLink(params) {
      instruction = router.generate(params);
      return './' + angular.stringifyInstruction(instruction);
    }

    let routeParamsGetter = $parse(link);
    // we can avoid adding a watcher if it's a literal
    if (routeParamsGetter.constant) {
      let params = routeParamsGetter();
      element.attr('href', getLink(params));
    } else {
      scope.$watch(() => routeParamsGetter(scope), params => element.attr('href', getLink(params)),
                   true);
    }

    element.on('click', event => {
      if (event.which !== 1 || !instruction) {
        return;
      }

      $router.navigateByInstruction(instruction);
      event.preventDefault();
    });
  }
}

function dashCase(str: string): string {
  return str.replace(/[A-Z]/g, match => '-' + match.toLowerCase());
}

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
    .provider('$$directiveIntrospector', DirectiveIntrospectorProvider)
    .config(compilerProviderDecorator);
