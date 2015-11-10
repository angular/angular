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
var view_pool_1 = require('angular2/src/core/linker/view_pool');
var core_1 = require('angular2/core');
var debug_1 = require('angular2/src/core/debug');
var lang_2 = require('angular2/src/facade/lang');
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        core_1.Component({ selector: 'my-comp' }),
        core_1.View({ directives: [] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
function main() {
    testing_internal_1.describe('element probe', function () {
        testing_internal_1.beforeEachBindings(function () { return [core_1.provide(view_pool_1.APP_VIEW_POOL_CAPACITY, { useValue: 0 })]; });
        testing_internal_1.it('should return a TestElement from a dom element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(MyComp, '<div some-dir></div>')
                .createAsync(MyComp)
                .then(function (componentFixture) {
                testing_internal_1.expect(debug_1.inspectNativeElement(componentFixture.debugElement.nativeElement)
                    .componentInstance)
                    .toBeAnInstanceOf(MyComp);
                async.done();
            });
        }));
        testing_internal_1.it('should clean up whent the view is destroyed', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(MyComp, '')
                .createAsync(MyComp)
                .then(function (componentFixture) {
                componentFixture.destroy();
                testing_internal_1.expect(debug_1.inspectNativeElement(componentFixture.debugElement.nativeElement)).toBe(null);
                async.done();
            });
        }));
        if (!lang_2.IS_DART) {
            testing_internal_1.it('should provide a global function to inspect elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideTemplate(MyComp, '')
                    .createAsync(MyComp)
                    .then(function (componentFixture) {
                    testing_internal_1.expect(lang_1.global['ng']['probe'](componentFixture.debugElement.nativeElement)
                        .componentInstance)
                        .toBeAnInstanceOf(MyComp);
                    async.done();
                });
            }));
        }
    });
}
exports.main = main;
//# sourceMappingURL=debug_element_view_listener_spec.js.map