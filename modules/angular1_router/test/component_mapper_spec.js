'use strict';

describe('$componentMapper', function () {
  var elt,
      $compile,
      $rootScope,
      $router,
      $templateCache;

  beforeEach(function() {
    module('ng');
    module('ngComponentRouter');
  });

  it('should convert a component name to a controller name', inject(function ($componentMapper) {
    expect($componentMapper.controllerName('foo')).toBe('FooController');
  }));

  it('should convert a controller name to a component name', inject(function ($componentMapper) {
    expect($componentMapper.component('FooController')).toBe('foo');
  }));

  it('should convert a component name to a template URL', inject(function ($componentMapper) {
    expect($componentMapper.template('foo')).toBe('./components/foo/foo.html');
  }));

  it('should work with a controller constructor fn and a template url', inject(function ($componentMapper) {
    var routes = {};
    $componentMapper.setCtrlNameMapping(function (name) {
      return routes[name].controller;
    });
    $componentMapper.setTemplateMapping(function (name) {
      return routes[name].templateUrl;
    });
    $componentMapper.setCtrlAsMapping(function (name) {
      return 'ctrl';
    });

    routes.myComponent = {
      controller: Ctrl,
      templateUrl: '/foo'
    };

    inject(function(_$compile_, _$rootScope_, _$router_, _$templateCache_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
      $templateCache = _$templateCache_;
    });

    $templateCache.put('/foo', [200, '{{ctrl.message}}', {}]);
    function Ctrl() {
      this.message = 'howdy';
    };

    compile('<ng-outlet></ng-outlet>');

    $router.config([
      { path: '/', component: 'myComponent' }
    ]);

    $router.navigate('/');
    $rootScope.$digest();

    expect(elt.text()).toBe('howdy');
  }));

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
