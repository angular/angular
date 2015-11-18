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
var core_1 = require('angular2/core');
var browser_1 = require('angular2/platform/browser');
var router_1 = require('angular2/router');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var instruction_1 = require('angular2/src/router/instruction');
var path_recognizer_1 = require('angular2/src/router/path_recognizer');
var sync_route_handler_1 = require('angular2/src/router/sync_route_handler');
var dummyPathRecognizer = new path_recognizer_1.PathRecognizer('', new sync_route_handler_1.SyncRouteHandler(null));
var dummyInstruction = new router_1.Instruction(new instruction_1.ComponentInstruction_('detail', [], dummyPathRecognizer), null, {});
function main() {
    testing_internal_1.describe('router-link directive', function () {
        var tcb;
        testing_internal_1.beforeEachBindings(function () { return [
            core_1.provide(router_1.Location, { useValue: makeDummyLocation() }),
            core_1.provide(router_1.Router, { useValue: makeDummyRouter() })
        ]; });
        testing_internal_1.beforeEach(testing_internal_1.inject([testing_internal_1.TestComponentBuilder], function (tcBuilder) { tcb = tcBuilder; }));
        testing_internal_1.it('should update a[href] attribute', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            tcb.createAsync(TestComponent)
                .then(function (testComponent) {
                testComponent.detectChanges();
                var anchorElement = testComponent.debugElement.query(browser_1.By.css('a.detail-view')).nativeElement;
                testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(anchorElement, 'href')).toEqual('detail');
                async.done();
            });
        }));
        testing_internal_1.it('should call router.navigate when a link is clicked', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, router_1.Router], function (async, router) {
            tcb.createAsync(TestComponent)
                .then(function (testComponent) {
                testComponent.detectChanges();
                // TODO: shouldn't this be just 'click' rather than '^click'?
                testComponent.debugElement.query(browser_1.By.css('a.detail-view'))
                    .triggerEventHandler('click', null);
                testing_internal_1.expect(router.spy('navigateByInstruction')).toHaveBeenCalledWith(dummyInstruction);
                async.done();
            });
        }));
        testing_internal_1.it('should call router.navigate when a link is clicked if target is _self', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, router_1.Router], function (async, router) {
            tcb.createAsync(TestComponent)
                .then(function (testComponent) {
                testComponent.detectChanges();
                testComponent.debugElement.query(browser_1.By.css('a.detail-view-self'))
                    .triggerEventHandler('click', null);
                testing_internal_1.expect(router.spy('navigateByInstruction')).toHaveBeenCalledWith(dummyInstruction);
                async.done();
            });
        }));
        testing_internal_1.it('should NOT call router.navigate when a link is clicked if target is set to other than _self', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, router_1.Router], function (async, router) {
            tcb.createAsync(TestComponent)
                .then(function (testComponent) {
                testComponent.detectChanges();
                testComponent.debugElement.query(browser_1.By.css('a.detail-view-blank'))
                    .triggerEventHandler('click', null);
                testing_internal_1.expect(router.spy('navigateByInstruction')).not.toHaveBeenCalled();
                async.done();
            });
        }));
    });
}
exports.main = main;
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
var TestComponent = (function () {
    function TestComponent() {
    }
    TestComponent = __decorate([
        core_1.Component({ selector: 'test-component' }),
        core_1.View({
            template: "\n    <div>\n      <a [router-link]=\"['/Detail']\"\n         class=\"detail-view\">\n           detail view\n      </a>\n      <a [router-link]=\"['/Detail']\"\n         class=\"detail-view-self\"\n         target=\"_self\">\n           detail view with _self target\n      </a>\n      <a [router-link]=\"['/Detail']\"\n         class=\"detail-view-blank\"\n         target=\"_blank\">\n           detail view with _blank target\n      </a>\n    </div>",
            directives: [router_1.RouterLink]
        }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
function makeDummyLocation() {
    var dl = new spies_1.SpyLocation();
    dl.spy('prepareExternalUrl').andCallFake(function (url) { return url; });
    return dl;
}
function makeDummyRouter() {
    var dr = new spies_1.SpyRouter();
    dr.spy('generate').andCallFake(function (routeParams) { return dummyInstruction; });
    dr.spy('isRouteActive').andCallFake(function (_) { return false; });
    dr.spy('navigateInstruction');
    return dr;
}
//# sourceMappingURL=router_link_spec.js.map