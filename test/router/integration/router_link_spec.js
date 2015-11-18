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
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var core_1 = require('angular2/core');
var location_mock_1 = require('angular2/src/mock/location_mock');
var router_1 = require('angular2/router');
var router_2 = require('angular2/src/router/router');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    testing_internal_1.describe('router-link directive', function () {
        var tcb;
        var fixture;
        var router, location;
        testing_internal_1.beforeEachBindings(function () { return [
            router_1.RouteRegistry,
            core_1.DirectiveResolver,
            core_1.provide(router_1.Location, { useClass: location_mock_1.SpyLocation }),
            core_1.provide(router_1.Router, {
                useFactory: function (registry, location) { return new router_2.RootRouter(registry, location, MyComp); },
                deps: [router_1.RouteRegistry, router_1.Location]
            })
        ]; });
        testing_internal_1.beforeEach(testing_internal_1.inject([testing_internal_1.TestComponentBuilder, router_1.Router, router_1.Location], function (tcBuilder, rtr, loc) {
            tcb = tcBuilder;
            router = rtr;
            location = loc;
        }));
        function compile(template) {
            if (template === void 0) { template = "<router-outlet></router-outlet>"; }
            return tcb.overrideView(MyComp, new core_1.View({
                template: ('<div>' + template + '</div>'),
                directives: [router_1.RouterOutlet, router_1.RouterLink]
            }))
                .createAsync(MyComp)
                .then(function (tc) { fixture = tc; });
        }
        testing_internal_1.it('should generate absolute hrefs that include the base href', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            location.setBaseHref('/my/base');
            compile('<a href="hello" [router-link]="[\'./User\']"></a>')
                .then(function (_) { return router.config([new router_1.Route({ path: '/user', component: UserCmp, name: 'User' })]); })
                .then(function (_) { return router.navigateByUrl('/a/b'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(getHref(fixture)).toEqual('/my/base/user');
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs without params', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile('<a href="hello" [router-link]="[\'./User\']"></a>')
                .then(function (_) { return router.config([new router_1.Route({ path: '/user', component: UserCmp, name: 'User' })]); })
                .then(function (_) { return router.navigateByUrl('/a/b'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(getHref(fixture)).toEqual('/user');
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs with params', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile('<a href="hello" [router-link]="[\'./User\', {name: name}]">{{name}}</a>')
                .then(function (_) { return router.config([new router_1.Route({ path: '/user/:name', component: UserCmp, name: 'User' })]); })
                .then(function (_) { return router.navigateByUrl('/a/b'); })
                .then(function (_) {
                fixture.debugElement.componentInstance.name = 'brian';
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('brian');
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, 'href'))
                    .toEqual('/user/brian');
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs from a child to its sibling', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([new router_1.Route({ path: '/page/:number', component: SiblingPageCmp, name: 'Page' })]); })
                .then(function (_) { return router.navigateByUrl('/page/1'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/page/2');
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs from a child to its sibling with no leading slash', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([
                new router_1.Route({ path: '/page/:number', component: NoPrefixSiblingPageCmp, name: 'Page' })
            ]); })
                .then(function (_) { return router.navigateByUrl('/page/1'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/page/2');
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs to a child with no leading slash', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([
                new router_1.Route({ path: '/book/:title/...', component: NoPrefixBookCmp, name: 'Book' })
            ]); })
                .then(function (_) { return router.navigateByUrl('/book/1984/page/1'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/book/1984/page/100');
                async.done();
            });
        }));
        testing_internal_1.it('should throw when links without a leading slash are ambiguous', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([
                new router_1.Route({ path: '/book/:title/...', component: AmbiguousBookCmp, name: 'Book' })
            ]); })
                .then(function (_) { return router.navigateByUrl('/book/1984/page/1'); })
                .then(function (_) {
                var link = collection_1.ListWrapper.toJSON(['Book', { number: 100 }]);
                testing_internal_1.expect(function () { return fixture.detectChanges(); })
                    .toThrowErrorWith("Link \"" + link + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.");
                async.done();
            });
        }));
        testing_internal_1.it('should generate link hrefs when asynchronously loaded', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([
                new router_1.AsyncRoute({
                    path: '/child-with-grandchild/...',
                    loader: parentCmpLoader,
                    name: 'ChildWithGrandchild'
                })
            ]); })
                .then(function (_) { return router.navigate(['/ChildWithGrandchild']); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/child-with-grandchild/grandchild');
                async.done();
            });
        }));
        testing_internal_1.it('should generate relative links preserving the existing parent route', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compile()
                .then(function (_) { return router.config([new router_1.Route({ path: '/book/:title/...', component: BookCmp, name: 'Book' })]); })
                .then(function (_) { return router.navigateByUrl('/book/1984/page/1'); })
                .then(function (_) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/book/1984/page/100');
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[1]
                    .componentViewChildren[2]
                    .componentViewChildren[0]
                    .nativeElement, 'href'))
                    .toEqual('/book/1984/page/2');
                async.done();
            });
        }));
        testing_internal_1.describe('router-link-active CSS class', function () {
            testing_internal_1.it('should be added to the associated element', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                router.config([
                    new router_1.Route({ path: '/child', component: HelloCmp, name: 'Child' }),
                    new router_1.Route({ path: '/better-child', component: Hello2Cmp, name: 'BetterChild' })
                ])
                    .then(function (_) { return compile("<a [router-link]=\"['./Child']\" class=\"child-link\">Child</a>\n                                <a [router-link]=\"['./BetterChild']\" class=\"better-child-link\">Better Child</a>\n                                <router-outlet></router-outlet>"); })
                    .then(function (_) {
                    var element = fixture.debugElement.nativeElement;
                    fixture.detectChanges();
                    var link1 = dom_adapter_1.DOM.querySelector(element, '.child-link');
                    var link2 = dom_adapter_1.DOM.querySelector(element, '.better-child-link');
                    testing_internal_1.expect(link1).not.toHaveCssClass('router-link-active');
                    testing_internal_1.expect(link2).not.toHaveCssClass('router-link-active');
                    router.subscribe(function (_) {
                        fixture.detectChanges();
                        testing_internal_1.expect(link1).not.toHaveCssClass('router-link-active');
                        testing_internal_1.expect(link2).toHaveCssClass('router-link-active');
                        async.done();
                    });
                    router.navigateByUrl('/better-child');
                });
            }));
            testing_internal_1.it('should be added to links in child routes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                router.config([
                    new router_1.Route({ path: '/child', component: HelloCmp, name: 'Child' }),
                    new router_1.Route({
                        path: '/child-with-grandchild/...',
                        component: ParentCmp,
                        name: 'ChildWithGrandchild'
                    })
                ])
                    .then(function (_) { return compile("<a [router-link]=\"['./Child']\" class=\"child-link\">Child</a>\n                                <a [router-link]=\"['./ChildWithGrandchild/Grandchild']\" class=\"child-with-grandchild-link\">Better Child</a>\n                                <router-outlet></router-outlet>"); })
                    .then(function (_) {
                    var element = fixture.debugElement.nativeElement;
                    fixture.detectChanges();
                    var link1 = dom_adapter_1.DOM.querySelector(element, '.child-link');
                    var link2 = dom_adapter_1.DOM.querySelector(element, '.child-with-grandchild-link');
                    testing_internal_1.expect(link1).not.toHaveCssClass('router-link-active');
                    testing_internal_1.expect(link2).not.toHaveCssClass('router-link-active');
                    router.subscribe(function (_) {
                        fixture.detectChanges();
                        testing_internal_1.expect(link1).not.toHaveCssClass('router-link-active');
                        testing_internal_1.expect(link2).toHaveCssClass('router-link-active');
                        var link3 = dom_adapter_1.DOM.querySelector(element, '.grandchild-link');
                        var link4 = dom_adapter_1.DOM.querySelector(element, '.better-grandchild-link');
                        testing_internal_1.expect(link3).toHaveCssClass('router-link-active');
                        testing_internal_1.expect(link4).not.toHaveCssClass('router-link-active');
                        async.done();
                    });
                    router.navigateByUrl('/child-with-grandchild/grandchild');
                });
            }));
        });
        testing_internal_1.describe('when clicked', function () {
            var clickOnElement = function (view) {
                var anchorEl = fixture.debugElement.componentViewChildren[0].nativeElement;
                var dispatchedEvent = dom_adapter_1.DOM.createMouseEvent('click');
                dom_adapter_1.DOM.dispatchEvent(anchorEl, dispatchedEvent);
                return dispatchedEvent;
            };
            testing_internal_1.it('should navigate to link hrefs without params', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile('<a href="hello" [router-link]="[\'./User\']"></a>')
                    .then(function (_) { return router.config([new router_1.Route({ path: '/user', component: UserCmp, name: 'User' })]); })
                    .then(function (_) { return router.navigateByUrl('/a/b'); })
                    .then(function (_) {
                    fixture.detectChanges();
                    var dispatchedEvent = clickOnElement(fixture);
                    testing_internal_1.expect(dom_adapter_1.DOM.isPrevented(dispatchedEvent)).toBe(true);
                    // router navigation is async.
                    router.subscribe(function (_) {
                        testing_internal_1.expect(location.urlChanges).toEqual(['/user']);
                        async.done();
                    });
                });
            }));
            testing_internal_1.it('should navigate to link hrefs in presence of base href', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                location.setBaseHref('/base');
                compile('<a href="hello" [router-link]="[\'./User\']"></a>')
                    .then(function (_) { return router.config([new router_1.Route({ path: '/user', component: UserCmp, name: 'User' })]); })
                    .then(function (_) { return router.navigateByUrl('/a/b'); })
                    .then(function (_) {
                    fixture.detectChanges();
                    var dispatchedEvent = clickOnElement(fixture);
                    testing_internal_1.expect(dom_adapter_1.DOM.isPrevented(dispatchedEvent)).toBe(true);
                    // router navigation is async.
                    router.subscribe(function (_) {
                        testing_internal_1.expect(location.urlChanges).toEqual(['/base/user']);
                        async.done();
                    });
                });
            }));
        });
    });
}
exports.main = main;
function getHref(tc) {
    return dom_adapter_1.DOM.getAttribute(tc.debugElement.componentViewChildren[0].nativeElement, 'href');
}
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        core_1.Component({ selector: 'my-comp' }), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
var UserCmp = (function () {
    function UserCmp(params) {
        this.user = params.get('name');
    }
    UserCmp = __decorate([
        core_1.Component({ selector: 'user-cmp' }),
        core_1.View({ template: "hello {{user}}" }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], UserCmp);
    return UserCmp;
})();
var SiblingPageCmp = (function () {
    function SiblingPageCmp(params) {
        this.pageNumber = lang_1.NumberWrapper.parseInt(params.get('number'), 10);
        this.nextPage = this.pageNumber + 1;
    }
    SiblingPageCmp = __decorate([
        core_1.Component({ selector: 'page-cmp' }),
        core_1.View({
            template: "page #{{pageNumber}} | <a href=\"hello\" [router-link]=\"['../Page', {number: nextPage}]\">next</a>",
            directives: [router_1.RouterLink]
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], SiblingPageCmp);
    return SiblingPageCmp;
})();
var NoPrefixSiblingPageCmp = (function () {
    function NoPrefixSiblingPageCmp(params) {
        this.pageNumber = lang_1.NumberWrapper.parseInt(params.get('number'), 10);
        this.nextPage = this.pageNumber + 1;
    }
    NoPrefixSiblingPageCmp = __decorate([
        core_1.Component({ selector: 'page-cmp' }),
        core_1.View({
            template: "page #{{pageNumber}} | <a href=\"hello\" [router-link]=\"['Page', {number: nextPage}]\">next</a>",
            directives: [router_1.RouterLink]
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], NoPrefixSiblingPageCmp);
    return NoPrefixSiblingPageCmp;
})();
var HelloCmp = (function () {
    function HelloCmp() {
    }
    HelloCmp = __decorate([
        core_1.Component({ selector: 'hello-cmp' }),
        core_1.View({ template: 'hello' }), 
        __metadata('design:paramtypes', [])
    ], HelloCmp);
    return HelloCmp;
})();
var Hello2Cmp = (function () {
    function Hello2Cmp() {
    }
    Hello2Cmp = __decorate([
        core_1.Component({ selector: 'hello2-cmp' }),
        core_1.View({ template: 'hello2' }), 
        __metadata('design:paramtypes', [])
    ], Hello2Cmp);
    return Hello2Cmp;
})();
function parentCmpLoader() {
    return async_1.PromiseWrapper.resolve(ParentCmp);
}
var ParentCmp = (function () {
    function ParentCmp(router) {
        this.router = router;
    }
    ParentCmp = __decorate([
        core_1.Component({ selector: 'parent-cmp' }),
        core_1.View({
            template: "{ <a [router-link]=\"['./Grandchild']\" class=\"grandchild-link\">Grandchild</a>\n               <a [router-link]=\"['./BetterGrandchild']\" class=\"better-grandchild-link\">Better Grandchild</a>\n               <router-outlet></router-outlet> }",
            directives: router_1.ROUTER_DIRECTIVES
        }),
        router_1.RouteConfig([
            new router_1.Route({ path: '/grandchild', component: HelloCmp, name: 'Grandchild' }),
            new router_1.Route({ path: '/better-grandchild', component: Hello2Cmp, name: 'BetterGrandchild' })
        ]), 
        __metadata('design:paramtypes', [router_1.Router])
    ], ParentCmp);
    return ParentCmp;
})();
var BookCmp = (function () {
    function BookCmp(params) {
        this.title = params.get('title');
    }
    BookCmp = __decorate([
        core_1.Component({ selector: 'book-cmp' }),
        core_1.View({
            template: "<a href=\"hello\" [router-link]=\"['./Page', {number: 100}]\">{{title}}</a> |\n    <router-outlet></router-outlet>",
            directives: router_1.ROUTER_DIRECTIVES
        }),
        router_1.RouteConfig([new router_1.Route({ path: '/page/:number', component: SiblingPageCmp, name: 'Page' })]), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], BookCmp);
    return BookCmp;
})();
var NoPrefixBookCmp = (function () {
    function NoPrefixBookCmp(params) {
        this.title = params.get('title');
    }
    NoPrefixBookCmp = __decorate([
        core_1.Component({ selector: 'book-cmp' }),
        core_1.View({
            template: "<a href=\"hello\" [router-link]=\"['Page', {number: 100}]\">{{title}}</a> |\n    <router-outlet></router-outlet>",
            directives: router_1.ROUTER_DIRECTIVES
        }),
        router_1.RouteConfig([new router_1.Route({ path: '/page/:number', component: SiblingPageCmp, name: 'Page' })]), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], NoPrefixBookCmp);
    return NoPrefixBookCmp;
})();
var AmbiguousBookCmp = (function () {
    function AmbiguousBookCmp(params) {
        this.title = params.get('title');
    }
    AmbiguousBookCmp = __decorate([
        core_1.Component({ selector: 'book-cmp' }),
        core_1.View({
            template: "<a href=\"hello\" [router-link]=\"['Book', {number: 100}]\">{{title}}</a> |\n    <router-outlet></router-outlet>",
            directives: router_1.ROUTER_DIRECTIVES
        }),
        router_1.RouteConfig([new router_1.Route({ path: '/page/:number', component: SiblingPageCmp, name: 'Book' })]), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], AmbiguousBookCmp);
    return AmbiguousBookCmp;
})();
//# sourceMappingURL=router_link_spec.js.map