'use strict';var core_1 = require('angular2/core');
var async_1 = require('angular2/src/facade/async');
var browser_1 = require('angular2/platform/browser');
var metadata_1 = require('./metadata');
var util_1 = require('./util');
var constants_1 = require('./constants');
var downgrade_ng2_adapter_1 = require('./downgrade_ng2_adapter');
var upgrade_ng1_adapter_1 = require('./upgrade_ng1_adapter');
var angular = require('./angular_js');
var upgradeCount = 0;
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
 *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
 *   directives: [adapter.upgradeNg1Component('ng1')]
 * })
 * class Ng2 {
 * }
 *
 * document.body.innerHTML = '<ng2 name="World">project</ng2>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 * ```
 */
var UpgradeAdapter = (function () {
    function UpgradeAdapter() {
        /* @internal */
        this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
        /* @internal */
        this.upgradedComponents = [];
        /* @internal */
        this.downgradedComponents = {};
        /* @internal */
        this.providers = [];
    }
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
     * var adapter = new UpgradeAdapter();
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
     * document.body.innerHTML =
     *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
     * });
     * ```
     */
    UpgradeAdapter.prototype.downgradeNg2Component = function (type) {
        this.upgradedComponents.push(type);
        var info = metadata_1.getComponentInfo(type);
        return ng1ComponentDirective(info, "" + this.idPrefix + info.selector + "_c");
    };
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
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     *
     * module.directive('greet', function() {
     *   return {
     *     scope: {salutation: '=', name: '=' },
     *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
     *   };
     * });
     *
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * @Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     *   directives: [adapter.upgradeNg1Component('greet')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2></ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
     * });
     * ```
     */
    UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
        if (this.downgradedComponents.hasOwnProperty(name)) {
            return this.downgradedComponents[name].type;
        }
        else {
            return (this.downgradedComponents[name] = new upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder(name)).type;
        }
    };
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
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
     *   directives: [adapter.upgradeNg1Component('ng1')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2 name="World">project</ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     * ```
     */
    UpgradeAdapter.prototype.bootstrap = function (element, modules, config) {
        var _this = this;
        var upgrade = new UpgradeAdapterRef();
        var ng1Injector = null;
        var platformRef = core_1.platform(browser_1.BROWSER_PROVIDERS);
        var applicationRef = platformRef.application([
            browser_1.BROWSER_APP_PROVIDERS,
            core_1.provide(constants_1.NG1_INJECTOR, { useFactory: function () { return ng1Injector; } }),
            core_1.provide(constants_1.NG1_COMPILE, { useFactory: function () { return ng1Injector.get(constants_1.NG1_COMPILE); } }),
            this.providers
        ]);
        var injector = applicationRef.injector;
        var ngZone = injector.get(core_1.NgZone);
        var compiler = injector.get(core_1.Compiler);
        var delayApplyExps = [];
        var original$applyFn;
        var rootScopePrototype;
        var rootScope;
        var protoViewRefMap = {};
        var ng1Module = angular.module(this.idPrefix, modules);
        var ng1compilePromise = null;
        ng1Module.value(constants_1.NG2_INJECTOR, injector)
            .value(constants_1.NG2_ZONE, ngZone)
            .value(constants_1.NG2_COMPILER, compiler)
            .value(constants_1.NG2_PROTO_VIEW_REF_MAP, protoViewRefMap)
            .value(constants_1.NG2_APP_VIEW_MANAGER, injector.get(core_1.AppViewManager))
            .config([
            '$provide',
            function (provide) {
                provide.decorator(constants_1.NG1_ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = function (exp) { return delayApplyExps.push(exp); };
                        }
                        else {
                            throw new Error("Failed to find '$apply' on '$rootScope'!");
                        }
                        return rootScope = rootScopeDelegate;
                    }
                ]);
            }
        ])
            .run([
            '$injector',
            '$rootScope',
            function (injector, rootScope) {
                ng1Injector = injector;
                async_1.ObservableWrapper.subscribe(ngZone.onTurnDone, function (_) { ngZone.run(function () { return rootScope.$apply(); }); });
                ng1compilePromise =
                    upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder.resolve(_this.downgradedComponents, injector);
            }
        ]);
        angular.element(element).data(util_1.controllerKey(constants_1.NG2_INJECTOR), injector);
        ngZone.run(function () { angular.bootstrap(element, [_this.idPrefix], config); });
        Promise.all([this.compileNg2Components(compiler, protoViewRefMap), ng1compilePromise])
            .then(function () {
            ngZone.run(function () {
                if (rootScopePrototype) {
                    rootScopePrototype.$apply = original$applyFn; // restore original $apply
                    while (delayApplyExps.length) {
                        rootScope.$apply(delayApplyExps.shift());
                    }
                    upgrade._bootstrapDone(applicationRef, ng1Injector);
                    rootScopePrototype = null;
                }
            });
        }, util_1.onError);
        return upgrade;
    };
    /**
     * Adds a provider to the top level environment of a hybrid AngularJS v1 / Angular v2 application.
     *
     * In hybrid AngularJS v1 / Angular v2 application, there is no one root Angular v2 component,
     * for this reason we provide an application global way of registering providers which is
     * consistent with single global injection in AngularJS v1.
     *
     * ### Example
     *
     * ```
     * class Greeter {
     *   greet(name) {
     *     alert('Hello ' + name + '!');
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: ''
     * })
     * class App {
     *   constructor(greeter: Greeter) {
     *     this.greeter('World');
     *   }
     * }
     *
     * var adapter = new UpgradeAdapter();
     * adapter.addProvider(Greeter);
     *
     * var module = angular.module('myExample', []);
     * module.directive('app', adapter.downgradeNg2Component(App));
     *
     * document.body.innerHTML = '<app></app>'
     * adapter.bootstrap(document.body, ['myExample']);
     *```
     */
    UpgradeAdapter.prototype.addProvider = function (provider) { this.providers.push(provider); };
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
     * adapter.addProvider(Example);
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   var example: Example = ref.ng2Injector.get(Example);
     * });
     *
     * ```
     */
    UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
        var token = options && options.asToken || name;
        this.providers.push(core_1.provide(token, {
            useFactory: function (ng1Injector) { return ng1Injector.get(name); },
            deps: [constants_1.NG1_INJECTOR]
        }));
    };
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
     * adapter.addProvider(Example);
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
    UpgradeAdapter.prototype.downgradeNg2Provider = function (token) {
        var factory = function (injector) { return injector.get(token); };
        factory.$inject = [constants_1.NG2_INJECTOR];
        return factory;
    };
    /* @internal */
    UpgradeAdapter.prototype.compileNg2Components = function (compiler, protoViewRefMap) {
        var _this = this;
        var promises = [];
        var types = this.upgradedComponents;
        for (var i = 0; i < types.length; i++) {
            promises.push(compiler.compileInHost(types[i]));
        }
        return Promise.all(promises).then(function (protoViews) {
            var types = _this.upgradedComponents;
            for (var i = 0; i < protoViews.length; i++) {
                protoViewRefMap[metadata_1.getComponentInfo(types[i]).selector] = protoViews[i];
            }
            return protoViewRefMap;
        }, util_1.onError);
    };
    return UpgradeAdapter;
})();
exports.UpgradeAdapter = UpgradeAdapter;
function ng1ComponentDirective(info, idPrefix) {
    directiveFactory.$inject = [constants_1.NG2_PROTO_VIEW_REF_MAP, constants_1.NG2_APP_VIEW_MANAGER, constants_1.NG1_PARSE];
    function directiveFactory(protoViewRefMap, viewManager, parse) {
        var protoView = protoViewRefMap[info.selector];
        if (!protoView)
            throw new Error('Expecting ProtoViewRef for: ' + info.selector);
        var idCount = 0;
        return {
            restrict: 'E',
            require: constants_1.REQUIRE_INJECTOR,
            link: {
                post: function (scope, element, attrs, parentInjector, transclude) {
                    var domElement = element[0];
                    var facade = new downgrade_ng2_adapter_1.DowngradeNg2ComponentAdapter(idPrefix + (idCount++), info, element, attrs, scope, parentInjector, parse, viewManager, protoView);
                    facade.setupInputs();
                    facade.bootstrapNg2();
                    facade.projectContent();
                    facade.setupOutputs();
                    facade.registerCleanup();
                }
            }
        };
    }
    return directiveFactory;
}
/**
 * Use `UgradeAdapterRef` to control a hybrid AngularJS v1 / Angular v2 application.
 */
