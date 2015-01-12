/*
 * This is for Angular 1.3
 */

angular.module('ngFuturisticRouter', ['ngFuturisticRouter.generated']).
  directive('routerComponent', routerComponentDirective).
  directive('routerComponent', routerComponentFillContentDirective).
  value('routeParams', {}).
  provider('componentLoader', componentLoaderProvider).
  directive('routerViewPort', routerViewPortDirective).
  directive('routerLink', routerLinkDirective);

/*
 * A component is:
 * - a controller
 * - a template
 * - an optional router
 *
 * This directive makes it easy to group all of them into a single concept
 *
 *
 */
function routerComponentDirective($animate, $controller, $compile, $rootScope, $location, $templateRequest, router, componentLoader) {
  $rootScope.$watch(function () {
    return $location.path();
  }, function (newUrl) {
    router.navigate(newUrl);
  });

  var nav = router.navigate;
  router.navigate = function (url) {
    return nav.call(this, url).then(function () {
      $location.path(url);
    });
  }

  return {
    restrict: 'AE',
    scope: {},
    priority: 400,
    transclude: 'element',
    require: ['?^^routerComponent', '?^^routerViewPort', 'routerComponent'],
    link: routerComponentLinkFn,
    controller: function () {},
    controllerAs: '$$routerComponentController'
  };

  function routerComponentLinkFn(scope, elt, attrs, ctrls, $transclude) {
    var parentComponentCtrl = ctrls[0],
        viewPortCtrl = ctrls[1],
        myOwnRouterComponentCtrl= ctrls[2];

    var childRouter = (parentComponentCtrl && parentComponentCtrl.$$router && parentComponentCtrl.$$router.childRouter()) || router;
    var parentRouter = childRouter.parent || childRouter;

    var componentName = attrs.routerComponent || attrs.componentName;

    var component = componentLoader(componentName);

    // build up locals for controller
    var childScope = scope.$new();
    var locals = {
      $scope: childScope
    };

    if (parentRouter.context) {
      locals.routeParams = parentRouter.context.params;
    }

    scope.$$routerComponentController.$$router = locals.router = childRouter;

    // TODO: the pipeline should probably be responsible for creating this...
    var controllerName = component.controllerName;
    var ctrl = $controller(controllerName, locals);
    childScope[componentName] = ctrl;

    if (!ctrl.canActivate || ctrl.canActivate()) {
      var componentTemplateUrl = component.template;
      $templateRequest(componentTemplateUrl).
          then(function(templateHtml) {

            myOwnRouterComponentCtrl.template = templateHtml;

            var clone = $transclude(childScope, function(clone) {
              $animate.enter(clone, null, elt);
            });

            if (ctrl.activate) {
              ctrl.activate();
            }
            if (ctrl.canDeactivate) {
              viewPortCtrl.canDeactivate = function (){
                return ctrl.canDeactivate();
              }
            }
          });
    }

  }
}


function routerComponentFillContentDirective($compile) {
  return {
    restrict: 'AE',
    priority: -400,
    require: 'routerComponent',
    link: function(scope, $element, $attr, ctrl) {
      $element.html(ctrl.template);
      $compile($element.contents())(scope);
    }
  };
};



/*
 * ## `<router-view-port>`
 * Responsibile for wiring up stuff
 * needs to appear inside of a routerComponent
 *
 * Use:
 *
 * ```html
 * <div router-view-port="name"></div>
 * ```
 *
 * The value for the routerViewComponent is optional
 */
function routerViewPortDirective($animate, $compile, $templateRequest, componentLoader) {
  return {
    restrict: 'AE',
    require: '^^routerComponent',
    link: viewPortLink,
    controller: function() {},
    controllerAs: '$$routerViewPort'
  };

  function viewPortLink(scope, elt, attrs, ctrl) {
    var router = ctrl.$$router;

    var name = attrs.routerViewPort || 'default';

    router.registerViewPort({
      activate: function (instruction) {
        var component = instruction[0].handler.component;
        var componentName = typeof component === 'string' ? component : component[name];

        var template = makeComponentString(componentName);
        var oldContents = elt.contents();

        if (oldContents.length) {
          oldContents.remove();
        }

        elt.html(template);
        var link = $compile(elt.contents());
        ctrl.$$router.context = instruction[0];
        link(scope.$new());

        if (oldContents.length) {
          elt.append(oldContents);
          $animate.leave(oldContents);
        }

        // TODO: this is a hack to avoid ordering constraint issues
        return $templateRequest(componentLoader(componentName).template);
      },
      canDeactivate: function (instruction) {
        return !scope.$$routerViewPort.canDeactivate || scope.$$routerViewPort.canDeactivate();
      }
    }, name);
  }
}

function makeComponentString(name) {
  return [
    '<router-component component-name="', name, '">',
    '</router-component>'
  ].join('');
}

var SOME_RE = /^(.+?)(?:\((.*)\))?$/;

function routerLinkDirective(router, $location, $parse) {
  var rootRouter = router;

  return {
    require: '^^routerComponent',
    restrict: 'A',
    link: routerLinkDirectiveLinkFn
  };


  function routerLinkDirectiveLinkFn(scope, elt, attrs, ctrl) {
    var router = ctrl && ctrl.$$router;
    if (!router) {
      return;
    }

    var link = attrs.routerLink || '';
    var parts = link.match(SOME_RE);
    var routeName = parts[1];
    var routeParams = parts[2];
    var url;

    if (routeParams) {
      var routeParamsGetter = $parse(routeParams);
      // we can avoid adding a watcher if it's a literal
      if (routeParamsGetter.constant) {
        var params = routeParamsGetter();
        url = router.generate(routeName, params);
        elt.attr('href', url);
      } else {
        scope.$watch(function() {
          return routeParamsGetter(scope, ctrl.one);
        }, function(params) {
          url = router.generate(routeName, params);
          elt.attr('href', url);
        }, true);
      }
    } else {
      url = router.generate(routeName);
      elt.attr('href', url);
    }

    elt.on('click', function (ev) {
      ev.preventDefault();
      rootRouter.navigate(url);
    });
  }

}

/*
 * This lets you set up your ~conventions~
 */
function componentLoaderProvider() {
  var componentToCtrl = function componentToCtrlDefault(name) {
    return name[0].toUpperCase() +
        name.substr(1) +
        'Controller';
  };

  var componentToTemplate = function componentToTemplateDefault(name) {
    var dashName = dashCase(name);
    return 'components/' + dashName + '/' + dashName + '.html';
  };

  function componentLoader(name) {
    return {
      controllerName: componentToCtrl(name),
      template: componentToTemplate(name),
    };
  }

  return {
    $get: function () {
      return componentLoader;
    },
    setCtrlNameMapping: function(newFn) {
      componentToCtrl = newFn;
    },
    setTemplateMapping: function(newFn) {
      componentToTemplate = newFn;
    }
  };
}

function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return '-' + $1.toLowerCase();
  });
}
