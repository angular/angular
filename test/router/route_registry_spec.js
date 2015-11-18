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
var async_1 = require('angular2/src/facade/async');
var route_registry_1 = require('angular2/src/router/route_registry');
var route_config_decorator_1 = require('angular2/src/router/route_config_decorator');
var instruction_1 = require('angular2/src/router/instruction');
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('RouteRegistry', function () {
        var registry;
        testing_internal_1.beforeEach(function () { registry = new route_registry_1.RouteRegistry(); });
        testing_internal_1.it('should match the full URL', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/', component: DummyCmpA }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/test', component: DummyCmpB }));
            registry.recognize('/test', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpB);
                async.done();
            });
        }));
        testing_internal_1.it('should generate URLs starting at the given component', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentCmp, name: 'FirstCmp' }));
            testing_internal_1.expect(instruction_1.stringifyInstruction(registry.generate(['FirstCmp', 'SecondCmp'], RootHostCmp)))
                .toEqual('first/second');
            testing_internal_1.expect(instruction_1.stringifyInstruction(registry.generate(['SecondCmp'], DummyParentCmp)))
                .toEqual('second');
        });
        testing_internal_1.it('should generate URLs that account for redirects', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentRedirectCmp, name: 'FirstCmp' }));
            testing_internal_1.expect(instruction_1.stringifyInstruction(registry.generate(['FirstCmp'], RootHostCmp)))
                .toEqual('first/second');
        });
        testing_internal_1.it('should generate URLs in a hierarchy of redirects', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyMultipleRedirectCmp, name: 'FirstCmp' }));
            testing_internal_1.expect(instruction_1.stringifyInstruction(registry.generate(['FirstCmp'], RootHostCmp)))
                .toEqual('first/second/third');
        });
        testing_internal_1.it('should generate URLs with params', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/:param/...', component: DummyParentParamCmp, name: 'FirstCmp' }));
            var url = instruction_1.stringifyInstruction(registry.generate(['FirstCmp', { param: 'one' }, 'SecondCmp', { param: 'two' }], RootHostCmp));
            testing_internal_1.expect(url).toEqual('first/one/second/two');
        });
        testing_internal_1.it('should generate params as an empty StringMap when no params are given', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/test', component: DummyCmpA, name: 'Test' }));
            var instruction = registry.generate(['Test'], RootHostCmp);
            testing_internal_1.expect(instruction.component.params).toEqual({});
        });
        testing_internal_1.it('should generate URLs of loaded components after they are loaded', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.AsyncRoute({ path: '/first/...', loader: AsyncParentLoader, name: 'FirstCmp' }));
            testing_internal_1.expect(function () { return registry.generate(['FirstCmp', 'SecondCmp'], RootHostCmp); })
                .toThrowError('Could not find route named "SecondCmp".');
            registry.recognize('/first/second', RootHostCmp)
                .then(function (_) {
                testing_internal_1.expect(instruction_1.stringifyInstruction(registry.generate(['FirstCmp', 'SecondCmp'], RootHostCmp)))
                    .toEqual('first/second');
                async.done();
            });
        }));
        testing_internal_1.it('should throw when generating a url and a parent has no config', function () {
            testing_internal_1.expect(function () { return registry.generate(['FirstCmp', 'SecondCmp'], RootHostCmp); })
                .toThrowError('Component "RootHostCmp" has no route config.');
        });
        testing_internal_1.it('should prefer static segments to dynamic', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/:site', component: DummyCmpB }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/home', component: DummyCmpA }));
            registry.recognize('/home', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpA);
                async.done();
            });
        }));
        testing_internal_1.it('should prefer dynamic segments to star', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/:site', component: DummyCmpA }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/*site', component: DummyCmpB }));
            registry.recognize('/home', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpA);
                async.done();
            });
        }));
        testing_internal_1.it('should prefer routes with more dynamic segments', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/:first/*rest', component: DummyCmpA }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/*all', component: DummyCmpB }));
            registry.recognize('/some/path', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpA);
                async.done();
            });
        }));
        testing_internal_1.it('should prefer routes with more static segments', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/:second', component: DummyCmpA }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/:first/:second', component: DummyCmpB }));
            registry.recognize('/first/second', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpA);
                async.done();
            });
        }));
        testing_internal_1.it('should prefer routes with static segments before dynamic segments', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/second/:third', component: DummyCmpB }));
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/:second/third', component: DummyCmpA }));
            registry.recognize('/first/second/third', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyCmpB);
                async.done();
            });
        }));
        testing_internal_1.it('should match the full URL using child components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentCmp }));
            registry.recognize('/first/second', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyParentCmp);
                testing_internal_1.expect(instruction.child.component.componentType).toBe(DummyCmpB);
                async.done();
            });
        }));
        testing_internal_1.it('should match the URL using async child components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyAsyncCmp }));
            registry.recognize('/first/second', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyAsyncCmp);
                testing_internal_1.expect(instruction.child.component.componentType).toBe(DummyCmpB);
                async.done();
            });
        }));
        testing_internal_1.it('should match the URL using an async parent component', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.AsyncRoute({ path: '/first/...', loader: AsyncParentLoader }));
            registry.recognize('/first/second', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyParentCmp);
                testing_internal_1.expect(instruction.child.component.componentType).toBe(DummyCmpB);
                async.done();
            });
        }));
        testing_internal_1.it('should throw when a parent config is missing the `...` suffix any of its children add routes', function () {
            testing_internal_1.expect(function () {
                return registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/', component: DummyParentCmp }));
            })
                .toThrowError('Child routes are not allowed for "/". Use "..." on the parent\'s route path.');
        });
        testing_internal_1.it('should throw when a parent config uses `...` suffix before the end of the route', function () {
            testing_internal_1.expect(function () { return registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/home/.../fun/', component: DummyParentCmp })); })
                .toThrowError('Unexpected "..." before the end of the path for "home/.../fun/".');
        });
        testing_internal_1.it('should throw if a config has a component that is not defined', function () {
            testing_internal_1.expect(function () { return registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/', component: null })); })
                .toThrowError('Component for route "/" is not defined, or is not a class.');
            testing_internal_1.expect(function () { return registry.config(RootHostCmp, new route_config_decorator_1.AuxRoute({ path: '/', component: null })); })
                .toThrowError('Component for route "/" is not defined, or is not a class.');
            // This would never happen in Dart
            if (!lang_1.IS_DART) {
                testing_internal_1.expect(function () { return registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/', component: 4 })); })
                    .toThrowError('Component for route "/" is not defined, or is not a class.');
            }
        });
        testing_internal_1.it('should throw when linkParams are not terminal', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentCmp, name: 'First' }));
            testing_internal_1.expect(function () { registry.generate(['First'], RootHostCmp); })
                .toThrowError('Link "["First"]" does not resolve to a terminal or async instruction.');
        });
        testing_internal_1.it('should match matrix params on child components and query params on the root component', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/...', component: DummyParentCmp }));
            registry.recognize('/first/second;filter=odd?comments=all', RootHostCmp)
                .then(function (instruction) {
                testing_internal_1.expect(instruction.component.componentType).toBe(DummyParentCmp);
                testing_internal_1.expect(instruction.component.params).toEqual({ 'comments': 'all' });
                testing_internal_1.expect(instruction.child.component.componentType).toBe(DummyCmpB);
                testing_internal_1.expect(instruction.child.component.params).toEqual({ 'filter': 'odd' });
                async.done();
            });
        }));
        testing_internal_1.it('should generate URLs with matrix and query params', function () {
            registry.config(RootHostCmp, new route_config_decorator_1.Route({ path: '/first/:param/...', component: DummyParentParamCmp, name: 'FirstCmp' }));
            var url = instruction_1.stringifyInstruction(registry.generate([
                'FirstCmp',
                { param: 'one', query: 'cats' },
                'SecondCmp',
                {
                    param: 'two',
                    sort: 'asc',
                }
            ], RootHostCmp));
            testing_internal_1.expect(url).toEqual('first/one/second/two;sort=asc?query=cats');
        });
    });
}
exports.main = main;
function AsyncParentLoader() {
    return async_1.PromiseWrapper.resolve(DummyParentCmp);
}
function AsyncChildLoader() {
    return async_1.PromiseWrapper.resolve(DummyCmpB);
}
var RootHostCmp = (function () {
    function RootHostCmp() {
    }
    return RootHostCmp;
})();
var DummyAsyncCmp = (function () {
    function DummyAsyncCmp() {
    }
    DummyAsyncCmp = __decorate([
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.AsyncRoute({ path: '/second', loader: AsyncChildLoader })]), 
        __metadata('design:paramtypes', [])
    ], DummyAsyncCmp);
    return DummyAsyncCmp;
})();
var DummyCmpA = (function () {
    function DummyCmpA() {
    }
    return DummyCmpA;
})();
var DummyCmpB = (function () {
    function DummyCmpB() {
    }
    return DummyCmpB;
})();
var DummyRedirectCmp = (function () {
    function DummyRedirectCmp() {
    }
    DummyRedirectCmp = __decorate([
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Redirect({ path: '/', redirectTo: '/third' }),
            new route_config_decorator_1.Route({ path: '/third', component: DummyCmpB, name: 'ThirdCmp' })
        ]), 
        __metadata('design:paramtypes', [])
    ], DummyRedirectCmp);
    return DummyRedirectCmp;
})();
var DummyMultipleRedirectCmp = (function () {
    function DummyMultipleRedirectCmp() {
    }
    DummyMultipleRedirectCmp = __decorate([
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Redirect({ path: '/', redirectTo: '/second' }),
            new route_config_decorator_1.Route({ path: '/second/...', component: DummyRedirectCmp, name: 'SecondCmp' })
        ]), 
        __metadata('design:paramtypes', [])
    ], DummyMultipleRedirectCmp);
    return DummyMultipleRedirectCmp;
})();
var DummyParentRedirectCmp = (function () {
    function DummyParentRedirectCmp() {
    }
    DummyParentRedirectCmp = __decorate([
        route_config_decorator_1.RouteConfig([
            new route_config_decorator_1.Redirect({ path: '/', redirectTo: '/second' }),
            new route_config_decorator_1.Route({ path: '/second', component: DummyCmpB, name: 'SecondCmp' })
        ]), 
        __metadata('design:paramtypes', [])
    ], DummyParentRedirectCmp);
    return DummyParentRedirectCmp;
})();
var DummyParentCmp = (function () {
    function DummyParentCmp() {
    }
    DummyParentCmp = __decorate([
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/second', component: DummyCmpB, name: 'SecondCmp' })]), 
        __metadata('design:paramtypes', [])
    ], DummyParentCmp);
    return DummyParentCmp;
})();
var DummyParentParamCmp = (function () {
    function DummyParentParamCmp() {
    }
    DummyParentParamCmp = __decorate([
        route_config_decorator_1.RouteConfig([new route_config_decorator_1.Route({ path: '/second/:param', component: DummyCmpB, name: 'SecondCmp' })]), 
        __metadata('design:paramtypes', [])
    ], DummyParentParamCmp);
    return DummyParentParamCmp;
})();
//# sourceMappingURL=route_registry_spec.js.map