/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, CompilerOptions, ComponentFactory, Injector, NgModule, NgModuleRef, NgZone, Provider, Testability, Type} from '@angular/core';

import * as angular from './angular_js';
import {CapturedContentSelectors} from './compiler-capture';
import {NG1_COMPILE, NG1_INJECTOR, NG1_PARSE, NG1_ROOT_SCOPE, NG1_TESTABILITY, NG2_CAPTURED_CONTENT_SELECTORS, NG2_COMPILER, NG2_COMPONENT_FACTORY_REF_MAP, NG2_INIT_PROMISE_COMPLETER, NG2_INJECTOR, NG2_ZONE, REQUIRE_INJECTOR} from './constants';
import {DowngradeNg2ComponentAdapter} from './downgrade_ng2_adapter';
import {ComponentInfo, getComponentInfo} from './metadata';
import {platformUpgrade} from './platform-upgrade';
import {UpgradeNg1ComponentAdapterBuilder} from './upgrade_ng1_adapter';
import {PromiseCompleter, controllerKey, isPresent, onError, sortProjectableNodes} from './util';

var upgradeCount: number = 0;

/**
 * Use `UpgradeAdapter` to allow AngularJS v1 and Angular v2 to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular v2 component from AngularJS v1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of AngularJS v1 directive from Angular v2 component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * ## Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS v1 directives always execute inside AngularJS v1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular v2 components always execute inside Angular v2 framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS v1 component can be upgraded to an Angular v2 component. This creates an
 *    Angular v2 directive, which bootstraps the AngularJS v1 component directive in that location.
 * 6. An Angular v2 component can be downgraded to an AngularJS v1 component directive. This creates
 *    an AngularJS v1 directive, which bootstraps the Angular v2 component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular v2 syntax.
 * 8. AngularJS v1 is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular v2 zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * var adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module), myCompilerOptions);
 * var module = angular.module('myExample', []);
 * module.directive('ng2Comp', adapter.downgradeNg2Component(Ng2Component));
 *
 * module.directive('ng1Hello', function() {
 *   return {
 *      scope: { title: '=' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * @Component({
 *   selector: 'ng2-comp',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
 *   directives:
 * })
 * class Ng2Component {
 * }
 *
 * @NgModule({
 *   declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
 *   imports: [BrowserModule]
 * })
 * class MyNg2Module {}
 *
 *
 * document.body.innerHTML = '<ng2-comp name="World">project</ng2-comp>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 *
 * ```
 *
 * @stable
 */
export class UpgradeAdapter {
  /* @internal */
  private idPrefix: string = `NG2_UPGRADE_${upgradeCount++}_`;
  /* @internal */
  private upgradedComponents: Type<any>[] = [];
  /**
   * An internal map of ng1 components which need to up upgraded to ng2.
   *
   * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
   * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
   *
   * @internal
   */
  private ng1ComponentsToBeUpgraded: {[name: string]: UpgradeNg1ComponentAdapterBuilder} = {};
  /* @internal */
  private providers: Provider[] = [];
  /* @internal */
  private ngZone: NgZone;

  constructor(private ng2AppModule: Type<any>, private compilerOptions?: CompilerOptions) {
    if (!ng2AppModule) {
      throw new Error(
          'UpgradeAdapter cannot be instantiated without an NgModule of the Angular 2 app.');
    }
  }

  /*
   * Objects shared between declaration and bootstrap.
   */
  /* @internal */
  private moduleRef: NgModuleRef<any> = null;
  /* @internal */
  private ng1Injector: angular.IInjectorService = null;
  /* @internal */
  private ng2Injector: Injector = null;

