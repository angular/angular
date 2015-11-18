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
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('ng-if directive', function () {
        testing_internal_1.it('should work in a template attribute', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var html = '<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>';
            tcb.overrideTemplate(TestComponent, html)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                async.done();
            });
        }));
        testing_internal_1.it('should work in a template element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var html = '<div><template [ng-if]="booleanCondition"><copy-me>hello2</copy-me></template></div>';
            tcb.overrideTemplate(TestComponent, html)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello2');
                async.done();
            });
        }));
        testing_internal_1.it('should toggle node when condition changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var html = '<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>';
            tcb.overrideTemplate(TestComponent, html)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.booleanCondition = false;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(0);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                fixture.debugElement.componentInstance.booleanCondition = true;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                fixture.debugElement.componentInstance.booleanCondition = false;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(0);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.it('should handle nested if correctly', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var html = '<div><template [ng-if]="booleanCondition"><copy-me *ng-if="nestedBooleanCondition">hello</copy-me></template></div>';
            tcb.overrideTemplate(TestComponent, html)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.booleanCondition = false;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(0);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                fixture.debugElement.componentInstance.booleanCondition = true;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                fixture.debugElement.componentInstance.nestedBooleanCondition = false;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(0);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                fixture.debugElement.componentInstance.nestedBooleanCondition = true;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                fixture.debugElement.componentInstance.booleanCondition = false;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(0);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.it('should update several nodes with if', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var html = '<div>' +
                '<copy-me template="ng-if numberCondition + 1 >= 2">helloNumber</copy-me>' +
                '<copy-me template="ng-if stringCondition == \'foo\'">helloString</copy-me>' +
                '<copy-me template="ng-if functionCondition(stringCondition, numberCondition)">helloFunction</copy-me>' +
                '</div>';
            tcb.overrideTemplate(TestComponent, html)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(3);
                testing_internal_1.expect(dom_adapter_1.DOM.getText(fixture.debugElement.nativeElement))
                    .toEqual('helloNumberhelloStringhelloFunction');
                fixture.debugElement.componentInstance.numberCondition = 0;
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('helloString');
                fixture.debugElement.componentInstance.numberCondition = 1;
                fixture.debugElement.componentInstance.stringCondition = "bar";
                fixture.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                    .toEqual(1);
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('helloNumber');
                async.done();
            });
        }));
        if (!lang_1.IS_DART) {
            testing_internal_1.it('should not add the element twice if the condition goes from true to true (JS)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';
                tcb.overrideTemplate(TestComponent, html)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                        .toEqual(1);
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                    fixture.debugElement.componentInstance.numberCondition = 2;
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                        .toEqual(1);
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                    async.done();
                });
            }));
            testing_internal_1.it('should not recreate the element if the condition goes from true to true (JS)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';
                tcb.overrideTemplate(TestComponent, html)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    dom_adapter_1.DOM.addClass(dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, 'copy-me'), "foo");
                    fixture.debugElement.componentInstance.numberCondition = 2;
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.hasClass(dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, 'copy-me'), "foo"))
                        .toBe(true);
                    async.done();
                });
            }));
        }
        if (lang_1.IS_DART) {
            testing_internal_1.it('should not create the element if the condition is not a boolean (DART)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';
                tcb.overrideTemplate(TestComponent, html)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    testing_internal_1.expect(function () { return fixture.detectChanges(); }).toThrowError();
                    testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
                        .toEqual(0);
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                    async.done();
                });
            }));
        }
    });
}
exports.main = main;
var TestComponent = (function () {
    function TestComponent() {
        this.booleanCondition = true;
        this.nestedBooleanCondition = true;
        this.numberCondition = 1;
        this.stringCondition = "foo";
        this.functionCondition = function (s, n) { return s == "foo" && n == 1; };
    }
    TestComponent = __decorate([
        core_1.Component({ selector: 'test-cmp' }),
        core_1.View({ directives: [core_1.NgIf] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
//# sourceMappingURL=ng_if_spec.js.map