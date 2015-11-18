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
var angular2_1 = require('angular2/angular2');
var ng_switch_1 = require('angular2/src/common/directives/ng_switch');
function main() {
    testing_internal_1.describe('switch', function () {
        testing_internal_1.describe('switch value changes', function () {
            testing_internal_1.it('should switch amongst when values', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div>' +
                    '<ul [ng-switch]="switchValue">' +
                    '<template ng-switch-when="a"><li>when a</li></template>' +
                    '<template ng-switch-when="b"><li>when b</li></template>' +
                    '</ul></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                    fixture.debugElement.componentInstance.switchValue = 'a';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when a');
                    fixture.debugElement.componentInstance.switchValue = 'b';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when b');
                    async.done();
                });
            }));
            testing_internal_1.it('should switch amongst when values with fallback to default', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div>' +
                    '<ul [ng-switch]="switchValue">' +
                    '<li template="ng-switch-when \'a\'">when a</li>' +
                    '<li template="ng-switch-default">when default</li>' +
                    '</ul></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when default');
                    fixture.debugElement.componentInstance.switchValue = 'a';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when a');
                    fixture.debugElement.componentInstance.switchValue = 'b';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when default');
                    async.done();
                });
            }));
            testing_internal_1.it('should support multiple whens with the same value', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div>' +
                    '<ul [ng-switch]="switchValue">' +
                    '<template ng-switch-when="a"><li>when a1;</li></template>' +
                    '<template ng-switch-when="b"><li>when b1;</li></template>' +
                    '<template ng-switch-when="a"><li>when a2;</li></template>' +
                    '<template ng-switch-when="b"><li>when b2;</li></template>' +
                    '<template ng-switch-default><li>when default1;</li></template>' +
                    '<template ng-switch-default><li>when default2;</li></template>' +
                    '</ul></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement)
                        .toHaveText('when default1;when default2;');
                    fixture.debugElement.componentInstance.switchValue = 'a';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when a1;when a2;');
                    fixture.debugElement.componentInstance.switchValue = 'b';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when b1;when b2;');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('when values changes', function () {
            testing_internal_1.it('should switch amongst when values', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div>' +
                    '<ul [ng-switch]="switchValue">' +
                    '<template [ng-switch-when]="when1"><li>when 1;</li></template>' +
                    '<template [ng-switch-when]="when2"><li>when 2;</li></template>' +
                    '<template ng-switch-default><li>when default;</li></template>' +
                    '</ul></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.when1 = 'a';
                    fixture.debugElement.componentInstance.when2 = 'b';
                    fixture.debugElement.componentInstance.switchValue = 'a';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when 1;');
                    fixture.debugElement.componentInstance.switchValue = 'b';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when 2;');
                    fixture.debugElement.componentInstance.switchValue = 'c';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when default;');
                    fixture.debugElement.componentInstance.when1 = 'c';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when 1;');
                    fixture.debugElement.componentInstance.when1 = 'd';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('when default;');
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var TestComponent = (function () {
    function TestComponent() {
        this.switchValue = null;
        this.when1 = null;
        this.when2 = null;
    }
    TestComponent = __decorate([
        angular2_1.Component({ selector: 'test-cmp' }),
        angular2_1.View({ directives: [ng_switch_1.NgSwitch, ng_switch_1.NgSwitchWhen, ng_switch_1.NgSwitchDefault] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
//# sourceMappingURL=ng_switch_spec.js.map