  /**
   * Allows Angular v2 Component to be used from AngularJS v1.
   *
   * Use `downgradeNg2Component` to create an AngularJS v1 Directive Definition Factory from
   * Angular v2 Component. The adapter will bootstrap Angular v2 component from within the
   * AngularJS v1 template.
   *
   * ## Mental Model
   *
   * 1. The component is instantiated by being listed in AngularJS v1 template. This means that the
   *    host element is controlled by AngularJS v1, but the component's view will be controlled by
   *    Angular v2.
   * 2. Even thought the component is instantiated in AngularJS v1, it will be using Angular v2
   *    syntax. This has to be done, this way because we must follow Angular v2 components do not
   *    declare how the attributes should be interpreted.
   *
   * ## Supported Features
   *
   * - Bindings:
   *   - Attribute: `<comp name="World">`
   *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
   *   - Expression:  `<comp [name]="username">`
   *   - Event:  `<comp (close)="doSomething()">`
   * - Content projection: yes
   *
   * ### Example
   *
   * ```
   * var adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
   * var module = angular.module('myExample', []);
   * module.directive('greet', adapter.downgradeNg2Component(Greeter));
   *
   * @Component({
   *   selector: 'greet',
   *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
   * })
   * class Greeter {
   *   @Input() salutation: string;
   *   @Input() name: string;
   * }
   *
   * @NgModule({
   *   declarations: [Greeter],
   *   imports: [BrowserModule]
   * })
   * class MyNg2Module {}
   *
   * document.body.innerHTML =
   *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
   *
   * adapter.bootstrap(document.body, ['myExample']).ready(function() {
   *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
   * });
   * ```
   */
  downgradeNg2Component(type: Type<any>): Function {
    this.upgradedComponents.push(type);
    var info: ComponentInfo = getComponentInfo(type);
    return ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
  }

  /**
   * Allows AngularJS v1 Component to be used from Angular v2.
   *
   * Use `upgradeNg1Component` to create an Angular v2 component from AngularJS v1 Component
   * directive. The adapter will bootstrap AngularJS v1 component from within the Angular v2
   * template.
   *
   * ## Mental Model
   *
   * 1. The component is instantiated by being listed in Angular v2 template. This means that the
   *    host element is controlled by Angular v2, but the component's view will be controlled by
   *    AngularJS v1.
   *
   * ## Supported Features
   *
   * - Bindings:
   *   - Attribute: `<comp name="World">`
   *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
   *   - Expression:  `<comp [name]="username">`
   *   - Event:  `<comp (close)="doSomething()">`
   * - Transclusion: yes
   * - Only some of the features of
   *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
   *   supported:
   *   - `compile`: not supported because the host element is owned by Angular v2, which does
   *     not allow modifying DOM structure during compilation.
   *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
   *   - `controllerAs': supported.
   *   - `bindToController': supported.
   *   - `link': supported. (NOTE: only pre-link function is supported.)
   *   - `name': supported.
   *   - `priority': ignored.
   *   - `replace': not supported.
   *   - `require`: supported.
   *   - `restrict`: must be set to 'E'.
   *   - `scope`: supported.
   *   - `template`: supported.
   *   - `templateUrl`: supported.
   *   - `terminal`: ignored.
   *   - `transclude`: supported.
   *
   *
   * ### Example
   *
   * ```
   * var adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
   * var module = angular.module('myExample', []);
   *
   * module.directive('greet', function() {
   *   return {
   *     scope: {salutation: '=', name: '=' },
   *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
   *   };
   * });
   *
   * module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));
   *
   * @Component({
   *   selector: 'ng2',
   *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
   * })
   * class Ng2Component {
   * }
   *
   * @NgModule({
   *   declarations: [Ng2Component, adapter.upgradeNg1Component('greet')],
   *   imports: [BrowserModule]
   * })
   * class MyNg2Module {}
   *
   * document.body.innerHTML = '<ng2></ng2>';
   *
   * adapter.bootstrap(document.body, ['myExample']).ready(function() {
   *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
   * });
   * ```
   */
  upgradeNg1Component(name: string): Type<any> {
    if ((<any>this.ng1ComponentsToBeUpgraded).hasOwnProperty(name)) {
      return this.ng1ComponentsToBeUpgraded[name].type;
    } else {
      return (this.ng1ComponentsToBeUpgraded[name] = new UpgradeNg1ComponentAdapterBuilder(name))
          .type;
    }
  }