var UpgradeAdapterRef = (function () {
    function UpgradeAdapterRef() {
        /* @internal */
        this._readyFn = null;
        this.ng1RootScope = null;
        this.ng1Injector = null;
        this.ng2ApplicationRef = null;
        this.ng2Injector = null;
    }
    /* @internal */
    UpgradeAdapterRef.prototype._bootstrapDone = function (applicationRef, ng1Injector) {
        this.ng2ApplicationRef = applicationRef;
        this.ng2Injector = applicationRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get(constants_1.NG1_ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    };
    /**
     * Register a callback function which is notified upon successful hybrid AngularJS v1 / Angular v2
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular v2 zone, therefore it does not
     * require a call to `$apply()`.
     */
    UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
    /**
     * Dispose of running hybrid AngularJS v1 / Angular v2 application.
     */
    UpgradeAdapterRef.prototype.dispose = function () {
        this.ng1Injector.get(constants_1.NG1_ROOT_SCOPE).$destroy();
        this.ng2ApplicationRef.dispose();
    };
    return UpgradeAdapterRef;
})();
exports.UpgradeAdapterRef = UpgradeAdapterRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3VwZ3JhZGUvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIlVwZ3JhZGVBZGFwdGVyIiwiVXBncmFkZUFkYXB0ZXIuY29uc3RydWN0b3IiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50IiwiVXBncmFkZUFkYXB0ZXIuYm9vdHN0cmFwIiwiVXBncmFkZUFkYXB0ZXIuYWRkUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJQcm92aWRlciIsIlVwZ3JhZGVBZGFwdGVyLmNvbXBpbGVOZzJDb21wb25lbnRzIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlLmRpcmVjdGl2ZUZhY3RvcnkiLCJVcGdyYWRlQWRhcHRlclJlZiIsIlVwZ3JhZGVBZGFwdGVyUmVmLmNvbnN0cnVjdG9yIiwiVXBncmFkZUFkYXB0ZXJSZWYuX2Jvb3RzdHJhcERvbmUiLCJVcGdyYWRlQWRhcHRlclJlZi5yZWFkeSIsIlVwZ3JhZGVBZGFwdGVyUmVmLmRpc3Bvc2UiXSwibWFwcGluZ3MiOiJBQUFBLHFCQWFPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBQzVELHdCQUF1RCwyQkFBMkIsQ0FBQyxDQUFBO0FBRW5GLHlCQUE4QyxZQUFZLENBQUMsQ0FBQTtBQUMzRCxxQkFBcUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsMEJBWU8sYUFBYSxDQUFDLENBQUE7QUFDckIsc0NBQTJDLHlCQUF5QixDQUFDLENBQUE7QUFDckUsb0NBQWdELHVCQUF1QixDQUFDLENBQUE7QUFDeEUsSUFBWSxPQUFPLFdBQU0sY0FBYyxDQUFDLENBQUE7QUFFeEMs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biAgcHJvdmlkZSxcbiAgcGxhdGZvcm0sXG4gIEFwcGxpY2F0aW9uUmVmLFxuICBBcHBWaWV3TWFuYWdlcixcbiAgQ29tcGlsZXIsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIFBsYXRmb3JtUmVmLFxuICBQcm90b1ZpZXdSZWYsXG4gIFByb3ZpZGVyLFxuICBUeXBlLFxuICBBUFBMSUNBVElPTl9DT01NT05fUFJPVklERVJTXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0JST1dTRVJfUFJPVklERVJTLCBCUk9XU0VSX0FQUF9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuXG5pbXBvcnQge2dldENvbXBvbmVudEluZm8sIENvbXBvbmVudEluZm99IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtvbkVycm9yLCBjb250cm9sbGVyS2V5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtcbiAgTkcxX0NPTVBJTEUsXG4gIE5HMV9JTkpFQ1RPUixcbiAgTkcxX1BBUlNFLFxuICBORzFfUk9PVF9TQ09QRSxcbiAgTkcxX1NDT1BFLFxuICBORzJfQVBQX1ZJRVdfTUFOQUdFUixcbiAgTkcyX0NPTVBJTEVSLFxuICBORzJfSU5KRUNUT1IsXG4gIE5HMl9QUk9UT19WSUVXX1JFRl9NQVAsXG4gIE5HMl9aT05FLFxuICBSRVFVSVJFX0lOSkVDVE9SXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlTmcyQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfbmcyX2FkYXB0ZXInO1xuaW1wb3J0IHtVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9IGZyb20gJy4vdXBncmFkZV9uZzFfYWRhcHRlcic7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcl9qcyc7XG5cbnZhciB1cGdyYWRlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlcmAgdG8gYWxsb3cgQW5ndWxhckpTIHYxIGFuZCBBbmd1bGFyIHYyIHRvIGNvZXhpc3QgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBVcGdyYWRlQWRhcHRlcmAgYWxsb3dzOlxuICogMS4gY3JlYXRpb24gb2YgQW5ndWxhciB2MiBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgdjEgY29tcG9uZW50IGRpcmVjdGl2ZVxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjdXBncmFkZU5nMUNvbXBvbmVudCgpXSlcbiAqIDIuIGNyZWF0aW9uIG9mIEFuZ3VsYXJKUyB2MSBkaXJlY3RpdmUgZnJvbSBBbmd1bGFyIHYyIGNvbXBvbmVudC5cbiAqICAgIChTZWUgW1VwZ3JhZGVBZGFwdGVyI2Rvd25ncmFkZU5nMkNvbXBvbmVudCgpXSlcbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIE1lbnRhbCBNb2RlbFxuICpcbiAqIFdoZW4gcmVhc29uaW5nIGFib3V0IGhvdyBhIGh5YnJpZCBhcHBsaWNhdGlvbiB3b3JrcyBpdCBpcyB1c2VmdWwgdG8gaGF2ZSBhIG1lbnRhbCBtb2RlbCB3aGljaFxuICogZGVzY3JpYmVzIHdoYXQgaXMgaGFwcGVuaW5nIGFuZCBleHBsYWlucyB3aGF0IGlzIGhhcHBlbmluZyBhdCB0aGUgbG93ZXN0IGxldmVsLlxuICpcbiAqIDEuIFRoZXJlIGFyZSB0d28gaW5kZXBlbmRlbnQgZnJhbWV3b3JrcyBydW5uaW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLCBlYWNoIGZyYW1ld29yayB0cmVhdHNcbiAqICAgIHRoZSBvdGhlciBhcyBhIGJsYWNrIGJveC5cbiAqIDIuIEVhY2ggRE9NIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgb3duZWQgZXhhY3RseSBieSBvbmUgZnJhbWV3b3JrLiBXaGljaGV2ZXIgZnJhbWV3b3JrXG4gKiAgICBpbnN0YW50aWF0ZWQgdGhlIGVsZW1lbnQgaXMgdGhlIG93bmVyLiBFYWNoIGZyYW1ld29yayBvbmx5IHVwZGF0ZXMvaW50ZXJhY3RzIHdpdGggaXRzIG93blxuICogICAgRE9NIGVsZW1lbnRzIGFuZCBpZ25vcmVzIG90aGVycy5cbiAqIDMuIEFuZ3VsYXJKUyB2MSBkaXJlY3RpdmVzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFySlMgdjEgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgdjIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhciB2MiBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIHYxIGNvbXBvbmVudCBjYW4gYmUgdXBncmFkZWQgdG8gYW4gQW5ndWxhciB2MiBjb21wb25lbnQuIFRoaXMgY3JlYXRlcyBhblxuICogICAgQW5ndWxhciB2MiBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZGlyZWN0aXZlIGluIHRoYXQgbG9jYXRpb24uXG4gKiA2LiBBbiBBbmd1bGFyIHYyIGNvbXBvbmVudCBjYW4gYmUgZG93bmdyYWRlZCB0byBhbiBBbmd1bGFySlMgdjEgY29tcG9uZW50IGRpcmVjdGl2ZS4gVGhpcyBjcmVhdGVzXG4gKiAgICBhbiBBbmd1bGFySlMgdjEgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIHYyIGNvbXBvbmVudCBpbiB0aGF0IGxvY2F0aW9uLlxuICogNy4gV2hlbmV2ZXIgYW4gYWRhcHRlciBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgdGhlIGZyYW1ld29ya1xuICogICAgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlIHZpZXcgZm9yIHRoYXRcbiAqICAgIGNvbXBvbmVudC4gVGhpcyBpbXBsaWVzIHRoYXQgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuIFRoZSBzeW50YXggaXMgYWx3YXlzIHRoYXQgb2YgQW5ndWxhciB2MiBzeW50YXguXG4gKiA4LiBBbmd1bGFySlMgdjEgaXMgYWx3YXlzIGJvb3RzdHJhcHBlZCBmaXJzdCBhbmQgb3ducyB0aGUgYm90dG9tIG1vc3Qgdmlldy5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBBbmd1bGFyIHYyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAqXG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzEnLCBmdW5jdGlvbigpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICogICB9O1xuICogfSk7XG4gKlxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ25nMicsXG4gKiAgIGlucHV0czogWyduYW1lJ10sXG4gKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEgW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzE+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KScsXG4gKiAgIGRpcmVjdGl2ZXM6IFthZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXVxuICogfSlcbiAqIGNsYXNzIE5nMiB7XG4gKiB9XG4gKlxuICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAqXG4gKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXIge1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBpZFByZWZpeDogc3RyaW5nID0gYE5HMl9VUEdSQURFXyR7dXBncmFkZUNvdW50Kyt9X2A7XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIHVwZ3JhZGVkQ29tcG9uZW50czogVHlwZVtdID0gW107XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGRvd25ncmFkZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gPSB7fTtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4gPSBbXTtcblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXIgdjIgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqIFVzZSBgZG93bmdyYWRlTmcyQ29tcG9uZW50YCB0byBjcmVhdGUgYW4gQW5ndWxhckpTIHYxIERpcmVjdGl2ZSBEZWZpbml0aW9uIEZhY3RvcnkgZnJvbVxuICAgKiBBbmd1bGFyIHYyIENvbXBvbmVudC4gVGhlIGFkYXB0ZXIgd2lsbCBib290c3RyYXAgQW5ndWxhciB2MiBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlXG4gICAqIEFuZ3VsYXJKUyB2MSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFySlMgdjEgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTIHYxLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXIgdjIuXG4gICAqIDIuIEV2ZW4gdGhvdWdodCB0aGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBpbiBBbmd1bGFySlMgdjEsIGl0IHdpbGwgYmUgdXNpbmcgQW5ndWxhciB2MlxuICAgKiAgICBzeW50YXguIFRoaXMgaGFzIHRvIGJlIGRvbmUsIHRoaXMgd2F5IGJlY2F1c2Ugd2UgbXVzdCBmb2xsb3cgQW5ndWxhciB2MiBjb21wb25lbnRzIGRvIG5vdFxuICAgKiAgICBkZWNsYXJlIGhvdyB0aGUgYXR0cmlidXRlcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqXG4gICAqICMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogLSBDb250ZW50IHByb2plY3Rpb246IHllc1xuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoR3JlZXRlcikpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICB0ZW1wbGF0ZTogJ3t7c2FsdXRhdGlvbn19IHt7bmFtZX19ISAtIDxuZy1jb250ZW50PjwvbmctY29udGVudD4nXG4gICAqIH0pXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgIEBJbnB1dCgpIHNhbHV0YXRpb246IHN0cmluZztcbiAgICogICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG4gICAqIH1cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPVxuICAgKiAgICduZzEgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0Pic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcxIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBkb3duZ3JhZGVOZzJDb21wb25lbnQodHlwZTogVHlwZSk6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLnVwZ3JhZGVkQ29tcG9uZW50cy5wdXNoKHR5cGUpO1xuICAgIHZhciBpbmZvOiBDb21wb25lbnRJbmZvID0gZ2V0Q29tcG9uZW50SW5mbyh0eXBlKTtcbiAgICByZXR1cm4gbmcxQ29tcG9uZW50RGlyZWN0aXZlKGluZm8sIGAke3RoaXMuaWRQcmVmaXh9JHtpbmZvLnNlbGVjdG9yfV9jYCk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyB2MSBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIgdjIuXG4gICAqXG4gICAqIFVzZSBgdXBncmFkZU5nMUNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXIgdjIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIHYxIENvbXBvbmVudFxuICAgKiBkaXJlY3RpdmUuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlIEFuZ3VsYXIgdjJcbiAgICogdGVtcGxhdGUuXG4gICAqXG4gICAqICMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhciB2MiB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFyIHYyLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXJKUyB2MS5cbiAgICpcbiAgICogIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIFRyYW5zY2x1c2lvbjogeWVzXG4gICAqIC0gT25seSBzb21lIG9mIHRoZSBmZWF0dXJlcyBvZlxuICAgKiAgIFtEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlLyRjb21waWxlKSBhcmVcbiAgICogICBzdXBwb3J0ZWQ6XG4gICAqICAgLSBgY29tcGlsZWA6IG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IEFuZ3VsYXIgdjIsIHdoaWNoIGRvZXNcbiAgICogICAgIG5vdCBhbGxvdyBtb2RpZnlpbmcgRE9NIHN0cnVjdHVyZSBkdXJpbmcgY29tcGlsYXRpb24uXG4gICAqICAgLSBgY29udHJvbGxlcmA6IHN1cHBvcnRlZC4gKE5PVEU6IGluamVjdGlvbiBvZiBgJGF0dHJzYCBhbmQgYCR0cmFuc2NsdWRlYCBpcyBub3Qgc3VwcG9ydGVkLilcbiAgICogICAtIGBjb250cm9sbGVyQXMnOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgYmluZFRvQ29udHJvbGxlcic6IHN1cHBvcnRlZC5cbiAgICogICAtIGBsaW5rJzogc3VwcG9ydGVkLiAoTk9URTogb25seSBwcmUtbGluayBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYG5hbWUnOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcHJpb3JpdHknOiBpZ25vcmVkLlxuICAgKiAgIC0gYHJlcGxhY2UnOiBub3Qgc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlcXVpcmVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVzdHJpY3RgOiBtdXN0IGJlIHNldCB0byAnRScuXG4gICAqICAgLSBgc2NvcGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVVcmxgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVybWluYWxgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHRyYW5zY2x1ZGVgOiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgc2NvcGU6IHtzYWx1dGF0aW9uOiAnPScsIG5hbWU6ICc9JyB9LFxuICAgKiAgICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4nXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgdGVtcGxhdGU6ICduZzIgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0PidcbiAgICogICBkaXJlY3RpdmVzOiBbYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCdncmVldCcpXVxuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzI+PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzIgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHVwZ3JhZGVOZzFDb21wb25lbnQobmFtZTogc3RyaW5nKTogVHlwZSB7XG4gICAgaWYgKCg8YW55PnRoaXMuZG93bmdyYWRlZENvbXBvbmVudHMpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50c1tuYW1lXS50eXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNbbmFtZV0gPSBuZXcgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyKG5hbWUpKS50eXBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBgYm9vdHN0cmFwYCBtZXRob2QgaXMgYSBkaXJlY3QgcmVwbGFjZW1lbnQgKHRha2VzIHNhbWUgYXJndW1lbnRzKSBmb3IgQW5ndWxhckpTIHYxXG4gICAqIFtgYm9vdHN0cmFwYF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKSBtZXRob2QuIFVubGlrZVxuICAgKiBBbmd1bGFySlMgdjEsIHRoaXMgYm9vdHN0cmFwIGlzIGFzeW5jaHJvbm91cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gICAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIGlucHV0czogWyduYW1lJ10sXG4gICAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJyxcbiAgICogICBkaXJlY3RpdmVzOiBbYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzEnKV1cbiAgICogfSlcbiAgICogY2xhc3MgTmcyIHtcbiAgICogfVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAgICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBib290c3RyYXAoZWxlbWVudDogRWxlbWVudCwgbW9kdWxlcz86IGFueVtdLFxuICAgICAgICAgICAgY29uZmlnPzogYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6IFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgICB2YXIgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuICAgIHZhciBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlID0gbnVsbDtcbiAgICB2YXIgcGxhdGZvcm1SZWY6IFBsYXRmb3JtUmVmID0gcGxhdGZvcm0oQlJPV1NFUl9QUk9WSURFUlMpO1xuICAgIHZhciBhcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYgPSBwbGF0Zm9ybVJlZi5hcHBsaWNhdGlvbihbXG4gICAgICBCUk9XU0VSX0FQUF9QUk9WSURFUlMsXG4gICAgICBwcm92aWRlKE5HMV9JTkpFQ1RPUiwge3VzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yfSksXG4gICAgICBwcm92aWRlKE5HMV9DT01QSUxFLCB7dXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3IuZ2V0KE5HMV9DT01QSUxFKX0pLFxuICAgICAgdGhpcy5wcm92aWRlcnNcbiAgICBdKTtcbiAgICB2YXIgaW5qZWN0b3I6IEluamVjdG9yID0gYXBwbGljYXRpb25SZWYuaW5qZWN0b3I7XG4gICAgdmFyIG5nWm9uZTogTmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgdmFyIGNvbXBpbGVyOiBDb21waWxlciA9IGluamVjdG9yLmdldChDb21waWxlcik7XG4gICAgdmFyIGRlbGF5QXBwbHlFeHBzOiBGdW5jdGlvbltdID0gW107XG4gICAgdmFyIG9yaWdpbmFsJGFwcGx5Rm46IEZ1bmN0aW9uO1xuICAgIHZhciByb290U2NvcGVQcm90b3R5cGU6IGFueTtcbiAgICB2YXIgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlO1xuICAgIHZhciBwcm90b1ZpZXdSZWZNYXA6IFByb3RvVmlld1JlZk1hcCA9IHt9O1xuICAgIHZhciBuZzFNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICB2YXIgbmcxY29tcGlsZVByb21pc2U6IFByb21pc2U8YW55PiA9IG51bGw7XG4gICAgbmcxTW9kdWxlLnZhbHVlKE5HMl9JTkpFQ1RPUiwgaW5qZWN0b3IpXG4gICAgICAgIC52YWx1ZShORzJfWk9ORSwgbmdab25lKVxuICAgICAgICAudmFsdWUoTkcyX0NPTVBJTEVSLCBjb21waWxlcilcbiAgICAgICAgLnZhbHVlKE5HMl9QUk9UT19WSUVXX1JFRl9NQVAsIHByb3RvVmlld1JlZk1hcClcbiAgICAgICAgLnZhbHVlKE5HMl9BUFBfVklFV19NQU5BR0VSLCBpbmplY3Rvci5nZXQoQXBwVmlld01hbmFnZXIpKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLFxuICAgICAgICAgIChwcm92aWRlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcihORzFfUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHApID0+IGRlbGF5QXBwbHlFeHBzLnB1c2goZXhwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZpbmQgJyRhcHBseScgb24gJyRyb290U2NvcGUnIVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZSA9IHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIF0pXG4gICAgICAgIC5ydW4oW1xuICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgICAgICAoaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBuZzFJbmplY3RvciA9IGluamVjdG9yO1xuICAgICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG5nWm9uZS5vblR1cm5Eb25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfKSA9PiB7IG5nWm9uZS5ydW4oKCkgPT4gcm9vdFNjb3BlLiRhcHBseSgpKTsgfSk7XG4gICAgICAgICAgICBuZzFjb21waWxlUHJvbWlzZSA9XG4gICAgICAgICAgICAgICAgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyLnJlc29sdmUodGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50cywgaW5qZWN0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG5cbiAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YShjb250cm9sbGVyS2V5KE5HMl9JTkpFQ1RPUiksIGluamVjdG9yKTtcbiAgICBuZ1pvbmUucnVuKCgpID0+IHsgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgW3RoaXMuaWRQcmVmaXhdLCBjb25maWcpOyB9KTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy5jb21waWxlTmcyQ29tcG9uZW50cyhjb21waWxlciwgcHJvdG9WaWV3UmVmTWFwKSwgbmcxY29tcGlsZVByb21pc2VdKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHkgPSBvcmlnaW5hbCRhcHBseUZuOyAgLy8gcmVzdG9yZSBvcmlnaW5hbCAkYXBwbHlcbiAgICAgICAgICAgICAgd2hpbGUgKGRlbGF5QXBwbHlFeHBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kYXBwbHkoZGVsYXlBcHBseUV4cHMuc2hpZnQoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKDxhbnk+dXBncmFkZSkuX2Jvb3RzdHJhcERvbmUoYXBwbGljYXRpb25SZWYsIG5nMUluamVjdG9yKTtcbiAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgb25FcnJvcik7XG4gICAgcmV0dXJuIHVwZ3JhZGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHByb3ZpZGVyIHRvIHRoZSB0b3AgbGV2ZWwgZW52aXJvbm1lbnQgb2YgYSBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogSW4gaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24sIHRoZXJlIGlzIG5vIG9uZSByb290IEFuZ3VsYXIgdjIgY29tcG9uZW50LFxuICAgKiBmb3IgdGhpcyByZWFzb24gd2UgcHJvdmlkZSBhbiBhcHBsaWNhdGlvbiBnbG9iYWwgd2F5IG9mIHJlZ2lzdGVyaW5nIHByb3ZpZGVycyB3aGljaCBpc1xuICAgKiBjb25zaXN0ZW50IHdpdGggc2luZ2xlIGdsb2JhbCBpbmplY3Rpb24gaW4gQW5ndWxhckpTIHYxLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgZ3JlZXQobmFtZSkge1xuICAgKiAgICAgYWxlcnQoJ0hlbGxvICcgKyBuYW1lICsgJyEnKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiAnJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge1xuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6IEdyZWV0ZXIpIHtcbiAgICogICAgIHRoaXMuZ3JlZXRlcignV29ybGQnKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAgICogYWRhcHRlci5hZGRQcm92aWRlcihHcmVldGVyKTtcbiAgICpcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2FwcCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEFwcCkpO1xuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8YXBwPjwvYXBwPidcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSk7XG4gICAqYGBgXG4gICAqL1xuICBwdWJsaWMgYWRkUHJvdmlkZXIocHJvdmlkZXI6IFR5cGUgfCBQcm92aWRlciB8IGFueVtdKTogdm9pZCB7IHRoaXMucHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpOyB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgdjEgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhciB2Mi5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIExvZ2luIHsgLi4uIH1cbiAgICogY2xhc3MgU2VydmVyIHsgLi4uIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogICBjb25zdHJ1Y3RvcihASW5qZWN0KCdzZXJ2ZXInKSBzZXJ2ZXIsIGxvZ2luOiBMb2dpbikge1xuICAgKiAgICAgLi4uXG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignc2VydmVyJyk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdsb2dpbicsIHthc1Rva2VuOiBMb2dpbn0pO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEV4YW1wbGUpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgdmFyIGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgdXBncmFkZU5nMVByb3ZpZGVyKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IHthc1Rva2VuOiBhbnl9KSB7XG4gICAgdmFyIHRva2VuID0gb3B0aW9ucyAmJiBvcHRpb25zLmFzVG9rZW4gfHwgbmFtZTtcbiAgICB0aGlzLnByb3ZpZGVycy5wdXNoKHByb3ZpZGUodG9rZW4sIHtcbiAgICAgIHVzZUZhY3Rvcnk6IChuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiBuZzFJbmplY3Rvci5nZXQobmFtZSksXG4gICAgICBkZXBzOiBbTkcxX0lOSkVDVE9SXVxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciB2MiBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEV4YW1wbGUpO1xuICAgKlxuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIHZhciBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMUluamVjdG9yLmdldCgnZXhhbXBsZScpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgZG93bmdyYWRlTmcyUHJvdmlkZXIodG9rZW46IGFueSk6IEZ1bmN0aW9uIHtcbiAgICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uKGluamVjdG9yOiBJbmplY3RvcikgeyByZXR1cm4gaW5qZWN0b3IuZ2V0KHRva2VuKTsgfTtcbiAgICAoPGFueT5mYWN0b3J5KS4kaW5qZWN0ID0gW05HMl9JTkpFQ1RPUl07XG4gICAgcmV0dXJuIGZhY3Rvcnk7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBjb21waWxlTmcyQ29tcG9uZW50cyhjb21waWxlcjogQ29tcGlsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9WaWV3UmVmTWFwOiBQcm90b1ZpZXdSZWZNYXApOiBQcm9taXNlPFByb3RvVmlld1JlZk1hcD4ge1xuICAgIHZhciBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxQcm90b1ZpZXdSZWY+PiA9IFtdO1xuICAgIHZhciB0eXBlcyA9IHRoaXMudXBncmFkZWRDb21wb25lbnRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHByb21pc2VzLnB1c2goY29tcGlsZXIuY29tcGlsZUluSG9zdCh0eXBlc1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKHByb3RvVmlld3M6IEFycmF5PFByb3RvVmlld1JlZj4pID0+IHtcbiAgICAgIHZhciB0eXBlcyA9IHRoaXMudXBncmFkZWRDb21wb25lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm90b1ZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHByb3RvVmlld1JlZk1hcFtnZXRDb21wb25lbnRJbmZvKHR5cGVzW2ldKS5zZWxlY3Rvcl0gPSBwcm90b1ZpZXdzW2ldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3RvVmlld1JlZk1hcDtcbiAgICB9LCBvbkVycm9yKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgUHJvdG9WaWV3UmVmTWFwIHtcbiAgW3NlbGVjdG9yOiBzdHJpbmddOiBQcm90b1ZpZXdSZWY7XG59XG5cbmZ1bmN0aW9uIG5nMUNvbXBvbmVudERpcmVjdGl2ZShpbmZvOiBDb21wb25lbnRJbmZvLCBpZFByZWZpeDogc3RyaW5nKTogRnVuY3Rpb24ge1xuICAoPGFueT5kaXJlY3RpdmVGYWN0b3J5KS4kaW5qZWN0ID0gW05HMl9QUk9UT19WSUVXX1JFRl9NQVAsIE5HMl9BUFBfVklFV19NQU5BR0VSLCBORzFfUEFSU0VdO1xuICBmdW5jdGlvbiBkaXJlY3RpdmVGYWN0b3J5KHByb3RvVmlld1JlZk1hcDogUHJvdG9WaWV3UmVmTWFwLCB2aWV3TWFuYWdlcjogQXBwVmlld01hbmFnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgdmFyIHByb3RvVmlldzogUHJvdG9WaWV3UmVmID0gcHJvdG9WaWV3UmVmTWFwW2luZm8uc2VsZWN0b3JdO1xuICAgIGlmICghcHJvdG9WaWV3KSB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGluZyBQcm90b1ZpZXdSZWYgZm9yOiAnICsgaW5mby5zZWxlY3Rvcik7XG4gICAgdmFyIGlkQ291bnQgPSAwO1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVxdWlyZTogUkVRVUlSRV9JTkpFQ1RPUixcbiAgICAgIGxpbms6IHtcbiAgICAgICAgcG9zdDogKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgIHBhcmVudEluamVjdG9yOiBhbnksIHRyYW5zY2x1ZGU6IGFuZ3VsYXIuSVRyYW5zY2x1ZGVGdW5jdGlvbik6IHZvaWQgPT4ge1xuICAgICAgICAgIHZhciBkb21FbGVtZW50ID0gPGFueT5lbGVtZW50WzBdO1xuICAgICAgICAgIHZhciBmYWNhZGUgPSBuZXcgRG93bmdyYWRlTmcyQ29tcG9uZW50QWRhcHRlcihpZFByZWZpeCArIChpZENvdW50KyspLCBpbmZvLCBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRycywgc2NvcGUsIDxJbmplY3Rvcj5wYXJlbnRJbmplY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2UsIHZpZXdNYW5hZ2VyLCBwcm90b1ZpZXcpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5ib290c3RyYXBOZzIoKTtcbiAgICAgICAgICBmYWNhZGUucHJvamVjdENvbnRlbnQoKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBVc2UgYFVncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICh1cGdyYWRlQWRhcHRlclJlZj86IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkID0gbnVsbDtcblxuICBwdWJsaWMgbmcxUm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlID0gbnVsbDtcbiAgcHVibGljIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgPSBudWxsO1xuICBwdWJsaWMgbmcyQXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmID0gbnVsbDtcbiAgcHVibGljIG5nMkluamVjdG9yOiBJbmplY3RvciA9IG51bGw7XG5cbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcERvbmUoYXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmLCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gICAgdGhpcy5uZzJBcHBsaWNhdGlvblJlZiA9IGFwcGxpY2F0aW9uUmVmO1xuICAgIHRoaXMubmcySW5qZWN0b3IgPSBhcHBsaWNhdGlvblJlZi5pbmplY3RvcjtcbiAgICB0aGlzLm5nMUluamVjdG9yID0gbmcxSW5qZWN0b3I7XG4gICAgdGhpcy5uZzFSb290U2NvcGUgPSBuZzFJbmplY3Rvci5nZXQoTkcxX1JPT1RfU0NPUEUpO1xuICAgIHRoaXMuX3JlYWR5Rm4gJiYgdGhpcy5fcmVhZHlGbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIG5vdGlmaWVkIHVwb24gc3VjY2Vzc2Z1bCBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MlxuICAgKiBhcHBsaWNhdGlvbiBoYXMgYmVlbiBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIFRoZSBgcmVhZHlgIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGludm9rZWQgaW5zaWRlIHRoZSBBbmd1bGFyIHYyIHpvbmUsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdFxuICAgKiByZXF1aXJlIGEgY2FsbCB0byBgJGFwcGx5KClgLlxuICAgKi9cbiAgcHVibGljIHJlYWR5KGZuOiAodXBncmFkZUFkYXB0ZXJSZWY/OiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCkgeyB0aGlzLl9yZWFkeUZuID0gZm47IH1cblxuICAvKipcbiAgICogRGlzcG9zZSBvZiBydW5uaW5nIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5uZzFJbmplY3Rvci5nZXQoTkcxX1JPT1RfU0NPUEUpLiRkZXN0cm95KCk7XG4gICAgdGhpcy5uZzJBcHBsaWNhdGlvblJlZi5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==