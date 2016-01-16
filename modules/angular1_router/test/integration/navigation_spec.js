'use strict';

describe('navigation', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $compileProvider;

  beforeEach(function () {
    module('ng');
    module('ngComponentRouter');
    module(function (_$compileProvider_) {
      $compileProvider = _$compileProvider_;
    });

    inject(function (_$compile_, _$rootScope_, _$router_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
    });

    registerComponent('userCmp', {
      template: '<div>hello {{userCmp.$routeParams.name}}</div>'
    });
    registerComponent('oneCmp', {
      template: '<div>{{oneCmp.number}}</div>',
      controller: function () {this.number = 'one'}
    });
    registerComponent('twoCmp', {
      template: '<div>{{twoCmp.number}}</div>',
      controller: function () {this.number = 'two'}
    });
  });

  it('should work in a simple case', function () {
    compile('<ng-outlet></ng-outlet>');

    $router.config([
      { path: '/', component: 'oneCmp' }
    ]);

    $router.navigateByUrl('/');
    $rootScope.$digest();

    expect(elt.text()).toBe('one');
  });

  it('should navigate between components with different parameters', function () {
    $router.config([
      { path: '/user/:name', component: 'userCmp' }
    ]);
    compile('<ng-outlet></ng-outlet>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello brian');

    $router.navigateByUrl('/user/igor');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello igor');
  });


  it('should reuse a parent when navigating between child components with different parameters', function () {
    var instanceCount = 0;
    function ParentController() {
      instanceCount += 1;
    }
    registerComponent('parentCmp', {
      template: 'parent { <ng-outlet></ng-outlet> }',
      $routeConfig: [
        { path: '/user/:name', component: 'userCmp' }
      ],
      controller: ParentController
    });

    $router.config([
      { path: '/parent/...', component: 'parentCmp' }
    ]);
    compile('<ng-outlet></ng-outlet>');

    $router.navigateByUrl('/parent/user/brian');
    $rootScope.$digest();
    expect(instanceCount).toBe(1);
    expect(elt.text()).toBe('parent { hello brian }');

    $router.navigateByUrl('/parent/user/igor');
    $rootScope.$digest();
    expect(instanceCount).toBe(1);
    expect(elt.text()).toBe('parent { hello igor }');
  });


  it('should work with nested outlets', function () {
    registerComponent('childCmp', {
      template: '<div>inner { <div ng-outlet></div> }</div>',
      $routeConfig: [
        { path: '/b', component: 'oneCmp' }
      ]
    });

    $router.config([
      { path: '/a/...', component: 'childCmp' }
    ]);
    compile('<div>outer { <div ng-outlet></div> }</div>');

    $router.navigateByUrl('/a/b');
    $rootScope.$digest();

    expect(elt.text()).toBe('outer { inner { one } }');
  });


  it('should work with recursive nested outlets', function () {
    registerComponent('recurCmp', {
      template: '<div>recur { <div ng-outlet></div> }</div>',
      $routeConfig: [
        { path: '/recur', component: 'recurCmp' },
        { path: '/end', component: 'oneCmp' }
      ]});

    $router.config([
      { path: '/recur', component: 'recurCmp' },
      { path: '/', component: 'oneCmp' }
    ]);

    compile('<div>root { <div ng-outlet></div> }</div>');
    $router.navigateByUrl('/recur/recur/end');
    $rootScope.$digest();
    expect(elt.text()).toBe('root { one }');
  });


  it('should change location path', inject(function ($location) {
    $router.config([
      { path: '/user', component: 'userCmp' }
    ]);

    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user');
    $rootScope.$digest();

    expect($location.path()).toBe('/user');
  }));


  it('should change location to the canonical route', inject(function ($location) {
    compile('<div ng-outlet></div>');

    $router.config([
      { path: '/',     redirectTo: ['/User'] },
      { path: '/user', component:  'userCmp', name: 'User' }
    ]);

    $router.navigateByUrl('/');
    $rootScope.$digest();

    expect($location.path()).toBe('/user');
  }));


  it('should change location to the canonical route with nested components', inject(function ($location) {
    registerComponent('childRouter', {
      template: '<div>inner { <div ng-outlet></div> }</div>',
      $routeConfig: [
        { path: '/new-child', component: 'oneCmp', name: 'NewChild'},
        { path: '/new-child-two', component: 'twoCmp', name: 'NewChildTwo'}
      ]
    });

    $router.config([
      { path: '/old-parent/old-child', redirectTo: ['/NewParent', 'NewChild'] },
      { path: '/old-parent/old-child-two', redirectTo: ['/NewParent', 'NewChildTwo'] },
      { path: '/new-parent/...', component:  'childRouter', name: 'NewParent' }
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
      { path: '/one', component: 'oneCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $location.path('/one');
    $rootScope.$digest();

    expect(elt.text()).toBe('one');
  }));


  it('should expose a "navigating" property on $router', inject(function ($q) {
    var defer;
    registerComponent('pendingActivate', {
      $canActivate: function () {
        defer = $q.defer();
        return defer.promise;
      }
    });
    $router.config([
      { path: '/pending-activate', component: 'pendingActivate' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/pending-activate');
    $rootScope.$digest();
    expect($router.navigating).toBe(true);
    defer.resolve();
    $rootScope.$digest();
    expect($router.navigating).toBe(false);
  }));

  function registerComponent(name, options) {
    var controller = options.controller || function () {};

    ['$routerOnActivate', '$routerOnDeactivate', '$routerOnReuse', '$routerCanReuse', '$routerCanDeactivate'].forEach(function (hookName) {
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
