import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit,
  containsRegexp,
  stringifyElement
} from 'angular2/test_lib';


import {TestBed} from 'angular2/src/test_lib/test_bed';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {
  Type,
  isPresent,
  BaseException,
  assertionsEnabled,
  isJsObject,
  global,
  stringify,
  CONST,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {Injector, bind, Injectable, Binding, forwardRef, OpaqueToken, Inject} from 'angular2/di';
import {
  PipeRegistry,
  defaultPipeRegistry,
  ChangeDetection,
  DynamicChangeDetection,
  Pipe,
  ChangeDetectorRef,
  ON_PUSH
} from 'angular2/change_detection';

import {
  Directive,
  Component,
  View,
  Parent,
  Ancestor,
  Unbounded,
  Attribute,
  Query
} from 'angular2/annotations';
import * as viewAnn from 'angular2/src/core/annotations_impl/view';
import * as visAnn from 'angular2/src/core/annotations_impl/visibility';

import {QueryList} from 'angular2/src/core/compiler/query_list';

import {NgIf} from 'angular2/src/directives/ng_if';
import {NgFor} from 'angular2/src/directives/ng_for';

import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {ProtoViewRef, ViewRef} from 'angular2/src/core/compiler/view_ref';
import {Compiler} from 'angular2/src/core/compiler/compiler';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';

import {DomRenderer} from 'angular2/src/render/dom/dom_renderer';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';

const ANCHOR_ELEMENT = CONST_EXPR(new OpaqueToken('AnchorElement'));

export function main() {
  describe('integration tests', function() {
    var ctx;

    beforeEachBindings(() => [bind(ANCHOR_ELEMENT).toValue(el('<div></div>'))]);

    beforeEach(() => { ctx = new MyComp(); });


    describe('react to record changes', function() {
      it('should consume text node changes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({template: '<div>{{ctxProp}}</div>'}));
           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 ctx.ctxProp = 'Hello World!';

                 view.detectChanges();
                 expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Hello World!');
                 async.done();
               });
         }));

      it('should consume element binding changes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({template: '<div [id]="ctxProp"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Hello World!';
                 view.detectChanges();

                 expect(view.rootNodes[0].id).toEqual('Hello World!');
                 async.done();
               });
         }));

      it('should consume binding to aria-* attributes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({template: '<div [attr.aria-label]="ctxProp"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Initial aria label';
                 view.detectChanges();
                 expect(DOM.getAttribute(view.rootNodes[0], 'aria-label'))
                     .toEqual('Initial aria label');

                 ctx.ctxProp = 'Changed aria label';
                 view.detectChanges();
                 expect(DOM.getAttribute(view.rootNodes[0], 'aria-label'))
                     .toEqual('Changed aria label');

                 async.done();
               });
         }));

      it('should consume binding to property names where attr name and property name do not match',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({template: '<div [tabindex]="ctxNumProp"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 view.detectChanges();
                 expect(view.rootNodes[0].tabIndex).toEqual(0);

                 ctx.ctxNumProp = 5;
                 view.detectChanges();
                 expect(view.rootNodes[0].tabIndex).toEqual(5);

                 async.done();
               });
         }));

      it('should consume binding to camel-cased properties using dash-cased syntax in templates',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({template: '<input [read-only]="ctxBoolProp">'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 view.detectChanges();
                 expect(view.rootNodes[0].readOnly).toBeFalsy();

                 ctx.ctxBoolProp = true;
                 view.detectChanges();
                 expect(view.rootNodes[0].readOnly).toBeTruthy();

                 async.done();
               });
         }));

      it('should consume binding to inner-html',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({template: '<div inner-html="{{ctxProp}}"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Some <span>HTML</span>';
                 view.detectChanges();
                 expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Some <span>HTML</span>');

                 ctx.ctxProp = 'Some other <div>HTML</div>';
                 view.detectChanges();
                 expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Some other <div>HTML</div>');

                 async.done();
               });
         }));

      it('should ignore bindings to unknown properties',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({template: '<div unknown="{{ctxProp}}"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Some value';
                 view.detectChanges();
                 expect(DOM.hasProperty(view.rootNodes[0], 'unknown')).toBeFalsy();

                 async.done();
               });
         }));

      it('should consume directive watch expression change.',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var tpl = '<div>' +
                     '<div my-dir [elprop]="ctxProp"></div>' +
                     '<div my-dir elprop="Hi there!"></div>' +
                     '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
                     '<div my-dir elprop="One more {{ctxProp}}"></div>' +
                     '</div>';
           tb.overrideView(MyComp, new viewAnn.View({template: tpl, directives: [MyDir]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Hello World!';
                 view.detectChanges();

                 expect(view.rawView.elementInjectors[0].get(MyDir).dirProp)
                     .toEqual('Hello World!');
                 expect(view.rawView.elementInjectors[1].get(MyDir).dirProp).toEqual('Hi there!');
                 expect(view.rawView.elementInjectors[2].get(MyDir).dirProp).toEqual('Hi there!');
                 expect(view.rawView.elementInjectors[3].get(MyDir).dirProp)
                     .toEqual('One more Hello World!');
                 async.done();
               });
         }));

      describe('pipes', () => {
        beforeEachBindings(() => {
          return [
            bind(ChangeDetection)
                .toFactory(() => new DynamicChangeDetection(
                               new PipeRegistry({"double": [new DoublePipeFactory()]})),
                           [])
          ];
        });

        it("should support pipes in bindings and bind config",
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template:
                   '<component-with-pipes #comp [prop]="ctxProp | double"></component-with-pipes>',
               directives: [ComponentWithPipes]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   ctx.ctxProp = 'a';
                   view.detectChanges();

                   var comp = view.rawView.locals.get("comp");

                   // it is doubled twice: once in the binding, second time in the bind config
                   expect(comp.prop).toEqual('aaaa');
                   async.done();
                 });
           }));
      });

      it('should support nested components.',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View({template: '<child-cmp></child-cmp>', directives: [ChildComp]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 view.detectChanges();

                 expect(view.rootNodes).toHaveText('hello');
                 async.done();
               });
         }));

      // GH issue 328 - https://github.com/angular/angular/issues/328
      it('should support different directive types on a single node',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<child-cmp my-dir [elprop]="ctxProp"></child-cmp>',
             directives: [MyDir, ChildComp]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 ctx.ctxProp = 'Hello World!';
                 view.detectChanges();

                 var elInj = view.rawView.elementInjectors[0];
                 expect(elInj.get(MyDir).dirProp).toEqual('Hello World!');
                 expect(elInj.get(ChildComp).dirProp).toEqual(null);

                 async.done();
               });
         }));

      it('should support directives where a binding attribute is not given',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             // No attribute "el-prop" specified.
             template: '<p my-dir></p>',
             directives: [MyDir]
           }));

           tb.createView(MyComp, {context: ctx}).then((view) => { async.done(); });
         }));

      it('should support directives where a selector matches property binding',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(
               MyComp, new viewAnn.View({template: '<p [id]="ctxProp"></p>', directives: [IdDir]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var idDir = view.rawView.elementInjectors[0].get(IdDir);

                 ctx.ctxProp = 'some_id';
                 view.detectChanges();
                 expect(idDir.id).toEqual('some_id');

                 ctx.ctxProp = 'other_id';
                 view.detectChanges();
                 expect(idDir.id).toEqual('other_id');

                 async.done();
               });
         }));

      it('should allow specifying directives as bindings',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<child-cmp></child-cmp>',
             directives: [bind(ChildComp).toClass(ChildComp)]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 view.detectChanges();

                 expect(view.rootNodes).toHaveText('hello');
                 async.done();
               });
         }));

      it('should read directives metadata from their binding token',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div public-api><div needs-public-api></div></div>',
             directives: [bind(PublicApi).toClass(PrivateImpl), NeedsPublicApi]
           }));

           tb.createView(MyComp, {context: ctx}).then((view) => { async.done(); });
         }));

      it('should support template directives via `<template>` elements.',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template:
                 '<div><template some-viewport var-greeting="some-tmpl"><copy-me>{{greeting}}</copy-me></template></div>',
             directives: [SomeViewport]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 view.detectChanges();

                 var childNodesOfWrapper = view.rootNodes[0].childNodes;
                 // 1 template + 2 copies.
                 expect(childNodesOfWrapper.length).toBe(3);
                 expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
                 expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
                 async.done();
               });
         }));

      it('should support template directives via `template` attribute.',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template:
                 '<div><copy-me template="some-viewport: var greeting=some-tmpl">{{greeting}}</copy-me></div>',
             directives: [SomeViewport]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 view.detectChanges();

                 var childNodesOfWrapper = view.rootNodes[0].childNodes;
                 // 1 template + 2 copies.
                 expect(childNodesOfWrapper.length).toBe(3);
                 expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
                 expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
                 async.done();
               });
         }));

      it('should allow to transplant embedded ProtoViews into other ViewContainers',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template:
                 '<some-directive><toolbar><template toolbarpart var-toolbar-prop="toolbarProp">{{ctxProp}},{{toolbarProp}},<cmp-with-parent></cmp-with-parent></template></toolbar></some-directive>',
             directives: [SomeDirective, CompWithParent, ToolbarComponent, ToolbarPart]
           }));

           ctx.ctxProp = 'From myComp';
           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes)
                     .toHaveText(
                         'TOOLBAR(From myComp,From toolbar,Component with an injected parent)');

                 async.done();
               });
         }));

      describe("variable bindings", () => {
        it('should assign a component to a var-',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<p><child-cmp var-alice></child-cmp></p>',
               directives: [ChildComp]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   expect(view.rawView.locals).not.toBe(null);
                   expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);

                   async.done();
                 })
           }));

        it('should assign a directive to a var-',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<p><div [export-dir] #localdir="dir"></div></p>',
               directives: [ExportDir]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   expect(view.rawView.locals).not.toBe(null);
                   expect(view.rawView.locals.get('localdir')).toBeAnInstanceOf(ExportDir);

                   async.done();
                 });
           }));

        it('should make the assigned component accessible in property bindings',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<p><child-cmp var-alice></child-cmp>{{alice.ctxProp}}</p>',
               directives: [ChildComp]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   view.detectChanges();

                   expect(view.rootNodes).toHaveText('hellohello');  // this first one is the
                                                                     // component, the second one is
                                                                     // the text binding
                   async.done();
                 })
           }));

        it('should assign two component instances each with a var-',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>',
               directives: [ChildComp]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {

                   expect(view.rawView.locals).not.toBe(null);
                   expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);
                   expect(view.rawView.locals.get('bob')).toBeAnInstanceOf(ChildComp);
                   expect(view.rawView.locals.get('alice'))
                       .not.toBe(view.rawView.locals.get('bob'));

                   async.done();
                 })
           }));

        it('should assign the component instance to a var- with shorthand syntax',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(
                 MyComp,
                 new viewAnn.View(
                     {template: '<child-cmp #alice></child-cmp>', directives: [ChildComp]}));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {

                   expect(view.rawView.locals).not.toBe(null);
                   expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);

                   async.done();
                 })
           }));

        it('should assign the element instance to a user-defined variable',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(
                 MyComp, new viewAnn.View({template: '<p><div var-alice><i>Hello</i></div></p>'}));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   expect(view.rawView.locals).not.toBe(null);

                   var value = view.rawView.locals.get('alice');
                   expect(value).not.toBe(null);
                   expect(value.tagName.toLowerCase()).toEqual('div');

                   async.done();
                 })
           }));

        it('should change dash-case to camel-case',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<p><child-cmp var-super-alice></child-cmp></p>',
               directives: [ChildComp]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   expect(view.rawView.locals).not.toBe(null);
                   expect(view.rawView.locals.get('superAlice')).toBeAnInstanceOf(ChildComp);

                   async.done();
                 });
           }));
      });

      describe("ON_PUSH components", () => {
        it("should use ChangeDetectorRef to manually request a check",
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

             tb.overrideView(MyComp, new viewAnn.View({
               template: '<push-cmp-with-ref #cmp></push-cmp-with-ref>',
               directives: [[[PushCmpWithRef]]]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {

                   var cmp = view.rawView.locals.get('cmp');

                   view.detectChanges();
                   expect(cmp.numberOfChecks).toEqual(1);

                   view.detectChanges();
                   expect(cmp.numberOfChecks).toEqual(1);

                   cmp.propagate();

                   view.detectChanges();
                   expect(cmp.numberOfChecks).toEqual(2);
                   async.done();
                 })
           }));

        it("should be checked when its bindings got updated",
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

             tb.overrideView(MyComp, new viewAnn.View({
               template: '<push-cmp [prop]="ctxProp" #cmp></push-cmp>',
               directives: [[[PushCmp]]]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   var cmp = view.rawView.locals.get('cmp');

                   ctx.ctxProp = "one";
                   view.detectChanges();
                   expect(cmp.numberOfChecks).toEqual(1);

                   ctx.ctxProp = "two";
                   view.detectChanges();
                   expect(cmp.numberOfChecks).toEqual(2);

                   async.done();
                 })
           }));

        it('should not affect updating properties on the component',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<push-cmp-with-ref [prop]="ctxProp" #cmp></push-cmp-with-ref>',
               directives: [[[PushCmpWithRef]]]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {

                   var cmp = view.rawView.locals.get('cmp');

                   ctx.ctxProp = "one";
                   view.detectChanges();
                   expect(cmp.prop).toEqual("one");

                   ctx.ctxProp = "two";
                   view.detectChanges();
                   expect(cmp.prop).toEqual("two");

                   async.done();
                 })
           }));
      });

      it('should create a component that injects a @Parent',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template:
                 '<some-directive><cmp-with-parent #child></cmp-with-parent></some-directive>',
             directives: [SomeDirective, CompWithParent]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 var childComponent = view.rawView.locals.get('child');
                 expect(childComponent.myParent).toBeAnInstanceOf(SomeDirective);

                 async.done();
               })
         }));

      it('should create a component that injects an @Ancestor',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: `
            <some-directive>
              <p>
                <cmp-with-ancestor #child></cmp-with-ancestor>
              </p>
            </some-directive>`,
             directives: [SomeDirective, CompWithAncestor]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 var childComponent = view.rawView.locals.get('child');
                 expect(childComponent.myAncestor).toBeAnInstanceOf(SomeDirective);

                 async.done();
               })
         }));

      it('should create a component that injects an @Ancestor through viewcontainer directive',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: `
            <some-directive>
              <p *ng-if="true">
                <cmp-with-ancestor #child></cmp-with-ancestor>
              </p>
            </some-directive>`,
             directives: [SomeDirective, CompWithAncestor, NgIf]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 view.detectChanges();

                 var subview = view.rawView.viewContainers[1].views[0];
                 var childComponent = subview.locals.get('child');
                 expect(childComponent.myAncestor).toBeAnInstanceOf(SomeDirective);

                 async.done();
               });
         }));

      it('should support events via EventEmitter',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div emitter listener></div>',
             directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 var injector = view.rawView.elementInjectors[0];

                 var emitter = injector.get(DirectiveEmitingEvent);
                 var listener = injector.get(DirectiveListeningEvent);

                 expect(listener.msg).toEqual('');

                 ObservableWrapper.subscribe(emitter.event, (_) => {
                   expect(listener.msg).toEqual('fired !');
                   async.done();
                 });

                 emitter.fireEvent('fired !');
               });
         }));

      it('should support [()] syntax',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div [(control)]="ctxProp" two-way></div>',
             directives: [DirectiveWithTwoWayBinding]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var injector = view.rawView.elementInjectors[0];
                 var dir = injector.get(DirectiveWithTwoWayBinding);

                 ctx.ctxProp = 'one';
                 view.detectChanges();

                 expect(dir.value).toEqual('one');

                 ObservableWrapper.subscribe(dir.control, (_) => {
                   expect(ctx.ctxProp).toEqual('two');
                   async.done();
                 });

                 dir.triggerChange('two');
               });
         }));

      if (DOM.supportsDOMEvents()) {
        it("should support invoking methods on the host element via hostActions",
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<div update-host-actions></div>',
               directives: [DirectiveUpdatingHostActions]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   var injector = view.rawView.elementInjectors[0];
                   var domElement = view.rootNodes[0];
                   var updateHost = injector.get(DirectiveUpdatingHostActions);

                   ObservableWrapper.subscribe(updateHost.setAttr, (_) => {
                     expect(DOM.hasAttribute(domElement, 'update-host-actions')).toBe(true);
                     async.done();
                   });

                   updateHost.triggerSetAttr('value');
                 });
           }));
      }

      it('should support render events',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div listener></div>', directives: [DirectiveListeningDomEvent]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {

                 var injector = view.rawView.elementInjectors[0];

                 var listener = injector.get(DirectiveListeningDomEvent);

                 dispatchEvent(view.rootNodes[0], 'domEvent');

                 expect(listener.eventType).toEqual('domEvent');

                 async.done();
               });
         }));

      it('should support render global events',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div listener></div>', directives: [DirectiveListeningDomEvent]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var injector = view.rawView.elementInjectors[0];

                 var listener = injector.get(DirectiveListeningDomEvent);
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(listener.eventType).toEqual('window_domEvent');

                 listener = injector.get(DirectiveListeningDomEvent);
                 dispatchEvent(DOM.getGlobalEventTarget("document"), 'domEvent');
                 expect(listener.eventType).toEqual('document_domEvent');

                 view.destroy();
                 listener = injector.get(DirectiveListeningDomEvent);
                 dispatchEvent(DOM.getGlobalEventTarget("body"), 'domEvent');
                 expect(listener.eventType).toEqual('');

                 async.done();
               });
         }));

      it('should support updating host element via hostAttributes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div update-host-attributes></div>',
             directives: [DirectiveUpdatingHostAttributes]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 view.detectChanges();

                 expect(DOM.getAttribute(view.rootNodes[0], "role")).toEqual("button");

                 async.done();
               });
         }));

      it('should support updating host element via hostProperties',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div update-host-properties></div>',
             directives: [DirectiveUpdatingHostProperties]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var injector = view.rawView.elementInjectors[0];
                 var updateHost = injector.get(DirectiveUpdatingHostProperties);

                 updateHost.id = "newId";

                 view.detectChanges();

                 expect(view.rootNodes[0].id).toEqual("newId");

                 async.done();
               });
         }));


      if (DOM.supportsDOMEvents()) {
        it('should support preventing default on render events',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template:
                   '<input type="checkbox" listenerprevent></input><input type="checkbox" listenernoprevent></input>',
               directives:
                   [DirectiveListeningDomEventPrevent, DirectiveListeningDomEventNoPrevent]
             }));

             tb.createView(MyComp, {context: ctx})
                 .then((view) => {
                   expect(DOM.getChecked(view.rootNodes[0])).toBeFalsy();
                   expect(DOM.getChecked(view.rootNodes[1])).toBeFalsy();
                   DOM.dispatchEvent(view.rootNodes[0], DOM.createMouseEvent('click'));
                   DOM.dispatchEvent(view.rootNodes[1], DOM.createMouseEvent('click'));
                   expect(DOM.getChecked(view.rootNodes[0])).toBeFalsy();
                   expect(DOM.getChecked(view.rootNodes[1])).toBeTruthy();
                   async.done();
                 });
           }));
      }

      it('should support render global events from multiple directives',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<div *ng-if="ctxBoolProp" listener listenerother></div>',
             directives: [NgIf, DirectiveListeningDomEvent, DirectiveListeningDomEventOther]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 globalCounter = 0;
                 ctx.ctxBoolProp = true;
                 view.detectChanges();

                 var subview = view.rawView.viewContainers[0].views[0];
                 var injector = subview.elementInjectors[0];
                 var listener = injector.get(DirectiveListeningDomEvent);
                 var listenerother = injector.get(DirectiveListeningDomEventOther);
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(listener.eventType).toEqual('window_domEvent');
                 expect(listenerother.eventType).toEqual('other_domEvent');
                 expect(globalCounter).toEqual(1);

                 ctx.ctxBoolProp = false;
                 view.detectChanges();
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(globalCounter).toEqual(1);

                 ctx.ctxBoolProp = true;
                 view.detectChanges();
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(globalCounter).toEqual(2);

                 async.done();
               });
         }));

      describe('dynamic ViewContainers', () => {

        it('should allow to create a ViewContainerRef at any bound location',
           inject([TestBed, AsyncTestCompleter, Compiler], (tb: TestBed, async, compiler) => {
             tb.overrideView(MyComp, new viewAnn.View({
               template: '<div><dynamic-vp #dynamic></dynamic-vp></div>',
               directives: [DynamicViewport]
             }));

             tb.createView(MyComp).then((view) => {
               var dynamicVp = view.rawView.elementInjectors[0].get(DynamicViewport);
               dynamicVp.done.then((_) => {
                 view.detectChanges();
                 expect(view.rootNodes).toHaveText('dynamic greet');
                 async.done();
               });
             });
           }));

      });

      it('should support static attributes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<input static type="text" title>', directives: [NeedsAttribute]}));
           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var injector = view.rawView.elementInjectors[0];
                 var needsAttribute = injector.get(NeedsAttribute);
                 expect(needsAttribute.typeAttribute).toEqual('text');
                 expect(needsAttribute.titleAttribute).toEqual('');
                 expect(needsAttribute.fooAttribute).toEqual(null);

                 async.done();
               });
         }));
    });

    describe("dependency injection", () => {
      it("should support hostInjector",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: `
            <directive-providing-injectable>
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
            </directive-providing-injectable>
          `,
             directives: [DirectiveProvidingInjectable, DirectiveConsumingInjectable]
           }));
           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var comp = view.rawView.locals.get("consuming");
                 expect(comp.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support viewInjector",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(DirectiveProvidingInjectableInView, new viewAnn.View({
             template: `
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
          `,
             directives: [DirectiveConsumingInjectable]
           }));
           tb.createView(DirectiveProvidingInjectableInView,
                         {context: new DirectiveProvidingInjectableInView()})
               .then((view) => {
                 var comp = view.rawView.locals.get("consuming");
                 expect(comp.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support unbounded lookup",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: `
            <directive-providing-injectable>
              <directive-containing-directive-consuming-an-injectable #dir>
              </directive-containing-directive-consuming-an-injectable>
            </directive-providing-injectable>
          `,
             directives: [
               DirectiveProvidingInjectable,
               DirectiveContainingDirectiveConsumingAnInjectable
             ]
           }));

           tb.overrideView(DirectiveContainingDirectiveConsumingAnInjectable, new viewAnn.View({
             template: `
            <directive-consuming-injectable-unbounded></directive-consuming-injectable-unbounded>
          `,
             directives: [DirectiveConsumingInjectableUnbounded]
           }));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var comp = view.rawView.locals.get("dir");
                 expect(comp.directive.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support the event-bus scenario",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: `
            <grand-parent-providing-event-bus>
              <parent-providing-event-bus>
                <child-consuming-event-bus>
                </child-consuming-event-bus>
              </parent-providing-event-bus>
            </grand-parent-providing-event-bus>
          `,
             directives:
                 [GrandParentProvidingEventBus, ParentProvidingEventBus, ChildConsumingEventBus]
           }));
           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 var eis = view.rawView.elementInjectors;
                 var childRawView = view.rawView.componentChildViews[1];

                 var grandParent = eis[0].get(GrandParentProvidingEventBus);
                 var parent = eis[1].get(ParentProvidingEventBus);
                 var child1 = eis[2].get(ChildConsumingEventBus);
                 var child2 = childRawView.elementInjectors[0].get(ChildConsumingEventBus);

                 expect(grandParent.bus.name).toEqual("grandparent");
                 expect(parent.bus.name).toEqual("parent");
                 expect(parent.grandParentBus).toBe(grandParent.bus);
                 expect(child1.bus).toBe(parent.bus);
                 expect(child2.bus).toBe(parent.bus);

                 async.done();
               });
         }));
    });

    describe("error handling", () => {
      it('should report a meaningful error when a directive is missing annotation',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp,
                           new viewAnn.View({directives: [SomeDirectiveMissingAnnotation]}));

           PromiseWrapper.catchError(tb.createView(MyComp, {context: ctx}), (e) => {
             expect(e.message).toEqual(
                 `No Directive annotation found on ${stringify(SomeDirectiveMissingAnnotation)}`);
             async.done();
             return null;
           });
         }));

      it('should report a meaningful error when a directive is null',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

           tb.overrideView(MyComp, new viewAnn.View({directives: [[null]]}));

           PromiseWrapper.catchError(tb.createView(MyComp, {context: ctx}), (e) => {
             expect(e.message).toEqual(
                 `Unexpected directive value 'null' on the View of component '${stringify(MyComp)}'`);
             async.done();
             return null;
           });
         }));

      if (!IS_DARTIUM) {
        it('should report a meaningful error when a directive is undefined',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

             var undefinedValue;

             tb.overrideView(MyComp, new viewAnn.View({directives: [undefinedValue]}));

             PromiseWrapper.catchError(tb.createView(MyComp, {context: ctx}), (e) => {
               expect(e.message).toEqual(
                   `Unexpected directive value 'undefined' on the View of component '${stringify(MyComp)}'`);
               async.done();
               return null;
             });
           }));
      }

      it('should specify a location of an error that happened during change detection (text)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

           tb.overrideView(MyComp, new viewAnn.View({template: '{{a.b}}'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 expect(() => view.detectChanges())
                     .toThrowError(containsRegexp(`{{a.b}} in ${stringify(MyComp)}`));
                 async.done();
               })
         }));

      it('should specify a location of an error that happened during change detection (element property)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

           tb.overrideView(MyComp, new viewAnn.View({template: '<div [prop]="a.b"></div>'}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 expect(() => view.detectChanges())
                     .toThrowError(containsRegexp(`a.b in ${stringify(MyComp)}`));
                 async.done();
               })
         }));

      it('should specify a location of an error that happened during change detection (directive property)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {

           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<child-cmp [prop]="a.b"></child-cmp>', directives: [ChildComp]}));

           tb.createView(MyComp, {context: ctx})
               .then((view) => {
                 expect(() => view.detectChanges())
                     .toThrowError(containsRegexp(`a.b in ${stringify(MyComp)}`));
                 async.done();
               })
         }));
    });

    it('should support imperative views',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.overrideView(MyComp, new viewAnn.View({
           template: '<simple-imp-cmp></simple-imp-cmp>',
           directives: [SimpleImperativeViewComponent]
         }));
         tb.createView(MyComp).then((view) => {
           expect(view.rootNodes).toHaveText('hello imp view');
           async.done();
         });
       }));

    it('should support free embedded views',
       inject([TestBed, AsyncTestCompleter, ANCHOR_ELEMENT], (tb, async, anchorElement) => {
         tb.overrideView(MyComp, new viewAnn.View({
           template: '<div><div *some-impvp="ctxBoolProp">hello</div></div>',
           directives: [SomeImperativeViewport]
         }));
         tb.createView(MyComp).then((view) => {
           view.detectChanges();
           expect(anchorElement).toHaveText('');

           view.context.ctxBoolProp = true;
           view.detectChanges();
           expect(anchorElement).toHaveText('hello');

           view.context.ctxBoolProp = false;
           view.detectChanges();
           expect(view.rootNodes).toHaveText('');

           async.done();
         });
       }));

    // Disabled until a solution is found, refs:
    // - https://github.com/angular/angular/issues/776
    // - https://github.com/angular/angular/commit/81f3f32
    xdescribe('Missing directive checks', () => {

      if (assertionsEnabled()) {
        function expectCompileError(tb, inlineTpl, errMessage, done) {
          tb.overrideView(MyComp, new viewAnn.View({template: inlineTpl}));
          PromiseWrapper.then(
              tb.createView(MyComp),
              (value) => {
                throw new BaseException(
                    "Test failure: should not have come here as an exception was expected");
              },
              (err) => {
                expect(err.message).toEqual(errMessage);
                done();
              });
        }

        it('should raise an error if no directive is registered for a template with template bindings',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             expectCompileError(tb, '<div><div template="if: foo"></div></div>',
                                'Missing directive to handle \'if\' in <div template="if: foo">',
                                () => async.done());
           }));

        it('should raise an error for missing template directive (1)',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             expectCompileError(tb, '<div><template foo></template></div>',
                                'Missing directive to handle: <template foo>', () => async.done());
           }));

        it('should raise an error for missing template directive (2)',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             expectCompileError(tb, '<div><template *ng-if="condition"></template></div>',
                                'Missing directive to handle: <template *ng-if="condition">',
                                () => async.done());
           }));

        it('should raise an error for missing template directive (3)',
           inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
             expectCompileError(
                 tb, '<div *ng-if="condition"></div>',
                 'Missing directive to handle \'if\' in MyComp: <div *ng-if="condition">',
                 () => async.done());
           }));
      }
    });
  });
}

@Injectable()
class MyService {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'simple-imp-cmp'})
@View({renderer: 'simple-imp-cmp-renderer', template: ''})
@Injectable()
class SimpleImperativeViewComponent {
  done;

  constructor(self: ElementRef, viewManager: AppViewManager, renderer: DomRenderer) {
    var shadowViewRef = viewManager.getComponentView(self);
    renderer.setComponentViewRootNodes(shadowViewRef.render, [el('hello imp view')]);
  }
}


@Directive({selector: 'dynamic-vp'})
@Injectable()
class DynamicViewport {
  done;
  constructor(vc: ViewContainerRef, inj: Injector, compiler: Compiler) {
    var myService = new MyService();
    myService.greeting = 'dynamic greet';
    this.done = compiler.compileInHost(ChildCompUsingService)
                    .then((hostPv) => {vc.create(hostPv, 0, null,
                                                 inj.createChildFromResolved(Injector.resolve(
                                                     [bind(MyService).toValue(myService)])))});
  }
}

@Directive({selector: '[my-dir]', properties: ['dirProp: elprop']})
@Injectable()
class MyDir {
  dirProp: string;
  constructor() { this.dirProp = ''; }
}

@Component({selector: 'push-cmp', properties: ['prop'], changeDetection: ON_PUSH})
@View({template: '{{field}}'})
@Injectable()
class PushCmp {
  numberOfChecks: number;
  prop;

  constructor() { this.numberOfChecks = 0; }

  get field() {
    this.numberOfChecks++;
    return "fixed";
  }
}

@Component({selector: 'push-cmp-with-ref', properties: ['prop'], changeDetection: ON_PUSH})
@View({template: '{{field}}'})
@Injectable()
class PushCmpWithRef {
  numberOfChecks: number;
  ref: ChangeDetectorRef;
  prop;

  constructor(ref: ChangeDetectorRef) {
    this.numberOfChecks = 0;
    this.ref = ref;
  }

  get field() {
    this.numberOfChecks++;
    return "fixed";
  }

  propagate() { this.ref.requestCheck(); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
@Injectable()
class MyComp {
  ctxProp: string;
  ctxNumProp;
  ctxBoolProp;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }
}

@Component({selector: 'component-with-pipes', properties: ["prop: prop | double"]})
@View({template: ''})
@Injectable()
class ComponentWithPipes {
  prop: string;
}

@Component({
  selector: 'child-cmp',
  appInjector: [MyService],
})
@View({directives: [MyDir], template: '{{ctxProp}}'})
@Injectable()
class ChildComp {
  ctxProp: string;
  dirProp: string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Component({selector: 'child-cmp-svc'})
@View({template: '{{ctxProp}}'})
@Injectable()
class ChildCompUsingService {
  ctxProp: string;
  constructor(service: MyService) { this.ctxProp = service.greeting; }
}

@Directive({selector: 'some-directive'})
@Injectable()
class SomeDirective {
}

class SomeDirectiveMissingAnnotation {}

@Component({selector: 'cmp-with-parent'})
@View({template: '<p>Component with an injected parent</p>', directives: [SomeDirective]})
@Injectable()
class CompWithParent {
  myParent: SomeDirective;
  constructor(@Parent() someComp: SomeDirective) { this.myParent = someComp; }
}

@Component({selector: 'cmp-with-ancestor'})
@View({template: '<p>Component with an injected ancestor</p>', directives: [SomeDirective]})
@Injectable()
class CompWithAncestor {
  myAncestor: SomeDirective;
  constructor(@Ancestor() someComp: SomeDirective) { this.myAncestor = someComp; }
}

@Component({selector: '[child-cmp2]', appInjector: [MyService]})
@Injectable()
class ChildComp2 {
  ctxProp: string;
  dirProp: string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Directive({selector: '[some-viewport]'})
@Injectable()
class SomeViewport {
  constructor(container: ViewContainerRef, protoView: ProtoViewRef) {
    container.create(protoView).setLocal('some-tmpl', 'hello');
    container.create(protoView).setLocal('some-tmpl', 'again');
  }
}

@Injectable()
class DoublePipe extends Pipe {
  supports(obj) { return true; }

  transform(value) { return `${value}${value}`; }
}

@Injectable()
class DoublePipeFactory {
  supports(obj) { return true; }

  create(cdRef) { return new DoublePipe(); }
}

@Directive({selector: '[emitter]', events: ['event']})
@Injectable()
class DirectiveEmitingEvent {
  msg: string;
  event: EventEmitter;

  constructor() {
    this.msg = '';
    this.event = new EventEmitter();
  }

  fireEvent(msg: string) { ObservableWrapper.callNext(this.event, msg); }
}

@Directive({selector: '[update-host-attributes]', host: {'role': 'button'}})
@Injectable()
class DirectiveUpdatingHostAttributes {
}

@Directive({selector: '[update-host-properties]', host: {'[id]': 'id'}})
@Injectable()
class DirectiveUpdatingHostProperties {
  id: string;

  constructor() { this.id = "one"; }
}

@Directive({
  selector: '[update-host-actions]',
  host: {'@setAttr': 'setAttribute("key", $action["attrValue"])'}
})
@Injectable()
class DirectiveUpdatingHostActions {
  setAttr: EventEmitter;

  constructor() { this.setAttr = new EventEmitter(); }

  triggerSetAttr(attrValue) { ObservableWrapper.callNext(this.setAttr, {'attrValue': attrValue}); }
}

@Directive({selector: '[listener]', host: {'(event)': 'onEvent($event)'}})
@Injectable()
class DirectiveListeningEvent {
  msg: string;

  constructor() { this.msg = ''; }

  onEvent(msg: string) { this.msg = msg; }
}

@Directive({
  selector: '[listener]',
  host: {
    '(domEvent)': 'onEvent($event.type)',
    '(window:domEvent)': 'onWindowEvent($event.type)',
    '(document:domEvent)': 'onDocumentEvent($event.type)',
    '(body:domEvent)': 'onBodyEvent($event.type)'
  }
})
@Injectable()
class DirectiveListeningDomEvent {
  eventType: string;
  constructor() { this.eventType = ''; }
  onEvent(eventType: string) { this.eventType = eventType; }
  onWindowEvent(eventType: string) { this.eventType = "window_" + eventType; }
  onDocumentEvent(eventType: string) { this.eventType = "document_" + eventType; }
  onBodyEvent(eventType: string) { this.eventType = "body_" + eventType; }
}

var globalCounter = 0;
@Directive({selector: '[listenerother]', host: {'(window:domEvent)': 'onEvent($event.type)'}})
@Injectable()
class DirectiveListeningDomEventOther {
  eventType: string;
  counter: int;
  constructor() { this.eventType = ''; }
  onEvent(eventType: string) {
    globalCounter++;
    this.eventType = "other_" + eventType;
  }
}

@Directive({selector: '[listenerprevent]', host: {'(click)': 'onEvent($event)'}})
@Injectable()
class DirectiveListeningDomEventPrevent {
  onEvent(event) { return false; }
}

@Directive({selector: '[listenernoprevent]', host: {'(click)': 'onEvent($event)'}})
@Injectable()
class DirectiveListeningDomEventNoPrevent {
  onEvent(event) { return true; }
}

@Directive({selector: '[id]', properties: ['id']})
@Injectable()
class IdDir {
  id: string;
}

@Directive({selector: '[static]'})
@Injectable()
class NeedsAttribute {
  typeAttribute;
  titleAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: String, @Attribute('title') titleAttribute: String,
              @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Directive({selector: '[public-api]'})
@Injectable()
class PublicApi {
}

@Directive({selector: '[private-impl]'})
@Injectable()
class PrivateImpl extends PublicApi {
}

@Directive({selector: '[needs-public-api]'})
@Injectable()
class NeedsPublicApi {
  constructor(@Parent() api: PublicApi) { expect(api instanceof PrivateImpl).toBe(true); }
}

@Directive({selector: '[toolbarpart]'})
@Injectable()
class ToolbarPart {
  protoViewRef: ProtoViewRef;
  elementRef: ElementRef;
  constructor(protoViewRef: ProtoViewRef, elementRef: ElementRef) {
    this.elementRef = elementRef;
    this.protoViewRef = protoViewRef;
  }
}

@Directive({selector: '[toolbar-vc]', properties: ['toolbarVc']})
@Injectable()
class ToolbarViewContainer {
  vc: ViewContainerRef;
  constructor(vc: ViewContainerRef) { this.vc = vc; }

  set toolbarVc(part: ToolbarPart) {
    var view = this.vc.create(part.protoViewRef, 0, part.elementRef);
    view.setLocal('toolbarProp', 'From toolbar');
  }
}

@Component({selector: 'toolbar'})
@View({
  template: 'TOOLBAR(<div *ng-for="var part of query" [toolbar-vc]="part"></div>)',
  directives: [ToolbarViewContainer, NgFor]
})
@Injectable()
class ToolbarComponent {
  query: QueryList<ToolbarPart>;
  ctxProp: string;

  constructor(@Query(ToolbarPart) query: QueryList<ToolbarPart>) {
    this.ctxProp = 'hello world';
    this.query = query;
  }
}

@Directive({selector: '[two-way]', properties: ['value: control'], events: ['control']})
@Injectable()
class DirectiveWithTwoWayBinding {
  control: EventEmitter;
  value: any;

  constructor() { this.control = new EventEmitter(); }

  triggerChange(value) { ObservableWrapper.callNext(this.control, value); }
}

@Injectable()
class InjectableService {
}

@Directive({selector: 'directive-providing-injectable', hostInjector: [InjectableService]})
@Injectable()
class DirectiveProvidingInjectable {
}

@Component({selector: 'directive-providing-injectable', viewInjector: [InjectableService]})
@View({template: ''})
@Injectable()
class DirectiveProvidingInjectableInView {
}

@Component({
  selector: 'directive-providing-injectable',
  hostInjector: [new Binding(InjectableService, {toValue: 'host'})],
  viewInjector: [new Binding(InjectableService, {toValue: 'view'})]
})
@View({template: ''})
@Injectable()
class DirectiveProvidingInjectableInHostAndView {
}


@Component({selector: 'directive-consuming-injectable'})
@View({template: ''})
@Injectable()
class DirectiveConsumingInjectable {
  injectable;

  constructor(@Ancestor() @Inject(InjectableService) injectable) { this.injectable = injectable; }
}



@Component({selector: 'directive-containing-directive-consuming-an-injectable'})
@Injectable()
class DirectiveContainingDirectiveConsumingAnInjectable {
  directive;
}

@Component({selector: 'directive-consuming-injectable-unbounded'})
@View({template: ''})
@Injectable()
class DirectiveConsumingInjectableUnbounded {
  injectable;

  constructor(@Unbounded() injectable: InjectableService,
              @Ancestor() parent: DirectiveContainingDirectiveConsumingAnInjectable) {
    this.injectable = injectable;
    parent.directive = this;
  }
}


@CONST()
class EventBus {
  parentEventBus: EventBus;
  name: string;

  constructor(parentEventBus: EventBus, name: string) {
    this.parentEventBus = parentEventBus;
    this.name = name;
  }
}

@Directive({
  selector: 'grand-parent-providing-event-bus',
  hostInjector: [new Binding(EventBus, {toValue: new EventBus(null, "grandparent")})]
})
class GrandParentProvidingEventBus {
  bus: EventBus;

  constructor(bus: EventBus) { this.bus = bus; }
}

function createParentBus(peb) {
  return new EventBus(peb, "parent");
}

@Component({
  selector: 'parent-providing-event-bus',
  hostInjector: [
    new Binding(EventBus,
                {toFactory: createParentBus, deps: [[EventBus, new visAnn.Unbounded()]]})
  ]
})
@View({
  directives: [forwardRef(() => ChildConsumingEventBus)],
  template: `
    <child-consuming-event-bus></child-consuming-event-bus>
  `
})
class ParentProvidingEventBus {
  bus: EventBus;
  grandParentBus: EventBus;

  constructor(bus: EventBus, @Unbounded() grandParentBus: EventBus) {
    this.bus = bus;
    this.grandParentBus = grandParentBus;
  }
}

@Directive({selector: 'child-consuming-event-bus'})
class ChildConsumingEventBus {
  bus: EventBus;

  constructor(@Unbounded() bus: EventBus) { this.bus = bus; }
}

@Directive({selector: '[some-impvp]', properties: ['someImpvp']})
@Injectable()
class SomeImperativeViewport {
  view: ViewRef;
  anchor;
  constructor(public element: ElementRef, public protoView: ProtoViewRef,
              public viewManager: AppViewManager, public renderer: DomRenderer,
              @Inject(ANCHOR_ELEMENT) anchor) {
    this.view = null;
    this.anchor = anchor;
  }

  set someImpvp(value: boolean) {
    if (isPresent(this.view)) {
      this.viewManager.destroyFreeEmbeddedView(this.element, this.view);
      this.view = null;
    }
    if (value) {
      this.view = this.viewManager.createFreeEmbeddedView(this.element, this.protoView);
      var nodes = this.renderer.getRootNodes(this.view.render);
      for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(this.anchor, nodes[i]);
      }
    }
  }
}

@Directive({selector: '[export-dir]', exportAs: 'dir'})
class ExportDir {
}
