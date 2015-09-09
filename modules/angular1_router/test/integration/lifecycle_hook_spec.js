'use strict';

describe('ngOutlet', function () {

  var elt,
      $compile,
      $rootScope,
      $router,
      $templateCache,
      $controllerProvider,
      $componentMapperProvider;

  var OneController, TwoController, UserController;

  function instructionFor(componentType) {
    return jasmine.objectContaining({componentType: componentType});
  }


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


  it('should run the activate hook of controllers', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', '', {
      onActivate: spy
    });

    $router.config([
      { path: '/a', component: activate }
    ]);
    compile('<div>outer { <div ng-outlet></div> }</div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });


  it('should pass instruction into the activate hook of a controller', function () {
    var spy = jasmine.createSpy('activate');
    var UserController = registerComponent('user', '', {
      onActivate: spy
    });

    $router.config([
      { path: '/user/:name', component: UserController }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalledWith(instructionFor(UserController), undefined);
  });


  it('should pass previous instruction into the activate hook of a controller', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', '', {
      onActivate: spy
    });

    $router.config([
      { path: '/user/:name', component: OneController },
      { path: '/post/:id', component: activate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor(activate),
                                     instructionFor(OneController));
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


  it('should run the deactivate hook of controllers', function () {
    var spy = jasmine.createSpy('deactivate');
    var deactivate = registerComponent('deactivate', '', {
      onDeactivate: spy
    });

    $router.config([
      { path: '/a', component: deactivate },
      { path: '/b', component: OneController }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalled();
  });


  it('should pass instructions into the deactivate hook of controllers', function () {
    var spy = jasmine.createSpy('deactivate');
    var deactivate = registerComponent('deactivate', '', {
      onDeactivate: spy
    });

    $router.config([
      { path: '/user/:name', component: deactivate },
      { path: '/post/:id', component: OneController }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor(OneController),
                                     instructionFor(deactivate));
  });


  it('should run the deactivate hook before the activate hook', function () {
    var log = [];

    var activate = registerComponent('activate', '', {
      onActivate: function () {
        log.push('activate');
      }
    });

    var deactivate = registerComponent('deactivate', '', {
      onDeactivate: function () {
        log.push('deactivate');
      }
    });

    $router.config([
      { path: '/a', component: deactivate },
      { path: '/b', component: activate }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    $router.navigateByUrl('/b');
    $rootScope.$digest();

    expect(log).toEqual(['deactivate', 'activate']);
  });


  it('should reuse a component when the canReuse hook returns true', function () {
    var log = [];
    var cmpInstanceCount = 0;

    function ReuseCmp() {
      cmpInstanceCount++;
      this.canReuse = function () {
        return true;
      };
      this.onReuse = function (next, prev) {
        log.push('reuse: ' + prev.urlPath + ' -> ' + next.urlPath);
      };
    }
    ReuseCmp.$routeConfig = [{path: '/a', component: OneController}, {path: '/b', component: TwoController}];
    registerComponent('reuse', 'reuse {<ng-outlet></ng-outlet>}', ReuseCmp);

    $router.config([
      { path: '/on-reuse/:number/...', component: ReuseCmp }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/on-reuse/1/a');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {one} }');

    $router.navigateByUrl('/on-reuse/2/b');
    $rootScope.$digest();
    expect(log).toEqual(['reuse: on-reuse/1 -> on-reuse/2']);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {two} }');
  });


  it('should not reuse a component when the canReuse hook returns false', function () {
    var log = [];
    var cmpInstanceCount = 0;

    function NeverReuseCmp() {
      cmpInstanceCount++;
      this.canReuse = function () {
        return false;
      };
      this.onReuse = function (next, prev) {
        log.push('reuse: ' + prev.urlPath + ' -> ' + next.urlPath);
      };
    }
    NeverReuseCmp.$routeConfig = [{path: '/a', component: OneController}, {path: '/b', component: TwoController}];
    registerComponent('reuse', 'reuse {<ng-outlet></ng-outlet>}', NeverReuseCmp);

    $router.config([
      { path: '/never-reuse/:number/...', component: NeverReuseCmp }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/never-reuse/1/a');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {one} }');

    $router.navigateByUrl('/never-reuse/2/b');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(2);
    expect(elt.text()).toBe('outer { reuse {two} }');
  });


  it('should not activate a component when canActivate returns false', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', '', {
      canActivate: function () {
        return false;
      },
      onActivate: spy
    });

    $router.config([
      { path: '/a', component: activate }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).not.toHaveBeenCalled();
    expect(elt.text()).toBe('outer {  }');
  });


  it('should activate a component when canActivate returns true', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', 'hi', {
      canActivate: function () {
        return true;
      },
      onActivate: spy
    });

    $router.config([
      { path: '/a', component: activate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  });


  it('should activate a component when canActivate returns a resolved promise', inject(function ($q) {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', 'hi', {
      canActivate: function () {
        return $q.when(true);
      },
      onActivate: spy
    });

    $router.config([
      { path: '/a', component: activate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  }));


  it('should inject into the canActivate hook of controllers', inject(function ($http) {
    var spy = jasmine.createSpy('canActivate').and.returnValue(true);
    var activate = registerComponent('activate', '', {
      canActivate: spy
    });

    spy.$inject = ['$routeParams', '$http'];

    $router.config([
      { path: '/user/:name', component: activate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith({name: 'brian'}, $http);
  }));


  it('should not navigate when canDeactivate returns false', function () {
    var activate = registerComponent('activate', 'hi', {
      canDeactivate: function () {
        return false;
      }
    });

    $router.config([
      { path: '/a', component: activate },
      { path: '/b', component: OneController }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');

    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');
  });


  it('should navigate when canDeactivate returns true', function () {
    var activate = registerComponent('activate', 'hi', {
      canDeactivate: function () {
        return true;
      }
    });

    $router.config([
      { path: '/a', component: activate },
      { path: '/b', component: OneController }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');

    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { one }');
  });


  it('should activate a component when canActivate returns true', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activate', 'hi', {
      canActivate: function () {
        return true;
      },
      onActivate: spy
    });

    $router.config([
      { path: '/a', component: activate }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  });


  it('should pass instructions into the canDeactivate hook of controllers', function () {
    var spy = jasmine.createSpy('canDeactivate').and.returnValue(true);
    var deactivate = registerComponent('deactivate', '', {
      canDeactivate: spy
    });

    $router.config([
      { path: '/user/:name', component: deactivate },
      { path: '/post/:id', component: OneController }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor(OneController),
                                     instructionFor(deactivate));
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
