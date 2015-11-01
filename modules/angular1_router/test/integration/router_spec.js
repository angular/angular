'use strict';

describe('router', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $compileProvider;

  beforeEach(function () {
    module('ng');
    module('ngComponentRouter');
    module(function($provide) {
      $provide.value('$routerRootComponent', 'app');
    });
    module(function (_$compileProvider_) {
      $compileProvider = _$compileProvider_;
    });

    inject(function (_$compile_, _$rootScope_, _$router_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
    });
  });

  it('should work with a provided root component', inject(function($location) {
    registerComponent('homeCmp', {
      template: 'Home'
    });

    registerComponent('app', {
      template: '<div ng-outlet></div>',
      $routeConfig: [
        { path: '/', component: 'homeCmp' }
      ]
    });

    compile('<app></app>');

    $location.path('/');
    $rootScope.$digest();
    expect(elt.text()).toBe('Home');
  }));

  function registerComponent(name, options) {
    var controller = options.controller || function () {};

    ['$onActivate', '$onDeactivate', '$onReuse', '$canReuse', '$canDeactivate'].forEach(function (hookName) {
      if (options[hookName]) {
        controller.prototype[hookName] = options[hookName];
      }
    });

    function factory() {
      return {
        template: options.template || '',
        controllerAs: name,
        controller: controller
      };
    }

    if (options.$canActivate) {
      factory.$canActivate = options.$canActivate;
    }
    if (options.$routeConfig) {
      factory.$routeConfig = options.$routeConfig;
    }

    $compileProvider.directive(name, factory);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
