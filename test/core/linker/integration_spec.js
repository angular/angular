var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var common_1 = require('angular2/common');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var metadata_1 = require('angular2/src/core/metadata');
var query_list_1 = require('angular2/src/core/linker/query_list');
var view_container_ref_1 = require('angular2/src/core/linker/view_container_ref');
var compiler_1 = require('angular2/src/core/linker/compiler');
var element_ref_1 = require('angular2/src/core/linker/element_ref');
var template_ref_1 = require('angular2/src/core/linker/template_ref');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var lang_2 = require('angular2/src/facade/lang');
var ANCHOR_ELEMENT = lang_1.CONST_EXPR(new core_1.OpaqueToken('AnchorElement'));
function main() {
    testing_internal_1.describe('integration tests', function () {
        testing_internal_1.beforeEachBindings(function () { return [core_1.provide(ANCHOR_ELEMENT, { useValue: testing_internal_1.el('<div></div>') })]; });
        testing_internal_1.describe('react to record changes', function () {
            testing_internal_1.it('should consume text node changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div>{{ctxProp}}</div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('Hello World!');
                    async.done();
                });
            }));
            testing_internal_1.it('should update text node with a blank string when interpolation evaluates to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div>{{null}}{{ctxProp}}</div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = null;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                    async.done();
                });
            }));
            testing_internal_1.it('should consume element binding changes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [id]="ctxProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].nativeElement.id)
                        .toEqual('Hello World!');
                    async.done();
                });
            }));
            testing_internal_1.it('should consume binding to aria-* attributes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [attr.aria-label]="ctxProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Initial aria label';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, 'aria-label'))
                        .toEqual('Initial aria label');
                    fixture.debugElement.componentInstance.ctxProp = 'Changed aria label';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, 'aria-label'))
                        .toEqual('Changed aria label');
                    async.done();
                });
            }));
            testing_internal_1.it('should remove an attribute when attribute expression evaluates to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [attr.foo]="ctxProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'bar';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, 'foo'))
                        .toEqual('bar');
                    fixture.debugElement.componentInstance.ctxProp = null;
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.hasAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, 'foo'))
                        .toBeFalsy();
                    async.done();
                });
            }));
            testing_internal_1.it('should remove style when when style expression evaluates to null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [style.height.px]="ctxProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = '10';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'height'))
                        .toEqual('10px');
                    fixture.debugElement.componentInstance.ctxProp = null;
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getStyle(fixture.debugElement.componentViewChildren[0].nativeElement, 'height'))
                        .toEqual('');
                    async.done();
                });
            }));
            testing_internal_1.it('should consume binding to property names where attr name and property name do not match', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [tabindex]="ctxNumProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].nativeElement.tabIndex)
                        .toEqual(0);
                    fixture.debugElement.componentInstance.ctxNumProp = 5;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].nativeElement.tabIndex)
                        .toEqual(5);
                    async.done();
                });
            }));
            testing_internal_1.it('should consume binding to camel-cased properties using dash-cased syntax in templates', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<input [read-only]="ctxBoolProp">' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].nativeElement.readOnly)
                        .toBeFalsy();
                    fixture.debugElement.componentInstance.ctxBoolProp = true;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].nativeElement.readOnly)
                        .toBeTruthy();
                    async.done();
                });
            }));
            testing_internal_1.it('should consume binding to inner-html', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div inner-html="{{ctxProp}}"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Some <span>HTML</span>';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(fixture.debugElement.componentViewChildren[0].nativeElement))
                        .toEqual('Some <span>HTML</span>');
                    fixture.debugElement.componentInstance.ctxProp = 'Some other <div>HTML</div>';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(fixture.debugElement.componentViewChildren[0].nativeElement))
                        .toEqual('Some other <div>HTML</div>');
                    async.done();
                });
            }));
            testing_internal_1.it('should consume binding to className using class alias', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div class="initial" [class]="ctxProp"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var nativeEl = fixture.debugElement.componentViewChildren[0].nativeElement;
                    fixture.debugElement.componentInstance.ctxProp = 'foo bar';
                    fixture.detectChanges();
                    testing_internal_1.expect(nativeEl).toHaveCssClass('foo');
                    testing_internal_1.expect(nativeEl).toHaveCssClass('bar');
                    testing_internal_1.expect(nativeEl).not.toHaveCssClass('initial');
                    async.done();
                });
            }));
            testing_internal_1.it('should consume directive watch expression change.', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var tpl = '<div>' +
                    '<div my-dir [elprop]="ctxProp"></div>' +
                    '<div my-dir elprop="Hi there!"></div>' +
                    '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
                    '<div my-dir elprop="One more {{ctxProp}}"></div>' +
                    '</div>';
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: tpl, directives: [MyDir] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].inject(MyDir).dirProp)
                        .toEqual('Hello World!');
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[1].inject(MyDir).dirProp)
                        .toEqual('Hi there!');
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[2].inject(MyDir).dirProp)
                        .toEqual('Hi there!');
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren[3].inject(MyDir).dirProp)
                        .toEqual('One more Hello World!');
                    async.done();
                });
            }));
            testing_internal_1.describe('pipes', function () {
                testing_internal_1.it("should support pipes in bindings", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<div my-dir #dir="mydir" [elprop]="ctxProp | double"></div>',
                        directives: [MyDir],
                        pipes: [DoublePipe]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        fixture.debugElement.componentInstance.ctxProp = 'a';
                        fixture.detectChanges();
                        var dir = fixture.debugElement.componentViewChildren[0].getLocal('dir');
                        testing_internal_1.expect(dir.dirProp).toEqual('aa');
                        async.done();
                    });
                }));
            });
            testing_internal_1.it('should support nested components.', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<child-cmp></child-cmp>', directives: [ChildComp] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello');
                    async.done();
                });
            }));
            // GH issue 328 - https://github.com/angular/angular/issues/328
            testing_internal_1.it('should support different directive types on a single node', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<child-cmp my-dir [elprop]="ctxProp"></child-cmp>',
                    directives: [MyDir, ChildComp]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                    fixture.detectChanges();
                    var tc = fixture.debugElement.componentViewChildren[0];
                    testing_internal_1.expect(tc.inject(MyDir).dirProp).toEqual('Hello World!');
                    testing_internal_1.expect(tc.inject(ChildComp).dirProp).toEqual(null);
                    async.done();
                });
            }));
            testing_internal_1.it('should support directives where a binding attribute is not given', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    // No attribute "el-prop" specified.
                    template: '<p my-dir></p>',
                    directives: [MyDir]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) { async.done(); });
            }));
            testing_internal_1.it('should execute a given directive once, even if specified multiple times', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<p no-duplicate></p>',
                    directives: [DuplicateDir, DuplicateDir, [DuplicateDir, [DuplicateDir]]]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('noduplicate');
                    async.done();
                });
            }));
            testing_internal_1.it('should support directives where a selector matches property binding', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<p [id]="ctxProp"></p>', directives: [IdDir] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var idDir = tc.inject(IdDir);
                    fixture.debugElement.componentInstance.ctxProp = 'some_id';
                    fixture.detectChanges();
                    testing_internal_1.expect(idDir.id).toEqual('some_id');
                    fixture.debugElement.componentInstance.ctxProp = 'other_id';
                    fixture.detectChanges();
                    testing_internal_1.expect(idDir.id).toEqual('other_id');
                    async.done();
                });
            }));
            testing_internal_1.it('should read directives metadata from their binding token', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div public-api><div needs-public-api></div></div>',
                    directives: [PrivateImpl, NeedsPublicApi]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) { async.done(); });
            }));
            testing_internal_1.it('should support template directives via `<template>` elements.', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<template some-viewport var-greeting="some-tmpl"><copy-me>{{greeting}}</copy-me></template>',
                    directives: [SomeViewport]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var childNodesOfWrapper = dom_adapter_1.DOM.childNodes(fixture.debugElement.nativeElement);
                    // 1 template + 2 copies.
                    testing_internal_1.expect(childNodesOfWrapper.length).toBe(3);
                    testing_internal_1.expect(childNodesOfWrapper[1]).toHaveText('hello');
                    testing_internal_1.expect(childNodesOfWrapper[2]).toHaveText('again');
                    async.done();
                });
            }));
            testing_internal_1.it('should support template directives via `template` attribute.', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<copy-me template="some-viewport: var greeting=some-tmpl">{{greeting}}</copy-me>',
                    directives: [SomeViewport]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var childNodesOfWrapper = dom_adapter_1.DOM.childNodes(fixture.debugElement.nativeElement);
                    // 1 template + 2 copies.
                    testing_internal_1.expect(childNodesOfWrapper.length).toBe(3);
                    testing_internal_1.expect(childNodesOfWrapper[1]).toHaveText('hello');
                    testing_internal_1.expect(childNodesOfWrapper[2]).toHaveText('again');
                    async.done();
                });
            }));
            testing_internal_1.it('should allow to transplant embedded ProtoViews into other ViewContainers', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<some-directive><toolbar><template toolbarpart var-toolbar-prop="toolbarProp">{{ctxProp}},{{toolbarProp}},<cmp-with-host></cmp-with-host></template></toolbar></some-directive>',
                    directives: [SomeDirective, CompWithHost, ToolbarComponent, ToolbarPart]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'From myComp';
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement)
                        .toHaveText('TOOLBAR(From myComp,From toolbar,Component with an injected host)');
                    async.done();
                });
            }));
            testing_internal_1.describe("variable bindings", function () {
                testing_internal_1.it('should assign a component to a var-', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<p><child-cmp var-alice></child-cmp></p>',
                        directives: [ChildComp]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('alice'))
                            .toBeAnInstanceOf(ChildComp);
                        async.done();
                    });
                }));
                testing_internal_1.it('should assign a directive to a var-', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<p><div export-dir #localdir="dir"></div></p>',
                        directives: [ExportDir]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('localdir'))
                            .toBeAnInstanceOf(ExportDir);
                        async.done();
                    });
                }));
                testing_internal_1.it('should make the assigned component accessible in property bindings', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<p><child-cmp var-alice></child-cmp>{{alice.ctxProp}}</p>',
                        directives: [ChildComp]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        fixture.detectChanges();
                        testing_internal_1.expect(fixture.debugElement.nativeElement)
                            .toHaveText('hellohello'); // this first one is the
                        // component, the second one is
                        // the text binding
                        async.done();
                    });
                }));
                testing_internal_1.it('should assign two component instances each with a var-', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>',
                        directives: [ChildComp]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('alice'))
                            .toBeAnInstanceOf(ChildComp);
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('bob'))
                            .toBeAnInstanceOf(ChildComp);
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('alice'))
                            .not.toBe(fixture.debugElement.componentViewChildren[0].getLocal('bob'));
                        async.done();
                    });
                }));
                testing_internal_1.it('should assign the component instance to a var- with shorthand syntax', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<child-cmp #alice></child-cmp>',
                        directives: [ChildComp]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('alice'))
                            .toBeAnInstanceOf(ChildComp);
                        async.done();
                    });
                }));
                testing_internal_1.it('should assign the element instance to a user-defined variable', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<p><div var-alice><i>Hello</i></div></p>' }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var value = fixture.debugElement.componentViewChildren[0].getLocal('alice');
                        testing_internal_1.expect(value).not.toBe(null);
                        testing_internal_1.expect(value.tagName.toLowerCase()).toEqual('div');
                        async.done();
                    });
                }));
                testing_internal_1.it('should change dash-case to camel-case', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<p><child-cmp var-super-alice></child-cmp></p>',
                        directives: [ChildComp]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        testing_internal_1.expect(fixture.debugElement.componentViewChildren[0].getLocal('superAlice'))
                            .toBeAnInstanceOf(ChildComp);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to use variables in a for loop', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<template ng-for [ng-for-of]="[1]" var-i><child-cmp-no-template #cmp></child-cmp-no-template>{{i}}-{{cmp.ctxProp}}</template>',
                        directives: [ChildCompNoTemplate, core_1.NgFor]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        fixture.detectChanges();
                        // Get the element at index 2, since index 0 is the <template>.
                        testing_internal_1.expect(dom_adapter_1.DOM.childNodes(fixture.debugElement.nativeElement)[2])
                            .toHaveText("1-hello");
                        async.done();
                    });
                }));
            });
            testing_internal_1.describe("OnPush components", function () {
                testing_internal_1.it("should use ChangeDetectorRef to manually request a check", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<push-cmp-with-ref #cmp></push-cmp-with-ref>',
                        directives: [[[PushCmpWithRef]]]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var cmp = fixture.debugElement.componentViewChildren[0].getLocal('cmp');
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(1);
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(1);
                        cmp.propagate();
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(2);
                        async.done();
                    });
                }));
                testing_internal_1.it("should be checked when its bindings got updated", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<push-cmp [prop]="ctxProp" #cmp></push-cmp>',
                        directives: [[[PushCmp]]]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var cmp = fixture.debugElement.componentViewChildren[0].getLocal('cmp');
                        fixture.debugElement.componentInstance.ctxProp = "one";
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(1);
                        fixture.debugElement.componentInstance.ctxProp = "two";
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(2);
                        async.done();
                    });
                }));
                testing_internal_1.it('should not affect updating properties on the component', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<push-cmp-with-ref [prop]="ctxProp" #cmp></push-cmp-with-ref>',
                        directives: [[[PushCmpWithRef]]]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var cmp = fixture.debugElement.componentViewChildren[0].getLocal('cmp');
                        fixture.debugElement.componentInstance.ctxProp = "one";
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.prop).toEqual("one");
                        fixture.debugElement.componentInstance.ctxProp = "two";
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.prop).toEqual("two");
                        async.done();
                    });
                }));
                if (dom_adapter_1.DOM.supportsDOMEvents()) {
                    testing_internal_1.it('should be checked when an async pipe requests a check', testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                        tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                            template: '<push-cmp-with-async #cmp></push-cmp-with-async>',
                            directives: [[[PushCmpWithAsyncPipe]]]
                        }));
                        var fixture;
                        tcb.createAsync(MyComp).then(function (root) { fixture = root; });
                        testing_internal_1.tick();
                        var cmp = fixture.debugElement.componentViewChildren[0].getLocal('cmp');
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(1);
                        fixture.detectChanges();
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(1);
                        cmp.resolve(2);
                        testing_internal_1.tick();
                        fixture.detectChanges();
                        testing_internal_1.expect(cmp.numberOfChecks).toEqual(2);
                    })));
                }
            });
            testing_internal_1.it('should create a component that injects an @Host', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <some-directive>\n              <p>\n                <cmp-with-host #child></cmp-with-host>\n              </p>\n            </some-directive>",
                    directives: [SomeDirective, CompWithHost]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var childComponent = fixture.debugElement.componentViewChildren[0].getLocal('child');
                    testing_internal_1.expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
                    async.done();
                });
            }));
            testing_internal_1.it('should create a component that injects an @Host through viewcontainer directive', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <some-directive>\n              <p *ng-if=\"true\">\n                <cmp-with-host #child></cmp-with-host>\n              </p>\n            </some-directive>",
                    directives: [SomeDirective, CompWithHost, core_1.NgIf]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var tc = fixture.debugElement.componentViewChildren[0].children[1];
                    var childComponent = tc.getLocal('child');
                    testing_internal_1.expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
                    async.done();
                });
            }));
            testing_internal_1.it('should support events via EventEmitter on regular elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div emitter listener></div>',
                    directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var emitter = tc.inject(DirectiveEmitingEvent);
                    var listener = tc.inject(DirectiveListeningEvent);
                    testing_internal_1.expect(listener.msg).toEqual('');
                    async_1.ObservableWrapper.subscribe(emitter.event, function (_) {
                        testing_internal_1.expect(listener.msg).toEqual('fired !');
                        async.done();
                    });
                    emitter.fireEvent('fired !');
                });
            }));
            testing_internal_1.it('should support events via EventEmitter on template elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<template emitter listener (event)="ctxProp=$event"></template>',
                    directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var emitter = tc.inject(DirectiveEmitingEvent);
                    var myComp = tc.inject(MyComp);
                    var listener = tc.inject(DirectiveListeningEvent);
                    myComp.ctxProp = '';
                    testing_internal_1.expect(listener.msg).toEqual('');
                    async_1.ObservableWrapper.subscribe(emitter.event, function (_) {
                        testing_internal_1.expect(listener.msg).toEqual('fired !');
                        testing_internal_1.expect(myComp.ctxProp).toEqual('fired !');
                        async.done();
                    });
                    emitter.fireEvent('fired !');
                });
            }));
            testing_internal_1.it('should support [()] syntax', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div [(control)]="ctxProp" two-way></div>',
                    directives: [DirectiveWithTwoWayBinding]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var dir = tc.inject(DirectiveWithTwoWayBinding);
                    fixture.debugElement.componentInstance.ctxProp = 'one';
                    fixture.detectChanges();
                    testing_internal_1.expect(dir.control).toEqual('one');
                    async_1.ObservableWrapper.subscribe(dir.controlChange, function (_) {
                        testing_internal_1.expect(fixture.debugElement.componentInstance.ctxProp).toEqual('two');
                        async.done();
                    });
                    dir.triggerChange('two');
                });
            }));
            testing_internal_1.it('should support render events', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div listener></div>', directives: [DirectiveListeningDomEvent] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var listener = tc.inject(DirectiveListeningDomEvent);
                    testing_internal_1.dispatchEvent(tc.nativeElement, 'domEvent');
                    testing_internal_1.expect(listener.eventTypes)
                        .toEqual(['domEvent', 'body_domEvent', 'document_domEvent', 'window_domEvent']);
                    async.done();
                });
            }));
            testing_internal_1.it('should support render global events', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div listener></div>', directives: [DirectiveListeningDomEvent] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var listener = tc.inject(DirectiveListeningDomEvent);
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("window"), 'domEvent');
                    testing_internal_1.expect(listener.eventTypes).toEqual(['window_domEvent']);
                    listener.eventTypes = [];
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("document"), 'domEvent');
                    testing_internal_1.expect(listener.eventTypes).toEqual(['document_domEvent', 'window_domEvent']);
                    fixture.destroy();
                    listener.eventTypes = [];
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("body"), 'domEvent');
                    testing_internal_1.expect(listener.eventTypes).toEqual([]);
                    async.done();
                });
            }));
            testing_internal_1.it('should support updating host element via hostAttributes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div update-host-attributes></div>',
                    directives: [DirectiveUpdatingHostAttributes]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(fixture.debugElement.componentViewChildren[0].nativeElement, "role"))
                        .toEqual("button");
                    async.done();
                });
            }));
            testing_internal_1.it('should support updating host element via hostProperties', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div update-host-properties></div>',
                    directives: [DirectiveUpdatingHostProperties]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var updateHost = tc.inject(DirectiveUpdatingHostProperties);
                    updateHost.id = "newId";
                    fixture.detectChanges();
                    testing_internal_1.expect(tc.nativeElement.id).toEqual("newId");
                    async.done();
                });
            }));
            if (dom_adapter_1.DOM.supportsDOMEvents()) {
                testing_internal_1.it('should support preventing default on render events', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<input type="checkbox" listenerprevent></input><input type="checkbox" listenernoprevent></input>',
                        directives: [
                            DirectiveListeningDomEventPrevent,
                            DirectiveListeningDomEventNoPrevent
                        ]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var dispatchedEvent = dom_adapter_1.DOM.createMouseEvent('click');
                        var dispatchedEvent2 = dom_adapter_1.DOM.createMouseEvent('click');
                        dom_adapter_1.DOM.dispatchEvent(fixture.debugElement.componentViewChildren[0].nativeElement, dispatchedEvent);
                        dom_adapter_1.DOM.dispatchEvent(fixture.debugElement.componentViewChildren[1].nativeElement, dispatchedEvent2);
                        testing_internal_1.expect(dom_adapter_1.DOM.isPrevented(dispatchedEvent)).toBe(true);
                        testing_internal_1.expect(dom_adapter_1.DOM.isPrevented(dispatchedEvent2)).toBe(false);
                        testing_internal_1.expect(dom_adapter_1.DOM.getChecked(fixture.debugElement.componentViewChildren[0].nativeElement))
                            .toBeFalsy();
                        testing_internal_1.expect(dom_adapter_1.DOM.getChecked(fixture.debugElement.componentViewChildren[1].nativeElement))
                            .toBeTruthy();
                        async.done();
                    });
                }));
            }
            testing_internal_1.it('should support render global events from multiple directives', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<div *ng-if="ctxBoolProp" listener listenerother></div>',
                    directives: [core_1.NgIf, DirectiveListeningDomEvent, DirectiveListeningDomEventOther]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    globalCounter = 0;
                    fixture.debugElement.componentInstance.ctxBoolProp = true;
                    fixture.detectChanges();
                    var tc = fixture.debugElement.componentViewChildren[1];
                    var listener = tc.inject(DirectiveListeningDomEvent);
                    var listenerother = tc.inject(DirectiveListeningDomEventOther);
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("window"), 'domEvent');
                    testing_internal_1.expect(listener.eventTypes).toEqual(['window_domEvent']);
                    testing_internal_1.expect(listenerother.eventType).toEqual('other_domEvent');
                    testing_internal_1.expect(globalCounter).toEqual(1);
                    fixture.debugElement.componentInstance.ctxBoolProp = false;
                    fixture.detectChanges();
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("window"), 'domEvent');
                    testing_internal_1.expect(globalCounter).toEqual(1);
                    fixture.debugElement.componentInstance.ctxBoolProp = true;
                    fixture.detectChanges();
                    testing_internal_1.dispatchEvent(dom_adapter_1.DOM.getGlobalEventTarget("window"), 'domEvent');
                    testing_internal_1.expect(globalCounter).toEqual(2);
                    async.done();
                });
            }));
            testing_internal_1.describe('dynamic ViewContainers', function () {
                testing_internal_1.it('should allow to create a ViewContainerRef at any bound location', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter, compiler_1.Compiler], function (tcb, async, compiler) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<div><dynamic-vp #dynamic></dynamic-vp></div>',
                        directives: [DynamicViewport]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var tc = fixture.debugElement.componentViewChildren[0];
                        var dynamicVp = tc.inject(DynamicViewport);
                        dynamicVp.done.then(function (_) {
                            fixture.detectChanges();
                            testing_internal_1.expect(fixture.debugElement.componentViewChildren[1].nativeElement)
                                .toHaveText('dynamic greet');
                            async.done();
                        });
                    });
                }));
            });
            testing_internal_1.it('should support static attributes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<input static type="text" title>', directives: [NeedsAttribute] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var tc = fixture.debugElement.componentViewChildren[0];
                    var needsAttribute = tc.inject(NeedsAttribute);
                    testing_internal_1.expect(needsAttribute.typeAttribute).toEqual('text');
                    testing_internal_1.expect(needsAttribute.staticAttribute).toEqual('');
                    testing_internal_1.expect(needsAttribute.fooAttribute).toEqual(null);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("dependency injection", function () {
            testing_internal_1.it("should support bindings", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <directive-providing-injectable >\n              <directive-consuming-injectable #consuming>\n              </directive-consuming-injectable>\n            </directive-providing-injectable>\n          ",
                    directives: [DirectiveProvidingInjectable, DirectiveConsumingInjectable]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var comp = fixture.debugElement.componentViewChildren[0].getLocal("consuming");
                    testing_internal_1.expect(comp.injectable).toBeAnInstanceOf(InjectableService);
                    async.done();
                });
            }));
            testing_internal_1.it("should support viewProviders", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(DirectiveProvidingInjectableInView, new metadata_1.ViewMetadata({
                    template: "\n              <directive-consuming-injectable #consuming>\n              </directive-consuming-injectable>\n          ",
                    directives: [DirectiveConsumingInjectable]
                }))
                    .createAsync(DirectiveProvidingInjectableInView)
                    .then(function (fixture) {
                    var comp = fixture.debugElement.componentViewChildren[0].getLocal("consuming");
                    testing_internal_1.expect(comp.injectable).toBeAnInstanceOf(InjectableService);
                    async.done();
                });
            }));
            testing_internal_1.it("should support unbounded lookup", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <directive-providing-injectable>\n              <directive-containing-directive-consuming-an-injectable #dir>\n              </directive-containing-directive-consuming-an-injectable>\n            </directive-providing-injectable>\n          ",
                    directives: [
                        DirectiveProvidingInjectable,
                        DirectiveContainingDirectiveConsumingAnInjectable
                    ]
                }))
                    .overrideView(DirectiveContainingDirectiveConsumingAnInjectable, new metadata_1.ViewMetadata({
                    template: "\n            <directive-consuming-injectable-unbounded></directive-consuming-injectable-unbounded>\n          ",
                    directives: [DirectiveConsumingInjectableUnbounded]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var comp = fixture.debugElement.componentViewChildren[0].getLocal("dir");
                    testing_internal_1.expect(comp.directive.injectable).toBeAnInstanceOf(InjectableService);
                    async.done();
                });
            }));
            testing_internal_1.it("should support the event-bus scenario", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <grand-parent-providing-event-bus>\n              <parent-providing-event-bus>\n                <child-consuming-event-bus>\n                </child-consuming-event-bus>\n              </parent-providing-event-bus>\n            </grand-parent-providing-event-bus>\n          ",
                    directives: [
                        GrandParentProvidingEventBus,
                        ParentProvidingEventBus,
                        ChildConsumingEventBus
                    ]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var gpComp = fixture.debugElement.componentViewChildren[0];
                    var parentComp = gpComp.children[0];
                    var childComp = parentComp.children[0];
                    var grandParent = gpComp.inject(GrandParentProvidingEventBus);
                    var parent = parentComp.inject(ParentProvidingEventBus);
                    var child = childComp.inject(ChildConsumingEventBus);
                    testing_internal_1.expect(grandParent.bus.name).toEqual("grandparent");
                    testing_internal_1.expect(parent.bus.name).toEqual("parent");
                    testing_internal_1.expect(parent.grandParentBus).toBe(grandParent.bus);
                    testing_internal_1.expect(child.bus).toBe(parent.bus);
                    async.done();
                });
            }));
            testing_internal_1.it("should instantiate bindings lazily", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n              <component-providing-logging-injectable #providing>\n                <directive-consuming-injectable *ng-if=\"ctxBoolProp\">\n                </directive-consuming-injectable>\n              </component-providing-logging-injectable>\n          ",
                    directives: [DirectiveConsumingInjectable, ComponentProvidingLoggingInjectable, core_1.NgIf]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var providing = fixture.debugElement.componentViewChildren[0].getLocal("providing");
                    testing_internal_1.expect(providing.created).toBe(false);
                    fixture.debugElement.componentInstance.ctxBoolProp = true;
                    fixture.detectChanges();
                    testing_internal_1.expect(providing.created).toBe(true);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("corner cases", function () {
            testing_internal_1.it('should remove script tags from templates', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: "\n            <script>alert(\"Ooops\");</script>\n            <div>before<script>alert(\"Ooops\");</script><span>inside</span>after</div>"
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    testing_internal_1.expect(dom_adapter_1.DOM.querySelectorAll(fixture.debugElement.nativeElement, 'script').length)
                        .toEqual(0);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("error handling", function () {
            testing_internal_1.it('should report a meaningful error when a directive is missing annotation', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '', directives: [SomeDirectiveMissingAnnotation] }));
                async_1.PromiseWrapper.catchError(tcb.createAsync(MyComp), function (e) {
                    testing_internal_1.expect(e.message).toEqual("No Directive annotation found on " + lang_1.stringify(SomeDirectiveMissingAnnotation));
                    async.done();
                    return null;
                });
            }));
            testing_internal_1.it('should report a meaningful error when a component is missing view annotation', testing_internal_1.inject([testing_internal_1.TestComponentBuilder], function (tcb) {
                try {
                    tcb.createAsync(ComponentWithoutView);
                }
                catch (e) {
                    testing_internal_1.expect(e.message)
                        .toContain("must have either 'template', 'templateUrl', or '@View' set.");
                    return null;
                }
            }));
            testing_internal_1.it('should report a meaningful error when a directive is null', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ directives: [[null]], template: '' }));
                async_1.PromiseWrapper.catchError(tcb.createAsync(MyComp), function (e) {
                    testing_internal_1.expect(e.message).toEqual("Unexpected directive value 'null' on the View of component '" + lang_1.stringify(MyComp) + "'");
                    async.done();
                    return null;
                });
            }));
            testing_internal_1.it('should provide an error context when an error happens in DI', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb =
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        directives: [DirectiveThrowingAnError],
                        template: "<directive-throwing-error></<directive-throwing-error>"
                    }));
                async_1.PromiseWrapper.catchError(tcb.createAsync(MyComp), function (e) {
                    var c = e.context;
                    testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.element).toUpperCase()).toEqual("DIRECTIVE-THROWING-ERROR");
                    testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
                    testing_internal_1.expect(c.injector).toBeAnInstanceOf(core_1.Injector);
                    async.done();
                    return null;
                });
            }));
            testing_internal_1.it('should provide an error context when an error happens in change detection', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: "<input [value]=\"one.two.three\" #local>" }));
                tcb.createAsync(MyComp).then(function (fixture) {
                    try {
                        fixture.detectChanges();
                        throw "Should throw";
                    }
                    catch (e) {
                        var c = e.context;
                        testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.element).toUpperCase()).toEqual("INPUT");
                        testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
                        testing_internal_1.expect(c.injector).toBeAnInstanceOf(core_1.Injector);
                        testing_internal_1.expect(c.expression).toContain("one.two.three");
                        testing_internal_1.expect(c.context).toBe(fixture.debugElement.componentInstance);
                        testing_internal_1.expect(c.locals["local"]).toBeDefined();
                    }
                    async.done();
                });
            }));
            testing_internal_1.it('should provide an error context when an error happens in change detection (text node)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: "{{one.two.three}}" }));
                tcb.createAsync(MyComp).then(function (fixture) {
                    try {
                        fixture.detectChanges();
                        throw "Should throw";
                    }
                    catch (e) {
                        var c = e.context;
                        testing_internal_1.expect(c.element).toBeNull();
                        testing_internal_1.expect(c.injector).toBeNull();
                    }
                    async.done();
                });
            }));
            if (dom_adapter_1.DOM.supportsDOMEvents()) {
                testing_internal_1.it('should provide an error context when an error happens in an event handler', testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                    tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: "<span emitter listener (event)=\"throwError()\" #local></span>",
                        directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
                    }));
                    var fixture;
                    tcb.createAsync(MyComp).then(function (root) { fixture = root; });
                    testing_internal_1.tick();
                    var tc = fixture.debugElement.componentViewChildren[0];
                    tc.inject(DirectiveEmitingEvent).fireEvent("boom");
                    try {
                        testing_internal_1.tick();
                        throw "Should throw";
                    }
                    catch (e) {
                        testing_internal_1.clearPendingTimers();
                        var c = e.context;
                        testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.element).toUpperCase()).toEqual("SPAN");
                        testing_internal_1.expect(dom_adapter_1.DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
                        testing_internal_1.expect(c.injector).toBeAnInstanceOf(core_1.Injector);
                        testing_internal_1.expect(c.context).toBe(fixture.debugElement.componentInstance);
                        testing_internal_1.expect(c.locals["local"]).toBeDefined();
                    }
                })));
            }
            if (!lang_2.IS_DART) {
                testing_internal_1.it('should report a meaningful error when a directive is undefined', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    var undefinedValue;
                    tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ directives: [undefinedValue], template: '' }));
                    async_1.PromiseWrapper.catchError(tcb.createAsync(MyComp), function (e) {
                        testing_internal_1.expect(e.message).toEqual("Unexpected directive value 'undefined' on the View of component '" + lang_1.stringify(MyComp) + "'");
                        async.done();
                        return null;
                    });
                }));
            }
            testing_internal_1.it('should specify a location of an error that happened during change detection (text)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '{{a.b}}' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    testing_internal_1.expect(function () { return fixture.detectChanges(); })
                        .toThrowError(testing_internal_1.containsRegexp("{{a.b}} in " + lang_1.stringify(MyComp)));
                    async.done();
                });
            }));
            testing_internal_1.it('should specify a location of an error that happened during change detection (element property)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [title]="a.b"></div>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    testing_internal_1.expect(function () { return fixture.detectChanges(); })
                        .toThrowError(testing_internal_1.containsRegexp("a.b in " + lang_1.stringify(MyComp)));
                    async.done();
                });
            }));
            testing_internal_1.it('should specify a location of an error that happened during change detection (directive property)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<child-cmp [title]="a.b"></child-cmp>',
                    directives: [ChildComp]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    testing_internal_1.expect(function () { return fixture.detectChanges(); })
                        .toThrowError(testing_internal_1.containsRegexp("a.b in " + lang_1.stringify(MyComp)));
                    async.done();
                });
            }));
        });
        testing_internal_1.it('should support imperative views', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                template: '<simple-imp-cmp></simple-imp-cmp>',
                directives: [SimpleImperativeViewComponent]
            }))
                .createAsync(MyComp)
                .then(function (fixture) {
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('hello imp view');
                async.done();
            });
        }));
        testing_internal_1.it('should support moving embedded views around', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter, ANCHOR_ELEMENT], function (tcb, async, anchorElement) {
            tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                template: '<div><div *some-impvp="ctxBoolProp">hello</div></div>',
                directives: [SomeImperativeViewport]
            }))
                .createAsync(MyComp)
                .then(function (fixture) {
                fixture.detectChanges();
                testing_internal_1.expect(anchorElement).toHaveText('');
                fixture.debugElement.componentInstance.ctxBoolProp = true;
                fixture.detectChanges();
                testing_internal_1.expect(anchorElement).toHaveText('hello');
                fixture.debugElement.componentInstance.ctxBoolProp = false;
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('');
                async.done();
            });
        }));
        testing_internal_1.describe('Property bindings', function () {
            if (!lang_2.IS_DART) {
                testing_internal_1.it('should throw on bindings to unknown properties', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb =
                        tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div unknown="{{ctxProp}}"></div>' }));
                    async_1.PromiseWrapper.catchError(tcb.createAsync(MyComp), function (e) {
                        testing_internal_1.expect(e.message).toEqual("Template parse errors:\nCan't bind to 'unknown' since it isn't a known native property in MyComp > div:nth-child(0)[unknown={{ctxProp}}]");
                        async.done();
                        return null;
                    });
                }));
                testing_internal_1.it('should not throw for property binding to a non-existing property when there is a matching directive property', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div my-dir [elprop]="ctxProp"></div>', directives: [MyDir] }))
                        .createAsync(MyComp)
                        .then(function (val) { async.done(); });
                }));
            }
            testing_internal_1.it('should not be created when there is a directive with the same property', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<span [title]="ctxProp"></span>',
                    directives: [DirectiveWithTitle]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = "TITLE";
                    fixture.detectChanges();
                    var el = dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, "span");
                    testing_internal_1.expect(lang_1.isBlank(el.title) || el.title == '').toBeTruthy();
                    async.done();
                });
            }));
            testing_internal_1.it('should work when a directive uses hostProperty to update the DOM element', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<span [title]="ctxProp"></span>',
                    directives: [DirectiveWithTitleAndHostProperty]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = "TITLE";
                    fixture.detectChanges();
                    var el = dom_adapter_1.DOM.querySelector(fixture.debugElement.nativeElement, "span");
                    testing_internal_1.expect(el.title).toEqual("TITLE");
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('logging property updates', function () {
            testing_internal_1.beforeEachBindings(function () { return [
                core_1.provide(change_detection_1.ChangeDetectorGenConfig, { useValue: new change_detection_1.ChangeDetectorGenConfig(true, true, false) })
            ]; });
            testing_internal_1.it('should reflect property values as attributes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var tpl = '<div>' +
                    '<div my-dir [elprop]="ctxProp"></div>' +
                    '</div>';
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: tpl, directives: [MyDir] }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.debugElement.componentInstance.ctxProp = 'hello';
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(fixture.debugElement.nativeElement))
                        .toContain('ng-reflect-dir-prop="hello"');
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('different proto view storages', function () {
            function runWithMode(mode) {
                return testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: "<!--" + mode + "--><div>{{ctxProp}}</div>" }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                        fixture.detectChanges();
                        testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('Hello World!');
                        async.done();
                    });
                });
            }
            testing_internal_1.it('should work with storing DOM nodes', runWithMode('cache'));
            testing_internal_1.it('should work with serializing the DOM nodes', runWithMode('nocache'));
        });
        // Disabled until a solution is found, refs:
        // - https://github.com/angular/angular/issues/776
        // - https://github.com/angular/angular/commit/81f3f32
        testing_internal_1.xdescribe('Missing directive checks', function () {
            function expectCompileError(tcb, inlineTpl, errMessage, done) {
                tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: inlineTpl }));
                async_1.PromiseWrapper.then(tcb.createAsync(MyComp), function (value) {
                    throw new exceptions_1.BaseException("Test failure: should not have come here as an exception was expected");
                }, function (err) {
                    testing_internal_1.expect(err.message).toEqual(errMessage);
                    done();
                });
            }
            if (lang_1.assertionsEnabled()) {
                testing_internal_1.it('should raise an error if no directive is registered for a template with template bindings', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    expectCompileError(tcb, '<div><div template="if: foo"></div></div>', 'Missing directive to handle \'if\' in <div template="if: foo">', function () { return async.done(); });
                }));
                testing_internal_1.it('should raise an error for missing template directive (1)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    expectCompileError(tcb, '<div><template foo></template></div>', 'Missing directive to handle: <template foo>', function () { return async.done(); });
                }));
                testing_internal_1.it('should raise an error for missing template directive (2)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    expectCompileError(tcb, '<div><template *ng-if="condition"></template></div>', 'Missing directive to handle: <template *ng-if="condition">', function () { return async.done(); });
                }));
                testing_internal_1.it('should raise an error for missing template directive (3)', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    expectCompileError(tcb, '<div *ng-if="condition"></div>', 'Missing directive to handle \'if\' in MyComp: <div *ng-if="condition">', function () { return async.done(); });
                }));
            }
        });
        testing_internal_1.describe('property decorators', function () {
            testing_internal_1.it('should support property decorators', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<with-prop-decorators el-prop="aaa"></with-prop-decorators>',
                    directives: [DirectiveWithPropDecorators]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var dir = fixture.debugElement.componentViewChildren[0].inject(DirectiveWithPropDecorators);
                    testing_internal_1.expect(dir.dirProp).toEqual("aaa");
                    async.done();
                });
            }));
            testing_internal_1.it('should support host binding decorators', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<with-prop-decorators></with-prop-decorators>',
                    directives: [DirectiveWithPropDecorators]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var dir = fixture.debugElement.componentViewChildren[0].inject(DirectiveWithPropDecorators);
                    dir.myAttr = "aaa";
                    fixture.detectChanges();
                    testing_internal_1.expect(dom_adapter_1.DOM.getOuterHTML(fixture.debugElement.componentViewChildren[0].nativeElement))
                        .toContain('my-attr="aaa"');
                    async.done();
                });
            }));
            if (dom_adapter_1.DOM.supportsDOMEvents()) {
                testing_internal_1.it('should support events decorators', testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                    tcb = tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: "<with-prop-decorators (el-event)=\"ctxProp='called'\">",
                        directives: [DirectiveWithPropDecorators]
                    }));
                    var fixture;
                    tcb.createAsync(MyComp).then(function (root) { fixture = root; });
                    testing_internal_1.tick();
                    var emitter = fixture.debugElement.componentViewChildren[0].inject(DirectiveWithPropDecorators);
                    emitter.fireEvent('fired !');
                    testing_internal_1.tick();
                    testing_internal_1.expect(fixture.debugElement.componentInstance.ctxProp).toEqual("called");
                })));
                testing_internal_1.it('should support host listener decorators', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                        template: '<with-prop-decorators></with-prop-decorators>',
                        directives: [DirectiveWithPropDecorators]
                    }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        fixture.detectChanges();
                        var dir = fixture.debugElement.componentViewChildren[0].inject(DirectiveWithPropDecorators);
                        var native = fixture.debugElement.componentViewChildren[0].nativeElement;
                        dom_adapter_1.DOM.dispatchEvent(native, dom_adapter_1.DOM.createMouseEvent('click'));
                        testing_internal_1.expect(dir.target).toBe(native);
                        async.done();
                    });
                }));
            }
            testing_internal_1.it('should support defining views in the component decorator', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.overrideView(MyComp, new metadata_1.ViewMetadata({
                    template: '<component-with-template></component-with-template>',
                    directives: [ComponentWithTemplate]
                }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    fixture.detectChanges();
                    var native = fixture.debugElement.componentViewChildren[0].nativeElement;
                    testing_internal_1.expect(native).toHaveText("No View Decorator: 123");
                    async.done();
                });
            }));
        });
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.describe('svg', function () {
                testing_internal_1.it('should support svg elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                    tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<svg><use xlink:href="Port" /></svg>' }))
                        .createAsync(MyComp)
                        .then(function (fixture) {
                        var el = fixture.debugElement.nativeElement;
                        var svg = dom_adapter_1.DOM.childNodes(el)[0];
                        var use = dom_adapter_1.DOM.childNodes(svg)[0];
                        testing_internal_1.expect(dom_adapter_1.DOM.getProperty(svg, 'namespaceURI'))
                            .toEqual('http://www.w3.org/2000/svg');
                        testing_internal_1.expect(dom_adapter_1.DOM.getProperty(use, 'namespaceURI'))
                            .toEqual('http://www.w3.org/2000/svg');
                        if (!lang_2.IS_DART) {
                            var firstAttribute = dom_adapter_1.DOM.getProperty(use, 'attributes')[0];
                            testing_internal_1.expect(firstAttribute.name).toEqual('xlink:href');
                            testing_internal_1.expect(firstAttribute.namespaceURI).toEqual('http://www.w3.org/1999/xlink');
                        }
                        else {
                            // For Dart where '_Attr' has no instance getter 'namespaceURI'
                            testing_internal_1.expect(dom_adapter_1.DOM.getOuterHTML(use)).toContain('xmlns:xlink');
                        }
                        async.done();
                    });
                }));
            });
        }
    });
}
exports.main = main;
var MyService = (function () {
    function MyService() {
        this.greeting = 'hello';
    }
    MyService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyService);
    return MyService;
})();
var SimpleImperativeViewComponent = (function () {
    function SimpleImperativeViewComponent(self, renderer) {
        var hostElement = renderer.getNativeElementSync(self);
        dom_adapter_1.DOM.appendChild(hostElement, testing_internal_1.el('hello imp view'));
    }
    SimpleImperativeViewComponent = __decorate([
        metadata_1.Component({ selector: 'simple-imp-cmp' }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [element_ref_1.ElementRef, dom_renderer_1.DomRenderer])
    ], SimpleImperativeViewComponent);
    return SimpleImperativeViewComponent;
})();
var DynamicViewport = (function () {
    function DynamicViewport(vc, compiler) {
        var myService = new MyService();
        myService.greeting = 'dynamic greet';
        var bindings = core_1.Injector.resolve([core_1.provide(MyService, { useValue: myService })]);
        this.done = compiler.compileInHost(ChildCompUsingService)
            .then(function (hostPv) { vc.createHostView(hostPv, 0, bindings); });
    }
    DynamicViewport = __decorate([
        metadata_1.Directive({ selector: 'dynamic-vp' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [view_container_ref_1.ViewContainerRef, compiler_1.Compiler])
    ], DynamicViewport);
    return DynamicViewport;
})();
var MyDir = (function () {
    function MyDir() {
        this.dirProp = '';
    }
    MyDir = __decorate([
        metadata_1.Directive({ selector: '[my-dir]', inputs: ['dirProp: elprop'], exportAs: 'mydir' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyDir);
    return MyDir;
})();
var DirectiveWithTitle = (function () {
    function DirectiveWithTitle() {
    }
    DirectiveWithTitle = __decorate([
        metadata_1.Directive({ selector: '[title]', inputs: ['title'] }), 
        __metadata('design:paramtypes', [])
    ], DirectiveWithTitle);
    return DirectiveWithTitle;
})();
var DirectiveWithTitleAndHostProperty = (function () {
    function DirectiveWithTitleAndHostProperty() {
    }
    DirectiveWithTitleAndHostProperty = __decorate([
        metadata_1.Directive({ selector: '[title]', inputs: ['title'], host: { '[title]': 'title' } }), 
        __metadata('design:paramtypes', [])
    ], DirectiveWithTitleAndHostProperty);
    return DirectiveWithTitleAndHostProperty;
})();
var PushCmp = (function () {
    function PushCmp() {
        this.numberOfChecks = 0;
    }
    Object.defineProperty(PushCmp.prototype, "field", {
        get: function () {
            this.numberOfChecks++;
            return "fixed";
        },
        enumerable: true,
        configurable: true
    });
    PushCmp = __decorate([
        metadata_1.Component({ selector: 'push-cmp', inputs: ['prop'], changeDetection: change_detection_1.ChangeDetectionStrategy.OnPush }),
        metadata_1.View({ template: '{{field}}' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PushCmp);
    return PushCmp;
})();
var PushCmpWithRef = (function () {
    function PushCmpWithRef(ref) {
        this.numberOfChecks = 0;
        this.ref = ref;
    }
    Object.defineProperty(PushCmpWithRef.prototype, "field", {
        get: function () {
            this.numberOfChecks++;
            return "fixed";
        },
        enumerable: true,
        configurable: true
    });
    PushCmpWithRef.prototype.propagate = function () { this.ref.markForCheck(); };
    PushCmpWithRef = __decorate([
        metadata_1.Component({
            selector: 'push-cmp-with-ref',
            inputs: ['prop'],
            changeDetection: change_detection_1.ChangeDetectionStrategy.OnPush
        }),
        metadata_1.View({ template: '{{field}}' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorRef])
    ], PushCmpWithRef);
    return PushCmpWithRef;
})();
var PushCmpWithAsyncPipe = (function () {
    function PushCmpWithAsyncPipe() {
        this.numberOfChecks = 0;
        this.completer = async_1.PromiseWrapper.completer();
        this.promise = this.completer.promise;
    }
    Object.defineProperty(PushCmpWithAsyncPipe.prototype, "field", {
        get: function () {
            this.numberOfChecks++;
            return this.promise;
        },
        enumerable: true,
        configurable: true
    });
    PushCmpWithAsyncPipe.prototype.resolve = function (value) { this.completer.resolve(value); };
    PushCmpWithAsyncPipe = __decorate([
        metadata_1.Component({
            selector: 'push-cmp-with-async',
            changeDetection: change_detection_1.ChangeDetectionStrategy.OnPush,
            template: '{{field | async}}',
            pipes: [common_1.AsyncPipe]
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PushCmpWithAsyncPipe);
    return PushCmpWithAsyncPipe;
})();
var MyComp = (function () {
    function MyComp() {
        this.ctxProp = 'initial value';
        this.ctxNumProp = 0;
        this.ctxBoolProp = false;
    }
    MyComp.prototype.throwError = function () { throw 'boom'; };
    MyComp = __decorate([
        metadata_1.Component({ selector: 'my-comp' }),
        metadata_1.View({ directives: [] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
var ChildComp = (function () {
    function ChildComp(service) {
        this.ctxProp = service.greeting;
        this.dirProp = null;
    }
    ChildComp = __decorate([
        metadata_1.Component({ selector: 'child-cmp', inputs: ['dirProp'], viewProviders: [MyService] }),
        metadata_1.View({ directives: [MyDir], template: '{{ctxProp}}' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [MyService])
    ], ChildComp);
    return ChildComp;
})();
var ChildCompNoTemplate = (function () {
    function ChildCompNoTemplate() {
        this.ctxProp = 'hello';
    }
    ChildCompNoTemplate = __decorate([
        metadata_1.Component({ selector: 'child-cmp-no-template' }),
        metadata_1.View({ directives: [], template: '' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildCompNoTemplate);
    return ChildCompNoTemplate;
})();
var ChildCompUsingService = (function () {
    function ChildCompUsingService(service) {
        this.ctxProp = service.greeting;
    }
    ChildCompUsingService = __decorate([
        metadata_1.Component({ selector: 'child-cmp-svc' }),
        metadata_1.View({ template: '{{ctxProp}}' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [MyService])
    ], ChildCompUsingService);
    return ChildCompUsingService;
})();
var SomeDirective = (function () {
    function SomeDirective() {
    }
    SomeDirective = __decorate([
        metadata_1.Directive({ selector: 'some-directive' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SomeDirective);
    return SomeDirective;
})();
var SomeDirectiveMissingAnnotation = (function () {
    function SomeDirectiveMissingAnnotation() {
    }
    return SomeDirectiveMissingAnnotation;
})();
var CompWithHost = (function () {
    function CompWithHost(someComp) {
        this.myHost = someComp;
    }
    CompWithHost = __decorate([
        metadata_1.Component({ selector: 'cmp-with-host' }),
        metadata_1.View({ template: '<p>Component with an injected host</p>', directives: [SomeDirective] }),
        core_1.Injectable(),
        __param(0, core_1.Host()), 
        __metadata('design:paramtypes', [SomeDirective])
    ], CompWithHost);
    return CompWithHost;
})();
var ChildComp2 = (function () {
    function ChildComp2(service) {
        this.ctxProp = service.greeting;
        this.dirProp = null;
    }
    ChildComp2 = __decorate([
        metadata_1.Component({ selector: '[child-cmp2]', viewProviders: [MyService] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [MyService])
    ], ChildComp2);
    return ChildComp2;
})();
var SomeViewport = (function () {
    function SomeViewport(container, templateRef) {
        container.createEmbeddedView(templateRef).setLocal('some-tmpl', 'hello');
        container.createEmbeddedView(templateRef).setLocal('some-tmpl', 'again');
    }
    SomeViewport = __decorate([
        metadata_1.Directive({ selector: '[some-viewport]' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [view_container_ref_1.ViewContainerRef, template_ref_1.TemplateRef])
    ], SomeViewport);
    return SomeViewport;
})();
var DoublePipe = (function () {
    function DoublePipe() {
    }
    DoublePipe.prototype.onDestroy = function () { };
    DoublePipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return "" + value + value;
    };
    DoublePipe = __decorate([
        metadata_1.Pipe({ name: 'double' }), 
        __metadata('design:paramtypes', [])
    ], DoublePipe);
    return DoublePipe;
})();
var DirectiveEmitingEvent = (function () {
    function DirectiveEmitingEvent() {
        this.msg = '';
        this.event = new async_1.EventEmitter();
    }
    DirectiveEmitingEvent.prototype.fireEvent = function (msg) { async_1.ObservableWrapper.callNext(this.event, msg); };
    DirectiveEmitingEvent = __decorate([
        metadata_1.Directive({ selector: '[emitter]', outputs: ['event'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveEmitingEvent);
    return DirectiveEmitingEvent;
})();
var DirectiveUpdatingHostAttributes = (function () {
    function DirectiveUpdatingHostAttributes() {
    }
    DirectiveUpdatingHostAttributes = __decorate([
        metadata_1.Directive({ selector: '[update-host-attributes]', host: { 'role': 'button' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveUpdatingHostAttributes);
    return DirectiveUpdatingHostAttributes;
})();
var DirectiveUpdatingHostProperties = (function () {
    function DirectiveUpdatingHostProperties() {
        this.id = "one";
    }
    DirectiveUpdatingHostProperties = __decorate([
        metadata_1.Directive({ selector: '[update-host-properties]', host: { '[id]': 'id' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveUpdatingHostProperties);
    return DirectiveUpdatingHostProperties;
})();
var DirectiveUpdatingHostActions = (function () {
    function DirectiveUpdatingHostActions() {
        this.setAttr = new async_1.EventEmitter();
    }
    DirectiveUpdatingHostActions.prototype.triggerSetAttr = function (attrValue) { async_1.ObservableWrapper.callNext(this.setAttr, ["key", attrValue]); };
    DirectiveUpdatingHostActions = __decorate([
        metadata_1.Directive({ selector: '[update-host-actions]', host: { '@setAttr': 'setAttribute' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveUpdatingHostActions);
    return DirectiveUpdatingHostActions;
})();
var DirectiveListeningEvent = (function () {
    function DirectiveListeningEvent() {
        this.msg = '';
    }
    DirectiveListeningEvent.prototype.onEvent = function (msg) { this.msg = msg; };
    DirectiveListeningEvent = __decorate([
        metadata_1.Directive({ selector: '[listener]', host: { '(event)': 'onEvent($event)' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveListeningEvent);
    return DirectiveListeningEvent;
})();
var DirectiveListeningDomEvent = (function () {
    function DirectiveListeningDomEvent() {
        this.eventTypes = [];
    }
    DirectiveListeningDomEvent.prototype.onEvent = function (eventType) { this.eventTypes.push(eventType); };
    DirectiveListeningDomEvent.prototype.onWindowEvent = function (eventType) { this.eventTypes.push("window_" + eventType); };
    DirectiveListeningDomEvent.prototype.onDocumentEvent = function (eventType) { this.eventTypes.push("document_" + eventType); };
    DirectiveListeningDomEvent.prototype.onBodyEvent = function (eventType) { this.eventTypes.push("body_" + eventType); };
    DirectiveListeningDomEvent = __decorate([
        metadata_1.Directive({
            selector: '[listener]',
            host: {
                '(domEvent)': 'onEvent($event.type)',
                '(window:domEvent)': 'onWindowEvent($event.type)',
                '(document:domEvent)': 'onDocumentEvent($event.type)',
                '(body:domEvent)': 'onBodyEvent($event.type)'
            }
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveListeningDomEvent);
    return DirectiveListeningDomEvent;
})();
var globalCounter = 0;
var DirectiveListeningDomEventOther = (function () {
    function DirectiveListeningDomEventOther() {
        this.eventType = '';
    }
    DirectiveListeningDomEventOther.prototype.onEvent = function (eventType) {
        globalCounter++;
        this.eventType = "other_" + eventType;
    };
    DirectiveListeningDomEventOther = __decorate([
        metadata_1.Directive({ selector: '[listenerother]', host: { '(window:domEvent)': 'onEvent($event.type)' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveListeningDomEventOther);
    return DirectiveListeningDomEventOther;
})();
var DirectiveListeningDomEventPrevent = (function () {
    function DirectiveListeningDomEventPrevent() {
    }
    DirectiveListeningDomEventPrevent.prototype.onEvent = function (event) { return false; };
    DirectiveListeningDomEventPrevent = __decorate([
        metadata_1.Directive({ selector: '[listenerprevent]', host: { '(click)': 'onEvent($event)' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveListeningDomEventPrevent);
    return DirectiveListeningDomEventPrevent;
})();
var DirectiveListeningDomEventNoPrevent = (function () {
    function DirectiveListeningDomEventNoPrevent() {
    }
    DirectiveListeningDomEventNoPrevent.prototype.onEvent = function (event) { return true; };
    DirectiveListeningDomEventNoPrevent = __decorate([
        metadata_1.Directive({ selector: '[listenernoprevent]', host: { '(click)': 'onEvent($event)' } }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveListeningDomEventNoPrevent);
    return DirectiveListeningDomEventNoPrevent;
})();
var IdDir = (function () {
    function IdDir() {
    }
    IdDir = __decorate([
        metadata_1.Directive({ selector: '[id]', inputs: ['id'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], IdDir);
    return IdDir;
})();
var NeedsAttribute = (function () {
    function NeedsAttribute(typeAttribute, staticAttribute, fooAttribute) {
        this.typeAttribute = typeAttribute;
        this.staticAttribute = staticAttribute;
        this.fooAttribute = fooAttribute;
    }
    NeedsAttribute = __decorate([
        metadata_1.Directive({ selector: '[static]' }),
        core_1.Injectable(),
        __param(0, metadata_1.Attribute('type')),
        __param(1, metadata_1.Attribute('static')),
        __param(2, metadata_1.Attribute('foo')), 
        __metadata('design:paramtypes', [String, String, String])
    ], NeedsAttribute);
    return NeedsAttribute;
})();
var PublicApi = (function () {
    function PublicApi() {
    }
    PublicApi = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PublicApi);
    return PublicApi;
})();
var PrivateImpl = (function (_super) {
    __extends(PrivateImpl, _super);
    function PrivateImpl() {
        _super.apply(this, arguments);
    }
    PrivateImpl = __decorate([
        metadata_1.Directive({
            selector: '[public-api]',
            providers: [new core_1.Provider(PublicApi, { useExisting: PrivateImpl, deps: [] })]
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PrivateImpl);
    return PrivateImpl;
})(PublicApi);
var NeedsPublicApi = (function () {
    function NeedsPublicApi(api) {
        testing_internal_1.expect(api instanceof PrivateImpl).toBe(true);
    }
    NeedsPublicApi = __decorate([
        metadata_1.Directive({ selector: '[needs-public-api]' }),
        core_1.Injectable(),
        __param(0, core_1.Host()), 
        __metadata('design:paramtypes', [PublicApi])
    ], NeedsPublicApi);
    return NeedsPublicApi;
})();
var ToolbarPart = (function () {
    function ToolbarPart(templateRef) {
        this.templateRef = templateRef;
    }
    ToolbarPart = __decorate([
        metadata_1.Directive({ selector: '[toolbarpart]' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [template_ref_1.TemplateRef])
    ], ToolbarPart);
    return ToolbarPart;
})();
var ToolbarViewContainer = (function () {
    function ToolbarViewContainer(vc) {
        this.vc = vc;
    }
    Object.defineProperty(ToolbarViewContainer.prototype, "toolbarVc", {
        set: function (part) {
            var view = this.vc.createEmbeddedView(part.templateRef, 0);
            view.setLocal('toolbarProp', 'From toolbar');
        },
        enumerable: true,
        configurable: true
    });
    ToolbarViewContainer = __decorate([
        metadata_1.Directive({ selector: '[toolbar-vc]', inputs: ['toolbarVc'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [view_container_ref_1.ViewContainerRef])
    ], ToolbarViewContainer);
    return ToolbarViewContainer;
})();
var ToolbarComponent = (function () {
    function ToolbarComponent(query) {
        this.ctxProp = 'hello world';
        this.query = query;
    }
    ToolbarComponent = __decorate([
        metadata_1.Component({ selector: 'toolbar' }),
        metadata_1.View({
            template: 'TOOLBAR(<div *ng-for="var part of query" [toolbar-vc]="part"></div>)',
            directives: [ToolbarViewContainer, core_1.NgFor]
        }),
        core_1.Injectable(),
        __param(0, metadata_1.Query(ToolbarPart)), 
        __metadata('design:paramtypes', [query_list_1.QueryList])
    ], ToolbarComponent);
    return ToolbarComponent;
})();
var DirectiveWithTwoWayBinding = (function () {
    function DirectiveWithTwoWayBinding() {
        this.controlChange = new async_1.EventEmitter();
        this.control = null;
    }
    DirectiveWithTwoWayBinding.prototype.triggerChange = function (value) { async_1.ObservableWrapper.callNext(this.controlChange, value); };
    DirectiveWithTwoWayBinding = __decorate([
        metadata_1.Directive({ selector: '[two-way]', inputs: ['control'], outputs: ['controlChange'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveWithTwoWayBinding);
    return DirectiveWithTwoWayBinding;
})();
var InjectableService = (function () {
    function InjectableService() {
    }
    InjectableService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], InjectableService);
    return InjectableService;
})();
function createInjectableWithLogging(inj) {
    inj.get(ComponentProvidingLoggingInjectable).created = true;
    return new InjectableService();
}
var ComponentProvidingLoggingInjectable = (function () {
    function ComponentProvidingLoggingInjectable() {
        this.created = false;
    }
    ComponentProvidingLoggingInjectable = __decorate([
        metadata_1.Component({
            selector: 'component-providing-logging-injectable',
            providers: [
                new core_1.Provider(InjectableService, { useFactory: createInjectableWithLogging, deps: [core_1.Injector] })
            ]
        }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ComponentProvidingLoggingInjectable);
    return ComponentProvidingLoggingInjectable;
})();
var DirectiveProvidingInjectable = (function () {
    function DirectiveProvidingInjectable() {
    }
    DirectiveProvidingInjectable = __decorate([
        metadata_1.Directive({ selector: 'directive-providing-injectable', providers: [[InjectableService]] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveProvidingInjectable);
    return DirectiveProvidingInjectable;
})();
var DirectiveProvidingInjectableInView = (function () {
    function DirectiveProvidingInjectableInView() {
    }
    DirectiveProvidingInjectableInView = __decorate([
        metadata_1.Component({ selector: 'directive-providing-injectable', viewProviders: [[InjectableService]] }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveProvidingInjectableInView);
    return DirectiveProvidingInjectableInView;
})();
var DirectiveProvidingInjectableInHostAndView = (function () {
    function DirectiveProvidingInjectableInHostAndView() {
    }
    DirectiveProvidingInjectableInHostAndView = __decorate([
        metadata_1.Component({
            selector: 'directive-providing-injectable',
            providers: [new core_1.Provider(InjectableService, { useValue: 'host' })],
            viewProviders: [new core_1.Provider(InjectableService, { useValue: 'view' })]
        }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveProvidingInjectableInHostAndView);
    return DirectiveProvidingInjectableInHostAndView;
})();
var DirectiveConsumingInjectable = (function () {
    function DirectiveConsumingInjectable(injectable) {
        this.injectable = injectable;
    }
    DirectiveConsumingInjectable = __decorate([
        metadata_1.Component({ selector: 'directive-consuming-injectable' }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(),
        __param(0, core_1.Host()),
        __param(0, core_1.Inject(InjectableService)), 
        __metadata('design:paramtypes', [Object])
    ], DirectiveConsumingInjectable);
    return DirectiveConsumingInjectable;
})();
var DirectiveContainingDirectiveConsumingAnInjectable = (function () {
    function DirectiveContainingDirectiveConsumingAnInjectable() {
    }
    DirectiveContainingDirectiveConsumingAnInjectable = __decorate([
        metadata_1.Component({ selector: 'directive-containing-directive-consuming-an-injectable' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveContainingDirectiveConsumingAnInjectable);
    return DirectiveContainingDirectiveConsumingAnInjectable;
})();
var DirectiveConsumingInjectableUnbounded = (function () {
    function DirectiveConsumingInjectableUnbounded(injectable, parent) {
        this.injectable = injectable;
        parent.directive = this;
    }
    DirectiveConsumingInjectableUnbounded = __decorate([
        metadata_1.Component({ selector: 'directive-consuming-injectable-unbounded' }),
        metadata_1.View({ template: '' }),
        core_1.Injectable(),
        __param(1, core_1.SkipSelf()), 
        __metadata('design:paramtypes', [InjectableService, DirectiveContainingDirectiveConsumingAnInjectable])
    ], DirectiveConsumingInjectableUnbounded);
    return DirectiveConsumingInjectableUnbounded;
})();
var EventBus = (function () {
    function EventBus(parentEventBus, name) {
        this.parentEventBus = parentEventBus;
        this.name = name;
    }
    EventBus = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [EventBus, String])
    ], EventBus);
    return EventBus;
})();
var GrandParentProvidingEventBus = (function () {
    function GrandParentProvidingEventBus(bus) {
        this.bus = bus;
    }
    GrandParentProvidingEventBus = __decorate([
        metadata_1.Directive({
            selector: 'grand-parent-providing-event-bus',
            providers: [new core_1.Provider(EventBus, { useValue: new EventBus(null, "grandparent") })]
        }), 
        __metadata('design:paramtypes', [EventBus])
    ], GrandParentProvidingEventBus);
    return GrandParentProvidingEventBus;
})();
function createParentBus(peb) {
    return new EventBus(peb, "parent");
}
var ParentProvidingEventBus = (function () {
    function ParentProvidingEventBus(bus, grandParentBus) {
        this.bus = bus;
        this.grandParentBus = grandParentBus;
    }
    ParentProvidingEventBus = __decorate([
        metadata_1.Component({
            selector: 'parent-providing-event-bus',
            providers: [
                new core_1.Provider(EventBus, { useFactory: createParentBus, deps: [[EventBus, new core_1.SkipSelfMetadata()]] })
            ]
        }),
        metadata_1.View({
            directives: [core_1.forwardRef(function () { return ChildConsumingEventBus; })],
            template: "\n    <child-consuming-event-bus></child-consuming-event-bus>\n  "
        }),
        __param(1, core_1.SkipSelf()), 
        __metadata('design:paramtypes', [EventBus, EventBus])
    ], ParentProvidingEventBus);
    return ParentProvidingEventBus;
})();
var ChildConsumingEventBus = (function () {
    function ChildConsumingEventBus(bus) {
        this.bus = bus;
    }
    ChildConsumingEventBus = __decorate([
        metadata_1.Directive({ selector: 'child-consuming-event-bus' }),
        __param(0, core_1.SkipSelf()), 
        __metadata('design:paramtypes', [EventBus])
    ], ChildConsumingEventBus);
    return ChildConsumingEventBus;
})();
var SomeImperativeViewport = (function () {
    function SomeImperativeViewport(vc, templateRef, renderer, anchor) {
        this.vc = vc;
        this.templateRef = templateRef;
        this.renderer = renderer;
        this.view = null;
        this.anchor = anchor;
    }
    Object.defineProperty(SomeImperativeViewport.prototype, "someImpvp", {
        set: function (value) {
            if (lang_1.isPresent(this.view)) {
                this.vc.clear();
                this.view = null;
            }
            if (value) {
                this.view = this.vc.createEmbeddedView(this.templateRef);
                var nodes = this.renderer.getRootNodes(this.view.renderFragment);
                for (var i = 0; i < nodes.length; i++) {
                    dom_adapter_1.DOM.appendChild(this.anchor, nodes[i]);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    SomeImperativeViewport = __decorate([
        metadata_1.Directive({ selector: '[some-impvp]', inputs: ['someImpvp'] }),
        core_1.Injectable(),
        __param(3, core_1.Inject(ANCHOR_ELEMENT)), 
        __metadata('design:paramtypes', [view_container_ref_1.ViewContainerRef, template_ref_1.TemplateRef, dom_renderer_1.DomRenderer, Object])
    ], SomeImperativeViewport);
    return SomeImperativeViewport;
})();
var ExportDir = (function () {
    function ExportDir() {
    }
    ExportDir = __decorate([
        metadata_1.Directive({ selector: '[export-dir]', exportAs: 'dir' }), 
        __metadata('design:paramtypes', [])
    ], ExportDir);
    return ExportDir;
})();
var ComponentWithoutView = (function () {
    function ComponentWithoutView() {
    }
    ComponentWithoutView = __decorate([
        metadata_1.Component({ selector: 'comp' }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithoutView);
    return ComponentWithoutView;
})();
var DuplicateDir = (function () {
    function DuplicateDir(elRef) {
        dom_adapter_1.DOM.setText(elRef.nativeElement, dom_adapter_1.DOM.getText(elRef.nativeElement) + 'noduplicate');
    }
    DuplicateDir = __decorate([
        metadata_1.Directive({ selector: '[no-duplicate]' }), 
        __metadata('design:paramtypes', [element_ref_1.ElementRef])
    ], DuplicateDir);
    return DuplicateDir;
})();
var OtherDuplicateDir = (function () {
    function OtherDuplicateDir(elRef) {
        dom_adapter_1.DOM.setText(elRef.nativeElement, dom_adapter_1.DOM.getText(elRef.nativeElement) + 'othernoduplicate');
    }
    OtherDuplicateDir = __decorate([
        metadata_1.Directive({ selector: '[no-duplicate]' }), 
        __metadata('design:paramtypes', [element_ref_1.ElementRef])
    ], OtherDuplicateDir);
    return OtherDuplicateDir;
})();
var DirectiveThrowingAnError = (function () {
    function DirectiveThrowingAnError() {
        throw new exceptions_1.BaseException("BOOM");
    }
    DirectiveThrowingAnError = __decorate([
        metadata_1.Directive({ selector: 'directive-throwing-error' }), 
        __metadata('design:paramtypes', [])
    ], DirectiveThrowingAnError);
    return DirectiveThrowingAnError;
})();
var ComponentWithTemplate = (function () {
    function ComponentWithTemplate() {
        this.items = [1, 2, 3];
    }
    ComponentWithTemplate = __decorate([
        metadata_1.Component({
            selector: 'component-with-template',
            directives: [core_1.NgFor],
            template: "No View Decorator: <div *ng-for=\"#item of items\">{{item}}</div>"
        }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithTemplate);
    return ComponentWithTemplate;
})();
var DirectiveWithPropDecorators = (function () {
    function DirectiveWithPropDecorators() {
        this.event = new async_1.EventEmitter();
    }
    DirectiveWithPropDecorators.prototype.onClick = function (target) {
        this.target = target;
    };
    DirectiveWithPropDecorators.prototype.fireEvent = function (msg) { async_1.ObservableWrapper.callNext(this.event, msg); };
    __decorate([
        metadata_1.Input("elProp"), 
        __metadata('design:type', String)
    ], DirectiveWithPropDecorators.prototype, "dirProp");
    __decorate([
        metadata_1.Output('elEvent'), 
        __metadata('design:type', Object)
    ], DirectiveWithPropDecorators.prototype, "event");
    __decorate([
        metadata_1.HostBinding("attr.my-attr"), 
        __metadata('design:type', String)
    ], DirectiveWithPropDecorators.prototype, "myAttr");
    Object.defineProperty(DirectiveWithPropDecorators.prototype, "onClick",
        __decorate([
            metadata_1.HostListener("click", ["$event.target"]), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object]), 
            __metadata('design:returntype', void 0)
        ], DirectiveWithPropDecorators.prototype, "onClick", Object.getOwnPropertyDescriptor(DirectiveWithPropDecorators.prototype, "onClick")));
    DirectiveWithPropDecorators = __decorate([
        metadata_1.Directive({ selector: 'with-prop-decorators' }), 
        __metadata('design:paramtypes', [])
    ], DirectiveWithPropDecorators);
    return DirectiveWithPropDecorators;
})();
//# sourceMappingURL=integration_spec.js.map