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
var collection_1 = require('angular2/src/facade/collection');
var angular2_1 = require('angular2/angular2');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var ng_style_1 = require('angular2/src/common/directives/ng_style');
function main() {
    testing_internal_1.describe('binding to CSS styles', function () {
        testing_internal_1.it('should add styles specified in an object literal', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = "<div [ng-style]=\"{'max-width': '40px'}\"></div>";
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('40px');
                async.done();
            });
        }));
        testing_internal_1.it('should add and change styles specified in an object expression', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = "<div [ng-style]=\"expr\"></div>";
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                var expr;
                fixture.debugElement.componentInstance.expr = { 'max-width': '40px' };
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('40px');
                expr = fixture.debugElement.componentInstance.expr;
                expr['max-width'] = '30%';
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('30%');
                async.done();
            });
        }));
        testing_internal_1.it('should remove styles when deleting a key in an object expression', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = "<div [ng-style]=\"expr\"></div>";
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.expr = { 'max-width': '40px' };
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('40px');
                collection_1.StringMapWrapper.delete(fixture.debugElement.componentInstance.expr, 'max-width');
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('');
                async.done();
            });
        }));
        testing_internal_1.it('should co-operate with the style attribute', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = "<div style=\"font-size: 12px\" [ng-style]=\"expr\"></div>";
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.expr = { 'max-width': '40px' };
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('40px');
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'font-size'))
                    .toEqual('12px');
                collection_1.StringMapWrapper.delete(fixture.debugElement.componentInstance.expr, 'max-width');
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('');
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'font-size'))
                    .toEqual('12px');
                async.done();
            });
        }));
        testing_internal_1.it('should co-operate with the style.[styleName]="expr" special-case in the compiler', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = "<div [style.font-size.px]=\"12\" [ng-style]=\"expr\"></div>";
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.expr = { 'max-width': '40px' };
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('40px');
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'font-size'))
                    .toEqual('12px');
                collection_1.StringMapWrapper.delete(fixture.debugElement.componentInstance.expr, 'max-width');
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'font-size'))
                    .toEqual('12px');
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'max-width'))
                    .toEqual('');
                async.done();
            });
        }));
    });
}
exports.main = main;
var TestComponent = (function () {
    function TestComponent() {
    }
    TestComponent = __decorate([
        angular2_1.Component({ selector: 'test-cmp' }),
        angular2_1.View({ directives: [ng_style_1.NgStyle] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
//# sourceMappingURL=ng_style_spec.js.map