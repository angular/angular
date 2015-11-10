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
var ng_class_1 = require('angular2/src/common/directives/ng_class');
var view_pool_1 = require('angular2/src/core/linker/view_pool');
function detectChangesAndCheck(fixture, classes, elIndex) {
    if (elIndex === void 0) { elIndex = 0; }
    fixture.detectChanges();
    testing_internal_1.expect(fixture.debugElement.componentViewChildren[elIndex].nativeElement.className)
        .toEqual(classes);
}
function main() {
    testing_internal_1.describe('binding to CSS class list', function () {
        testing_internal_1.describe('viewpool support', function () {
            testing_internal_1.beforeEachBindings(function () { return [angular2_1.provide(view_pool_1.APP_VIEW_POOL_CAPACITY, { useValue: 100 })]; });
            testing_internal_1.it('should clean up when the directive is destroyed', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div *ng-for="var item of items" [ng-class]="item"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.items = [['0']];
                    fixture.detectChanges();
                    fixture.debugElement.componentInstance.items = [['1']];
                    detectChangesAndCheck(fixture, '1', 1);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('expressions evaluating to objects', function () {
            testing_internal_1.it('should add classes specified in an object literal', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="{foo: true, bar: false}"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    async.done();
                });
            }));
            testing_internal_1.it('should add classes specified in an object literal without change in class names', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"{'foo-bar': true, 'fooBar': true}\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo-bar fooBar');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes based on changes in object literal values', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="{foo: condition, bar: !condition}"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.condition = false;
                    detectChangesAndCheck(fixture, 'bar');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes based on changes to the expression object', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="objExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, 'foo bar');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'baz', true);
                    detectChangesAndCheck(fixture, 'foo bar baz');
                    collection_1.StringMapWrapper.delete(fixture.debugElement.componentInstance.objExpr, 'bar');
                    detectChangesAndCheck(fixture, 'foo baz');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes based on reference changes to the expression object', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="objExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.objExpr = { foo: true, bar: true };
                    detectChangesAndCheck(fixture, 'foo bar');
                    fixture.debugElement.componentInstance.objExpr = { baz: true };
                    detectChangesAndCheck(fixture, 'baz');
                    async.done();
                });
            }));
            testing_internal_1.it('should remove active classes when expression evaluates to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="objExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.objExpr = null;
                    detectChangesAndCheck(fixture, '');
                    fixture.debugElement.componentInstance.objExpr = { 'foo': false, 'bar': true };
                    detectChangesAndCheck(fixture, 'bar');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('expressions evaluating to lists', function () {
            testing_internal_1.it('should add classes specified in a list literal', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"['foo', 'bar', 'foo-bar', 'fooBar']\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes based on changes to the expression', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="arrExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    var arrExpr = fixture.debugElement.componentInstance.arrExpr;
                    detectChangesAndCheck(fixture, 'foo');
                    arrExpr.push('bar');
                    detectChangesAndCheck(fixture, 'foo bar');
                    arrExpr[1] = 'baz';
                    detectChangesAndCheck(fixture, 'foo baz');
                    collection_1.ListWrapper.remove(fixture.debugElement.componentInstance.arrExpr, 'baz');
                    detectChangesAndCheck(fixture, 'foo');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes when a reference changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="arrExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.arrExpr = ['bar'];
                    detectChangesAndCheck(fixture, 'bar');
                    async.done();
                });
            }));
            testing_internal_1.it('should take initial classes into account when a reference changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div class="foo" [ng-class]="arrExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.arrExpr = ['bar'];
                    detectChangesAndCheck(fixture, 'foo bar');
                    async.done();
                });
            }));
            testing_internal_1.it('should ignore empty or blank class names', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div class="foo" [ng-class]="arrExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.arrExpr = ['', '  '];
                    detectChangesAndCheck(fixture, 'foo');
                    async.done();
                });
            }));
            testing_internal_1.it('should trim blanks from class names', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div class="foo" [ng-class]="arrExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.arrExpr = [' bar  '];
                    detectChangesAndCheck(fixture, 'foo bar');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('expressions evaluating to sets', function () {
            testing_internal_1.it('should add and remove classes if the set instance changed', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="setExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    var setExpr = new Set();
                    setExpr.add('bar');
                    fixture.debugElement.componentInstance.setExpr = setExpr;
                    detectChangesAndCheck(fixture, 'bar');
                    setExpr = new Set();
                    setExpr.add('baz');
                    fixture.debugElement.componentInstance.setExpr = setExpr;
                    detectChangesAndCheck(fixture, 'baz');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('expressions evaluating to string', function () {
            testing_internal_1.it('should add classes specified in a string literal', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"'foo bar foo-bar fooBar'\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
                    async.done();
                });
            }));
            testing_internal_1.it('should add and remove classes based on changes to the expression', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="strExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.strExpr = 'foo bar';
                    detectChangesAndCheck(fixture, 'foo bar');
                    fixture.debugElement.componentInstance.strExpr = 'baz';
                    detectChangesAndCheck(fixture, 'baz');
                    async.done();
                });
            }));
            testing_internal_1.it('should remove active classes when switching from string to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"strExpr\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.strExpr = null;
                    detectChangesAndCheck(fixture, '');
                    async.done();
                });
            }));
            testing_internal_1.it('should take initial classes into account when switching from string to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div class=\"foo\" [ng-class]=\"strExpr\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'foo');
                    fixture.debugElement.componentInstance.strExpr = null;
                    detectChangesAndCheck(fixture, 'foo');
                    async.done();
                });
            }));
            testing_internal_1.it('should ignore empty and blank strings', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div class=\"foo\" [ng-class]=\"strExpr\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.strExpr = '';
                    detectChangesAndCheck(fixture, 'foo');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('cooperation with other class-changing constructs', function () {
            testing_internal_1.it('should co-operate with the class attribute', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div [ng-class]="objExpr" class="init foo"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, 'init foo bar');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                    detectChangesAndCheck(fixture, 'init bar');
                    fixture.debugElement.componentInstance.objExpr = null;
                    detectChangesAndCheck(fixture, 'init foo');
                    async.done();
                });
            }));
            testing_internal_1.it('should co-operate with the interpolated class attribute', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"objExpr\" class=\"{{'init foo'}}\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, "init foo bar");
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                    detectChangesAndCheck(fixture, "init bar");
                    fixture.debugElement.componentInstance.objExpr = null;
                    detectChangesAndCheck(fixture, "init foo");
                    async.done();
                });
            }));
            testing_internal_1.it('should co-operate with the class attribute and binding to it', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = "<div [ng-class]=\"objExpr\" class=\"init\" [class]=\"'foo'\"></div>";
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, "init foo bar");
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                    detectChangesAndCheck(fixture, "init bar");
                    fixture.debugElement.componentInstance.objExpr = null;
                    detectChangesAndCheck(fixture, "init foo");
                    async.done();
                });
            }));
            testing_internal_1.it('should co-operate with the class attribute and class.name binding', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div class="init foo" [ng-class]="objExpr" [class.baz]="condition"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'init foo baz');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, 'init foo baz bar');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                    detectChangesAndCheck(fixture, 'init baz bar');
                    fixture.debugElement.componentInstance.condition = false;
                    detectChangesAndCheck(fixture, 'init bar');
                    async.done();
                });
            }));
            testing_internal_1.it('should co-operate with initial class and class attribute binding when binding changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div class="init" [ng-class]="objExpr" [class]="strExpr"></div>';
                tcb.overrideTemplate(TestComponent, template)
                    .createAsync(TestComponent)
                    .then(function (fixture) {
                    detectChangesAndCheck(fixture, 'init foo');
                    collection_1.StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                    detectChangesAndCheck(fixture, 'init foo bar');
                    fixture.debugElement.componentInstance.strExpr = 'baz';
                    detectChangesAndCheck(fixture, 'init bar baz foo');
                    fixture.debugElement.componentInstance.objExpr = null;
                    detectChangesAndCheck(fixture, 'init baz');
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var TestComponent = (function () {
    function TestComponent() {
        this.condition = true;
        this.arrExpr = ['foo'];
        this.setExpr = new Set();
        this.objExpr = { 'foo': true, 'bar': false };
        this.strExpr = 'foo';
        this.setExpr.add('foo');
    }
    TestComponent = __decorate([
        angular2_1.Component({ selector: 'test-cmp' }),
        angular2_1.View({ directives: [ng_class_1.NgClass, angular2_1.NgFor] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
//# sourceMappingURL=ng_class_spec.js.map