  /**
   * Declares the AngularJS v1 module for this UpgradeAdapter.
   *
   * This method is here for unit testing purposes, to allow declaring the module without
   * bootstrapping the whole hybrid application.
   *
   * This method is automatically called by `bootstrap()` if the module hasn't already been
   * declared.
   *
   * ### Example
   *
   * ```
   * const upgradeAdapter = new UpgradeAdapter();
   * upgradeAdapter.declareNg1Module(['heroApp']);
   * ```
   */
  declareNg1Module(modules?: any[]): void {
    this.ngZone = new NgZone({enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec')});
    var delayApplyExps: Function[] = [];
    var original$applyFn: Function;
    var rootScopePrototype: any;
    var rootScope: angular.IRootScopeService;
    var componentFactoryRefMap: ComponentFactoryRefMap = {};
    var contentSelectors: CapturedContentSelectors =
        platformUpgrade().injector.get(NG2_CAPTURED_CONTENT_SELECTORS);
    var upgradeAdapter = this;

    var ng1Module = angular.module(this.idPrefix, modules);
    ng1Module.factory(NG2_INJECTOR, () => this.moduleRef.injector.get(Injector))
        .value(NG2_ZONE, this.ngZone)
        .factory(NG2_COMPILER, () => this.moduleRef.injector.get(Compiler))
        .value(NG2_CAPTURED_CONTENT_SELECTORS, contentSelectors)
        .value(NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap)
        .config([
          '$provide', '$injector',
          (provide: any /** TODO #???? */, ng1Injector: angular.IInjectorService) => {
            provide.decorator(NG1_ROOT_SCOPE, [
              '$delegate',
              function(rootScopeDelegate: angular.IRootScopeService) {
                // Capture the root apply so that we can delay first call to $apply until we
                // bootstrap Angular 2 and then we replay and restore the $apply.
                rootScopePrototype = rootScopeDelegate.constructor.prototype;
                if (rootScopePrototype.hasOwnProperty('$apply')) {
                  original$applyFn = rootScopePrototype.$apply;
                  rootScopePrototype.$apply = (exp: any) => delayApplyExps.push(exp);
                } else {
                  throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');
                }
                return rootScope = rootScopeDelegate;
              }
            ]);
            if (ng1Injector.has(NG1_TESTABILITY)) {
              provide.decorator(NG1_TESTABILITY, [
                '$delegate',
                function(testabilityDelegate: angular.ITestabilityService) {
                  var originalWhenStable: Function = testabilityDelegate.whenStable;
                  var newWhenStable = (callback: Function): void => {
                    var whenStableContext: any = this;
                    originalWhenStable.call(this, function() {
                      var ng2Testability: Testability =
                          upgradeAdapter.moduleRef.injector.get(Testability);
                      if (ng2Testability.isStable()) {
                        callback.apply(this, arguments);
                      } else {
                        ng2Testability.whenStable(newWhenStable.bind(whenStableContext, callback));
                      }
                    });
                  };

                  testabilityDelegate.whenStable = newWhenStable;
                  return testabilityDelegate;
                }
              ]);
            }
          }
        ]);

    ng1Module.run([
      '$injector', '$rootScope', NG2_INIT_PROMISE_COMPLETER,
      (injector: angular.IInjectorService, rootScope: angular.IRootScopeService,
       initPromiseCompleter: PromiseCompleter<any>) => {
        this.ng1Injector = injector;
        UpgradeNg1ComponentAdapterBuilder.resolve(this.ng1ComponentsToBeUpgraded, injector)
            .then(() => {
              // At this point we have ng1 injector and we have lifted ng1 components into ng2, we
              // now can bootstrap ng2.
              var DynamicNgUpgradeModule =
                  NgModule({
                    providers: [
                      {provide: NG1_INJECTOR, useFactory: () => this.ng1Injector},
                      {provide: NG1_COMPILE, useFactory: () => this.ng1Injector.get(NG1_COMPILE)},
                      this.providers
                    ],
                    imports: [this.ng2AppModule]
                  }).Class({
                    constructor: function DynamicNgUpgradeModule() {},
                    ngDoBootstrap: function() {}
                  });

              (platformUpgrade() as any)
                  ._bootstrapModuleWithZone(
                      DynamicNgUpgradeModule, this.compilerOptions, this.ngZone,
                      (componentFactories: ComponentFactory<any>[]) => {
                        componentFactories.forEach((componentFactory) => {
                          var type: Type<any> = componentFactory.componentType;
                          if (this.upgradedComponents.indexOf(type) !== -1) {
                            componentFactoryRefMap[getComponentInfo(type).selector] =
                                componentFactory;
                          }
                        });
                      })
                  .then((ref: NgModuleRef<any>) => {
                    this.moduleRef = ref;
                    let subscription = this.ngZone.onMicrotaskEmpty.subscribe({
                      next: (_: any) => this.ngZone.runOutsideAngular(() => rootScope.$evalAsync())
                    });
                    rootScope.$on('$destroy', () => {
                      subscription.unsubscribe();
                      this.ng1Injector = null;
                    });
                    this.ngZone.run(() => {
                      if (rootScopePrototype) {
                        rootScopePrototype.$apply = original$applyFn;  // restore original $apply
                        while (delayApplyExps.length) {
                          rootScope.$apply(delayApplyExps.shift());
                        }
                        rootScopePrototype = null;
                      }
                    });
                  })
                  .then(() => initPromiseCompleter.resolve(), onError);
            })
            .catch(reason => initPromiseCompleter.reject(reason));
      }
    ]);
  }

  /**
   * Registers the UpgradeAdapter's AngularJS v1 module configuration code for unit testing.
   * It is a direct replacement of angular.mock.module() for the Upgrade Adapter.
   *
   * It returns an {@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
   * run assertions once the Angular v2 components are ready to test through AngularJS v1.
   *
   * ### Example
   *
   * ```
   * const upgradeAdapter = new UpgradeAdapter();
   * upgradeAdapter.declareNg1Module(['heroApp']);
   *
   * let upgradeAdapterRef: UpgradeAdapterRef;
   * let $compile, $rootScope;
   *
   * beforeEach(() => {
   *   upgradeAdapterRef = upgradeAdapter.initForNg1Tests()
   * });
   *
   * beforeEach(inject((_$compile_, _$rootScope_) => {
   *   $compile = _$compile_;
   *   $rootScope = _$rootScope_;
   * }));
   *
   * it("says hello", (done) => {
   *   upgradeAdapterRef.ready(() => {
   *     var element = $compile("<my-component></my-component>")($rootScope);
   *     $rootScope.$apply();
   *     expect(element.html()).toContain("Hello World");
   *     done();
   *   })
   * });
   *
   * ```
   */
  initForNg1Tests(): UpgradeAdapterRef {
    var moduleName = this.idPrefix;
    try {
      angular.module(moduleName);
    } catch (e) {
      throw new Error(
          'You need to call declareNg1Module() ' +
          'before initializing it for tests.');
    }
    var windowNgMock = (window as any /** TODO #???? */)['angular'].mock;
    if (!isPresent(windowNgMock) || !isPresent(windowNgMock.module)) {
      throw new Error('Failed to find \'angular.mock.module\'.');
    }
    let upgrade = new UpgradeAdapterRef();
    let initPromiseCompleter = new PromiseCompleter<any>();
    windowNgMock.module(
        [
          '$provide',
          function($provide: any) {
            $provide.constant(NG2_INIT_PROMISE_COMPLETER, initPromiseCompleter);
          }
        ],
        moduleName);
    initPromiseCompleter.promise.then(
        () => { (<any>upgrade)._bootstrapDone(this.moduleRef, this.ng1Injector); }, onError);
    return upgrade;
  }

  /**
   * Bootstrap a hybrid AngularJS v1 / Angular v2 application.
   *
   * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS v1
   * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
   * AngularJS v1, this bootstrap is asynchronous.
   *
   * ### Example
   *
   * ```
   * var adapter = new UpgradeAdapter();
   * var module = angular.module('myExample', []);
   * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
   *
   * module.directive('ng1', function() {
   *   return {
   *      scope: { title: '=' },
   *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
   *   };
   * });
   *
   *
   * @Component({
   *   selector: 'ng2',
   *   inputs: ['name'],
   *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
   * })
   * class Ng2 {
   * }
   *
   * @NgModule({
   *   declarations: [Ng2, adapter.upgradeNg1Component('ng1')],
   *   imports: [BrowserModule]
   * })
   * class MyNg2Module {}
   *
   * document.body.innerHTML = '<ng2 name="World">project</ng2>';
   *
   * adapter.bootstrap(document.body, ['myExample']).ready(function() {
   *   expect(document.body.textContent).toEqual(
   *       "ng2[ng1[Hello World!](transclude)](project)");
   * });
   * ```
   */
  bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig):
      UpgradeAdapterRef {
    try {
      angular.module(this.idPrefix);
    } catch (e) {
      this.declareNg1Module(modules);
    }

    const upgrade = new UpgradeAdapterRef();

    // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
    const windowAngular = (window as any /** TODO #???? */)['angular'];
    windowAngular.resumeBootstrap = undefined;

    const initPromiseCompleter = new PromiseCompleter<any>();
    const toBootstrap = [
      [
        '$provide',
        function($provide: any) {
          $provide.constant(NG2_INIT_PROMISE_COMPLETER, initPromiseCompleter);
        }
      ],
      this.idPrefix
    ];

    this.ngZone.run(() => { angular.bootstrap(element, toBootstrap, config); });
    var ng1BootstrapPromise = new Promise((resolve, reject) => {
      if (windowAngular.resumeBootstrap) {
        var originalResumeBootstrap: () => void = windowAngular.resumeBootstrap;
        windowAngular.resumeBootstrap = function() {
          windowAngular.resumeBootstrap = originalResumeBootstrap;
          windowAngular.resumeBootstrap.apply(this, arguments);
          resolve();
        };
      } else {
        resolve();
      }
    });

    Promise.all([initPromiseCompleter.promise, ng1BootstrapPromise]).then(() => {
      angular.element(element).data(controllerKey(NG2_INJECTOR), this.moduleRef.injector);
      this.moduleRef.injector.get(NgZone).run(
          () => { (<any>upgrade)._bootstrapDone(this.moduleRef, this.ng1Injector); });
    }, onError);
    return upgrade;
  }

  /**
   * Allows AngularJS v1 service to be accessible from Angular v2.
   *
   *
   * ### Example
   *
   * ```
   * class Login { ... }
   * class Server { ... }
   *
   * @Injectable()
   * class Example {
   *   constructor(@Inject('server') server, login: Login) {
   *     ...
   *   }
   * }
   *
   * var module = angular.module('myExample', []);
   * module.service('server', Server);
   * module.service('login', Login);
   *
   * var adapter = new UpgradeAdapter();
   * adapter.upgradeNg1Provider('server');
   * adapter.upgradeNg1Provider('login', {asToken: Login});
   *
   * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
   *   var example: Example = ref.ng2Injector.get(Example);
   * });
   *
   * ```
   */
  public upgradeNg1Provider(name: string, options?: {asToken: any}) {
    var token = options && options.asToken || name;
    this.providers.push({
      provide: token,
      useFactory: (ng1Injector: angular.IInjectorService) => ng1Injector.get(name),
      deps: [NG1_INJECTOR]
    });
  }

  /**
   * Allows Angular v2 service to be accessible from AngularJS v1.
   *
   *
   * ### Example
   *
   * ```
   * class Example {
   * }
   *
   * var adapter = new UpgradeAdapter();
   *
   * var module = angular.module('myExample', []);
   * module.factory('example', adapter.downgradeNg2Provider(Example));
   *
   * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
   *   var example: Example = ref.ng1Injector.get('example');
   * });
   *
   * ```
   */
  public downgradeNg2Provider(token: any): Function {
    var factory = function(injector: Injector) { return injector.get(token); };
    (<any>factory).$inject = [NG2_INJECTOR];
    return factory;
  }
}

interface ComponentFactoryRefMap {
  [selector: string]: ComponentFactory<any>;
}

/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS v1's $compile.
 */
class ParentInjectorPromise {
  private _injector: Injector;
  private _callbacks: ((injector: Injector) => any)[] = [];

