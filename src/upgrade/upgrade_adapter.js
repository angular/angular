'use strict';var angular2_1 = require('angular2/angular2');
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
        var platformRef = angular2_1.platform(browser_1.BROWSER_PROVIDERS);
        var applicationRef = platformRef.application([
            browser_1.BROWSER_APP_PROVIDERS,
            angular2_1.provide(constants_1.NG1_INJECTOR, { useFactory: function () { return ng1Injector; } }),
            angular2_1.provide(constants_1.NG1_COMPILE, { useFactory: function () { return ng1Injector.get(constants_1.NG1_COMPILE); } }),
            this.providers
        ]);
        var injector = applicationRef.injector;
        var ngZone = injector.get(angular2_1.NgZone);
        var compiler = injector.get(angular2_1.Compiler);
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
            .value(constants_1.NG2_APP_VIEW_MANAGER, injector.get(angular2_1.AppViewManager))
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
        this.providers.push(angular2_1.provide(token, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3VwZ3JhZGUvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIlVwZ3JhZGVBZGFwdGVyIiwiVXBncmFkZUFkYXB0ZXIuY29uc3RydWN0b3IiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50IiwiVXBncmFkZUFkYXB0ZXIuYm9vdHN0cmFwIiwiVXBncmFkZUFkYXB0ZXIuYWRkUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJQcm92aWRlciIsIlVwZ3JhZGVBZGFwdGVyLmNvbXBpbGVOZzJDb21wb25lbnRzIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlLmRpcmVjdGl2ZUZhY3RvcnkiLCJVcGdyYWRlQWRhcHRlclJlZiIsIlVwZ3JhZGVBZGFwdGVyUmVmLmNvbnN0cnVjdG9yIiwiVXBncmFkZUFkYXB0ZXJSZWYuX2Jvb3RzdHJhcERvbmUiLCJVcGdyYWRlQWRhcHRlclJlZi5yZWFkeSIsIlVwZ3JhZGVBZGFwdGVyUmVmLmRpc3Bvc2UiXSwibWFwcGluZ3MiOiJBQUFBLHlCQWNPLG1CQUFtQixDQUFDLENBQUE7QUFHM0Isc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFDNUQsd0JBQXVELDJCQUEyQixDQUFDLENBQUE7QUFFbkYseUJBQThDLFlBQVksQ0FBQyxDQUFBO0FBQzNELHFCQUFxQyxRQUFRLENBQUMsQ0FBQTtBQUM5QywwQkFZTyxhQUFhLENBQUMsQ0FBQTtBQUNyQixzQ0FBMkMseUJBQXlCLENBQUMsQ0FBQTtBQUNyRSxvQ0FBZ0QsdUJBQXVCLENBQUMsQ0FBQTtBQUN4RSxJQUFZLE9BQU8sV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUV4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bXBvcnQge1xuICBiaW5kLFxuICBwcm92aWRlLFxuICBwbGF0Zm9ybSxcbiAgQXBwbGljYXRpb25SZWYsXG4gIEFwcFZpZXdNYW5hZ2VyLFxuICBDb21waWxlcixcbiAgSW5qZWN0LFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBQbGF0Zm9ybVJlZixcbiAgUHJvdG9WaWV3UmVmLFxuICBQcm92aWRlcixcbiAgVHlwZVxufSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge0FQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT01QSUxFUl9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9jb21waWxlcic7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7QlJPV1NFUl9QUk9WSURFUlMsIEJST1dTRVJfQVBQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbmltcG9ydCB7Z2V0Q29tcG9uZW50SW5mbywgQ29tcG9uZW50SW5mb30gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge29uRXJyb3IsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge1xuICBORzFfQ09NUElMRSxcbiAgTkcxX0lOSkVDVE9SLFxuICBORzFfUEFSU0UsXG4gIE5HMV9ST09UX1NDT1BFLFxuICBORzFfU0NPUEUsXG4gIE5HMl9BUFBfVklFV19NQU5BR0VSLFxuICBORzJfQ09NUElMRVIsXG4gIE5HMl9JTkpFQ1RPUixcbiAgTkcyX1BST1RPX1ZJRVdfUkVGX01BUCxcbiAgTkcyX1pPTkUsXG4gIFJFUVVJUkVfSU5KRUNUT1Jcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVOZzJDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9uZzJfYWRhcHRlcic7XG5pbXBvcnQge1VwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gZnJvbSAnLi91cGdyYWRlX25nMV9hZGFwdGVyJztcbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyX2pzJztcblxudmFyIHVwZ3JhZGVDb3VudDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyYCB0byBhbGxvdyBBbmd1bGFySlMgdjEgYW5kIEFuZ3VsYXIgdjIgdG8gY29leGlzdCBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYFVwZ3JhZGVBZGFwdGVyYCBhbGxvd3M6XG4gKiAxLiBjcmVhdGlvbiBvZiBBbmd1bGFyIHYyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZGlyZWN0aXZlXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciN1cGdyYWRlTmcxQ29tcG9uZW50KCldKVxuICogMi4gY3JlYXRpb24gb2YgQW5ndWxhckpTIHYxIGRpcmVjdGl2ZSBmcm9tIEFuZ3VsYXIgdjIgY29tcG9uZW50LlxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjZG93bmdyYWRlTmcyQ29tcG9uZW50KCldKVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIHYxIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXJKUyB2MSBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciB2MiBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFyIHYyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgdjEgY29tcG9uZW50IGNhbiBiZSB1cGdyYWRlZCB0byBhbiBBbmd1bGFyIHYyIGNvbXBvbmVudC4gVGhpcyBjcmVhdGVzIGFuXG4gKiAgICBBbmd1bGFyIHYyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIHYxIGNvbXBvbmVudCBkaXJlY3RpdmUgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDYuIEFuIEFuZ3VsYXIgdjIgY29tcG9uZW50IGNhbiBiZSBkb3duZ3JhZGVkIHRvIGFuIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZGlyZWN0aXZlLiBUaGlzIGNyZWF0ZXNcbiAqICAgIGFuIEFuZ3VsYXJKUyB2MSBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgdjIgY29tcG9uZW50IGluIHRoYXQgbG9jYXRpb24uXG4gKiA3LiBXaGVuZXZlciBhbiBhZGFwdGVyIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSB0aGUgZnJhbWV3b3JrXG4gKiAgICBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGUgdmlldyBmb3IgdGhhdFxuICogICAgY29tcG9uZW50LiBUaGlzIGltcGxpZXMgdGhhdCBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay4gVGhlIHN5bnRheCBpcyBhbHdheXMgdGhhdCBvZiBBbmd1bGFyIHYyIHN5bnRheC5cbiAqIDguIEFuZ3VsYXJKUyB2MSBpcyBhbHdheXMgYm9vdHN0cmFwcGVkIGZpcnN0IGFuZCBvd25zIHRoZSBib3R0b20gbW9zdCB2aWV3LlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIEFuZ3VsYXIgdjIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICpcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJyxcbiAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldXG4gKiB9KVxuICogY2xhc3MgTmcyIHtcbiAqIH1cbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMj4nO1xuICpcbiAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlciB7XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGlkUHJlZml4OiBzdHJpbmcgPSBgTkcyX1VQR1JBREVfJHt1cGdyYWRlQ291bnQrK31fYDtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgdXBncmFkZWRDb21wb25lbnRzOiBUeXBlW10gPSBbXTtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgZG93bmdyYWRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSA9IHt9O1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiA9IFtdO1xuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciB2MiBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUyB2MS5cbiAgICpcbiAgICogVXNlIGBkb3duZ3JhZGVOZzJDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFySlMgdjEgRGlyZWN0aXZlIERlZmluaXRpb24gRmFjdG9yeSBmcm9tXG4gICAqIEFuZ3VsYXIgdjIgQ29tcG9uZW50LiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFyIHYyIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGVcbiAgICogQW5ndWxhckpTIHYxIHRlbXBsYXRlLlxuICAgKlxuICAgKiAjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXJKUyB2MSB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMgdjEsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhciB2Mi5cbiAgICogMi4gRXZlbiB0aG91Z2h0IHRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGluIEFuZ3VsYXJKUyB2MSwgaXQgd2lsbCBiZSB1c2luZyBBbmd1bGFyIHYyXG4gICAqICAgIHN5bnRheC4gVGhpcyBoYXMgdG8gYmUgZG9uZSwgdGhpcyB3YXkgYmVjYXVzZSB3ZSBtdXN0IGZvbGxvdyBBbmd1bGFyIHYyIGNvbXBvbmVudHMgZG8gbm90XG4gICAqICAgIGRlY2xhcmUgaG93IHRoZSBhdHRyaWJ1dGVzIHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAgICpcbiAgICogIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIENvbnRlbnQgcHJvamVjdGlvbjogeWVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChHcmVldGVyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PidcbiAgICogfSlcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgQElucHV0KCkgc2FsdXRhdGlvbjogc3RyaW5nO1xuICAgKiAgIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgICogfVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9XG4gICAqICAgJ25nMSB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzEgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMkNvbXBvbmVudCh0eXBlOiBUeXBlKTogRnVuY3Rpb24ge1xuICAgIHRoaXMudXBncmFkZWRDb21wb25lbnRzLnB1c2godHlwZSk7XG4gICAgdmFyIGluZm86IENvbXBvbmVudEluZm8gPSBnZXRDb21wb25lbnRJbmZvKHR5cGUpO1xuICAgIHJldHVybiBuZzFDb21wb25lbnREaXJlY3RpdmUoaW5mbywgYCR7dGhpcy5pZFByZWZpeH0ke2luZm8uc2VsZWN0b3J9X2NgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIHYxIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhciB2Mi5cbiAgICpcbiAgICogVXNlIGB1cGdyYWRlTmcxQ29tcG9uZW50YCB0byBjcmVhdGUgYW4gQW5ndWxhciB2MiBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgdjEgQ29tcG9uZW50XG4gICAqIGRpcmVjdGl2ZS4gVGhlIGFkYXB0ZXIgd2lsbCBib290c3RyYXAgQW5ndWxhckpTIHYxIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGUgQW5ndWxhciB2MlxuICAgKiB0ZW1wbGF0ZS5cbiAgICpcbiAgICogIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFyIHYyIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXIgdjIsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhckpTIHYxLlxuICAgKlxuICAgKiAjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqIC0gVHJhbnNjbHVzaW9uOiB5ZXNcbiAgICogLSBPbmx5IHNvbWUgb2YgdGhlIGZlYXR1cmVzIG9mXG4gICAqICAgW0RpcmVjdGl2ZSBEZWZpbml0aW9uIE9iamVjdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UvJGNvbXBpbGUpIGFyZVxuICAgKiAgIHN1cHBvcnRlZDpcbiAgICogICAtIGBjb21waWxlYDogbm90IHN1cHBvcnRlZCBiZWNhdXNlIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgQW5ndWxhciB2Miwgd2hpY2ggZG9lc1xuICAgKiAgICAgbm90IGFsbG93IG1vZGlmeWluZyBET00gc3RydWN0dXJlIGR1cmluZyBjb21waWxhdGlvbi5cbiAgICogICAtIGBjb250cm9sbGVyYDogc3VwcG9ydGVkLiAoTk9URTogaW5qZWN0aW9uIG9mIGAkYXR0cnNgIGFuZCBgJHRyYW5zY2x1ZGVgIGlzIG5vdCBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYGNvbnRyb2xsZXJBcyc6IHN1cHBvcnRlZC5cbiAgICogICAtIGBiaW5kVG9Db250cm9sbGVyJzogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGxpbmsnOiBzdXBwb3J0ZWQuIChOT1RFOiBvbmx5IHByZS1saW5rIGZ1bmN0aW9uIGlzIHN1cHBvcnRlZC4pXG4gICAqICAgLSBgbmFtZSc6IHN1cHBvcnRlZC5cbiAgICogICAtIGBwcmlvcml0eSc6IGlnbm9yZWQuXG4gICAqICAgLSBgcmVwbGFjZSc6IG5vdCBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVxdWlyZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXN0cmljdGA6IG11c3QgYmUgc2V0IHRvICdFJy5cbiAgICogICAtIGBzY29wZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZVVybGA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZXJtaW5hbGA6IGlnbm9yZWQuXG4gICAqICAgLSBgdHJhbnNjbHVkZWA6IHN1cHBvcnRlZC5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICBzY29wZToge3NhbHV0YXRpb246ICc9JywgbmFtZTogJz0nIH0sXG4gICAqICAgICB0ZW1wbGF0ZTogJ3t7c2FsdXRhdGlvbn19IHt7bmFtZX19ISAtIDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPidcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICB0ZW1wbGF0ZTogJ25nMiB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+J1xuICAgKiAgIGRpcmVjdGl2ZXM6IFthZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ2dyZWV0JyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMiB7XG4gICAqIH1cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMj48L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMiB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBUeXBlIHtcbiAgICBpZiAoKDxhbnk+dGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50cykuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50c1tuYW1lXSA9IG5ldyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIobmFtZSkpLnR5cGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBUaGlzIGBib290c3RyYXBgIG1ldGhvZCBpcyBhIGRpcmVjdCByZXBsYWNlbWVudCAodGFrZXMgc2FtZSBhcmd1bWVudHMpIGZvciBBbmd1bGFySlMgdjFcbiAgICogW2Bib290c3RyYXBgXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvZnVuY3Rpb24vYW5ndWxhci5ib290c3RyYXApIG1ldGhvZC4gVW5saWtlXG4gICAqIEFuZ3VsYXJKUyB2MSwgdGhpcyBib290c3RyYXAgaXMgYXN5bmNocm9ub3VzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzEnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAgICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ25nMls8bmcxIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFthZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXVxuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzIgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICAgKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGJvb3RzdHJhcChlbGVtZW50OiBFbGVtZW50LCBtb2R1bGVzPzogYW55W10sXG4gICAgICAgICAgICBjb25maWc/OiBhbmd1bGFyLklBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKTogVXBncmFkZUFkYXB0ZXJSZWYge1xuICAgIHZhciB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgdmFyIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgPSBudWxsO1xuICAgIHZhciBwbGF0Zm9ybVJlZjogUGxhdGZvcm1SZWYgPSBwbGF0Zm9ybShCUk9XU0VSX1BST1ZJREVSUyk7XG4gICAgdmFyIGFwcGxpY2F0aW9uUmVmOiBBcHBsaWNhdGlvblJlZiA9IHBsYXRmb3JtUmVmLmFwcGxpY2F0aW9uKFtcbiAgICAgIEJST1dTRVJfQVBQX1BST1ZJREVSUyxcbiAgICAgIHByb3ZpZGUoTkcxX0lOSkVDVE9SLCB7dXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3J9KSxcbiAgICAgIHByb3ZpZGUoTkcxX0NPTVBJTEUsIHt1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvci5nZXQoTkcxX0NPTVBJTEUpfSksXG4gICAgICB0aGlzLnByb3ZpZGVyc1xuICAgIF0pO1xuICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3IgPSBhcHBsaWNhdGlvblJlZi5pbmplY3RvcjtcbiAgICB2YXIgbmdab25lOiBOZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICB2YXIgY29tcGlsZXI6IENvbXBpbGVyID0gaW5qZWN0b3IuZ2V0KENvbXBpbGVyKTtcbiAgICB2YXIgZGVsYXlBcHBseUV4cHM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICB2YXIgb3JpZ2luYWwkYXBwbHlGbjogRnVuY3Rpb247XG4gICAgdmFyIHJvb3RTY29wZVByb3RvdHlwZTogYW55O1xuICAgIHZhciByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XG4gICAgdmFyIHByb3RvVmlld1JlZk1hcDogUHJvdG9WaWV3UmVmTWFwID0ge307XG4gICAgdmFyIG5nMU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKHRoaXMuaWRQcmVmaXgsIG1vZHVsZXMpO1xuICAgIHZhciBuZzFjb21waWxlUHJvbWlzZTogUHJvbWlzZTxhbnk+ID0gbnVsbDtcbiAgICBuZzFNb2R1bGUudmFsdWUoTkcyX0lOSkVDVE9SLCBpbmplY3RvcilcbiAgICAgICAgLnZhbHVlKE5HMl9aT05FLCBuZ1pvbmUpXG4gICAgICAgIC52YWx1ZShORzJfQ09NUElMRVIsIGNvbXBpbGVyKVxuICAgICAgICAudmFsdWUoTkcyX1BST1RPX1ZJRVdfUkVGX01BUCwgcHJvdG9WaWV3UmVmTWFwKVxuICAgICAgICAudmFsdWUoTkcyX0FQUF9WSUVXX01BTkFHRVIsIGluamVjdG9yLmdldChBcHBWaWV3TWFuYWdlcikpXG4gICAgICAgIC5jb25maWcoW1xuICAgICAgICAgICckcHJvdmlkZScsXG4gICAgICAgICAgKHByb3ZpZGUpID0+IHtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKE5HMV9ST09UX1NDT1BFLCBbXG4gICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICBmdW5jdGlvbihyb290U2NvcGVEZWxlZ2F0ZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkge1xuICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IHJvb3RTY29wZURlbGVnYXRlLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlLmhhc093blByb3BlcnR5KCckYXBwbHknKSkge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWwkYXBwbHlGbiA9IHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHk7XG4gICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gKGV4cCkgPT4gZGVsYXlBcHBseUV4cHMucHVzaChleHApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCAnJGFwcGx5JyBvbiAnJHJvb3RTY29wZSchXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlID0gcm9vdFNjb3BlRGVsZWdhdGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgXSlcbiAgICAgICAgLnJ1bihbXG4gICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgJyRyb290U2NvcGUnLFxuICAgICAgICAgIChpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIG5nMUluamVjdG9yID0gaW5qZWN0b3I7XG4gICAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUobmdab25lLm9uVHVybkRvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8pID0+IHsgbmdab25lLnJ1bigoKSA9PiByb290U2NvcGUuJGFwcGx5KCkpOyB9KTtcbiAgICAgICAgICAgIG5nMWNvbXBpbGVQcm9taXNlID1cbiAgICAgICAgICAgICAgICBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIucmVzb2x2ZSh0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLCBpbmplY3Rvcik7XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhKGNvbnRyb2xsZXJLZXkoTkcyX0lOSkVDVE9SKSwgaW5qZWN0b3IpO1xuICAgIG5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdGhpcy5pZFByZWZpeF0sIGNvbmZpZyk7IH0pO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLmNvbXBpbGVOZzJDb21wb25lbnRzKGNvbXBpbGVyLCBwcm90b1ZpZXdSZWZNYXApLCBuZzFjb21waWxlUHJvbWlzZV0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBuZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47ICAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICB3aGlsZSAoZGVsYXlBcHBseUV4cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRhcHBseShkZWxheUFwcGx5RXhwcy5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZShhcHBsaWNhdGlvblJlZiwgbmcxSW5qZWN0b3IpO1xuICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJvdmlkZXIgdG8gdGhlIHRvcCBsZXZlbCBlbnZpcm9ubWVudCBvZiBhIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBJbiBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbiwgdGhlcmUgaXMgbm8gb25lIHJvb3QgQW5ndWxhciB2MiBjb21wb25lbnQsXG4gICAqIGZvciB0aGlzIHJlYXNvbiB3ZSBwcm92aWRlIGFuIGFwcGxpY2F0aW9uIGdsb2JhbCB3YXkgb2YgcmVnaXN0ZXJpbmcgcHJvdmlkZXJzIHdoaWNoIGlzXG4gICAqIGNvbnNpc3RlbnQgd2l0aCBzaW5nbGUgZ2xvYmFsIGluamVjdGlvbiBpbiBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBncmVldChuYW1lKSB7XG4gICAqICAgICBhbGVydCgnSGVsbG8gJyArIG5hbWUgKyAnIScpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgdGVtcGxhdGU6ICcnXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7XG4gICAqICAgY29uc3RydWN0b3IoZ3JlZXRlcjogR3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyKCdXb3JsZCcpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEdyZWV0ZXIpO1xuICAgKlxuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnYXBwJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoQXBwKSk7XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxhcHA+PC9hcHA+J1xuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKTtcbiAgICpgYGBcbiAgICovXG4gIHB1YmxpYyBhZGRQcm92aWRlcihwcm92aWRlcjogVHlwZSB8IFByb3ZpZGVyIHwgYW55W10pOiB2b2lkIHsgdGhpcy5wcm92aWRlcnMucHVzaChwcm92aWRlcik7IH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyB2MSBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFyIHYyLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgTG9naW4geyAuLi4gfVxuICAgKiBjbGFzcyBTZXJ2ZXIgeyAuLi4gfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJ3NlcnZlcicpIHNlcnZlciwgbG9naW46IExvZ2luKSB7XG4gICAqICAgICAuLi5cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdzZXJ2ZXInLCBTZXJ2ZXIpO1xuICAgKiBtb2R1bGUuc2VydmljZSgnbG9naW4nLCBMb2dpbik7XG4gICAqXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdzZXJ2ZXInKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ2xvZ2luJywge2FzVG9rZW46IExvZ2lufSk7XG4gICAqIGFkYXB0ZXIuYWRkUHJvdmlkZXIoRXhhbXBsZSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICB2YXIgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzJJbmplY3Rvci5nZXQoRXhhbXBsZSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICB2YXIgdG9rZW4gPSBvcHRpb25zICYmIG9wdGlvbnMuYXNUb2tlbiB8fCBuYW1lO1xuICAgIHRoaXMucHJvdmlkZXJzLnB1c2gocHJvdmlkZSh0b2tlbiwge1xuICAgICAgdXNlRmFjdG9yeTogKG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IG5nMUluamVjdG9yLmdldChuYW1lKSxcbiAgICAgIGRlcHM6IFtORzFfSU5KRUNUT1JdXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHYyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUyB2MS5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiB9XG4gICAqXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIGFkYXB0ZXIuYWRkUHJvdmlkZXIoRXhhbXBsZSk7XG4gICAqXG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZmFjdG9yeSgnZXhhbXBsZScsIGFkYXB0ZXIuZG93bmdyYWRlTmcyUHJvdmlkZXIoRXhhbXBsZSkpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgdmFyIGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBkb3duZ3JhZGVOZzJQcm92aWRlcih0b2tlbjogYW55KTogRnVuY3Rpb24ge1xuICAgIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24oaW5qZWN0b3I6IEluamVjdG9yKSB7IHJldHVybiBpbmplY3Rvci5nZXQodG9rZW4pOyB9O1xuICAgICg8YW55PmZhY3RvcnkpLiRpbmplY3QgPSBbTkcyX0lOSkVDVE9SXTtcbiAgICByZXR1cm4gZmFjdG9yeTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGNvbXBpbGVOZzJDb21wb25lbnRzKGNvbXBpbGVyOiBDb21waWxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm90b1ZpZXdSZWZNYXA6IFByb3RvVmlld1JlZk1hcCk6IFByb21pc2U8UHJvdG9WaWV3UmVmTWFwPiB7XG4gICAgdmFyIHByb21pc2VzOiBBcnJheTxQcm9taXNlPFByb3RvVmlld1JlZj4+ID0gW107XG4gICAgdmFyIHR5cGVzID0gdGhpcy51cGdyYWRlZENvbXBvbmVudHM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHJvbWlzZXMucHVzaChjb21waWxlci5jb21waWxlSW5Ib3N0KHR5cGVzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigocHJvdG9WaWV3czogQXJyYXk8UHJvdG9WaWV3UmVmPikgPT4ge1xuICAgICAgdmFyIHR5cGVzID0gdGhpcy51cGdyYWRlZENvbXBvbmVudHM7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3RvVmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcHJvdG9WaWV3UmVmTWFwW2dldENvbXBvbmVudEluZm8odHlwZXNbaV0pLnNlbGVjdG9yXSA9IHByb3RvVmlld3NbaV07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvdG9WaWV3UmVmTWFwO1xuICAgIH0sIG9uRXJyb3IpO1xuICB9XG59XG5cbmludGVyZmFjZSBQcm90b1ZpZXdSZWZNYXAge1xuICBbc2VsZWN0b3I6IHN0cmluZ106IFByb3RvVmlld1JlZjtcbn1cblxuZnVuY3Rpb24gbmcxQ29tcG9uZW50RGlyZWN0aXZlKGluZm86IENvbXBvbmVudEluZm8sIGlkUHJlZml4OiBzdHJpbmcpOiBGdW5jdGlvbiB7XG4gICg8YW55PmRpcmVjdGl2ZUZhY3RvcnkpLiRpbmplY3QgPSBbTkcyX1BST1RPX1ZJRVdfUkVGX01BUCwgTkcyX0FQUF9WSUVXX01BTkFHRVIsIE5HMV9QQVJTRV07XG4gIGZ1bmN0aW9uIGRpcmVjdGl2ZUZhY3RvcnkocHJvdG9WaWV3UmVmTWFwOiBQcm90b1ZpZXdSZWZNYXAsIHZpZXdNYW5hZ2VyOiBBcHBWaWV3TWFuYWdlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICB2YXIgcHJvdG9WaWV3OiBQcm90b1ZpZXdSZWYgPSBwcm90b1ZpZXdSZWZNYXBbaW5mby5zZWxlY3Rvcl07XG4gICAgaWYgKCFwcm90b1ZpZXcpIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIFByb3RvVmlld1JlZiBmb3I6ICcgKyBpbmZvLnNlbGVjdG9yKTtcbiAgICB2YXIgaWRDb3VudCA9IDA7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXF1aXJlOiBSRVFVSVJFX0lOSkVDVE9SLFxuICAgICAgbGluazoge1xuICAgICAgICBwb3N0OiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgcGFyZW50SW5qZWN0b3I6IGFueSwgdHJhbnNjbHVkZTogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uKTogdm9pZCA9PiB7XG4gICAgICAgICAgdmFyIGRvbUVsZW1lbnQgPSA8YW55PmVsZW1lbnRbMF07XG4gICAgICAgICAgdmFyIGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVOZzJDb21wb25lbnRBZGFwdGVyKGlkUHJlZml4ICsgKGlkQ291bnQrKyksIGluZm8sIGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLCBzY29wZSwgPEluamVjdG9yPnBhcmVudEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZSwgdmlld01hbmFnZXIsIHByb3RvVmlldyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLmJvb3RzdHJhcE5nMigpO1xuICAgICAgICAgIGZhY2FkZS5wcm9qZWN0Q29udGVudCgpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cE91dHB1dHMoKTtcbiAgICAgICAgICBmYWNhZGUucmVnaXN0ZXJDbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFVzZSBgVWdyYWRlQWRhcHRlclJlZmAgdG8gY29udHJvbCBhIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXJSZWYge1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcmVhZHlGbjogKHVwZ3JhZGVBZGFwdGVyUmVmPzogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQgPSBudWxsO1xuXG4gIHB1YmxpYyBuZzFSb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UgPSBudWxsO1xuICBwdWJsaWMgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSA9IG51bGw7XG4gIHB1YmxpYyBuZzJBcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYgPSBudWxsO1xuICBwdWJsaWMgbmcySW5qZWN0b3I6IEluamVjdG9yID0gbnVsbDtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwRG9uZShhcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYsIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgICB0aGlzLm5nMkFwcGxpY2F0aW9uUmVmID0gYXBwbGljYXRpb25SZWY7XG4gICAgdGhpcy5uZzJJbmplY3RvciA9IGFwcGxpY2F0aW9uUmVmLmluamVjdG9yO1xuICAgIHRoaXMubmcxSW5qZWN0b3IgPSBuZzFJbmplY3RvcjtcbiAgICB0aGlzLm5nMVJvb3RTY29wZSA9IG5nMUluamVjdG9yLmdldChORzFfUk9PVF9TQ09QRSk7XG4gICAgdGhpcy5fcmVhZHlGbiAmJiB0aGlzLl9yZWFkeUZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgbm90aWZpZWQgdXBvbiBzdWNjZXNzZnVsIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyXG4gICAqIGFwcGxpY2F0aW9uIGhhcyBiZWVuIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogVGhlIGByZWFkeWAgY2FsbGJhY2sgZnVuY3Rpb24gaXMgaW52b2tlZCBpbnNpZGUgdGhlIEFuZ3VsYXIgdjIgem9uZSwgdGhlcmVmb3JlIGl0IGRvZXMgbm90XG4gICAqIHJlcXVpcmUgYSBjYWxsIHRvIGAkYXBwbHkoKWAuXG4gICAqL1xuICBwdWJsaWMgcmVhZHkoZm46ICh1cGdyYWRlQWRhcHRlclJlZj86IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB7IHRoaXMuX3JlYWR5Rm4gPSBmbjsgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHJ1bm5pbmcgaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5nMUluamVjdG9yLmdldChORzFfUk9PVF9TQ09QRSkuJGRlc3Ryb3koKTtcbiAgICB0aGlzLm5nMkFwcGxpY2F0aW9uUmVmLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19