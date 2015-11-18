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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var core_2 = require('angular2/core');
var browser_adapter_1 = require('angular2/src/platform/browser/browser_adapter');
function main() {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    testing_internal_1.describe('Query API', function () {
        testing_internal_1.describe("querying by directive type", function () {
            testing_internal_1.it('should contain all direct child directives in the light dom (constructor)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query text="2"><div text="3">' +
                    '<div text="too-deep"></div>' +
                    '</div></needs-query>' +
                    '<div text="4"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|3|');
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all direct child directives in the content dom', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-content-children #q><div text="foo"></div></needs-content-children>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    view.detectChanges();
                    testing_internal_1.expect(q.textDirChildren.length).toEqual(1);
                    testing_internal_1.expect(q.numberOfChildrenAfterContentInit).toEqual(1);
                    async.done();
                });
            }));
            testing_internal_1.it('should contain the first content child', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-content-child #q><div *ng-if="shouldShow" text="foo"></div></needs-content-child>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.debugElement.componentInstance.shouldShow = true;
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    testing_internal_1.expect(q.log).toEqual([["setter", "foo"], ["init", "foo"], ["check", "foo"]]);
                    view.debugElement.componentInstance.shouldShow = false;
                    view.detectChanges();
                    testing_internal_1.expect(q.log).toEqual([
                        ["setter", "foo"],
                        ["init", "foo"],
                        ["check", "foo"],
                        ["setter", null],
                        ["check", null]
                    ]);
                    async.done();
                });
            }));
            testing_internal_1.it('should contain the first view child', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-child #q></needs-view-child>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    testing_internal_1.expect(q.log).toEqual([["setter", "foo"], ["init", "foo"], ["check", "foo"]]);
                    q.shouldShow = false;
                    view.detectChanges();
                    testing_internal_1.expect(q.log).toEqual([
                        ["setter", "foo"],
                        ["init", "foo"],
                        ["check", "foo"],
                        ["setter", null],
                        ["check", null]
                    ]);
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all directives in the light dom when descendants flag is used', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query-desc text="2"><div text="3">' +
                    '<div text="4"></div>' +
                    '</div></needs-query-desc>' +
                    '<div text="5"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|3|4|');
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all directives in the light dom', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query text="2"><div text="3"></div></needs-query>' +
                    '<div text="4"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|3|');
                    async.done();
                });
            }));
            testing_internal_1.it('should reflect dynamically inserted directives', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query text="2"><div *ng-if="shouldShow" [text]="\'3\'"></div></needs-query>' +
                    '<div text="4"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren)).toHaveText('2|');
                    view.debugElement.componentInstance.shouldShow = true;
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|3|');
                    async.done();
                });
            }));
            testing_internal_1.it('should be cleanly destroyed when a query crosses view boundaries', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query text="2"><div *ng-if="shouldShow" [text]="\'3\'"></div></needs-query>' +
                    '<div text="4"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.shouldShow = true;
                    fixture.detectChanges();
                    fixture.destroy();
                    async.done();
                });
            }));
            testing_internal_1.it('should reflect moved directives', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<div text="1"></div>' +
                    '<needs-query text="2"><div *ng-for="var i of list" [text]="i"></div></needs-query>' +
                    '<div text="4"></div>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|1d|2d|3d|');
                    view.debugElement.componentInstance.list = ['3d', '2d'];
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('2|3d|2d|');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('query for TemplateRef', function () {
            testing_internal_1.it('should find TemplateRefs in the light and shadow dom', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-tpl><template var-x="light"></template></needs-tpl>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    var needsTpl = view.debugElement.componentViewChildren[0].inject(NeedsTpl);
                    testing_internal_1.expect(needsTpl.query.first.hasLocal('light')).toBe(true);
                    testing_internal_1.expect(needsTpl.viewQuery.first.hasLocal('shadow')).toBe(true);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("changes", function () {
            testing_internal_1.it('should notify query on change', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query #q>' +
                    '<div text="1"></div>' +
                    '<div *ng-if="shouldShow" text="2"></div>' +
                    '</needs-query>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    async_1.ObservableWrapper.subscribe(q.query.changes, function (_) {
                        testing_internal_1.expect(q.query.first.text).toEqual("1");
                        testing_internal_1.expect(q.query.last.text).toEqual("2");
                        async.done();
                    });
                    view.debugElement.componentInstance.shouldShow = true;
                    view.detectChanges();
                });
            }));
            testing_internal_1.it("should notify child's query before notifying parent's query", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-desc #q1>' +
                    '<needs-query-desc #q2>' +
                    '<div text="1"></div>' +
                    '</needs-query-desc>' +
                    '</needs-query-desc>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q1 = view.debugElement.componentViewChildren[0].getLocal("q1");
                    var q2 = view.debugElement.componentViewChildren[0].getLocal("q2");
                    var firedQ2 = false;
                    async_1.ObservableWrapper.subscribe(q2.query.changes, function (_) { firedQ2 = true; });
                    async_1.ObservableWrapper.subscribe(q1.query.changes, function (_) {
                        testing_internal_1.expect(firedQ2).toBe(true);
                        async.done();
                    });
                    view.detectChanges();
                });
            }));
            testing_internal_1.it('should correctly clean-up when destroyed together with the directives it is querying', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query #q *ng-if="shouldShow"><div text="foo"></div></needs-query>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.debugElement.componentInstance.shouldShow = true;
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[1].getLocal('q');
                    testing_internal_1.expect(q.query.length).toEqual(1);
                    view.debugElement.componentInstance.shouldShow = false;
                    view.detectChanges();
                    view.debugElement.componentInstance.shouldShow = true;
                    view.detectChanges();
                    var q2 = view.debugElement.componentViewChildren[1].getLocal('q');
                    testing_internal_1.expect(q2.query.length).toEqual(1);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("querying by var binding", function () {
            testing_internal_1.it('should contain all the child directives in the light dom with the given var binding', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-by-var-binding #q>' +
                    '<div *ng-for="#item of list" [text]="item" #text-label="textDir"></div>' +
                    '</needs-query-by-var-binding>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.debugElement.componentInstance.list = ['1d', '2d'];
                    view.detectChanges();
                    testing_internal_1.expect(q.query.first.text).toEqual("1d");
                    testing_internal_1.expect(q.query.last.text).toEqual("2d");
                    async.done();
                });
            }));
            testing_internal_1.it('should support querying by multiple var bindings', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-by-var-bindings #q>' +
                    '<div text="one" #text-label1="textDir"></div>' +
                    '<div text="two" #text-label2="textDir"></div>' +
                    '</needs-query-by-var-bindings>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.first.text).toEqual("one");
                    testing_internal_1.expect(q.query.last.text).toEqual("two");
                    async.done();
                });
            }));
            testing_internal_1.it('should reflect dynamically inserted directives', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-by-var-binding #q>' +
                    '<div *ng-for="#item of list" [text]="item" #text-label="textDir"></div>' +
                    '</needs-query-by-var-binding>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.debugElement.componentInstance.list = ['1d', '2d'];
                    view.detectChanges();
                    view.debugElement.componentInstance.list = ['2d', '1d'];
                    view.detectChanges();
                    testing_internal_1.expect(q.query.last.text).toEqual("1d");
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all the elements in the light dom with the given var binding', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-by-var-binding #q>' +
                    '<div template="ng-for: #item of list">' +
                    '<div #text-label>{{item}}</div>' +
                    '</div>' +
                    '</needs-query-by-var-binding>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.debugElement.componentInstance.list = ['1d', '2d'];
                    view.detectChanges();
                    testing_internal_1.expect(q.query.first.nativeElement).toHaveText("1d");
                    testing_internal_1.expect(q.query.last.nativeElement).toHaveText("2d");
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all the elements in the light dom even if they get projected', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-query-and-project #q>' +
                    '<div text="hello"></div><div text="world"></div>' +
                    '</needs-query-and-project>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    testing_internal_1.expect(core_2.asNativeElements(view.debugElement.componentViewChildren))
                        .toHaveText('hello|world|');
                    async.done();
                });
            }));
            testing_internal_1.it('should support querying the view by using a view query', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-by-var-binding #q></needs-view-query-by-var-binding>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.first.nativeElement).toHaveText("text");
                    async.done();
                });
            }));
            testing_internal_1.it('should contain all child directives in the view dom', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-children #q></needs-view-children>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    view.detectChanges();
                    testing_internal_1.expect(q.textDirChildren.length).toEqual(1);
                    testing_internal_1.expect(q.numberOfChildrenAfterViewInit).toEqual(1);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("querying in the view", function () {
            testing_internal_1.it('should contain all the elements in the view with that have the given directive', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query #q><div text="ignoreme"></div></needs-view-query>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "2", "3", "4"]);
                    async.done();
                });
            }));
            testing_internal_1.it('should not include directive present on the host element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query #q text="self"></needs-view-query>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "2", "3", "4"]);
                    async.done();
                });
            }));
            testing_internal_1.it('should reflect changes in the component', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-if #q></needs-view-query-if>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.length).toBe(0);
                    q.show = true;
                    view.detectChanges();
                    testing_internal_1.expect(q.query.length).toBe(1);
                    testing_internal_1.expect(q.query.first.text).toEqual("1");
                    async.done();
                });
            }));
            testing_internal_1.it('should not be affected by other changes in the component', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-nested-if #q></needs-view-query-nested-if>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.length).toEqual(1);
                    testing_internal_1.expect(q.query.first.text).toEqual("1");
                    q.show = false;
                    view.detectChanges();
                    testing_internal_1.expect(q.query.length).toEqual(1);
                    testing_internal_1.expect(q.query.first.text).toEqual("1");
                    async.done();
                });
            }));
            testing_internal_1.it('should maintain directives in pre-order depth-first DOM order after dynamic insertion', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-order #q></needs-view-query-order>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "2", "3", "4"]);
                    q.list = ["-3", "2"];
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "-3", "2", "4"]);
                    async.done();
                });
            }));
            testing_internal_1.it('should maintain directives in pre-order depth-first DOM order after dynamic insertion', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-order-with-p #q></needs-view-query-order-with-p>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal("q");
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "2", "3", "4"]);
                    q.list = ["-3", "2"];
                    view.detectChanges();
                    testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(["1", "-3", "2", "4"]);
                    async.done();
                });
            }));
            testing_internal_1.it('should handle long ng-for cycles', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-view-query-order #q></needs-view-query-order>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    // no significance to 50, just a reasonably large cycle.
                    for (var i = 0; i < 50; i++) {
                        var newString = i.toString();
                        q.list = [newString];
                        view.detectChanges();
                        testing_internal_1.expect(q.query.map(function (d) { return d.text; })).toEqual(['1', newString, '4']);
                    }
                    async.done();
                });
            }));
            testing_internal_1.it('should support more than three queries', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var template = '<needs-four-queries #q><div text="1"></div></needs-four-queries>';
                tcb.overrideTemplate(MyComp, template)
                    .createAsync(MyComp)
                    .then(function (view) {
                    view.detectChanges();
                    var q = view.debugElement.componentViewChildren[0].getLocal('q');
                    testing_internal_1.expect(q.query1).toBeDefined();
                    testing_internal_1.expect(q.query2).toBeDefined();
                    testing_internal_1.expect(q.query3).toBeDefined();
                    testing_internal_1.expect(q.query4).toBeDefined();
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var TextDirective = (function () {
    function TextDirective() {
    }
    TextDirective = __decorate([
        core_1.Directive({ selector: '[text]', inputs: ['text'], exportAs: 'textDir' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TextDirective);
    return TextDirective;
})();
var NeedsContentChildren = (function () {
    function NeedsContentChildren() {
    }
    NeedsContentChildren.prototype.afterContentInit = function () { this.numberOfChildrenAfterContentInit = this.textDirChildren.length; };
    __decorate([
        core_1.ContentChildren(TextDirective), 
        __metadata('design:type', core_1.QueryList)
    ], NeedsContentChildren.prototype, "textDirChildren");
    NeedsContentChildren = __decorate([
        core_1.Component({ selector: 'needs-content-children' }),
        core_1.View({ template: '' }), 
        __metadata('design:paramtypes', [])
    ], NeedsContentChildren);
    return NeedsContentChildren;
})();
var NeedsViewChildren = (function () {
    function NeedsViewChildren() {
    }
    NeedsViewChildren.prototype.afterViewInit = function () { this.numberOfChildrenAfterViewInit = this.textDirChildren.length; };
    __decorate([
        core_1.ViewChildren(TextDirective), 
        __metadata('design:type', core_1.QueryList)
    ], NeedsViewChildren.prototype, "textDirChildren");
    NeedsViewChildren = __decorate([
        core_1.Component({ selector: 'needs-view-children' }),
        core_1.View({ template: '<div text></div>', directives: [TextDirective] }), 
        __metadata('design:paramtypes', [])
    ], NeedsViewChildren);
    return NeedsViewChildren;
})();
var NeedsContentChild = (function () {
    function NeedsContentChild() {
        this.log = [];
    }
    Object.defineProperty(NeedsContentChild.prototype, "child", {
        get: function () { return this._child; },
        set: function (value) {
            this._child = value;
            this.log.push(['setter', lang_1.isPresent(value) ? value.text : null]);
        },
        enumerable: true,
        configurable: true
    });
    NeedsContentChild.prototype.afterContentInit = function () { this.log.push(["init", lang_1.isPresent(this.child) ? this.child.text : null]); };
    NeedsContentChild.prototype.afterContentChecked = function () {
        this.log.push(["check", lang_1.isPresent(this.child) ? this.child.text : null]);
    };
    Object.defineProperty(NeedsContentChild.prototype, "child",
        __decorate([
            core_1.ContentChild(TextDirective), 
            __metadata('design:type', Object), 
            __metadata('design:paramtypes', [Object])
        ], NeedsContentChild.prototype, "child", Object.getOwnPropertyDescriptor(NeedsContentChild.prototype, "child")));
    NeedsContentChild = __decorate([
        core_1.Component({ selector: 'needs-content-child' }),
        core_1.View({ template: '' }), 
        __metadata('design:paramtypes', [])
    ], NeedsContentChild);
    return NeedsContentChild;
})();
var NeedsViewChild = (function () {
    function NeedsViewChild() {
        this.shouldShow = true;
        this.log = [];
    }
    Object.defineProperty(NeedsViewChild.prototype, "child", {
        get: function () { return this._child; },
        set: function (value) {
            this._child = value;
            this.log.push(['setter', lang_1.isPresent(value) ? value.text : null]);
        },
        enumerable: true,
        configurable: true
    });
    NeedsViewChild.prototype.afterViewInit = function () { this.log.push(["init", lang_1.isPresent(this.child) ? this.child.text : null]); };
    NeedsViewChild.prototype.afterViewChecked = function () { this.log.push(["check", lang_1.isPresent(this.child) ? this.child.text : null]); };
    Object.defineProperty(NeedsViewChild.prototype, "child",
        __decorate([
            core_1.ViewChild(TextDirective), 
            __metadata('design:type', Object), 
            __metadata('design:paramtypes', [Object])
        ], NeedsViewChild.prototype, "child", Object.getOwnPropertyDescriptor(NeedsViewChild.prototype, "child")));
    NeedsViewChild = __decorate([
        core_1.Component({ selector: 'needs-view-child' }),
        core_1.View({
            template: "\n    <div *ng-if=\"shouldShow\" text=\"foo\"></div>\n  ",
            directives: [core_1.NgIf, TextDirective]
        }), 
        __metadata('design:paramtypes', [])
    ], NeedsViewChild);
    return NeedsViewChild;
})();
var InertDirective = (function () {
    function InertDirective() {
    }
    InertDirective = __decorate([
        core_1.Directive({ selector: '[dir]' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], InertDirective);
    return InertDirective;
})();
var NeedsQuery = (function () {
    function NeedsQuery(query) {
        this.query = query;
    }
    NeedsQuery = __decorate([
        core_1.Component({ selector: 'needs-query' }),
        core_1.View({
            directives: [core_1.NgFor, TextDirective],
            template: '<div text="ignoreme"></div><b *ng-for="var dir of query">{{dir.text}}|</b>'
        }),
        core_1.Injectable(),
        __param(0, core_1.Query(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsQuery);
    return NeedsQuery;
})();
var NeedsFourQueries = (function () {
    function NeedsFourQueries() {
    }
    __decorate([
        core_1.ContentChild(TextDirective), 
        __metadata('design:type', TextDirective)
    ], NeedsFourQueries.prototype, "query1");
    __decorate([
        core_1.ContentChild(TextDirective), 
        __metadata('design:type', TextDirective)
    ], NeedsFourQueries.prototype, "query2");
    __decorate([
        core_1.ContentChild(TextDirective), 
        __metadata('design:type', TextDirective)
    ], NeedsFourQueries.prototype, "query3");
    __decorate([
        core_1.ContentChild(TextDirective), 
        __metadata('design:type', TextDirective)
    ], NeedsFourQueries.prototype, "query4");
    NeedsFourQueries = __decorate([
        core_1.Component({ selector: 'needs-four-queries' }),
        core_1.View({ template: '' }), 
        __metadata('design:paramtypes', [])
    ], NeedsFourQueries);
    return NeedsFourQueries;
})();
var NeedsQueryDesc = (function () {
    function NeedsQueryDesc(query) {
        this.query = query;
    }
    NeedsQueryDesc = __decorate([
        core_1.Component({ selector: 'needs-query-desc' }),
        core_1.View({ directives: [core_1.NgFor], template: '<div *ng-for="var dir of query">{{dir.text}}|</div>' }),
        core_1.Injectable(),
        __param(0, core_1.Query(TextDirective, { descendants: true })), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsQueryDesc);
    return NeedsQueryDesc;
})();
var NeedsQueryByLabel = (function () {
    function NeedsQueryByLabel(query) {
        this.query = query;
    }
    NeedsQueryByLabel = __decorate([
        core_1.Component({ selector: 'needs-query-by-var-binding' }),
        core_1.View({ directives: [], template: '<ng-content>' }),
        core_1.Injectable(),
        __param(0, core_1.Query("textLabel", { descendants: true })), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsQueryByLabel);
    return NeedsQueryByLabel;
})();
var NeedsViewQueryByLabel = (function () {
    function NeedsViewQueryByLabel(query) {
        this.query = query;
    }
    NeedsViewQueryByLabel = __decorate([
        core_1.Component({ selector: 'needs-view-query-by-var-binding' }),
        core_1.View({ directives: [], template: '<div #text-label>text</div>' }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery("textLabel")), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQueryByLabel);
    return NeedsViewQueryByLabel;
})();
var NeedsQueryByTwoLabels = (function () {
    function NeedsQueryByTwoLabels(query) {
        this.query = query;
    }
    NeedsQueryByTwoLabels = __decorate([
        core_1.Component({ selector: 'needs-query-by-var-bindings' }),
        core_1.View({ directives: [], template: '<ng-content>' }),
        core_1.Injectable(),
        __param(0, core_1.Query("textLabel1,textLabel2", { descendants: true })), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsQueryByTwoLabels);
    return NeedsQueryByTwoLabels;
})();
var NeedsQueryAndProject = (function () {
    function NeedsQueryAndProject(query) {
        this.query = query;
    }
    NeedsQueryAndProject = __decorate([
        core_1.Component({ selector: 'needs-query-and-project' }),
        core_1.View({
            directives: [core_1.NgFor],
            template: '<div *ng-for="var dir of query">{{dir.text}}|</div><ng-content></ng-content>'
        }),
        core_1.Injectable(),
        __param(0, core_1.Query(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsQueryAndProject);
    return NeedsQueryAndProject;
})();
var NeedsViewQuery = (function () {
    function NeedsViewQuery(query) {
        this.query = query;
    }
    NeedsViewQuery = __decorate([
        core_1.Component({ selector: 'needs-view-query' }),
        core_1.View({
            directives: [TextDirective],
            template: '<div text="1"><div text="2"></div></div>' +
                '<div text="3"></div><div text="4"></div>'
        }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQuery);
    return NeedsViewQuery;
})();
var NeedsViewQueryIf = (function () {
    function NeedsViewQueryIf(query) {
        this.query = query;
        this.show = false;
    }
    NeedsViewQueryIf = __decorate([
        core_1.Component({ selector: 'needs-view-query-if' }),
        core_1.View({ directives: [core_1.NgIf, TextDirective], template: '<div *ng-if="show" text="1"></div>' }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQueryIf);
    return NeedsViewQueryIf;
})();
var NeedsViewQueryNestedIf = (function () {
    function NeedsViewQueryNestedIf(query) {
        this.query = query;
        this.show = true;
    }
    NeedsViewQueryNestedIf = __decorate([
        core_1.Component({ selector: 'needs-view-query-nested-if' }),
        core_1.View({
            directives: [core_1.NgIf, InertDirective, TextDirective],
            template: '<div text="1"><div *ng-if="show"><div dir></div></div></div>'
        }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQueryNestedIf);
    return NeedsViewQueryNestedIf;
})();
var NeedsViewQueryOrder = (function () {
    function NeedsViewQueryOrder(query) {
        this.query = query;
        this.list = ['2', '3'];
    }
    NeedsViewQueryOrder = __decorate([
        core_1.Component({ selector: 'needs-view-query-order' }),
        core_1.View({
            directives: [core_1.NgFor, TextDirective, InertDirective],
            template: '<div text="1"></div>' +
                '<div *ng-for="var i of list" [text]="i"></div>' +
                '<div text="4"></div>'
        }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQueryOrder);
    return NeedsViewQueryOrder;
})();
var NeedsViewQueryOrderWithParent = (function () {
    function NeedsViewQueryOrderWithParent(query) {
        this.query = query;
        this.list = ['2', '3'];
    }
    NeedsViewQueryOrderWithParent = __decorate([
        core_1.Component({ selector: 'needs-view-query-order-with-p' }),
        core_1.View({
            directives: [core_1.NgFor, TextDirective, InertDirective],
            template: '<div dir><div text="1"></div>' +
                '<div *ng-for="var i of list" [text]="i"></div>' +
                '<div text="4"></div></div>'
        }),
        core_1.Injectable(),
        __param(0, core_1.ViewQuery(TextDirective)), 
        __metadata('design:paramtypes', [core_1.QueryList])
    ], NeedsViewQueryOrderWithParent);
    return NeedsViewQueryOrderWithParent;
})();
var NeedsTpl = (function () {
    function NeedsTpl(viewQuery, query) {
        this.viewQuery = viewQuery;
        this.query = query;
    }
    NeedsTpl = __decorate([
        core_1.Component({ selector: 'needs-tpl' }),
        core_1.View({ template: '<template var-x="shadow"></template>' }),
        __param(0, core_1.ViewQuery(core_1.TemplateRef)),
        __param(1, core_1.Query(core_1.TemplateRef)), 
        __metadata('design:paramtypes', [core_1.QueryList, core_1.QueryList])
    ], NeedsTpl);
    return NeedsTpl;
})();
var MyComp = (function () {
    function MyComp() {
        this.shouldShow = false;
        this.list = ['1d', '2d', '3d'];
    }
    MyComp = __decorate([
        core_1.Component({ selector: 'my-comp' }),
        core_1.View({
            directives: [
                NeedsQuery,
                NeedsQueryDesc,
                NeedsQueryByLabel,
                NeedsQueryByTwoLabels,
                NeedsQueryAndProject,
                NeedsViewQuery,
                NeedsViewQueryIf,
                NeedsViewQueryNestedIf,
                NeedsViewQueryOrder,
                NeedsViewQueryByLabel,
                NeedsViewQueryOrderWithParent,
                NeedsContentChildren,
                NeedsViewChildren,
                NeedsViewChild,
                NeedsContentChild,
                NeedsTpl,
                TextDirective,
                InertDirective,
                core_1.NgIf,
                core_1.NgFor,
                NeedsFourQueries
            ]
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
//# sourceMappingURL=query_integration_spec.js.map