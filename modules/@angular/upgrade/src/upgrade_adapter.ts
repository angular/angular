/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SelectorMatcher, createElementCssSelector} from '@angular/compiler';
import {Compiler, CompilerOptions, ComponentFactory, Injector, NgModule, NgModuleRef, NgZone, Provider, Testability, Type} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import * as angular from './angular_js';
import {NG1_COMPILE, NG1_INJECTOR, NG1_PARSE, NG1_ROOT_SCOPE, NG1_TESTABILITY, NG2_COMPILER, NG2_COMPONENT_FACTORY_REF_MAP, NG2_INJECTOR, NG2_ZONE, REQUIRE_INJECTOR} from './constants';
import {DowngradeNg2ComponentAdapter} from './downgrade_ng2_adapter';
import {ComponentInfo, getComponentInfo} from './metadata';
import {UpgradeNg1ComponentAdapterBuilder} from './upgrade_ng1_adapter';
import {Deferred, controllerKey, getAttributesAsArray, onError} from './util';

let upgradeCount: number = 0;

/**
 * Use `UpgradeAdapter` to allow Angular 1 and Angular 2+ to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular 2+ component from Angular 1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of Angular 1 directive from Angular 2+ component.
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
 * 3. Angular 1 directives always execute inside Angular 1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular 2+ components always execute inside Angular 2+ framework codebase regardless of
 *    where they are instantiated.
 * 5. An Angular 1 component can be upgraded to an Angular 2+ component. This creates an
 *    Angular 2+ directive, which bootstraps the Angular 1 component directive in that location.
 * 6. An Angular 2+ component can be downgraded to an Angular 1 component directive. This creates
 *    an Angular 1 directive, which bootstraps the Angular 2+ component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular 2+ syntax.
 * 8. Angular 1 is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular 2+ zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module), myCompilerOptions);
 * const module = angular.module('myExample', []);
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
  private idPrefix: string = `NG2_UPGRADE_${upgradeCount++}_`;
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
  private providers: Provider[] = [];
  private ngZone: NgZone;
  private ng1Module: angular.IModule;
  private moduleRef: NgModuleRef<any> = null;
  private ng2BootstrapDeferred: Deferred<angular.IInjectorService>;

  constructor(private ng2AppModule: Type<any>, private compilerOptions?: CompilerOptions) {
    if (!ng2AppModule) {
      throw new Error(
          'UpgradeAdapter cannot be instantiated without an NgModule of the Angular 2 app.');
    }
  }

  /**
   * Allows Angular 2+ Component to be used from Angular 1.
   *
   * Use `downgradeNg2Component` to create an Angular 1 Directive Definition Factory from
   * Angular 2+ Component. The adapter will bootstrap Angular 2+ component from within the
   * Angular 1 template.
   *
   * ## Mental Model
   *
   * 1. The component is instantiated by being listed in Angular 1 template. This means that the
   *    host element is controlled by Angular 1, but the component's view will be controlled by
   *    Angular 2+.
   * 2. Even thought the component is instantiated in Angular 1, it will be using Angular 2+
   *    syntax. This has to be done, this way because we must follow Angular 2+ components do not
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
   * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
   * const module = angular.module('myExample', []);
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
    const info: ComponentInfo = getComponentInfo(type);
    return ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
  }

  /**
   * Allows Angular 1 Component to be used from Angular 2+.
   *
   * Use `upgradeNg1Component` to create an Angular 2+ component from Angular 1 Component
   * directive. The adapter will bootstrap Angular 1 component from within the Angular 2+
   * template.
   *
   * ## Mental Model
   *
   * 1. The component is instantiated by being listed in Angular 2+ template. This means that the
   *    host element is controlled by Angular 2+, but the component's view will be controlled by
   *    Angular 1.
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
   *   - `compile`: not supported because the host element is owned by Angular 2+, which does
   *     not allow modifying DOM structure during compilation.
   *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
   *   - `controllerAs`: supported.
   *   - `bindToController`: supported.
   *   - `link`: supported. (NOTE: only pre-link function is supported.)
   *   - `name`: supported.
   *   - `priority`: ignored.
   *   - `replace`: not supported.
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
   * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
   * const module = angular.module('myExample', []);
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
   * Registers the adapter's Angular 1 upgrade module for unit testing in Angular 1.
   * Use this instead of `angular.mock.module()` to load the upgrade module into
   * the Angular 1 testing injector.
   *
   * ### Example
   *
   * ```
   * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
   *
   * // configure the adapter with upgrade/downgrade components and services
   * upgradeAdapter.downgradeNg2Component(MyComponent);
   *
   * let upgradeAdapterRef: UpgradeAdapterRef;
   * let $compile, $rootScope;
   *
   * // We must register the adapter before any calls to `inject()`
   * beforeEach(() => {
   *   upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['heroApp']);
   * });
   *
   * beforeEach(inject((_$compile_, _$rootScope_) => {
   *   $compile = _$compile_;
   *   $rootScope = _$rootScope_;
   * }));
   *
   * it("says hello", (done) => {
   *   upgradeAdapterRef.ready(() => {
   *     const element = $compile("<my-component></my-component>")($rootScope);
   *     $rootScope.$apply();
   *     expect(element.html()).toContain("Hello World");
   *     done();
   *   })
   * });
   *
   * ```
   *
   * @param modules any Angular 1 modules that the upgrade module should depend upon
   * @returns an {@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
   * run assertions once the Angular 2+ components are ready to test through Angular 1.
   */
  registerForNg1Tests(modules?: string[]): UpgradeAdapterRef {
    const windowNgMock = (window as any)['angular'].mock;
    if (!windowNgMock || !windowNgMock.module) {
      throw new Error('Failed to find \'angular.mock.module\'.');
    }
    this.declareNg1Module(modules);
    windowNgMock.module(this.ng1Module.name);
    const upgrade = new UpgradeAdapterRef();
    this.ng2BootstrapDeferred.promise.then(
        (ng1Injector) => { (<any>upgrade)._bootstrapDone(this.moduleRef, ng1Injector); }, onError);
    return upgrade;
  }

  /**
   * Bootstrap a hybrid Angular 1 / Angular 2+ application.
   *
   * This `bootstrap` method is a direct replacement (takes same arguments) for Angular 1
   * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
   * Angular 1, this bootstrap is asynchronous.
   *
   * ### Example
   *
   * ```
   * const adapter = new UpgradeAdapter(MyNg2Module);
   * const module = angular.module('myExample', []);
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
    this.declareNg1Module(modules);

    const upgrade = new UpgradeAdapterRef();

    // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
    const windowAngular = (window as any /** TODO #???? */)['angular'];
    windowAngular.resumeBootstrap = undefined;

    this.ngZone.run(() => { angular.bootstrap(element, [this.ng1Module.name], config); });
    const ng1BootstrapPromise = new Promise((resolve) => {
      if (windowAngular.resumeBootstrap) {
        const originalResumeBootstrap: () => void = windowAngular.resumeBootstrap;
        windowAngular.resumeBootstrap = function() {
          windowAngular.resumeBootstrap = originalResumeBootstrap;
          windowAngular.resumeBootstrap.apply(this, arguments);
          resolve();
        };
      } else {
        resolve();
      }
    });

    Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(([ng1Injector]) => {
      angular.element(element).data(controllerKey(NG2_INJECTOR), this.moduleRef.injector);
      this.moduleRef.injector.get(NgZone).run(
          () => { (<any>upgrade)._bootstrapDone(this.moduleRef, ng1Injector); });
    }, onError);
    return upgrade;
  }

  /**
   * Allows Angular 1 service to be accessible from Angular 2+.
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
   * const module = angular.module('myExample', []);
   * module.service('server', Server);
   * module.service('login', Login);
   *
   * const adapter = new UpgradeAdapter(MyNg2Module);
   * adapter.upgradeNg1Provider('server');
   * adapter.upgradeNg1Provider('login', {asToken: Login});
   *
   * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
   *   const example: Example = ref.ng2Injector.get(Example);
   * });
   *
   * ```
   */
  public upgradeNg1Provider(name: string, options?: {asToken: any}) {
    const token = options && options.asToken || name;
    this.providers.push({
      provide: token,
      useFactory: (ng1Injector: angular.IInjectorService) => ng1Injector.get(name),
      deps: [NG1_INJECTOR]
    });
  }

  /**
   * Allows Angular 2+ service to be accessible from Angular 1.
   *
   *
   * ### Example
   *
   * ```
   * class Example {
   * }
   *
   * const adapter = new UpgradeAdapter(MyNg2Module);
   *
   * const module = angular.module('myExample', []);
   * module.factory('example', adapter.downgradeNg2Provider(Example));
   *
   * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
   *   const example: Example = ref.ng1Injector.get('example');
   * });
   *
   * ```
   */
  public downgradeNg2Provider(token: any): Function {
    const factory = function(injector: Injector) { return injector.get(token); };
    (<any>factory).$inject = [NG2_INJECTOR];
    return factory;
  }


  /**
   * Declare the Angular 1 upgrade module for this adapter without bootstrapping the whole
   * hybrid application.
   *
   * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
   *
   * @param modules The Angular 1 modules that this upgrade module should depend upon.
   * @returns The Angular 1 upgrade module that is declared by this method
   *
   * ### Example
   *
   * ```
   * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
   * upgradeAdapter.declareNg1Module(['heroApp']);
   * ```
   */
  private declareNg1Module(modules: string[] = []): angular.IModule {
    const delayApplyExps: Function[] = [];
    let original$applyFn: Function;
    let rootScopePrototype: any;
    let rootScope: angular.IRootScopeService;
    const componentFactoryRefMap: ComponentFactoryRefMap = {};
    const upgradeAdapter = this;
    const ng1Module = this.ng1Module = angular.module(this.idPrefix, modules);
    const platformRef = platformBrowserDynamic();

    this.ngZone = new NgZone({enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec')});
    this.ng2BootstrapDeferred = new Deferred();
    ng1Module.factory(NG2_INJECTOR, () => this.moduleRef.injector.get(Injector))
        .constant(NG2_ZONE, this.ngZone)
        .constant(NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap)
        .factory(NG2_COMPILER, () => this.moduleRef.injector.get(Compiler))
        .config([
          '$provide', '$injector',
          (provide: angular.IProvideService, ng1Injector: angular.IInjectorService) => {
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
                  const originalWhenStable: Function = testabilityDelegate.whenStable;
                  // Cannot use arrow function below because we need the context
                  const newWhenStable = function(callback: Function) {
                    originalWhenStable.call(this, function() {
                      const ng2Testability: Testability =
                          upgradeAdapter.moduleRef.injector.get(Testability);
                      if (ng2Testability.isStable()) {
                        callback.apply(this, arguments);
                      } else {
                        ng2Testability.whenStable(newWhenStable.bind(this, callback));
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
      '$injector', '$rootScope',
      (ng1Injector: angular.IInjectorService, rootScope: angular.IRootScopeService) => {
        UpgradeNg1ComponentAdapterBuilder.resolve(this.ng1ComponentsToBeUpgraded, ng1Injector)
            .then(() => {
              // At this point we have ng1 injector and we have lifted ng1 components into ng2, we
              // now can bootstrap ng2.
              const DynamicNgUpgradeModule =
                  NgModule({
                    providers: [
                      {provide: NG1_INJECTOR, useFactory: () => ng1Injector},
                      {provide: NG1_COMPILE, useFactory: () => ng1Injector.get(NG1_COMPILE)},
                      this.providers
                    ],
                    imports: [this.ng2AppModule]
                  }).Class({
                    constructor: function DynamicNgUpgradeModule() {},
                    ngDoBootstrap: function() {}
                  });
              (platformRef as any)
                  ._bootstrapModuleWithZone(
                      DynamicNgUpgradeModule, this.compilerOptions, this.ngZone,
                      (componentFactories: ComponentFactory<any>[]) => {
                        componentFactories.forEach((componentFactory) => {
                          const type: Type<any> = componentFactory.componentType;
                          if (this.upgradedComponents.indexOf(type) !== -1) {
                            componentFactoryRefMap[getComponentInfo(type).selector] =
                                componentFactory;
                          }
                        });
                      })
                  .then((ref: NgModuleRef<any>) => {
                    this.moduleRef = ref;
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
                  .then(() => this.ng2BootstrapDeferred.resolve(ng1Injector), onError)
                  .then(() => {
                    let subscription =
                        this.ngZone.onMicrotaskEmpty.subscribe({next: () => rootScope.$digest()});
                    rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                  });
            })
            .catch((e) => this.ng2BootstrapDeferred.reject(e));
      }
    ]);

    return ng1Module;
  }
}

interface ComponentFactoryRefMap {
  [selector: string]: ComponentFactory<any>;
}

/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
class ParentInjectorPromise {
  private injector: Injector;
  private callbacks: ((injector: Injector) => any)[] = [];

  constructor(private element: angular.IAugmentedJQuery) {
    // store the promise on the element
    element.data(controllerKey(NG2_INJECTOR), this);
  }

  then(callback: (injector: Injector) => any) {
    if (this.injector) {
      callback(this.injector);
    } else {
      this.callbacks.push(callback);
    }
  }

  resolve(injector: Injector) {
    this.injector = injector;

    // reset the element data to point to the real injector
    this.element.data(controllerKey(NG2_INJECTOR), injector);

    // clean out the element to prevent memory leaks
    this.element = null;

    // run all the queued callbacks
    this.callbacks.forEach((callback) => callback(injector));
    this.callbacks.length = 0;
  }
}


function ng1ComponentDirective(info: ComponentInfo, idPrefix: string): Function {
  (<any>directiveFactory).$inject =
      [NG1_INJECTOR, NG1_COMPILE, NG2_COMPONENT_FACTORY_REF_MAP, NG1_PARSE];
  function directiveFactory(
      ng1Injector: angular.IInjectorService, ng1Compile: angular.ICompileService,
      componentFactoryRefMap: ComponentFactoryRefMap,
      parse: angular.IParseService): angular.IDirective {
    let idCount = 0;
    let dashSelector = info.selector.replace(/[A-Z]/g, char => '-' + char.toLowerCase());
    return {
      restrict: 'E',
      terminal: true,
      require: REQUIRE_INJECTOR,
      compile: (templateElement: angular.IAugmentedJQuery, templateAttributes: angular.IAttributes,
                transclude: angular.ITranscludeFunction) => {
        // We might have compile the contents lazily, because this might have been triggered by the
        // UpgradeNg1ComponentAdapterBuilder, when the ng2 templates have not been compiled yet
        return {
          post: (scope: angular.IScope, element: angular.IAugmentedJQuery,
                 attrs: angular.IAttributes, parentInjector: Injector | ParentInjectorPromise,
                 transclude: angular.ITranscludeFunction): void => {
            let id = idPrefix + (idCount++);
            (<any>element[0]).id = id;

            let injectorPromise = new ParentInjectorPromise(element);

            const ng2Compiler = ng1Injector.get(NG2_COMPILER) as Compiler;
            const ngContentSelectors = ng2Compiler.getNgContentSelectors(info.type);
            const linkFns = compileProjectedNodes(templateElement, ngContentSelectors);

            const componentFactory: ComponentFactory<any> = componentFactoryRefMap[info.selector];
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

            parentInjector = parentInjector || ng1Injector.get(NG2_INJECTOR);

            if (parentInjector instanceof ParentInjectorPromise) {
              parentInjector.then((resolvedInjector: Injector) => downgrade(resolvedInjector));
            } else {
              downgrade(parentInjector);
            }

            function downgrade(injector: Injector) {
              const facade = new DowngradeNg2ComponentAdapter(
                  info, element, attrs, scope, injector, parse, componentFactory);
              facade.setupInputs();
              facade.bootstrapNg2(projectableNodes);
              facade.setupOutputs();
              facade.registerCleanup();
              injectorPromise.resolve(facade.componentRef.injector);
            }
          }
        };
      }
    };

    function compileProjectedNodes(
        templateElement: angular.IAugmentedJQuery,
        ngContentSelectors: string[]): angular.ILinkFn[] {
      if (!ngContentSelectors)
        throw new Error('Expecting ngContentSelectors for: ' + info.selector);
      // We have to sort the projected content before we compile it, hence the terminal: true
      let projectableTemplateNodes =
          sortProjectableNodes(ngContentSelectors, templateElement.contents());
      return projectableTemplateNodes.map(nodes => ng1Compile(nodes));
    }
  }
  return directiveFactory;
}

/**
 * Use `UpgradeAdapterRef` to control a hybrid Angular 1 / Angular 2+ application.
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
   * Register a callback function which is notified upon successful hybrid Angular 1 / Angular 2+
   * application has been bootstrapped.
   *
   * The `ready` callback function is invoked inside the Angular 2+ zone, therefore it does not
   * require a call to `$apply()`.
   */
  public ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void) { this._readyFn = fn; }

  /**
   * Dispose of running hybrid Angular 1 / Angular 2+ application.
   */
  public dispose() {
    this.ng1Injector.get(NG1_ROOT_SCOPE).$destroy();
    this.ng2ModuleRef.destroy();
  }
}


/**
 * Sort a set of DOM nodes that into groups based on the given content selectors
 */
export function sortProjectableNodes(ngContentSelectors: string[], childNodes: Node[]): Node[][] {
  let projectableNodes: Node[][] = [];
  let matcher = new SelectorMatcher();
  let wildcardNgContentIndex: number;
  for (let i = 0, ii = ngContentSelectors.length; i < ii; i++) {
    projectableNodes[i] = [];
    if (ngContentSelectors[i] === '*') {
      wildcardNgContentIndex = i;
    } else {
      matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
    }
  }
  for (let node of childNodes) {
    let ngContentIndices: number[] = [];
    let selector =
        createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
    matcher.match(
        selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
    ngContentIndices.sort();
    if (wildcardNgContentIndex !== undefined) {
      ngContentIndices.push(wildcardNgContentIndex);
    }
    if (ngContentIndices.length > 0) {
      projectableNodes[ngContentIndices[0]].push(node);
    }
  }
  return projectableNodes;
}