  then(callback: (injector: Injector) => any) {
    if (this._injector) {
      callback(this._injector);
    } else {
      this._callbacks.push(callback);
    }
  }

  resolve(injector: Injector) {
    this._injector = injector;
    for (let callback of this._callbacks) {
      callback(injector);
    }
    this._callbacks.length = 0;
  }
}


function ng1ComponentDirective(info: ComponentInfo, idPrefix: string): Function {
  (<any>directiveFactory).$inject = [
    NG1_INJECTOR, NG1_COMPILE, NG2_CAPTURED_CONTENT_SELECTORS, NG2_COMPONENT_FACTORY_REF_MAP,
    NG1_PARSE
  ];
  function directiveFactory(
      ng1Injector: angular.IInjectorService, ng1Compile: angular.ICompileService,
      contentSelectors: CapturedContentSelectors, componentFactoryRefMap: ComponentFactoryRefMap,
      parse: angular.IParseService): angular.IDirective {
    var idCount = 0;
    let dashSelector = info.selector.replace(/([A-Z])/g, char => '-' + char.toLowerCase());
    return {
      restrict: 'E',
      terminal: true,
      require: REQUIRE_INJECTOR,
      compile: (templateElement: angular.IAugmentedJQuery, templateAttributes: angular.IAttributes,
                transclude: angular.ITranscludeFunction) => {
        // We might have compile the contents lazily, because this might have been triggered by the
        // UpgradeNg1ComponentAdapterBuilder, when the ng2 templates have not been compiled yet
        let linkFns: angular.ILinkFn[];
        if (contentSelectors.ngContentSelectors[dashSelector]) {
          linkFns = compileProjectedNodes(templateElement);
        }
        return {
          post: (scope: angular.IScope, element: angular.IAugmentedJQuery,
                 attrs: angular.IAttributes, parentInjector: Injector | ParentInjectorPromise,
                 transclude: angular.ITranscludeFunction): void => {
            let id = idPrefix + (idCount++);
            (<any>element[0]).id = id;

            let injectorPromise = new ParentInjectorPromise();
            element.data(controllerKey(NG2_INJECTOR), injectorPromise);

            if (!linkFns) {
              linkFns = compileProjectedNodes(templateElement);
            }

            var componentFactory: ComponentFactory<any> = componentFactoryRefMap[info.selector];
            if (!componentFactory)
              throw new Error('Expecting ComponentFactory for: ' + info.selector);

            element.empty();
            let projectableNodes = linkFns.map(link => {
              let projectedClone: Node[];
              link(scope, (clone: Node[]) => {
                projectedClone = clone;
                element.append(clone);
              });
              return projectedClone;
            });

            if (parentInjector === null) {
              parentInjector = ng1Injector.get(NG2_INJECTOR);
            }
            if (parentInjector instanceof ParentInjectorPromise) {
              (<ParentInjectorPromise>parentInjector)
                  .then((resolvedInjector: Injector) => downgrade(resolvedInjector));
            } else {
              downgrade(<Injector>parentInjector);
            }

            function downgrade(injector: Injector) {
              var facade = new DowngradeNg2ComponentAdapter(
                  info, element, attrs, scope, injector, parse, componentFactory);
              facade.setupInputs();
              facade.bootstrapNg2(projectableNodes);
              facade.setupOutputs();
              facade.registerCleanup();
              injectorPromise.resolve(facade.elementInjector);
            }
          }
        };
      }
    };

    function compileProjectedNodes(templateElement: angular.IAugmentedJQuery): angular.ILinkFn[] {
      let ngContentSelectors: string[] = contentSelectors.ngContentSelectors[dashSelector];
      if (!ngContentSelectors)
        throw new Error('Expecting ngContentSelectors for: ' + info.selector);
      // We have to sort the projected content before we compile it, hence the terminal: true
      let projectableTemplateNodes =
          sortProjectableNodes(ngContentSelectors, <any>templateElement.contents());
      return projectableTemplateNodes.map(nodes => ng1Compile(<any>nodes));
    }
  }
  return directiveFactory;
}

/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS v1 / Angular v2 application.
 *
 * @stable
 */
export class UpgradeAdapterRef {
  /* @internal */
  private _readyFn: (upgradeAdapterRef?: UpgradeAdapterRef) => void = null;

  public ng1RootScope: angular.IRootScopeService = null;
  public ng1Injector: angular.IInjectorService = null;
  public ng2ModuleRef: NgModuleRef<any> = null;
  public ng2Injector: Injector = null;

  /* @internal */
  private _bootstrapDone(ngModuleRef: NgModuleRef<any>, ng1Injector: angular.IInjectorService) {
    this.ng2ModuleRef = ngModuleRef;
    this.ng2Injector = ngModuleRef.injector;
    this.ng1Injector = ng1Injector;
    this.ng1RootScope = ng1Injector.get(NG1_ROOT_SCOPE);
    this._readyFn && this._readyFn(this);
  }

  /**
   * Register a callback function which is notified upon successful hybrid AngularJS v1 / Angular v2
   * application has been bootstrapped.
   *
   * The `ready` callback function is invoked inside the Angular v2 zone, therefore it does not
   * require a call to `$apply()`.
   */
  public ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void) { this._readyFn = fn; }

  /**
   * Dispose of running hybrid AngularJS v1 / Angular v2 application.
   */
  public dispose() {
    this.ng1Injector.get(NG1_ROOT_SCOPE).$destroy();
    this.ng2ModuleRef.destroy();
  }
}
