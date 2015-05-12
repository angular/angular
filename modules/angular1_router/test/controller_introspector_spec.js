'use strict';

describe('$$controllerIntrospector', function () {

  var $controllerProvider;

  beforeEach(function() {
    module('ng');
    module('ngComponentRouter');
    module(function(_$controllerProvider_) {
      $controllerProvider = _$controllerProvider_;
    });
  });

  it('should call the introspector function whenever a controller is registered', inject(function ($$controllerIntrospector) {
    var spy = jasmine.createSpy();
    $$controllerIntrospector(spy);
    function Ctrl(){}
    $controllerProvider.register('SomeController', Ctrl);

    expect(spy).toHaveBeenCalledWith('some', Ctrl);
  }));

  it('should call the introspector function whenever a controller is registered with array annotations', inject(function ($$controllerIntrospector) {
    var spy = jasmine.createSpy();
    $$controllerIntrospector(spy);
    function Ctrl(foo){}
    $controllerProvider.register('SomeController', ['foo', Ctrl]);

    expect(spy).toHaveBeenCalledWith('some', Ctrl);
  }));

  it('should retrieve a constructor', inject(function ($$controllerIntrospector) {
    function Ctrl(foo){}
    $controllerProvider.register('SomeController', ['foo', Ctrl]);
    expect($$controllerIntrospector.getTypeByName('SomeController')).toBe(Ctrl);
  }));
});
