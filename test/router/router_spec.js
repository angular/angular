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
var spies_1 = require('./spies');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var router_1 = require('angular2/src/router/router');
var location_mock_1 = require('angular2/src/mock/location_mock');
var location_1 = require('angular2/src/router/location');
var instruction_1 = require('angular2/src/router/instruction');
var route_registry_1 = require('angular2/src/router/route_registry');
var route_config_decorator_1 = require('angular2/src/router/route_config_decorator');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var core_1 = require('angular2/core');
function main() {
    testing_internal_1.describe('Router', function () {
        var router, location;
        testing_internal_1.beforeEachBindings(function () { return [
            route_registry_1.RouteRegistry,
            directive_resolver_1.DirectiveResolver,
            core_1.provide(location_1.Location, { useClass: location_mock_1.SpyLocation }),
            core_1.provide(router_1.Router, {
                useFactory: function (registry, location) { return new router_1.RootRouter(registry, location, AppCmp); },
                deps: [route_registry_1.RouteRegistry, location_1.Location]
            })
        ]; });
        testing_internal_1.beforeEach(testing_internal_1.inject([router_1.Router, location_1.Location], function (rtr, loc) {
            router = rtr;
            location = loc;
        }));
        testing_internal_1.it('should navigate based on the initial URL state', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.config([new route_config_decorator_1.Route({ path: '/', component: DummyComponent })])
                .then(function (_) { return router.registerPrimaryOutlet(outlet); })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                testing_internal_1.expect(location.urlChanges).toEqual([]);
                async.done();
            });
        }));
        testing_internal_1.it('should activate viewports and update URL on navigate', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet)
                .then(function (_) { return router.config([new route_config_decorator_1.Route({ path: '/a', component: DummyComponent })]); })
                .then(function (_) { return router.navigateByUrl('/a'); })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                testing_internal_1.expect(location.urlChanges).toEqual(['/a']);
                async.done();
            });
        }));
        testing_internal_1.it('should activate viewports and update URL when navigating via DSL', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet)
                .then(function (_) { return router.config([new route_config_decorator_1.Route({ path: '/a', component: DummyComponent, name: 'A' })]); })
                .then(function (_) { return router.navigate(['/A']); })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                testing_internal_1.expect(location.urlChanges).toEqual(['/a']);
                async.done();
            });
        }));
        testing_internal_1.it('should not push a history change on when navigate is called with skipUrlChange', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet)
                .then(function (_) { return router.config([new route_config_decorator_1.Route({ path: '/b', component: DummyComponent })]); })
                .then(function (_) { return router.navigateByUrl('/b', true); })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                testing_internal_1.expect(location.urlChanges).toEqual([]);
                async.done();
            });
        }));
        testing_internal_1.it('should navigate after being configured', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet)
                .then(function (_) { return router.navigateByUrl('/a'); })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).not.toHaveBeenCalled();
                return router.config([new route_config_decorator_1.Route({ path: '/a', component: DummyComponent })]);
            })
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                async.done();
            });
        }));
        testing_internal_1.it('should throw when linkParams does not include a route name', function () {
            testing_internal_1.expect(function () { return router.generate(['./']); })
                .toThrowError("Link \"" + collection_1.ListWrapper.toJSON(['./']) + "\" must include a route name.");
            testing_internal_1.expect(function () { return router.generate(['/']); })
                .toThrowError("Link \"" + collection_1.ListWrapper.toJSON(['/']) + "\" must include a route name.");
        });
        testing_internal_1.it('should, when subscribed to, return a disposable subscription', function () {
            testing_internal_1.expect(function () {
                var subscription = router.subscribe(function (_) { });
                async_1.ObservableWrapper.dispose(subscription);
            }).not.toThrow();
        });
        testing_internal_1.it('should generate URLs from the root component when the path starts with /', function () {
            router.config([new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentComp, name: 'FirstCmp' })]);
            var instruction = router.generate(['/FirstCmp', 'SecondCmp']);
            testing_internal_1.expect(instruction_1.stringifyInstruction(instruction)).toEqual('first/second');
            instruction = router.generate(['/FirstCmp/SecondCmp']);
            testing_internal_1.expect(instruction_1.stringifyInstruction(instruction)).toEqual('first/second');
        });
        testing_internal_1.it('should generate an instruction with terminal async routes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet);
            router.config([new route_config_decorator_1.AsyncRoute({ path: '/first', loader: loader, name: 'FirstCmp' })]);
            var instruction = router.generate(['/FirstCmp']);
            router.navigateByInstruction(instruction)
                .then(function (_) {
                testing_internal_1.expect(outlet.spy('activate')).toHaveBeenCalled();
                async.done();
            });
        }));
        testing_internal_1.it('should return whether a given instruction is active with isRouteActive', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var outlet = makeDummyOutlet();
            router.registerPrimaryOutlet(outlet)
                .then(function (_) { return router.config([
                new route_config_decorator_1.Route({ path: '/a', component: DummyComponent, name: 'A' }),
                new route_config_decorator_1.Route({ path: '/b', component: DummyComponent, name: 'B' })
            ]); })
                .then(function (_) { return router.navigateByUrl('/a'); })
                .then(function (_) {
                var instruction = router.generate(['/A']);
                var otherInstruction = router.generate(['/B']);
                testing_internal_1.expect(router.isRouteActive(instruction)).toEqual(true);
                testing_internal_1.expect(router.isRouteActive(otherInstruction)).toEqual(false);
                async.done();
            });
        }));
        testing_internal_1.describe('query string params', function () {
            testing_internal_1.it('should use query string params for the root route', function () {
                router.config([new route_config_decorator_1.Route({ path: '/hi/how/are/you', component: DummyComponent, name: 'GreetingUrl' })]);
                var instruction = router.generate(['/GreetingUrl', { 'name': 'brad' }]);
                var path = instruction_1.stringifyInstruction(instruction);
                testing_internal_1.expect(path).toEqual('hi/how/are/you?name=brad');
            });
            testing_internal_1.it('should serialize parameters that are not part of the route definition as query string params', function () {
                router.config([
                    new route_config_decorator_1.Route({ path: '/one/two/:three', component: DummyComponent, name: 'NumberUrl' })
                ]);
                var instruction = router.generate(['/NumberUrl', { 'three': 'three', 'four': 'four' }]);
                var path = instruction_1.stringifyInstruction(instruction);
                testing_internal_1.expect(path).toEqual('one/two/three?four=four');
            });
        });
        testing_internal_1.describe('matrix params', function () {
            testing_internal_1.it('should generate matrix params for each non-root component', function () {
                router.config([new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentComp, name: 'FirstCmp' })]);
                var instruction = router.generate(['/FirstCmp', { 'key': 'value' }, 'SecondCmp', { 'project': 'angular' }]);
                var path = instruction_1.stringifyInstruction(instruction);
                testing_internal_1.expect(path).toEqual('first/second;project=angular?key=value');
            });
            testing_internal_1.it('should work with named params', function () {
                router.config([new route_config_decorator_1.Route({ path: '/first/:token/...', component: DummyParentComp, name: 'FirstCmp' })]);
                var instruction = router.generate(['/FirstCmp', { 'token': 'min' }, 'SecondCmp', { 'author': 'max' }]);
                var path = instruction_1.stringifyInstruction(instruction);
                testing_internal_1.expect(path).toEqual('first/min/second;author=max');
            });
        });
    });
}
exports.main = main;
function loader() {
    return async_1.PromiseWrapper.resolve(DummyComponent);
}
var DummyComponent = (function () {
    function DummyComponent() {
    }
    return DummyComponent;
})();
var DummyParentComp = (function () {
    function DummyParentComp() {
    }
    DummyParentComp = __decorate([
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/second', component: DummyComponent, name: 'SecondCmp' })]), 
        __metadata('design:paramtypes', [])
    ], DummyParentComp);
    return DummyParentComp;
})();
function makeDummyOutlet() {
    var ref = new spies_1.SpyRouterOutlet();
    ref.spy('canActivate').andCallFake(function (_) { return async_1.PromiseWrapper.resolve(true); });
    ref.spy('canReuse').andCallFake(function (_) { return async_1.PromiseWrapper.resolve(false); });
    ref.spy('canDeactivate').andCallFake(function (_) { return async_1.PromiseWrapper.resolve(true); });
    ref.spy('activate').andCallFake(function (_) { return async_1.PromiseWrapper.resolve(true); });
    return ref;
}
var AppCmp = (function () {
    function AppCmp() {
    }
    return AppCmp;
})();
//# sourceMappingURL=router_spec.js.map