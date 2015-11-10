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
var core_1 = require('angular2/core');
var async_1 = require('angular2/src/facade/async');
var router_1 = require('angular2/src/router/router');
var router_2 = require('angular2/router');
var route_config_decorator_1 = require('angular2/src/router/route_config_decorator');
var location_mock_1 = require('angular2/src/mock/location_mock');
var location_1 = require('angular2/src/router/location');
var route_registry_1 = require('angular2/src/router/route_registry');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var cmpInstanceCount;
var childCmpInstanceCount;
var log;
function main() {
    testing_internal_1.describe('navigation', function () {
        var tcb;
        var fixture;
        var rtr;
        testing_internal_1.beforeEachBindings(function () { return [
            route_registry_1.RouteRegistry,
            directive_resolver_1.DirectiveResolver,
            core_1.provide(location_1.Location, { useClass: location_mock_1.SpyLocation }),
            core_1.provide(router_2.Router, {
                useFactory: function (registry, location) { return new router_1.RootRouter(registry, location, MyComp); },
                deps: [route_registry_1.RouteRegistry, location_1.Location]
            })
        ]; });
        testing_internal_1.beforeEach(testing_internal_1.inject([testing_internal_1.TestComponentBuilder, router_2.Router], function (tcBuilder, router) {
            tcb = tcBuilder;
            rtr = router;
            childCmpInstanceCount = 0;
            cmpInstanceCount = 0;
            log = [];
        }));
        function compile(template) {
            if (template === void 0) { template = "<router-outlet></router-outlet>"; }
            return tcb.overrideView(MyComp, new core_1.View({
                template: ('<div>' + template + '</div>'),
                directives: [router_2.RouterOutlet, router_2.RouterLink]
            }))
                .createAsync(MyComp)
                .then(function (tc) { fixture = tc; });
        }
        testing_internal_1.it('should work in a simple case', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/test', component: HelloCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/test'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                async.done();
            });
        }));
        testing_internal_1.it('should navigate between components with different parameters', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/user/:name', component: UserCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/user/brian'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello brian');
            })
                .then(function (_) { return rtr.navigateByUrl('/user/igor'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello igor');
                async.done();
            });
        }));
        testing_internal_1.it('should navigate to child routes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile('outer { <router-outlet></router-outlet> }')
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/a/...', component: ParentCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/a/b'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
                async.done();
            });
        }));
        testing_internal_1.it('should navigate to child routes that capture an empty path', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile('outer { <router-outlet></router-outlet> }')
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/a/...', component: ParentCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/a'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
                async.done();
            });
        }));
        testing_internal_1.it('should navigate to child routes of async routes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile('outer { <router-outlet></router-outlet> }')
                .then(function (_) { return rtr.config([new route_config_decorator_1.AsyncRoute({ path: '/a/...', loader: parentLoader })]); })
                .then(function (_) { return rtr.navigateByUrl('/a/b'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
                async.done();
            });
        }));
        testing_internal_1.it('should recognize and apply redirects', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, location_1.Location], function (async, location) {
            compile()
                .then(function (_) { return rtr.config([
                new route_config_decorator_1.Redirect({ path: '/original', redirectTo: '/redirected' }),
                new route_config_decorator_1.Route({ path: '/redirected', component: HelloCmp })
            ]); })
                .then(function (_) { return rtr.navigateByUrl('/original'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                testing_internal_1.expect(location.urlChanges).toEqual(['/redirected']);
                async.done();
            });
        }));
        testing_internal_1.it('should reuse common parent components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/team/:id/...', component: TeamCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/team/angular/user/rado'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(cmpInstanceCount).toBe(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('team angular { hello rado }');
            })
                .then(function (_) { return rtr.navigateByUrl('/team/angular/user/victor'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(cmpInstanceCount).toBe(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement)
                    .toHaveText('team angular { hello victor }');
                async.done();
            });
        }));
        testing_internal_1.it('should not reuse children when parent components change', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/team/:id/...', component: TeamCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/team/angular/user/rado'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(cmpInstanceCount).toBe(1);
                testing_internal_1.expect(childCmpInstanceCount).toBe(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('team angular { hello rado }');
            })
                .then(function (_) { return rtr.navigateByUrl('/team/dart/user/rado'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(cmpInstanceCount).toBe(2);
                testing_internal_1.expect(childCmpInstanceCount).toBe(2);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('team dart { hello rado }');
                async.done();
            });
        }));
        testing_internal_1.it('should inject route data into component', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([
                new route_config_decorator_1.Route({ path: '/route-data', component: RouteDataCmp, data: { isAdmin: true } })
            ]); })
                .then(function (_) { return rtr.navigateByUrl('/route-data'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('true');
                async.done();
            });
        }));
        testing_internal_1.it('should inject route data into component with AsyncRoute', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([
                new route_config_decorator_1.AsyncRoute({ path: '/route-data', loader: AsyncRouteDataCmp, data: { isAdmin: true } })
            ]); })
                .then(function (_) { return rtr.navigateByUrl('/route-data'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('true');
                async.done();
            });
        }));
        testing_internal_1.it('should inject empty object if the route has no data property', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/route-data-default', component: RouteDataCmp })]); })
                .then(function (_) { return rtr.navigateByUrl('/route-data-default'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.describe('auxiliary routes', function () {
            testing_internal_1.it('should recognize a simple case', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile()
                    .then(function (_) { return rtr.config([new route_config_decorator_1.Route({ path: '/...', component: AuxCmp })]); })
                    .then(function (_) { return rtr.navigateByUrl('/hello(modal)'); })
                    .then(function (_) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement)
                        .toHaveText('main {hello} | aux {modal}');
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var HelloCmp = (function () {
    function HelloCmp() {
        this.greeting = "hello";
    }
    HelloCmp = __decorate([
        core_1.Component({ selector: 'hello-cmp' }),
        core_1.View({ template: "{{greeting}}" }), 
        __metadata('design:paramtypes', [])
    ], HelloCmp);
    return HelloCmp;
})();
function AsyncRouteDataCmp() {
    return async_1.PromiseWrapper.resolve(RouteDataCmp);
}
var RouteDataCmp = (function () {
    function RouteDataCmp(data) {
        this.myData = data.get('isAdmin');
    }
    RouteDataCmp = __decorate([
        core_1.Component({ selector: 'data-cmp' }),
        core_1.View({ template: "{{myData}}" }), 
        __metadata('design:paramtypes', [router_2.RouteData])
    ], RouteDataCmp);
    return RouteDataCmp;
})();
var UserCmp = (function () {
    function UserCmp(params) {
        childCmpInstanceCount += 1;
        this.user = params.get('name');
    }
    UserCmp = __decorate([
        core_1.Component({ selector: 'user-cmp' }),
        core_1.View({ template: "hello {{user}}" }), 
        __metadata('design:paramtypes', [router_2.RouteParams])
    ], UserCmp);
    return UserCmp;
})();
function parentLoader() {
    return async_1.PromiseWrapper.resolve(ParentCmp);
}
var ParentCmp = (function () {
    function ParentCmp() {
    }
    ParentCmp = __decorate([
        core_1.Component({ selector: 'parent-cmp' }),
        core_1.View({
            template: "inner { <router-outlet></router-outlet> }",
            directives: [router_2.RouterOutlet],
        }),
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Route({ path: '/b', component: HelloCmp }),
            new route_config_decorator_1.Route({ path: '/', component: HelloCmp }),
        ]), 
        __metadata('design:paramtypes', [])
    ], ParentCmp);
    return ParentCmp;
})();
var TeamCmp = (function () {
    function TeamCmp(params) {
        this.id = params.get('id');
        cmpInstanceCount += 1;
    }
    TeamCmp = __decorate([
        core_1.Component({ selector: 'team-cmp' }),
        core_1.View({
            template: "team {{id}} { <router-outlet></router-outlet> }",
            directives: [router_2.RouterOutlet],
        }),
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/user/:name', component: UserCmp })]), 
        __metadata('design:paramtypes', [router_2.RouteParams])
    ], TeamCmp);
    return TeamCmp;
})();
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        core_1.Component({ selector: 'my-comp' }), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
var ModalCmp = (function () {
    function ModalCmp() {
    }
    ModalCmp = __decorate([
        core_1.Component({ selector: 'modal-cmp' }),
        core_1.View({ template: "modal" }), 
        __metadata('design:paramtypes', [])
    ], ModalCmp);
    return ModalCmp;
})();
var AuxCmp = (function () {
    function AuxCmp() {
    }
    AuxCmp = __decorate([
        core_1.Component({ selector: 'aux-cmp' }),
        core_1.View({
            template: 'main {<router-outlet></router-outlet>} | ' +
                'aux {<router-outlet name="modal"></router-outlet>}',
            directives: [router_2.RouterOutlet],
        }),
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Route({ path: '/hello', component: HelloCmp }),
            new route_config_decorator_1.AuxRoute({ path: '/modal', component: ModalCmp }),
        ]), 
        __metadata('design:paramtypes', [])
    ], AuxCmp);
    return AuxCmp;
})();
//# sourceMappingURL=navigation_spec.js.map