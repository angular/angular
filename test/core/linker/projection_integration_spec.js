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
var view_listener_1 = require('angular2/src/core/linker/view_listener');
var core_1 = require('angular2/core');
var browser_1 = require('angular2/platform/browser');
function main() {
    testing_internal_1.describe('projection', function () {
        testing_internal_1.beforeEachProviders(function () { return [core_1.provide(view_listener_1.AppViewListener, { useClass: view_listener_1.AppViewListener })]; });
        testing_internal_1.it('should support simple components', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<simple>' +
                    '<div>A</div>' +
                    '</simple>',
                directives: [Simple]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE(A)');
                async.done();
            });
        }));
        testing_internal_1.it('should support simple components with text interpolation as direct children', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '{{\'START(\'}}<simple>' +
                    '{{text}}' +
                    '</simple>{{\')END\'}}',
                directives: [Simple]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                main.debugElement.componentInstance.text = 'A';
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('START(SIMPLE(A))END');
                async.done();
            });
        }));
        testing_internal_1.it('should support projecting text interpolation to a non bound element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(Simple, new core_1.ViewMetadata({ template: 'SIMPLE(<div><ng-content></ng-content></div>)', directives: [] }))
                .overrideView(MainComp, new core_1.ViewMetadata({ template: '<simple>{{text}}</simple>', directives: [Simple] }))
                .createAsync(MainComp)
                .then(function (main) {
                main.debugElement.componentInstance.text = 'A';
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE(A)');
                async.done();
            });
        }));
        testing_internal_1.it('should support projecting text interpolation to a non bound element with other bound elements after it', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(Simple, new core_1.ViewMetadata({
                template: 'SIMPLE(<div><ng-content></ng-content></div><div [tab-index]="0">EL</div>)',
                directives: []
            }))
                .overrideView(MainComp, new core_1.ViewMetadata({ template: '<simple>{{text}}</simple>', directives: [Simple] }))
                .createAsync(MainComp)
                .then(function (main) {
                main.debugElement.componentInstance.text = 'A';
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE(AEL)');
                async.done();
            });
        }));
        testing_internal_1.it('should project content components', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(Simple, new core_1.ViewMetadata({ template: 'SIMPLE({{0}}|<ng-content></ng-content>|{{2}})', directives: [] }))
                .overrideView(OtherComp, new core_1.ViewMetadata({ template: '{{1}}', directives: [] }))
                .overrideView(MainComp, new core_1.ViewMetadata({
                template: '<simple><other></other></simple>',
                directives: [Simple, OtherComp]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE(0|1|2)');
                async.done();
            });
        }));
        testing_internal_1.it('should not show the light dom even if there is no content tag', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({ template: '<empty>A</empty>', directives: [Empty] }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.it('should support multiple content tags', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<multiple-content-tags>' +
                    '<div>B</div>' +
                    '<div>C</div>' +
                    '<div class="left">A</div>' +
                    '</multiple-content-tags>',
                directives: [MultipleContentTagsComponent]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(A, BC)');
                async.done();
            });
        }));
        testing_internal_1.it('should redistribute only direct children', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<multiple-content-tags>' +
                    '<div>B<div class="left">A</div></div>' +
                    '<div>C</div>' +
                    '</multiple-content-tags>',
                directives: [MultipleContentTagsComponent]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, BAC)');
                async.done();
            });
        }));
        testing_internal_1.it("should redistribute direct child viewcontainers when the light dom changes", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<multiple-content-tags>' +
                    '<template manual class="left"><div>A1</div></template>' +
                    '<div>B</div>' +
                    '</multiple-content-tags>',
                directives: [MultipleContentTagsComponent, ManualViewportDirective]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var viewportDirectives = main.debugElement.queryAll(browser_1.By.directive(ManualViewportDirective))
                    .map(function (de) { return de.inject(ManualViewportDirective); });
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, B)');
                viewportDirectives.forEach(function (d) { return d.show(); });
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(A1, B)');
                viewportDirectives.forEach(function (d) { return d.hide(); });
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, B)');
                async.done();
            });
        }));
        testing_internal_1.it("should support nested components", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<outer-with-indirect-nested>' +
                    '<div>A</div>' +
                    '<div>B</div>' +
                    '</outer-with-indirect-nested>',
                directives: [OuterWithIndirectNestedComponent]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('OUTER(SIMPLE(AB))');
                async.done();
            });
        }));
        testing_internal_1.it("should support nesting with content being direct child of a nested component", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<outer>' +
                    '<template manual class="left"><div>A</div></template>' +
                    '<div>B</div>' +
                    '<div>C</div>' +
                    '</outer>',
                directives: [OuterComponent, ManualViewportDirective],
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var viewportDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('OUTER(INNER(INNERINNER(,BC)))');
                viewportDirective.show();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
                async.done();
            });
        }));
        testing_internal_1.it('should redistribute when the shadow dom changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<conditional-content>' +
                    '<div class="left">A</div>' +
                    '<div>B</div>' +
                    '<div>C</div>' +
                    '</conditional-content>',
                directives: [ConditionalContentComponent]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var viewportDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, BC)');
                viewportDirective.show();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(A, BC)');
                viewportDirective.hide();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, BC)');
                async.done();
            });
        }));
        // GH-2095 - https://github.com/angular/angular/issues/2095
        // important as we are removing the ng-content element during compilation,
        // which could skrew up text node indices.
        testing_internal_1.it('should support text nodes after content tags', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({ template: '<simple string-prop="text"></simple>', directives: [Simple] }))
                .overrideTemplate(Simple, '<ng-content></ng-content><p>P,</p>{{stringProp}}')
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('P,text');
                async.done();
            });
        }));
        // important as we are moving style tags around during compilation,
        // which could skrew up text node indices.
        testing_internal_1.it('should support text nodes after style tags', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({ template: '<simple string-prop="text"></simple>', directives: [Simple] }))
                .overrideTemplate(Simple, '<style></style><p>P,</p>{{stringProp}}')
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('P,text');
                async.done();
            });
        }));
        testing_internal_1.it('should support moving non projected light dom around', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<empty>' +
                    '  <template manual><div>A</div></template>' +
                    '</empty>' +
                    'START(<div project></div>)END',
                directives: [Empty, ProjectDirective, ManualViewportDirective],
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var sourceDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                var projectDirective = main.debugElement.query(browser_1.By.directive(ProjectDirective)).inject(ProjectDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('START()END');
                projectDirective.show(sourceDirective.templateRef);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('START(A)END');
                async.done();
            });
        }));
        testing_internal_1.it('should support moving projected light dom around', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<simple><template manual><div>A</div></template></simple>' +
                    'START(<div project></div>)END',
                directives: [Simple, ProjectDirective, ManualViewportDirective],
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var sourceDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                var projectDirective = main.debugElement.query(browser_1.By.directive(ProjectDirective)).inject(ProjectDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE()START()END');
                projectDirective.show(sourceDirective.templateRef);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('SIMPLE()START(A)END');
                async.done();
            });
        }));
        testing_internal_1.it('should support moving ng-content around', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: '<conditional-content>' +
                    '<div class="left">A</div>' +
                    '<div>B</div>' +
                    '</conditional-content>' +
                    'START(<div project></div>)END',
                directives: [ConditionalContentComponent, ProjectDirective, ManualViewportDirective]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                var sourceDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                var projectDirective = main.debugElement.query(browser_1.By.directive(ProjectDirective)).inject(ProjectDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, B)START()END');
                projectDirective.show(sourceDirective.templateRef);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, B)START(A)END');
                // Stamping ng-content multiple times should not produce the content multiple
                // times...
                projectDirective.show(sourceDirective.templateRef);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('(, B)START(A)END');
                async.done();
            });
        }));
        // Note: This does not use a ng-content element, but
        // is still important as we are merging proto views independent of
        // the presence of ng-content elements!
        testing_internal_1.it('should still allow to implement a recursive trees', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({ template: '<tree></tree>', directives: [Tree] }))
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                var manualDirective = main.debugElement.query(browser_1.By.directive(ManualViewportDirective))
                    .inject(ManualViewportDirective);
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('TREE(0:)');
                manualDirective.show();
                main.detectChanges();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('TREE(0:TREE(1:))');
                async.done();
            });
        }));
        if (dom_adapter_1.DOM.supportsNativeShadowDOM()) {
            testing_internal_1.it('should support native content projection and isolate styles per component', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MainComp, new core_1.ViewMetadata({
                    template: '<simple-native1><div>A</div></simple-native1>' +
                        '<simple-native2><div>B</div></simple-native2>',
                    directives: [SimpleNative1, SimpleNative2]
                }))
                    .createAsync(MainComp)
                    .then(function (main) {
                    var childNodes = dom_adapter_1.DOM.childNodes(main.debugElement.nativeElement);
                    testing_internal_1.expect(childNodes[0]).toHaveText('div {color: red}SIMPLE1(A)');
                    testing_internal_1.expect(childNodes[1]).toHaveText('div {color: blue}SIMPLE2(B)');
                    async.done();
                });
            }));
        }
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.it('should support emulated style encapsulation', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MainComp, new core_1.ViewMetadata({
                    template: '<div></div>',
                    styles: ['div { color: red}'],
                    encapsulation: core_1.ViewEncapsulation.Emulated
                }))
                    .createAsync(MainComp)
                    .then(function (main) {
                    var mainEl = main.debugElement.nativeElement;
                    var div1 = dom_adapter_1.DOM.firstChild(mainEl);
                    var div2 = dom_adapter_1.DOM.createElement('div');
                    dom_adapter_1.DOM.appendChild(mainEl, div2);
                    testing_internal_1.expect(dom_adapter_1.DOM.getComputedStyle(div1).color).toEqual('rgb(255, 0, 0)');
                    testing_internal_1.expect(dom_adapter_1.DOM.getComputedStyle(div2).color).toEqual('rgb(0, 0, 0)');
                    async.done();
                });
            }));
        }
        testing_internal_1.it('should support nested conditionals that contain ng-contents', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: "<conditional-text>a</conditional-text>",
                directives: [ConditionalTextComponent]
            }))
                .createAsync(MainComp)
                .then(function (main) {
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('MAIN()');
                var viewportElement = main.debugElement.componentViewChildren[0].componentViewChildren[0];
                viewportElement.inject(ManualViewportDirective).show();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('MAIN(FIRST())');
                viewportElement =
                    main.debugElement.componentViewChildren[0].componentViewChildren[1];
                viewportElement.inject(ManualViewportDirective).show();
                testing_internal_1.expect(main.debugElement.nativeElement).toHaveText('MAIN(FIRST(SECOND(a)))');
                async.done();
            });
        }));
        testing_internal_1.it('should allow to switch the order of nested components via ng-content', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: "<cmp-a><cmp-b></cmp-b></cmp-a>",
                directives: [CmpA, CmpB],
            }))
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(main.debugElement.nativeElement))
                    .toEqual('<cmp-a><cmp-b><cmp-d><d>cmp-d</d></cmp-d></cmp-b>' +
                    '<cmp-c><c>cmp-c</c></cmp-c></cmp-a>');
                async.done();
            });
        }));
        testing_internal_1.it('should create nested components in the right order', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MainComp, new core_1.ViewMetadata({
                template: "<cmp-a1></cmp-a1><cmp-a2></cmp-a2>",
                directives: [CmpA1, CmpA2],
            }))
                .createAsync(MainComp)
                .then(function (main) {
                main.detectChanges();
                testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(main.debugElement.nativeElement))
                    .toEqual('<cmp-a1>a1<cmp-b11>b11</cmp-b11><cmp-b12>b12</cmp-b12></cmp-a1>' +
                    '<cmp-a2>a2<cmp-b21>b21</cmp-b21><cmp-b22>b22</cmp-b22></cmp-a2>');
                async.done();
            });
        }));
    });
}
exports.main = main;
var MainComp = (function () {
    function MainComp() {
        this.text = '';
    }
    MainComp = __decorate([
        core_1.Component({ selector: 'main' }),
        core_1.View({ template: '', directives: [] }), 
        __metadata('design:paramtypes', [])
    ], MainComp);
    return MainComp;
})();
var OtherComp = (function () {
    function OtherComp() {
        this.text = '';
    }
    OtherComp = __decorate([
        core_1.Component({ selector: 'other' }),
        core_1.View({ template: '', directives: [] }), 
        __metadata('design:paramtypes', [])
    ], OtherComp);
    return OtherComp;
})();
var Simple = (function () {
    function Simple() {
        this.stringProp = '';
    }
    Simple = __decorate([
        core_1.Component({ selector: 'simple', inputs: ['stringProp'] }),
        core_1.View({ template: 'SIMPLE(<ng-content></ng-content>)', directives: [] }), 
        __metadata('design:paramtypes', [])
    ], Simple);
    return Simple;
})();
var SimpleNative1 = (function () {
    function SimpleNative1() {
    }
    SimpleNative1 = __decorate([
        core_1.Component({ selector: 'simple-native1' }),
        core_1.View({
            template: 'SIMPLE1(<content></content>)',
            directives: [],
            encapsulation: core_1.ViewEncapsulation.Native,
            styles: ['div {color: red}']
        }), 
        __metadata('design:paramtypes', [])
    ], SimpleNative1);
    return SimpleNative1;
})();
var SimpleNative2 = (function () {
    function SimpleNative2() {
    }
    SimpleNative2 = __decorate([
        core_1.Component({ selector: 'simple-native2' }),
        core_1.View({
            template: 'SIMPLE2(<content></content>)',
            directives: [],
            encapsulation: core_1.ViewEncapsulation.Native,
            styles: ['div {color: blue}']
        }), 
        __metadata('design:paramtypes', [])
    ], SimpleNative2);
    return SimpleNative2;
})();
var Empty = (function () {
    function Empty() {
    }
    Empty = __decorate([
        core_1.Component({ selector: 'empty' }),
        core_1.View({ template: '', directives: [] }), 
        __metadata('design:paramtypes', [])
    ], Empty);
    return Empty;
})();
var MultipleContentTagsComponent = (function () {
    function MultipleContentTagsComponent() {
    }
    MultipleContentTagsComponent = __decorate([
        core_1.Component({ selector: 'multiple-content-tags' }),
        core_1.View({
            template: '(<ng-content select=".left"></ng-content>, <ng-content></ng-content>)',
            directives: []
        }), 
        __metadata('design:paramtypes', [])
    ], MultipleContentTagsComponent);
    return MultipleContentTagsComponent;
})();
var ManualViewportDirective = (function () {
    function ManualViewportDirective(vc, templateRef) {
        this.vc = vc;
        this.templateRef = templateRef;
    }
    ManualViewportDirective.prototype.show = function () { this.vc.createEmbeddedView(this.templateRef, 0); };
    ManualViewportDirective.prototype.hide = function () { this.vc.clear(); };
    ManualViewportDirective = __decorate([
        core_1.Directive({ selector: '[manual]' }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef])
    ], ManualViewportDirective);
    return ManualViewportDirective;
})();
var ProjectDirective = (function () {
    function ProjectDirective(vc) {
        this.vc = vc;
    }
    ProjectDirective.prototype.show = function (templateRef) { this.vc.createEmbeddedView(templateRef, 0); };
    ProjectDirective.prototype.hide = function () { this.vc.clear(); };
    ProjectDirective = __decorate([
        core_1.Directive({ selector: '[project]' }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef])
    ], ProjectDirective);
    return ProjectDirective;
})();
var OuterWithIndirectNestedComponent = (function () {
    function OuterWithIndirectNestedComponent() {
    }
    OuterWithIndirectNestedComponent = __decorate([
        core_1.Component({ selector: 'outer-with-indirect-nested' }),
        core_1.View({
            template: 'OUTER(<simple><div><ng-content></ng-content></div></simple>)',
            directives: [Simple]
        }), 
        __metadata('design:paramtypes', [])
    ], OuterWithIndirectNestedComponent);
    return OuterWithIndirectNestedComponent;
})();
var OuterComponent = (function () {
    function OuterComponent() {
    }
    OuterComponent = __decorate([
        core_1.Component({ selector: 'outer' }),
        core_1.View({
            template: 'OUTER(<inner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></inner>)',
            directives: [core_1.forwardRef(function () { return InnerComponent; })]
        }), 
        __metadata('design:paramtypes', [])
    ], OuterComponent);
    return OuterComponent;
})();
var InnerComponent = (function () {
    function InnerComponent() {
    }
    InnerComponent = __decorate([
        core_1.Component({ selector: 'inner' }),
        core_1.View({
            template: 'INNER(<innerinner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></innerinner>)',
            directives: [core_1.forwardRef(function () { return InnerInnerComponent; })]
        }), 
        __metadata('design:paramtypes', [])
    ], InnerComponent);
    return InnerComponent;
})();
var InnerInnerComponent = (function () {
    function InnerInnerComponent() {
    }
    InnerInnerComponent = __decorate([
        core_1.Component({ selector: 'innerinner' }),
        core_1.View({
            template: 'INNERINNER(<ng-content select=".left"></ng-content>,<ng-content></ng-content>)',
            directives: []
        }), 
        __metadata('design:paramtypes', [])
    ], InnerInnerComponent);
    return InnerInnerComponent;
})();
var ConditionalContentComponent = (function () {
    function ConditionalContentComponent() {
    }
    ConditionalContentComponent = __decorate([
        core_1.Component({ selector: 'conditional-content' }),
        core_1.View({
            template: '<div>(<div *manual><ng-content select=".left"></ng-content></div>, <ng-content></ng-content>)</div>',
            directives: [ManualViewportDirective]
        }), 
        __metadata('design:paramtypes', [])
    ], ConditionalContentComponent);
    return ConditionalContentComponent;
})();
var ConditionalTextComponent = (function () {
    function ConditionalTextComponent() {
    }
    ConditionalTextComponent = __decorate([
        core_1.Component({ selector: 'conditional-text' }),
        core_1.View({
            template: 'MAIN(<template manual>FIRST(<template manual>SECOND(<ng-content></ng-content>)</template>)</template>)',
            directives: [ManualViewportDirective]
        }), 
        __metadata('design:paramtypes', [])
    ], ConditionalTextComponent);
    return ConditionalTextComponent;
})();
var Tab = (function () {
    function Tab() {
    }
    Tab = __decorate([
        core_1.Component({ selector: 'tab' }),
        core_1.View({
            template: '<div><div *manual>TAB(<ng-content></ng-content>)</div></div>',
            directives: [ManualViewportDirective]
        }), 
        __metadata('design:paramtypes', [])
    ], Tab);
    return Tab;
})();
var Tree = (function () {
    function Tree() {
        this.depth = 0;
    }
    Tree = __decorate([
        core_1.Component({ selector: 'tree', inputs: ['depth'] }),
        core_1.View({
            template: 'TREE({{depth}}:<tree *manual [depth]="depth+1"></tree>)',
            directives: [ManualViewportDirective, Tree]
        }), 
        __metadata('design:paramtypes', [])
    ], Tree);
    return Tree;
})();
var CmpD = (function () {
    function CmpD(elementRef) {
        this.tagName = dom_adapter_1.DOM.tagName(elementRef.nativeElement).toLowerCase();
    }
    CmpD = __decorate([
        core_1.Component({ selector: 'cmp-d' }),
        core_1.View({ template: "<d>{{tagName}}</d>" }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], CmpD);
    return CmpD;
})();
var CmpC = (function () {
    function CmpC(elementRef) {
        this.tagName = dom_adapter_1.DOM.tagName(elementRef.nativeElement).toLowerCase();
    }
    CmpC = __decorate([
        core_1.Component({ selector: 'cmp-c' }),
        core_1.View({ template: "<c>{{tagName}}</c>" }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], CmpC);
    return CmpC;
})();
var CmpB = (function () {
    function CmpB() {
    }
    CmpB = __decorate([
        core_1.Component({ selector: 'cmp-b' }),
        core_1.View({ template: "<ng-content></ng-content><cmp-d></cmp-d>", directives: [CmpD] }), 
        __metadata('design:paramtypes', [])
    ], CmpB);
    return CmpB;
})();
var CmpA = (function () {
    function CmpA() {
    }
    CmpA = __decorate([
        core_1.Component({ selector: 'cmp-a' }),
        core_1.View({ template: "<ng-content></ng-content><cmp-c></cmp-c>", directives: [CmpC] }), 
        __metadata('design:paramtypes', [])
    ], CmpA);
    return CmpA;
})();
var CmpB11 = (function () {
    function CmpB11() {
    }
    CmpB11 = __decorate([
        core_1.Component({ selector: 'cmp-b11' }),
        core_1.View({ template: "{{'b11'}}", directives: [] }), 
        __metadata('design:paramtypes', [])
    ], CmpB11);
    return CmpB11;
})();
var CmpB12 = (function () {
    function CmpB12() {
    }
    CmpB12 = __decorate([
        core_1.Component({ selector: 'cmp-b12' }),
        core_1.View({ template: "{{'b12'}}", directives: [] }), 
        __metadata('design:paramtypes', [])
    ], CmpB12);
    return CmpB12;
})();
var CmpB21 = (function () {
    function CmpB21() {
    }
    CmpB21 = __decorate([
        core_1.Component({ selector: 'cmp-b21' }),
        core_1.View({ template: "{{'b21'}}", directives: [] }), 
        __metadata('design:paramtypes', [])
    ], CmpB21);
    return CmpB21;
})();
var CmpB22 = (function () {
    function CmpB22() {
    }
    CmpB22 = __decorate([
        core_1.Component({ selector: 'cmp-b22' }),
        core_1.View({ template: "{{'b22'}}", directives: [] }), 
        __metadata('design:paramtypes', [])
    ], CmpB22);
    return CmpB22;
})();
var CmpA1 = (function () {
    function CmpA1() {
    }
    CmpA1 = __decorate([
        core_1.Component({ selector: 'cmp-a1' }),
        core_1.View({ template: "{{'a1'}}<cmp-b11></cmp-b11><cmp-b12></cmp-b12>", directives: [CmpB11, CmpB12] }), 
        __metadata('design:paramtypes', [])
    ], CmpA1);
    return CmpA1;
})();
var CmpA2 = (function () {
    function CmpA2() {
    }
    CmpA2 = __decorate([
        core_1.Component({ selector: 'cmp-a2' }),
        core_1.View({ template: "{{'a2'}}<cmp-b21></cmp-b21><cmp-b22></cmp-b22>", directives: [CmpB21, CmpB22] }), 
        __metadata('design:paramtypes', [])
    ], CmpA2);
    return CmpA2;
})();
//# sourceMappingURL=projection_integration_spec.js.map