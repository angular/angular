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
var render_1 = require('angular2/src/core/render/render');
var route_config_decorator_1 = require('angular2/src/router/route_config_decorator');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var router_1 = require('angular2/router');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
var application_ref_1 = require('angular2/src/core/application_ref');
var mock_application_ref_1 = require('angular2/src/mock/mock_application_ref');
function main() {
    testing_internal_1.describe('router injectables', function () {
        testing_internal_1.beforeEachBindings(function () {
            return [
                router_1.ROUTER_PROVIDERS,
                core_1.provide(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
                core_1.provide(application_ref_1.ApplicationRef, { useClass: mock_application_ref_1.MockApplicationRef })
            ];
        });
        // do not refactor out the `bootstrap` functionality. We still want to
        // keep this test around so we can ensure that bootstrapping a router works
        testing_internal_1.describe('bootstrap functionality', function () {
            testing_internal_1.it('should bootstrap a simple app', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var fakeDoc = dom_adapter_1.DOM.createHtmlDocument();
                var el = dom_adapter_1.DOM.createElement('app-cmp', fakeDoc);
                dom_adapter_1.DOM.appendChild(fakeDoc.body, el);
                bootstrap_1.bootstrap(AppCmp, [
                    router_1.ROUTER_PROVIDERS,
                    core_1.provide(router_1.ROUTER_PRIMARY_COMPONENT, { useValue: AppCmp }),
                    core_1.provide(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
                    core_1.provide(render_1.DOCUMENT, { useValue: fakeDoc })
                ])
                    .then(function (applicationRef) {
                    var router = applicationRef.hostComponent.router;
                    router.subscribe(function (_) {
                        testing_internal_1.expect(el).toHaveText('outer { hello }');
                        testing_internal_1.expect(applicationRef.hostComponent.location.path()).toEqual('');
                        async.done();
                    });
                });
            }));
        });
        testing_internal_1.describe('broken app', function () {
            testing_internal_1.beforeEachBindings(function () { return [core_1.provide(router_1.ROUTER_PRIMARY_COMPONENT, { useValue: BrokenAppCmp })]; });
            testing_internal_1.it('should rethrow exceptions from component constructors', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, testing_internal_1.TestComponentBuilder], function (async, tcb) {
                tcb.createAsync(AppCmp).then(function (fixture) {
                    var router = fixture.debugElement.componentInstance.router;
                    async_1.PromiseWrapper.catchError(router.navigateByUrl('/cause-error'), function (error) {
                        testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('outer { oh no }');
                        testing_internal_1.expect(error).toContainError('oops!');
                        async.done();
                    });
                });
            }));
        });
        testing_internal_1.describe('back button app', function () {
            testing_internal_1.beforeEachBindings(function () { return [core_1.provide(router_1.ROUTER_PRIMARY_COMPONENT, { useValue: HierarchyAppCmp })]; });
            testing_internal_1.it('should change the url without pushing a new history state for back navigations', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, testing_internal_1.TestComponentBuilder], function (async, tcb) {
                tcb.createAsync(HierarchyAppCmp)
                    .then(function (fixture) {
                    var router = fixture.debugElement.componentInstance.router;
                    var position = 0;
                    var flipped = false;
                    var history = [
                        ['/parent/child', 'root { parent { hello } }', '/super-parent/child'],
                        ['/super-parent/child', 'root { super-parent { hello2 } }', '/parent/child'],
                        ['/parent/child', 'root { parent { hello } }', false]
                    ];
                    router.subscribe(function (_) {
                        var location = fixture.debugElement.componentInstance.location;
                        var element = fixture.debugElement.nativeElement;
                        var path = location.path();
                        var entry = history[position];
                        testing_internal_1.expect(path).toEqual(entry[0]);
                        testing_internal_1.expect(element).toHaveText(entry[1]);
                        var nextUrl = entry[2];
                        if (nextUrl == false) {
                            flipped = true;
                        }
                        if (flipped && position == 0) {
                            async.done();
                            return;
                        }
                        position = position + (flipped ? -1 : 1);
                        if (flipped) {
                            location.back();
                        }
                        else {
                            router.navigateByUrl(nextUrl);
                        }
                    });
                    router.navigateByUrl(history[0][0]);
                });
            }), 1000);
        });
        testing_internal_1.describe('hierarchical app', function () {
            testing_internal_1.beforeEachBindings(function () { return [core_1.provide(router_1.ROUTER_PRIMARY_COMPONENT, { useValue: HierarchyAppCmp })]; });
            testing_internal_1.it('should bootstrap an app with a hierarchy', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, testing_internal_1.TestComponentBuilder], function (async, tcb) {
                tcb.createAsync(HierarchyAppCmp)
                    .then(function (fixture) {
                    var router = fixture.debugElement.componentInstance.router;
                    router.subscribe(function (_) {
                        testing_internal_1.expect(fixture.debugElement.nativeElement)
                            .toHaveText('root { parent { hello } }');
                        testing_internal_1.expect(fixture.debugElement.componentInstance.location.path())
                            .toEqual('/parent/child');
                        async.done();
                    });
                    router.navigateByUrl('/parent/child');
                });
            }));
            // TODO(btford): mock out level lower than LocationStrategy once that level exists
            testing_internal_1.xdescribe('custom app base ref', function () {
                testing_internal_1.beforeEachBindings(function () { return [core_1.provide(router_1.APP_BASE_HREF, { useValue: '/my/app' })]; });
                testing_internal_1.it('should bootstrap', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, testing_internal_1.TestComponentBuilder], function (async, tcb) {
                    tcb.createAsync(HierarchyAppCmp)
                        .then(function (fixture) {
                        var router = fixture.debugElement.componentInstance.router;
                        router.subscribe(function (_) {
                            testing_internal_1.expect(fixture.debugElement.nativeElement)
                                .toHaveText('root { parent { hello } }');
                            testing_internal_1.expect(fixture.debugElement.componentInstance.location.path())
                                .toEqual('/my/app/parent/child');
                            async.done();
                        });
                        router.navigateByUrl('/parent/child');
                    });
                }));
            });
        });
        // TODO: add a test in which the child component has bindings
        testing_internal_1.describe('querystring params app', function () {
            testing_internal_1.beforeEachBindings(function () { return [core_1.provide(router_1.ROUTER_PRIMARY_COMPONENT, { useValue: QueryStringAppCmp })]; });
            testing_internal_1.it('should recognize and return querystring params with the injected RouteParams', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, testing_internal_1.TestComponentBuilder], function (async, tcb) {
                tcb.createAsync(QueryStringAppCmp)
                    .then(function (fixture) {
                    var router = fixture.debugElement.componentInstance.router;
                    router.subscribe(function (_) {
                        fixture.detectChanges();
                        testing_internal_1.expect(fixture.debugElement.nativeElement)
                            .toHaveText('qParam = search-for-something');
                        /*
                        expect(applicationRef.hostComponent.location.path())
                            .toEqual('/qs?q=search-for-something');*/
                        async.done();
                    });
                    router.navigateByUrl('/qs?q=search-for-something');
                    fixture.detectChanges();
                });
            }));
        });
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
var Hello2Cmp = (function () {
    function Hello2Cmp() {
    }
    Hello2Cmp = __decorate([
        metadata_1.Component({ selector: 'hello2-cmp' }),
        metadata_1.View({ template: 'hello2' }), 
        __metadata('design:paramtypes', [])
    ], Hello2Cmp);
    return Hello2Cmp;
})();
var AppCmp = (function () {
    function AppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    AppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "outer { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/', component: HelloCmp })]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], AppCmp);
    return AppCmp;
})();
var ParentCmp = (function () {
    function ParentCmp() {
    }
    ParentCmp = __decorate([
        metadata_1.Component({ selector: 'parent-cmp' }),
        metadata_1.View({ template: "parent { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/child', component: HelloCmp })]), 
        __metadata('design:paramtypes', [])
    ], ParentCmp);
    return ParentCmp;
})();
var SuperParentCmp = (function () {
    function SuperParentCmp() {
    }
    SuperParentCmp = __decorate([
        metadata_1.Component({ selector: 'super-parent-cmp' }),
        metadata_1.View({ template: "super-parent { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/child', component: Hello2Cmp })]), 
        __metadata('design:paramtypes', [])
    ], SuperParentCmp);
    return SuperParentCmp;
})();
var HierarchyAppCmp = (function () {
    function HierarchyAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    HierarchyAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "root { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Route({ path: '/parent/...', component: ParentCmp }),
            new route_config_decorator_1.Route({ path: '/super-parent/...', component: SuperParentCmp })
        ]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], HierarchyAppCmp);
    return HierarchyAppCmp;
})();
var QSCmp = (function () {
    function QSCmp(params) {
        this.q = params.get('q');
    }
    QSCmp = __decorate([
        metadata_1.Component({ selector: 'qs-cmp' }),
        metadata_1.View({ template: "qParam = {{q}}" }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], QSCmp);
    return QSCmp;
})();
var QueryStringAppCmp = (function () {
    function QueryStringAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    QueryStringAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "<router-outlet></router-outlet>", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/qs', component: QSCmp })]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], QueryStringAppCmp);
    return QueryStringAppCmp;
})();
var BrokenCmp = (function () {
    function BrokenCmp() {
        throw new exceptions_1.BaseException('oops!');
    }
    BrokenCmp = __decorate([
        metadata_1.Component({ selector: 'oops-cmp' }),
        metadata_1.View({ template: "oh no" }), 
        __metadata('design:paramtypes', [])
    ], BrokenCmp);
    return BrokenCmp;
})();
var BrokenAppCmp = (function () {
    function BrokenAppCmp(router, location) {
        this.router = router;
        this.location = location;
    }
    BrokenAppCmp = __decorate([
        metadata_1.Component({ selector: 'app-cmp' }),
        metadata_1.View({ template: "outer { <router-outlet></router-outlet> }", directives: router_1.ROUTER_DIRECTIVES }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/cause-error', component: BrokenCmp })]), 
        __metadata('design:paramtypes', [router_1.Router, location_strategy_1.LocationStrategy])
    ], BrokenAppCmp);
    return BrokenAppCmp;
})();
//# sourceMappingURL=router_integration_spec.js.map