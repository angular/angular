'use strict';

describe('ngLink', function () {

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

    registerComponent('userCmp', '<div>hello {{userCmp.$routeParams.name}}</div>', function () {});
    registerComponent('oneCmp', '<div>{{oneCmp.number}}</div>', function () {this.number = 'one'});
    registerComponent('twoCmp', '<div><a ng-link="[\'/Two\']">{{twoCmp.number}}</a></div>', function () {this.number = 'two'});
  });


  it('should allow linking from the parent to the child', function () {
    $router.config([
      { path: '/a', component: 'oneCmp' },
      { path: '/b', component: 'twoCmp', name: 'Two' }
    ]);
    compile('<a ng-link="[\'/Two\']">link</a> | outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b');
  });

  it('should allow linking from the child and the parent', function () {
    $router.config([
      { path: '/a', component: 'oneCmp' },
      { path: '/b', component: 'twoCmp', name: 'Two' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/b');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b');
  });


  it('should allow params in routerLink directive', function () {
    registerComponent('twoLinkCmp', '<div><a ng-link="[\'/Two\', {param: \'lol\'}]">{{twoLinkCmp.number}}</a></div>', function () {this.number = 'two'});

    $router.config([
      { path: '/a', component: 'twoLinkCmp' },
      { path: '/b/:param', component: 'twoCmp', name: 'Two' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b/lol');
  });


  it('should update the href of links with bound params', function () {
    registerComponent('twoLinkCmp', '<div><a ng-link="[\'/Two\', {param: twoLinkCmp.number}]">{{twoLinkCmp.number}}</a></div>', function () {this.number = 'param'});
    $router.config([
      { path: '/a', component: 'twoLinkCmp' },
      { path: '/b/:param', component: 'twoCmp', name: 'Two' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(elt.find('a').attr('href')).toBe('./b/param');
  });


  it('should navigate on left-mouse click when a link url matches a route', function () {
    $router.config([
      { path: '/', component: 'oneCmp' },
      { path: '/two', component: 'twoCmp', name: 'Two'}
    ]);

    compile('<a ng-link="[\'/Two\']">link</a> | <div ng-outlet></div>');
    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');

    expect(elt.find('a').attr('href')).toBe('./two');

    elt.find('a')[0].click();

    $rootScope.$digest();
    expect(elt.text()).toBe('link | two');
  });


  it('should not navigate on non-left mouse click when a link url matches a route', inject(function ($router) {
    $router.config([
      { path: '/', component: 'oneCmp' },
      { path: '/two', component: 'twoCmp', name: 'Two'}
    ]);

    compile('<a ng-link="[\'/Two\']">link</a> | <div ng-outlet></div>');
    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');
    elt.find('a').triggerHandler({ type: 'click', which: 3 });

    $rootScope.$digest();
    expect(elt.text()).toBe('link | one');
  }));


  // See https://github.com/angular/router/issues/206
  it('should not navigate a link without an href', function () {
    $router.config([
      { path: '/', component: 'oneCmp' },
      { path: '/two', component: 'twoCmp', name: 'Two'}
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
    var controller = function () {};

    function factory() {
      return {
        template: template,
        controllerAs: name,
        controller: controller
      };
    }

    if (!template) {
      template = '';
    }
    if (angular.isArray(config)) {
      factory.annotations = [new angular.annotations.RouteConfig(config)];
    } else if (typeof config === 'function') {
      controller = config;
    } else if (typeof config === 'object') {
      if (config.canActivate) {
        controller.$canActivate = config.canActivate;
      }
    }
    $compileProvider.directive(name, factory);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
