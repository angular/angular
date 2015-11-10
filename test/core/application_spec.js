var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var bootstrap_1 = require('angular2/bootstrap');
var application_ref_1 = require('angular2/src/core/application_ref');
var core_1 = require('angular2/core');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var render_1 = require('angular2/render');
var async_1 = require('angular2/src/facade/async');
var core_2 = require('angular2/core');
var exceptions_1 = require('angular2/src/facade/exceptions');
var testability_1 = require('angular2/src/core/testability/testability');
var HelloRootCmp = (function () {
    function HelloRootCmp() {
        this.greeting = 'hello';
    }
    HelloRootCmp = __decorate([
        core_1.Component({ selector: 'hello-app' }),
        core_1.View({ template: '{{greeting}} world!' }), 
        __metadata('design:paramtypes', [])
    ], HelloRootCmp);
    return HelloRootCmp;
})();
var HelloRootCmpContent = (function () {
    function HelloRootCmpContent() {
    }
    HelloRootCmpContent = __decorate([
        core_1.Component({ selector: 'hello-app' }),
        core_1.View({ template: 'before: <ng-content></ng-content> after: done' }), 
        __metadata('design:paramtypes', [])
    ], HelloRootCmpContent);
    return HelloRootCmpContent;
})();
var HelloRootCmp2 = (function () {
    function HelloRootCmp2() {
        this.greeting = 'hello';
    }
    HelloRootCmp2 = __decorate([
        core_1.Component({ selector: 'hello-app-2' }),
        core_1.View({ template: '{{greeting}} world, again!' }), 
        __metadata('design:paramtypes', [])
    ], HelloRootCmp2);
    return HelloRootCmp2;
})();
var HelloRootCmp3 = (function () {
    function HelloRootCmp3(appBinding) {
        this.appBinding = appBinding;
    }
    HelloRootCmp3 = __decorate([
        core_1.Component({ selector: 'hello-app' }),
        core_1.View({ template: '' }),
        __param(0, core_2.Inject("appBinding")), 
        __metadata('design:paramtypes', [Object])
    ], HelloRootCmp3);
    return HelloRootCmp3;
})();
var HelloRootCmp4 = (function () {
    function HelloRootCmp4(appRef) {
        this.appRef = appRef;
    }
    HelloRootCmp4 = __decorate([
        core_1.Component({ selector: 'hello-app' }),
        core_1.View({ template: '' }),
        __param(0, core_2.Inject(application_ref_1.ApplicationRef)), 
        __metadata('design:paramtypes', [Object])
    ], HelloRootCmp4);
    return HelloRootCmp4;
})();
var HelloRootMissingTemplate = (function () {
    function HelloRootMissingTemplate() {
    }
    HelloRootMissingTemplate = __decorate([
        core_1.Component({ selector: 'hello-app' }), 
        __metadata('design:paramtypes', [])
    ], HelloRootMissingTemplate);
    return HelloRootMissingTemplate;
})();
var HelloRootDirectiveIsNotCmp = (function () {
    function HelloRootDirectiveIsNotCmp() {
    }
    HelloRootDirectiveIsNotCmp = __decorate([
        core_1.Directive({ selector: 'hello-app' }), 
        __metadata('design:paramtypes', [])
    ], HelloRootDirectiveIsNotCmp);
    return HelloRootDirectiveIsNotCmp;
})();
var _ArrayLogger = (function () {
    function _ArrayLogger() {
        this.res = [];
    }
    _ArrayLogger.prototype.log = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logError = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroup = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroupEnd = function () { };
    ;
    return _ArrayLogger;
})();
function main() {
    var fakeDoc, el, el2, testProviders, lightDom;
    testing_internal_1.describe('bootstrap factory method', function () {
        testing_internal_1.beforeEach(function () {
            fakeDoc = dom_adapter_1.DOM.createHtmlDocument();
            el = dom_adapter_1.DOM.createElement('hello-app', fakeDoc);
            el2 = dom_adapter_1.DOM.createElement('hello-app-2', fakeDoc);
            lightDom = dom_adapter_1.DOM.createElement('light-dom-el', fakeDoc);
            dom_adapter_1.DOM.appendChild(fakeDoc.body, el);
            dom_adapter_1.DOM.appendChild(fakeDoc.body, el2);
            dom_adapter_1.DOM.appendChild(el, lightDom);
            dom_adapter_1.DOM.setText(lightDom, 'loading');
            testProviders = [core_2.provide(render_1.DOCUMENT, { useValue: fakeDoc })];
        });
        testing_internal_1.it('should throw if bootstrapped Directive is not a Component', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var logger = new _ArrayLogger();
            var exceptionHandler = new exceptions_1.ExceptionHandler(logger, false);
            var refPromise = bootstrap_1.bootstrap(HelloRootDirectiveIsNotCmp, [testProviders, core_2.provide(exceptions_1.ExceptionHandler, { useValue: exceptionHandler })]);
            async_1.PromiseWrapper.then(refPromise, null, function (exception) {
                testing_internal_1.expect(exception).toContainError("Could not compile '" + lang_1.stringify(HelloRootDirectiveIsNotCmp) + "' because it is not a component.");
                testing_internal_1.expect(logger.res.join("")).toContain("Could not compile");
                async.done();
                return null;
            });
        }));
        testing_internal_1.it('should throw if no element is found', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var logger = new _ArrayLogger();
            var exceptionHandler = new exceptions_1.ExceptionHandler(logger, lang_1.IS_DART ? false : true);
            var refPromise = bootstrap_1.bootstrap(HelloRootCmp, [core_2.provide(exceptions_1.ExceptionHandler, { useValue: exceptionHandler })]);
            async_1.PromiseWrapper.then(refPromise, null, function (reason) {
                testing_internal_1.expect(reason.message).toContain('The selector "hello-app" did not match any elements');
                async.done();
                return null;
            });
        }));
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.it('should invoke the default exception handler when bootstrap fails', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var logger = new _ArrayLogger();
                var exceptionHandler = new exceptions_1.ExceptionHandler(logger, lang_1.IS_DART ? false : true);
                var refPromise = bootstrap_1.bootstrap(HelloRootCmp, [core_2.provide(exceptions_1.ExceptionHandler, { useValue: exceptionHandler })]);
                async_1.PromiseWrapper.then(refPromise, null, function (reason) {
                    testing_internal_1.expect(logger.res.join(""))
                        .toContain('The selector "hello-app" did not match any elements');
                    async.done();
                    return null;
                });
            }));
        }
        testing_internal_1.it('should create an injector promise', function () {
            var refPromise = bootstrap_1.bootstrap(HelloRootCmp, testProviders);
            testing_internal_1.expect(refPromise).not.toBe(null);
        });
        testing_internal_1.it('should display hello world', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var refPromise = bootstrap_1.bootstrap(HelloRootCmp, testProviders);
            refPromise.then(function (ref) {
                testing_internal_1.expect(el).toHaveText('hello world!');
                async.done();
            });
        }));
        testing_internal_1.it('should support multiple calls to bootstrap', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var refPromise1 = bootstrap_1.bootstrap(HelloRootCmp, testProviders);
            var refPromise2 = bootstrap_1.bootstrap(HelloRootCmp2, testProviders);
            async_1.PromiseWrapper.all([refPromise1, refPromise2])
                .then(function (refs) {
                testing_internal_1.expect(el).toHaveText('hello world!');
                testing_internal_1.expect(el2).toHaveText('hello world, again!');
                async.done();
            });
        }));
        testing_internal_1.it("should make the provided bindings available to the application component", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var refPromise = bootstrap_1.bootstrap(HelloRootCmp3, [testProviders, core_2.provide("appBinding", { useValue: "BoundValue" })]);
            refPromise.then(function (ref) {
                testing_internal_1.expect(ref.hostComponent.appBinding).toEqual("BoundValue");
                async.done();
            });
        }));
        testing_internal_1.it("should avoid cyclic dependencies when root component requires Lifecycle through DI", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var refPromise = bootstrap_1.bootstrap(HelloRootCmp4, testProviders);
            refPromise.then(function (ref) {
                testing_internal_1.expect(ref.hostComponent.appRef).toBe(ref.injector.get(application_ref_1.ApplicationRef));
                async.done();
            });
        }));
        testing_internal_1.it('should register each application with the testability registry', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var refPromise1 = bootstrap_1.bootstrap(HelloRootCmp, testProviders);
            var refPromise2 = bootstrap_1.bootstrap(HelloRootCmp2, testProviders);
            async_1.PromiseWrapper.all([refPromise1, refPromise2])
                .then(function (refs) {
                var registry = refs[0].injector.get(testability_1.TestabilityRegistry);
                var testabilities = [refs[0].injector.get(testability_1.Testability), refs[1].injector.get(testability_1.Testability)];
                async_1.PromiseWrapper.all(testabilities)
                    .then(function (testabilities) {
                    testing_internal_1.expect(registry.findTestabilityInTree(el)).toEqual(testabilities[0]);
                    testing_internal_1.expect(registry.findTestabilityInTree(el2)).toEqual(testabilities[1]);
                    async.done();
                });
            });
        }));
    });
}
exports.main = main;
//# sourceMappingURL=application_spec.js.map