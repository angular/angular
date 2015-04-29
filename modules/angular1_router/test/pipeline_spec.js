'use strict';

describe('$pipeline', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $templateCache,
      $controllerProvider;

  beforeEach(function() {
    module('ng');
    module('ngComponentRouter');
    module(function(_$controllerProvider_) {
      $controllerProvider = _$controllerProvider_;
    });
  });

  it('should allow reconfiguration', function () {
    module(function($pipelineProvider, $provide) {
      $pipelineProvider.config([
        '$setupRoutersStep',
        '$initLocalsStep',
        'myCustomStep',
        '$runCanDeactivateHookStep',
        '$runCanActivateHookStep',
        '$loadTemplatesStep',
        '$activateStep'
      ]);

      $provide.value('myCustomStep', function (instruction) {
        return instruction.traverseSync(function (parent, instruction) {
          return instruction.locals.custom = 'hello!'
        });
      });
    });

    inject(function(_$compile_, _$rootScope_, _$router_, _$templateCache_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
      $templateCache = _$templateCache_;
    });

    put('one', '<div>{{one.custom}}</div>');
    $controllerProvider.register('OneController', function () {
      this.custom = 'hello!';
    });

    $router.config([
      { path: '/', component: 'one' }
    ]);

    compile('<ng-outlet></ng-outlet>');

    $router.navigate('/');
    $rootScope.$digest();

    expect(elt.text()).toBe('hello!');
  });

  function put (name, template) {
    $templateCache.put(componentTemplatePath(name), [200, template, {}]);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }
});
