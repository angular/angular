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
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var core_1 = require('angular2/core');
var element_ref_1 = require('angular2/src/core/linker/element_ref');
function main() {
    testing_internal_1.describe('non-bindable', function () {
        testing_internal_1.it('should not interpolate children', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div>{{text}}<span ng-non-bindable>{{text}}</span></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('foo{{text}}');
                async.done();
            });
        }));
        testing_internal_1.it('should ignore directives on child nodes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div ng-non-bindable><span id=child test-dec>{{text}}</span></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                // We must use DOM.querySelector instead of fixture.query here
                // since the elements inside are not compiled.
                var span = dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, '#child');
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(span, 'compiled')).toBeFalsy();
                async.done();
            });
        }));
        testing_internal_1.it('should trigger directives on the same node', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><span id=child ng-non-bindable test-dec>{{text}}</span></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                var span = dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, '#child');
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(span, 'compiled')).toBeTruthy();
                async.done();
            });
        }));
    });
}
exports.main = main;
var TestDirective = (function () {
    function TestDirective(el) {
        dom_adapter_1.DOM.addClass(el.nativeElement, 'compiled');
    }
    TestDirective = __decorate([
        core_1.Directive({ selector: '[test-dec]' }), 
        __metadata('design:paramtypes', [element_ref_1.ElementRef])
    ], TestDirective);
    return TestDirective;
})();
var TestComponent = (function () {
    function TestComponent() {
        this.text = 'foo';
    }
    TestComponent = __decorate([
        core_1.Component({ selector: 'test-cmp' }),
        core_1.View({ directives: [TestDirective] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
//# sourceMappingURL=non_bindable_spec.js.map