'use strict';

describe('ngOutlet animations', function () {
  var elt,
      $animate,
      $compile,
      $rootScope,
      $router,
      $templateCache,
      $controllerProvider;

  function UserController($routeParams) {
    this.name = $routeParams.name;
  }

  beforeEach(function () {
    module('ngAnimate');
    module('ngAnimateMock');
    module('ngComponentRouter');
    module(function (_$controllerProvider_) {
      $controllerProvider = _$controllerProvider_;
    });

    inject(function (_$animate_, _$compile_, _$rootScope_, _$router_, _$templateCache_) {
      $animate = _$animate_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
      $templateCache = _$templateCache_;
    });

    put('user', '<div>hello {{user.name}}</div>');
    $controllerProvider.register('UserController', UserController);
  });

  afterEach(function () {
    expect($animate.queue).toEqual([]);
  });

  it('should work in a simple case', function () {
    var item;

    compile('<div ng-outlet></div>');

    $router.config([
      { path: '/user/:name', component: UserController }
    ]);

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello brian');

    // "user" component enters
    item = $animate.queue.shift();
    expect(item.event).toBe('enter');

    // navigate to pete
    $router.navigateByUrl('/user/pete');
    $rootScope.$digest();
    expect(elt.text()).toBe('hello pete');

    // "user pete" component enters
    item = $animate.queue.shift();
    expect(item.event).toBe('enter');
    expect(item.element.text()).toBe('hello pete');

    // "user brian" component leaves
    item = $animate.queue.shift();
    expect(item.event).toBe('leave');
    expect(item.element.text()).toBe('hello brian');
  });

  function put(name, template) {
    $templateCache.put(componentTemplatePath(name), [200, template, {}]);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
