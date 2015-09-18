'use strict';

describe('$$directiveIntrospector', function () {

  var $compileProvider;

  beforeEach(function() {
    module('ng');
    module('ngComponentRouter');
    module(function(_$compileProvider_) {
      $compileProvider = _$compileProvider_;
    });
  });

  it('should call the introspector function whenever a directive factory is registered', inject(function ($$directiveIntrospector) {
    var spy = jasmine.createSpy();
    $$directiveIntrospector(spy);
    function myDir(){}
    $compileProvider.directive('myDir', myDir);

    expect(spy).toHaveBeenCalledWith('myDir', myDir);
  }));

  it('should call the introspector function whenever a directive factory is registered with array annotations', inject(function ($$directiveIntrospector) {
    var spy = jasmine.createSpy();
    $$directiveIntrospector(spy);
    function myDir(){}
    $compileProvider.directive('myDir', ['foo', myDir]);

    expect(spy).toHaveBeenCalledWith('myDir', myDir);
  }));

  it('should retrieve a factory based on directive name', inject(function ($$directiveIntrospector) {
    function myDir(){}
    $compileProvider.directive('myDir', ['foo', myDir]);
    expect($$directiveIntrospector.getTypeByName('myDir')).toBe(myDir);
  }));
});
