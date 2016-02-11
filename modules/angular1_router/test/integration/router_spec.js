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

  it('should bind the component to the current router', inject(function($location) {
    var router;
    registerComponent('homeCmp', {
      bindings: { router: '=' },
      controller: function($scope, $element) {
        this.$routerOnActivate = function() {
          router = this.router;
        };
      },
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
    var homeElement = elt.find('home-cmp');
    expect(homeElement.text()).toBe('Home');
    expect(homeElement.isolateScope().$ctrl.router).toBeDefined();
    expect(router).toBeDefined();
  }));

  it('should work when an async route is provided route data', inject(function($location, $q) {
    registerDirective('homeCmp', {
      template: 'Home ({{homeCmp.isAdmin}})',
      $routerOnActivate: function(next, prev) {
        this.isAdmin = next.routeData.data.isAdmin;
      }
    });

    registerDirective('app', {
      template: '<div ng-outlet></div>',
      $routeConfig: [
        { path: '/', loader: function() { return $q.when('homeCmp'); }, data: { isAdmin: true } }
      ]
    });

    compile('<app></app>');

    $location.path('/');
    $rootScope.$digest();
    expect(elt.text()).toBe('Home (true)');
  }));

  it('should work with a templateUrl component', inject(function($location, $httpBackend) {
    var $routerOnActivate = jasmine.createSpy('$routerOnActivate');
    $httpBackend.expectGET('homeCmp.html').respond('Home');
    registerComponent('homeCmp', {
      templateUrl: 'homeCmp.html',
      $routerOnActivate: $routerOnActivate
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
    $httpBackend.flush();
    var homeElement = elt.find('home-cmp');
    expect(homeElement.text()).toBe('Home');
    expect($routerOnActivate).toHaveBeenCalled();
  }));


  function registerDirective(name, options) {
    function factory() {
      return {
        template: options.template || '',
        controllerAs: name,
        controller: getController(options)
      };
    }
    applyStaticProperties(factory, options);
    $compileProvider.directive(name, factory);
  }

  function registerComponent(name, options) {

    var definition = {
      bindings: options.bindings,
      controller: getController(options),
    };
    if (options.template) {
      definition.template = options.template;
    }
    if (options.templateUrl) {
      definition.templateUrl = options.templateUrl;
    }

    applyStaticProperties(definition, options);
    $compileProvider.component(name, definition);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }

  function getController(options) {
    var controller = options.controller || function () {};
    [
      '$routerOnActivate', '$routerOnDeactivate',
      '$routerOnReuse', '$routerCanReuse',
      '$routerCanDeactivate'
    ].forEach(function (hookName) {
      if (options[hookName]) {
        controller.prototype[hookName] = options[hookName];
      }
    });
    return controller;
  }

  function applyStaticProperties(target, options) {
    ['$canActivate', '$routeConfig'].forEach(function(property) {
      if (options[property]) {
        target[property] = options[property];
      }
    });
  }
});
