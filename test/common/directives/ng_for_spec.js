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
var ng_for_1 = require('angular2/src/common/directives/ng_for');
function main() {
    testing_internal_1.describe('ng-for', function () {
        var TEMPLATE = '<div><copy-me template="ng-for #item of items">{{item.toString()}};</copy-me></div>';
        testing_internal_1.it('should reflect initial elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;2;');
                async.done();
            });
        }));
        testing_internal_1.it('should reflect added elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                fixture.debugElement.componentInstance.items.push(3);
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;2;3;');
                async.done();
            });
        }));
        testing_internal_1.it('should reflect removed elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                collection_1.ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 1);
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;');
                async.done();
            });
        }));
        testing_internal_1.it('should reflect moved elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                collection_1.ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 0);
                fixture.debugElement.componentInstance.items.push(1);
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('2;1;');
                async.done();
            });
        }));
        testing_internal_1.it('should reflect a mix of all changes (additions/removals/moves)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [0, 1, 2, 3, 4, 5];
                fixture.detectChanges();
                fixture.debugElement.componentInstance.items = [6, 2, 7, 0, 4, 8];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('6;2;7;0;4;8;');
                async.done();
            });
        }));
        testing_internal_1.it('should iterate over an array of objects', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<ul><li template="ng-for #item of items">{{item["name"]}};</li></ul>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                // INIT
                fixture.debugElement.componentInstance.items =
                    [{ 'name': 'misko' }, { 'name': 'shyam' }];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('misko;shyam;');
                // GROW
                fixture.debugElement.componentInstance.items.push({ 'name': 'adam' });
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('misko;shyam;adam;');
                // SHRINK
                collection_1.ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 2);
                collection_1.ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 0);
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('shyam;');
                async.done();
            });
        }));
        testing_internal_1.it('should gracefully handle nulls', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<ul><li template="ng-for #item of null">{{item}};</li></ul>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.it('should gracefully handle ref changing to null and back', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;2;');
                fixture.debugElement.componentInstance.items = null;
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                fixture.debugElement.componentInstance.items = [1, 2, 3];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;2;3;');
                async.done();
            });
        }));
        testing_internal_1.it('should throw on ref changing to string', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('1;2;');
                fixture.debugElement.componentInstance.items = 'whaaa';
                testing_internal_1.expect(function () { return fixture.detectChanges(); }).toThrowError();
                async.done();
            });
        }));
        testing_internal_1.it('should works with duplicates', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, TEMPLATE)
                .createAsync(TestComponent)
                .then(function (fixture) {
                var a = new Foo();
                fixture.debugElement.componentInstance.items = [a, a];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('foo;foo;');
                async.done();
            });
        }));
        testing_internal_1.it('should repeat over nested arrays', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div>' +
                '<div template="ng-for #item of items">' +
                '<div template="ng-for #subitem of item">' +
                '{{subitem}}-{{item.length}};' +
                '</div>|' +
                '</div>' +
                '</div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [['a', 'b'], ['c']];
                fixture.detectChanges();
                fixture.detectChanges();
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('a-2;b-2;|c-1;|');
                fixture.debugElement.componentInstance.items = [['e'], ['f', 'g']];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('e-1;|f-2;g-2;|');
                async.done();
            });
        }));
        testing_internal_1.it('should repeat over nested arrays with no intermediate element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><template ng-for #item [ng-for-of]="items">' +
                '<div template="ng-for #subitem of item">' +
                '{{subitem}}-{{item.length}};' +
                '</div></template></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [['a', 'b'], ['c']];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('a-2;b-2;c-1;');
                fixture.debugElement.componentInstance.items = [['e'], ['f', 'g']];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('e-1;f-2;g-2;');
                async.done();
            });
        }));
        testing_internal_1.it('should display indices correctly', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><copy-me template="ng-for: var item of items; var i=index">{{i.toString()}}</copy-me></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('0123456789');
                fixture.debugElement.componentInstance.items = [1, 2, 6, 7, 4, 3, 5, 8, 9, 0];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('0123456789');
                async.done();
            });
        }));
        testing_internal_1.it('should display last item correctly', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><copy-me template="ng-for: var item of items; var isLast=last">{{isLast.toString()}}</copy-me></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [0, 1, 2];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('falsefalsetrue');
                fixture.debugElement.componentInstance.items = [2, 1];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('falsetrue');
                async.done();
            });
        }));
        testing_internal_1.it('should display even items correctly', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><copy-me template="ng-for: var item of items; var isEven=even">{{isEven.toString()}}</copy-me></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [0, 1, 2];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('truefalsetrue');
                fixture.debugElement.componentInstance.items = [2, 1];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('truefalse');
                async.done();
            });
        }));
        testing_internal_1.it('should display odd items correctly', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var template = '<div><copy-me template="ng-for: var item of items; var isOdd=odd">{{isOdd.toString()}}</copy-me></div>';
            tcb.overrideTemplate(TestComponent, template)
                .createAsync(TestComponent)
                .then(function (fixture) {
                fixture.debugElement.componentInstance.items = [0, 1, 2, 3];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('falsetruefalsetrue');
                fixture.debugElement.componentInstance.items = [2, 1];
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('falsetrue');
                async.done();
            });
        }));
        testing_internal_1.it('should allow to use a custom template', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, '<ul><template ng-for [ng-for-of]="items" [ng-for-template]="contentTpl"></template></ul>')
                .overrideTemplate(ComponentUsingTestComponent, '<test-cmp><li template="#item #i=index">{{i}}: {{item}};</li></test-cmp>')
                .createAsync(ComponentUsingTestComponent)
                .then(function (fixture) {
                var testComponent = fixture.debugElement.componentViewChildren[0];
                testComponent.componentInstance.items = ['a', 'b', 'c'];
                fixture.detectChanges();
                testing_internal_1.expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
                async.done();
            });
        }));
        testing_internal_1.it('should use a default template if a custom one is null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, "<ul><template ng-for #item [ng-for-of]=\"items\"\n         [ng-for-template]=\"contentTpl\" #i=\"index\">{{i}}: {{item}};</template></ul>")
                .overrideTemplate(ComponentUsingTestComponent, '<test-cmp></test-cmp>')
                .createAsync(ComponentUsingTestComponent)
                .then(function (fixture) {
                var testComponent = fixture.debugElement.componentViewChildren[0];
                testComponent.componentInstance.items = ['a', 'b', 'c'];
                fixture.detectChanges();
                testing_internal_1.expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
                async.done();
            });
        }));
        testing_internal_1.it('should use a custom template when both default and a custom one are present', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(TestComponent, "<ul><template ng-for #item [ng-for-of]=\"items\"\n         [ng-for-template]=\"contentTpl\" #i=\"index\">{{i}}=> {{item}};</template></ul>")
                .overrideTemplate(ComponentUsingTestComponent, '<test-cmp><li template="#item #i=index">{{i}}: {{item}};</li></test-cmp>')
                .createAsync(ComponentUsingTestComponent)
                .then(function (fixture) {
                var testComponent = fixture.debugElement.componentViewChildren[0];
                testComponent.componentInstance.items = ['a', 'b', 'c'];
                fixture.detectChanges();
                testing_internal_1.expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
                async.done();
            });
        }));
    });
}
exports.main = main;
var Foo = (function () {
    function Foo() {
    }
    Foo.prototype.toString = function () { return 'foo'; };
    return Foo;
})();
var TestComponent = (function () {
    function TestComponent() {
        this.items = [1, 2];
    }
    __decorate([
        angular2_1.ContentChild(angular2_1.TemplateRef), 
        __metadata('design:type', angular2_1.TemplateRef)
    ], TestComponent.prototype, "contentTpl");
    TestComponent = __decorate([
        angular2_1.Component({ selector: 'test-cmp' }),
        angular2_1.View({ directives: [ng_for_1.NgFor] }), 
        __metadata('design:paramtypes', [])
    ], TestComponent);
    return TestComponent;
})();
var ComponentUsingTestComponent = (function () {
    function ComponentUsingTestComponent() {
        this.items = [1, 2];
    }
    ComponentUsingTestComponent = __decorate([
        angular2_1.Component({ selector: 'outer-cmp' }),
        angular2_1.View({ directives: [TestComponent] }), 
        __metadata('design:paramtypes', [])
    ], ComponentUsingTestComponent);
    return ComponentUsingTestComponent;
})();
//# sourceMappingURL=ng_for_spec.js.map