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
var testing_internal_1 = require('angular2/testing_internal');
var bootstrap_1 = require('angular2/bootstrap');
var metadata_1 = require('angular2/src/core/metadata');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var core_1 = require('angular2/core');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var router_1 = require('angular2/router');
var exceptions_1 = require('angular2/src/facade/exceptions');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
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
    testing_internal_1.describe('RouteConfig with POJO arguments', function () {
        var fakeDoc, el, testBindings;
        testing_internal_1.beforeEach(function () {
            fakeDoc = dom_adapter_1.DOM.createHtmlDocument();
            el = dom_adapter_1.DOM.createElement('app-cmp', fakeDoc);
            dom_adapter_1.DOM.appendChild(fakeDoc.body, el);
            var logger = new _ArrayLogger();
            var exceptionHandler = new exceptions_1.ExceptionHandler(logger, true);
            testBindings = [
                router_1.ROUTER_PROVIDERS,
                core_1.provide(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
                core_1.provide(dom_tokens_1.DOCUMENT, { useValue: fakeDoc }),
                core_1.provide(exceptions_1.ExceptionHandler, { useValue: exceptionHandler })
            ];
        });
        testing_internal_1.it('should bootstrap an app with a hierarchy', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(HierarchyAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { parent { hello } }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/parent/child');
                    async.done();
                });
                router.navigateByUrl('/parent/child');
            });
        }));
        testing_internal_1.it('should work in an app with redirects', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(RedirectAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { hello }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/after');
                    async.done();
                });
                router.navigateByUrl('/before');
            });
        }));
        testing_internal_1.it('should work in an app with async components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(AsyncAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { hello }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/hello');
                    async.done();
                });
                router.navigateByUrl('/hello');
            });
        }));
        testing_internal_1.it('should work in an app with aux routes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(AuxAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { hello } aside { hello }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/hello(aside)');
                    async.done();
                });
                router.navigateByUrl('/hello(aside)');
            });
        }));
        testing_internal_1.it('should work in an app with async components defined with "loader"', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(ConciseAsyncAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { hello }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/hello');
                    async.done();
                });
                router.navigateByUrl('/hello');
            });
        }));
        testing_internal_1.it('should work in an app with a constructor component', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(ExplicitConstructorAppCmp, testBindings)
                .then(function (applicationRef) {
                var router = applicationRef.hostComponent.router;
                router.subscribe(function (_) {
                    testing_internal_1.expect(el).toHaveText('root { hello }');
                    testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('/hello');
                    async.done();
                });
                router.navigateByUrl('/hello');
            });
        }));
        testing_internal_1.it('should throw if a config is missing a target', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(WrongConfigCmp, testBindings)
                .catch(function (e) {
                testing_internal_1.expect(e.originalException)
                    .toContainError('Route config should contain exactly one "component", "loader", or "redirectTo" property.');
                async.done();
                return null;
            });
        }));
        testing_internal_1.it('should throw if a config has an invalid component type', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(WrongComponentTypeCmp, testBindings)
                .catch(function (e) {
                testing_internal_1.expect(e.originalException)
                    .toContainError('Invalid component type "intentionallyWrongComponentType". Valid types are "constructor" and "loader".');
                async.done();
                return null;
            });
        }));
        testing_internal_1.it('should throw if a config has an invalid alias name', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(BadAliasNameCmp, testBindings)
                .catch(function (e) {
                testing_internal_1.expect(e.originalException)
                    .toContainError("Route \"/child\" with name \"child\" does not begin with an uppercase letter. Route names should be CamelCase like \"Child\".");
                async.done();
                return null;
            });
        }));
        testing_internal_1.it('should throw if a config has an invalid alias name with "as"', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(BadAliasCmp, testBindings)
                .catch(function (e) {
                testing_internal_1.expect(e.originalException)
                    .toContainError("Route \"/child\" with name \"child\" does not begin with an uppercase letter. Route names should be CamelCase like \"Child\".");
                async.done();
                return null;
            });
        }));
        testing_internal_1.it('should throw if a config has multiple alias properties "as" and "name"', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            bootstrap_1.bootstrap(MultipleAliasCmp, testBindings)
                .catch(function (e) {
                testing_internal_1.expect(e.originalException)
                    .toContainError("Route config should contain exactly one \"as\" or \"name\" property.");
                async.done();
                return null;
            });
        }));
    });
}
exports.main = main;
var HelloCmp = (function () {
    function HelloCmp() {
    }
    HelloCmp = __decorate([
        metadata_1.Component({ selector: 'hello-cmp' }),
        metadata_1.View({ template: 'hello' }), 
        __metadata('design:paramtypes', [])
    ], HelloCmp);
    return HelloCmp;
})();
var RedirectAppCmp = (function () {
    function RedirectAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    RedirectAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/before', redirectTo: '/after' }, { path: '/after', component: HelloCmp }]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], RedirectAppCmp);
    return RedirectAppCmp;
})();
function HelloLoader() {
    return Promise.resolve(HelloCmp);
}
var AsyncAppCmp = (function () {
    function AsyncAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    AsyncAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([
            { path: '/hello', component: { type: 'loader', loader: HelloLoader } },
        ]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], AsyncAppCmp);
    return AsyncAppCmp;
})();
var ConciseAsyncAppCmp = (function () {
    function ConciseAsyncAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    ConciseAsyncAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([
            { path: '/hello', loader: HelloLoader },
        ]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], ConciseAsyncAppCmp);
    return ConciseAsyncAppCmp;
})();
var AuxAppCmp = (function () {
    function AuxAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    AuxAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> } aside { <router-outlet name=\"aside\"></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/hello', component: HelloCmp }, { aux: 'aside', component: HelloCmp }]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], AuxAppCmp);
    return AuxAppCmp;
})();
var ExplicitConstructorAppCmp = (function () {
    function ExplicitConstructorAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    ExplicitConstructorAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([
            { path: '/hello', component: { type: 'constructor', constructor: HelloCmp } },
        ]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], ExplicitConstructorAppCmp);
    return ExplicitConstructorAppCmp;
})();
var ParentCmp = (function () {
    function ParentCmp() {
    }
    ParentCmp = __decorate([
        metadata_1.Component({ selector: 'parent-cmp' }),
        metadata_1.View({ template: "parent { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/child', component: HelloCmp }]), 
        __metadata('design:paramtypes', [])
    ], ParentCmp);
    return ParentCmp;
})();
var HierarchyAppCmp = (function () {
    function HierarchyAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    HierarchyAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/parent/...', component: ParentCmp }]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], HierarchyAppCmp);
    return HierarchyAppCmp;
})();
var WrongConfigCmp = (function () {
    function WrongConfigCmp() {
    }
    WrongConfigCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/hello' }]), 
        __metadata('design:paramtypes', [])
    ], WrongConfigCmp);
    return WrongConfigCmp;
})();
var BadAliasNameCmp = (function () {
    function BadAliasNameCmp() {
    }
    BadAliasNameCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/child', component: HelloCmp, name: 'child' }]), 
        __metadata('design:paramtypes', [])
    ], BadAliasNameCmp);
    return BadAliasNameCmp;
})();
var BadAliasCmp = (function () {
    function BadAliasCmp() {
    }
    BadAliasCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/child', component: HelloCmp, as: 'child' }]), 
        __metadata('design:paramtypes', [])
    ], BadAliasCmp);
    return BadAliasCmp;
})();
var MultipleAliasCmp = (function () {
    function MultipleAliasCmp() {
    }
    MultipleAliasCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([{ path: '/child', component: HelloCmp, as: 'Child', name: 'Child' }]), 
        __metadata('design:paramtypes', [])
    ], MultipleAliasCmp);
    return MultipleAliasCmp;
})();
var WrongComponentTypeCmp = (function () {
    function WrongComponentTypeCmp() {
    }
    WrongComponentTypeCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        router_1.RouteConfig([
            { path: '/hello', component: { type: 'intentionallyWrongComponentType', constructor: HelloCmp } },
        ]), 
        __metadata('design:paramtypes', [])
    ], WrongComponentTypeCmp);
    return WrongComponentTypeCmp;
})();
//# sourceMappingURL=route_config_spec.js.map