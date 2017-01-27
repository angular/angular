/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

///<reference path="../typings/angularjs/angular.d.ts"/>



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
function ngOutletDirective($animate, $q: ng.IQService, $rootRouter) {
  const rootRouter = $rootRouter;

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
        const previousInstruction = this.currentInstruction;
        this.currentInstruction = instruction;
        if (this.currentController && this.currentController.$routerOnReuse) {
          next = $q.when(
              this.currentController.$routerOnReuse(this.currentInstruction, previousInstruction));
        }

        return next;
      }

      routerCanReuse(nextInstruction) {
        let result;
        if (!this.currentInstruction ||
            this.currentInstruction.componentType !== nextInstruction.componentType) {
          result = false;
        } else if (this.currentController && this.currentController.$routerCanReuse) {
          result = this.currentController.$routerCanReuse(nextInstruction, this.currentInstruction);
        } else {
          result = nextInstruction === this.currentInstruction ||
                   angular.equals(nextInstruction.params, this.currentInstruction.params);
        }
        return $q.when(result);
      }

      routerCanDeactivate(instruction) {
        if (this.currentController && this.currentController.$routerCanDeactivate) {
          return $q.when(
              this.currentController.$routerCanDeactivate(instruction, this.currentInstruction));
        }
        return $q.when(true);
      }

      deactivate(instruction) {
        if (this.currentController && this.currentController.$routerOnDeactivate) {
          return $q.when(
              this.currentController.$routerOnDeactivate(instruction, this.currentInstruction));
        }
        return $q.when();
      }

      activate(instruction) {
        this.previousInstruction = this.currentInstruction;
        this.currentInstruction = instruction;

        const componentName = this.controller.$$componentName = instruction.componentType;

        if (typeof componentName !== 'string') {
          throw new Error('Component is not a string for ' + instruction.urlPath);
        }

        this.controller.$$template = '<' + dashCase(componentName) + ' $router="::$$router"></' +
                                     dashCase(componentName) + '>';
        this.controller.$$router = this.router.childRouter(instruction.componentType);
        this.controller.$$outlet = this;

        const newScope = scope.$new();
        newScope.$$router = this.controller.$$router;
        this.deferredActivation = $q.defer();

        const clone = $transclude(newScope, clone => {});

        const activateView = () => {
          $animate.enter(clone, null, this.currentElement || element);
          this.cleanupLastView();
          this.currentElement = clone;
          this.currentScope = newScope;
        };

        return this.deferredActivation.promise.then(activateView, activateView);
      }
    }

    const parentCtrl = ctrls[0], myCtrl = ctrls[1],
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
      const template = ctrl.$$template;
      element.html(template);
      $compile(element.contents())(scope);
    }
  };
}



function routerTriggerDirective($q) {
  return {
    require: '^ngOutlet',
    priority: -1000,
    link: function(scope, element, attr, ngOutletCtrl) {
      let promise = $q.when();
      const outlet = ngOutletCtrl.$$outlet;
      const currentComponent = outlet.currentController =
          element.controller(ngOutletCtrl.$$componentName);
      if (currentComponent.$routerOnActivate) {
        promise = $q.when(currentComponent.$routerOnActivate(outlet.currentInstruction,
                                                             outlet.previousInstruction));
      }
      promise.then(outlet.deferredActivation.resolve, outlet.deferredActivation.reject);
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
 *   .controller('AppController', ['$rootRouter', function($rootRouter) {
 *     $rootRouter.config({ path: '/user/:id', component: 'user' });
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
function ngLinkDirective($rootRouter, $parse) {
  return {require: '?^^ngOutlet', restrict: 'A', link: ngLinkDirectiveLinkFn};

  function ngLinkDirectiveLinkFn(scope, element, attrs, ctrl) {
    const router = (ctrl && ctrl.$$router) || $rootRouter;
    if (!router) {
      return;
    }

    let navigationInstruction = null;
    const link = attrs.ngLink || '';

    function getLink(params) {
      if (!params) {
        return;
      }

      navigationInstruction = router.generate(params);

      scope.$watch(function() { return router.isRouteActive(navigationInstruction); },
                   function(active) {
                     if (active) {
                       element.addClass('ng-link-active');
                     } else {
                       element.removeClass('ng-link-active');
                     }
                   });

      const navigationHref = navigationInstruction.toLinkUrl();
      return $rootRouter._location.prepareExternalUrl(navigationHref);
    }

    const routeParamsGetter = $parse(link);
    // we can avoid adding a watcher if it's a literal
    if (routeParamsGetter.constant) {
      const params = routeParamsGetter();
      element.attr('href', getLink(params));
    } else {
      scope.$watch(() => routeParamsGetter(scope), params => element.attr('href', getLink(params)),
                   true);
    }

    element.on('click', event => {
      if (event.which !== 1 || !navigationInstruction) {
        return;
      }

      $rootRouter.navigateByInstruction(navigationInstruction);
      event.preventDefault();
    });
  }
}

function dashCase(str: string): string {
  return str.replace(/[A-Z]/g, match => '-' + match.toLowerCase());
}

/*
 * A module for adding new a routing system AngularJS.
 */
angular.module('ngComponentRouter', [])
    .directive('ngOutlet', ['$animate', '$q', '$rootRouter', ngOutletDirective])
    .directive('ngOutlet', ['$compile', ngOutletFillContentDirective])
    .directive('ngLink', ['$rootRouter', '$parse', ngLinkDirective])
    .directive('$router', ['$q', routerTriggerDirective]);
