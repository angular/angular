'use strict';

describe('navigation', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $templateCache,
      $controllerProvider,
      $componentMapperProvider;

  var OneController, TwoController, UserController;


  beforeEach(function () {
    module('ng');
    module('ngComponentRouter');
    module(function (_$controllerProvider_, _$componentMapperProvider_) {
      $controllerProvider = _$controllerProvider_;
      $componentMapperProvider = _$componentMapperProvider_;
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


  it('should work in a simple case', function () {
    compile('<ng-outlet></ng-outlet>');

    $router.config([
      { path: '/', component: OneController }
    ]);

    $router.navigateByUrl('/');
    $rootScope.$digest();

    expect(elt.text()).toBe('one');
  });


  // See https://github.com/angular/router/issues/105
  xit('should warn when instantiating a component with no controller', function () {
    put('noController', '<div>{{ 2 + 2 }}</div>');
    $router.config([
      { path: '/', component: 'noController' }
    ]);

    spyOn(console, 'warn');
    compile('<ng-outlet></ng-outlet>');
    $router.navigateByUrl('/');

    expect(console.warn).toHaveBeenCalledWith('Could not find controller for', 'NoControllerController');
    expect(elt.text()).toBe('4');
  });


  it('should navigate between components with different parameters', function () {
    $router.config([
      { path: '/user/:name', component: UserController }
    ]);
    compile('<ng-outlet></ng-outlet>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello brian');

    $router.navigateByUrl('/user/igor');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello igor');
  });


  it('should not reactivate a parent when navigating between child components with different parameters', function () {
    var spy = jasmine.createSpy('onActivate');
    function ParentController() {}
    ParentController.$routeConfig = [
      { path: '/user/:name', component: UserController }
    ];
    ParentController.prototype.onActivate = spy;

    registerComponent('parent', 'parent { <ng-outlet></ng-outlet> }', ParentController);

    $router.config([
      { path: '/parent/...', component: ParentController }
    ]);
    compile('<ng-outlet></ng-outlet>');

    $router.navigateByUrl('/parent/user/brian');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('parent { hello brian }');

    spy.calls.reset();

    $router.navigateByUrl('/parent/user/igor');
    $rootScope.$digest();
    expect(spy).not.toHaveBeenCalled();
    expect(elt.text()).toBe('parent { hello igor }');
  });


  it('should work with nested outlets', function () {
    var childComponent = registerComponent('childComponent', '<div>inner { <div ng-outlet></div> }</div>', [
      { path: '/b', component: OneController }
    ]);

    $router.config([
      { path: '/a/...', component: childComponent }
    ]);
    compile('<div>outer { <div ng-outlet></div> }</div>');

    $router.navigateByUrl('/a/b');
    $rootScope.$digest();

    expect(elt.text()).toBe('outer { inner { one } }');
  });


  it('should work with recursive nested outlets', function () {
    put('two', '<div>recur { <div ng-outlet></div> }</div>');
    $router.config([
      { path: '/recur', component: TwoController },
      { path: '/', component: OneController }
    ]);

    compile('<div>root { <div ng-outlet></div> }</div>');
    $router.navigateByUrl('/');
    $rootScope.$digest();
    expect(elt.text()).toBe('root { one }');
  });

  it('should inject $scope into the controller constructor', function () {
    var injectedScope;
    var UserController = registerComponent('user', '', function ($scope) {
      injectedScope = $scope;
    });

    $router.config([
      { path: '/user', component: UserController }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user');
    $rootScope.$digest();

    expect(injectedScope).toBeDefined();
  });


  it('should change location path', inject(function ($location) {
    $router.config([
      { path: '/user', component: UserController }
    ]);

    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user');
    $rootScope.$digest();

    expect($location.path()).toBe('/user');
  }));


  it('should change location to the canonical route', inject(function ($location) {
    compile('<div ng-outlet></div>');

    $router.config([
      { path: '/',     redirectTo: '/user' },
      { path: '/user', component:  UserController }
    ]);

    $router.navigateByUrl('/');
    $rootScope.$digest();

    expect($location.path()).toBe('/user');
  }));


  it('should change location to the canonical route with nested components', inject(function ($location) {
    var childRouter = registerComponent('childRouter', '<div>inner { <div ng-outlet></div> }</div>', [
      { path: '/old-child', redirectTo: '/new-child' },
      { path: '/new-child', component: OneController},
      { path: '/old-child-two', redirectTo: '/new-child-two' },
      { path: '/new-child-two', component: TwoController}
    ]);

    $router.config([
      { path: '/old-parent', redirectTo: '/new-parent' },
      { path: '/new-parent/...', component:  childRouter }
    ]);

    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/old-parent/old-child');
    $rootScope.$digest();

    expect($location.path()).toBe('/new-parent/new-child');
    expect(elt.text()).toBe('inner { one }');

    $router.navigateByUrl('/old-parent/old-child-two');
    $rootScope.$digest();

    expect($location.path()).toBe('/new-parent/new-child-two');
    expect(elt.text()).toBe('inner { two }');
  }));


  it('should navigate when the location path changes', inject(function ($location) {
    $router.config([
      { path: '/one', component: OneController }
    ]);
    compile('<div ng-outlet></div>');

    $location.path('/one');
    $rootScope.$digest();

    expect(elt.text()).toBe('one');
  }));


  it('should expose a "navigating" property on $router', inject(function ($q) {
    var defer;
    var pendingActivate = registerComponent('pendingActivate', '', {
      onActivate: function () {
        defer = $q.defer();
        return defer.promise;
      }
    });
    $router.config([
      { path: '/pendingActivate', component: pendingActivate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/pendingActivate');
    $rootScope.$digest();
    expect($router.navigating).toBe(true);
    defer.resolve();
    $rootScope.$digest();
    expect($router.navigating).toBe(false);
  }));


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
