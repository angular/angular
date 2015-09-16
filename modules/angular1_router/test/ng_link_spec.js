'use strict';

describe('ngOutlet', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $templateCache,
      $controllerProvider;

  var OneController, TwoController, UserController;

  beforeEach(function () {
    module('ng');
    module('ngComponentRouter');
    module(function (_$controllerProvider_) {
      $controllerProvider = _$controllerProvider_;
    });

    inject(function (_$compile_, _$rootScope_, _$router_, _$templateCache_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
      $templateCache = _$templateCache_;
    });

    UserController = registerComponent('user', '<div>hello {{user.name}}</div>', function ($routeParams) {
      this.name = $routeParams.name;
    });
    OneController = registerComponent('one', '<div>{{one.number}}</div>', boringController('number', 'one'));
    TwoController = registerComponent('two', '<div>{{two.number}}</div>', boringController('number', 'two'));
  });


  it('should allow linking from the parent to the child', function () {
    put('one', '<div>{{number}}</div>');

    $router.config([
      { path: '/a', component: OneController },
      { path: '/b', component: TwoController, as: 'Two' }
    ]);
    compile('<a ng-link="[\'/Two\']">link</a> | outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b');
  });

  it('should allow linking from the child and the parent', function () {
    put('one', '<div><a ng-link="[\'/Two\']">{{number}}</a></div>');

    $router.config([
      { path: '/a', component: OneController },
      { path: '/b', component: TwoController, as: 'Two' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b');
  });


  it('should allow params in routerLink directive', function () {
    put('router', '<div>outer { <div ng-outlet></div> }</div>');
    put('one', '<div><a ng-link="[\'/Two\', {param: \'lol\'}]">{{number}}</a></div>');

    $router.config([
      { path: '/a', component: OneController },
      { path: '/b/:param', component: TwoController, as: 'Two' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b/lol');
  });

  // TODO: test dynamic links
  it('should update the href of links with bound params', function () {
    put('router', '<div>outer { <div ng-outlet></div> }</div>');
    put('one', '<div><a ng-link="[\'/Two\', {param: one.number}]">{{one.number}}</a></div>');

    $router.config([
      { path: '/a', component: OneController },
      { path: '/b/:param', component: TwoController, as: 'Two' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b/one');
  });


  it('should navigate on left-mouse click when a link url matches a route', function () {
    $router.config([
      { path: '/', component: OneController },
      { path: '/two', component: TwoController }
    ]);

    compile('<a href="/two">link</a> | <div ng-outlet></div>');
    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');
    elt.find('a')[0].click();

    $rootScope.$digest();
    expect(elt.text()).toBe('link | two');
  });


  it('should not navigate on non-left mouse click when a link url matches a route', inject(function ($router) {
    $router.config([
      { path: '/', component: OneController },
      { path: '/two', component: TwoController }
    ]);

    compile('<a href="./two">link</a> | <div ng-outlet></div>');
    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');
    elt.find('a').triggerHandler({ type: 'click', which: 3 });

    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');
  }));


  // See https://github.com/angular/router/issues/206
  it('should not navigate a link without an href', function () {
    $router.config([
      { path: '/', component: OneController },
      { path: '/two', component: TwoController }
    ]);
    expect(function () {
      compile('<a>link</a>');
      $rootScope.$digest();
      expect(elt.text()).toBe('link');
      elt.find('a')[0].click();
      $rootScope.$digest();
    }).not.toThrow();
  });


  function registerComponent(name, template, config) {
    var Ctrl;
    if (!template) {
      template = '';
    }
    if (!config) {
      Ctrl = function () {};
    } else if (angular.isArray(config)) {
      Ctrl = function () {};
      Ctrl.annotations = [new angular.annotations.RouteConfig(config)];
    } else if (typeof config === 'function') {
      Ctrl = config;
    } else {
      Ctrl = function () {};
      if (config.canActivate) {
        Ctrl.$canActivate = config.canActivate;
        delete config.canActivate;
      }
      Ctrl.prototype = config;
    }
    $controllerProvider.register(componentControllerName(name), Ctrl);
    put(name, template);
    return Ctrl;
  }

  function boringController(model, value) {
    return function () {
      this[model] = value;
    };
  }

  function put(name, template) {
    $templateCache.put(componentTemplatePath(name), [200, template, {}]);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
