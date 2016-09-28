/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ComponentFactory, Host, Inject, Injectable, Injector, NO_ERRORS_SCHEMA, NgModule, OnDestroy, OpaqueToken, ReflectiveInjector, SkipSelf} from '@angular/core';
import {ChangeDetectionStrategy, ChangeDetectorRef, PipeTransform} from '@angular/core/src/change_detection/change_detection';
import {ComponentFactoryResolver} from '@angular/core/src/linker/component_factory_resolver';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {QueryList} from '@angular/core/src/linker/query_list';
import {TemplateRef, TemplateRef_} from '@angular/core/src/linker/template_ref';
import {ViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {EmbeddedViewRef} from '@angular/core/src/linker/view_ref';
import {Attribute, Component, ContentChildren, Directive, HostBinding, HostListener, Input, Output, Pipe} from '@angular/core/src/metadata';
import {Renderer} from '@angular/core/src/render';
import {TestBed, async, fakeAsync, getTestBed, tick} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent, el} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import {EventEmitter} from '../../src/facade/async';
import {isBlank, isPresent, stringify} from '../../src/facade/lang';

const ANCHOR_ELEMENT = new OpaqueToken('AnchorElement');

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });

  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('integration tests', function() {

    beforeEach(() => { TestBed.configureCompiler({useJit: useJit}); });

    describe('react to record changes', function() {
      it('should consume text node changes', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div>{{ctxProp}}</div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
        fixture.componentInstance.ctxProp = 'Hello World!';

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('Hello World!');
      });

      it('should update text node with a blank string when interpolation evaluates to null', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div>{{null}}{{ctxProp}}</div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
        fixture.componentInstance.ctxProp = null;

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('');
      });

      it('should consume element binding changes', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [id]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Hello World!';
        fixture.detectChanges();

        expect(fixture.debugElement.children[0].nativeElement.id).toEqual('Hello World!');
      });

      it('should consume binding to aria-* attributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [attr.aria-label]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Initial aria label';
        fixture.detectChanges();
        expect(getDOM().getAttribute(fixture.debugElement.children[0].nativeElement, 'aria-label'))
            .toEqual('Initial aria label');

        fixture.componentInstance.ctxProp = 'Changed aria label';
        fixture.detectChanges();
        expect(getDOM().getAttribute(fixture.debugElement.children[0].nativeElement, 'aria-label'))
            .toEqual('Changed aria label');
      });

      it('should remove an attribute when attribute expression evaluates to null', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [attr.foo]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'bar';
        fixture.detectChanges();
        expect(getDOM().getAttribute(fixture.debugElement.children[0].nativeElement, 'foo'))
            .toEqual('bar');

        fixture.componentInstance.ctxProp = null;
        fixture.detectChanges();
        expect(getDOM().hasAttribute(fixture.debugElement.children[0].nativeElement, 'foo'))
            .toBeFalsy();
      });

      it('should remove style when when style expression evaluates to null', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [style.height.px]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = '10';
        fixture.detectChanges();
        expect(getDOM().getStyle(fixture.debugElement.children[0].nativeElement, 'height'))
            .toEqual('10px');

        fixture.componentInstance.ctxProp = null;
        fixture.detectChanges();
        expect(getDOM().getStyle(fixture.debugElement.children[0].nativeElement, 'height'))
            .toEqual('');
      });

      it('should consume binding to property names where attr name and property name do not match',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp]});
           const template = '<div [tabindex]="ctxNumProp"></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           fixture.detectChanges();
           expect(fixture.debugElement.children[0].nativeElement.tabIndex).toEqual(0);

           fixture.componentInstance.ctxNumProp = 5;
           fixture.detectChanges();
           expect(fixture.debugElement.children[0].nativeElement.tabIndex).toEqual(5);
         });

      it('should consume binding to camel-cased properties', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<input [readOnly]="ctxBoolProp">';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.readOnly).toBeFalsy();

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.readOnly).toBeTruthy();
      });

      it('should consume binding to innerHtml', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div innerHtml="{{ctxProp}}"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Some <span>HTML</span>';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(fixture.debugElement.children[0].nativeElement))
            .toEqual('Some <span>HTML</span>');

        fixture.componentInstance.ctxProp = 'Some other <div>HTML</div>';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(fixture.debugElement.children[0].nativeElement))
            .toEqual('Some other <div>HTML</div>');
      });

      it('should consume binding to className using class alias', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div class="initial" [class]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var nativeEl = fixture.debugElement.children[0].nativeElement;
        fixture.componentInstance.ctxProp = 'foo bar';
        fixture.detectChanges();

        expect(nativeEl).toHaveCssClass('foo');
        expect(nativeEl).toHaveCssClass('bar');
        expect(nativeEl).not.toHaveCssClass('initial');
      });

      it('should consume directive watch expression change.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        const template = '<span>' +
            '<div my-dir [elprop]="ctxProp"></div>' +
            '<div my-dir elprop="Hi there!"></div>' +
            '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
            '<div my-dir elprop="One more {{ctxProp}}"></div>' +
            '</span>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Hello World!';
        fixture.detectChanges();

        var containerSpan = fixture.debugElement.children[0];

        expect(containerSpan.children[0].injector.get(MyDir).dirProp).toEqual('Hello World!');
        expect(containerSpan.children[1].injector.get(MyDir).dirProp).toEqual('Hi there!');
        expect(containerSpan.children[2].injector.get(MyDir).dirProp).toEqual('Hi there!');
        expect(containerSpan.children[3].injector.get(MyDir).dirProp)
            .toEqual('One more Hello World!');
      });

      describe('pipes', () => {
        it('should support pipes in bindings', () => {
          TestBed.configureTestingModule({declarations: [MyComp, MyDir, DoublePipe]});
          const template = '<div my-dir #dir="mydir" [elprop]="ctxProp | double"></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          fixture.componentInstance.ctxProp = 'a';
          fixture.detectChanges();

          var dir = fixture.debugElement.children[0].references['dir'];
          expect(dir.dirProp).toEqual('aa');
        });
      });

      it('should support nested components.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
        const template = '<child-cmp></child-cmp>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        expect(fixture.nativeElement).toHaveText('hello');
      });

      // GH issue 328 - https://github.com/angular/angular/issues/328
      it('should support different directive types on a single node', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ChildComp, MyDir]});
        const template = '<child-cmp my-dir [elprop]="ctxProp"></child-cmp>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Hello World!';
        fixture.detectChanges();

        var tc = fixture.debugElement.children[0];

        expect(tc.injector.get(MyDir).dirProp).toEqual('Hello World!');
        expect(tc.injector.get(ChildComp).dirProp).toEqual(null);
      });

      it('should support directives where a binding attribute is not given', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        const template = '<p my-dir></p>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
      });

      it('should execute a given directive once, even if specified multiple times', () => {
        TestBed.configureTestingModule(
            {declarations: [MyComp, DuplicateDir, DuplicateDir, [DuplicateDir, [DuplicateDir]]]});
        const template = '<p no-duplicate></p>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
        expect(fixture.nativeElement).toHaveText('noduplicate');
      });

      it('should support directives where a selector matches property binding', () => {
        TestBed.configureTestingModule({declarations: [MyComp, IdDir]});
        const template = '<p [id]="ctxProp"></p>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        var idDir = tc.injector.get(IdDir);

        fixture.componentInstance.ctxProp = 'some_id';
        fixture.detectChanges();
        expect(idDir.id).toEqual('some_id');

        fixture.componentInstance.ctxProp = 'other_id';
        fixture.detectChanges();
        expect(idDir.id).toEqual('other_id');
      });

      it('should support directives where a selector matches event binding', () => {
        TestBed.configureTestingModule({declarations: [MyComp, EventDir]});
        const template = '<p (customEvent)="doNothing()"></p>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        expect(tc.injector.get(EventDir)).not.toBe(null);
      });

      it('should read directives metadata from their binding token', () => {
        TestBed.configureTestingModule({declarations: [MyComp, PrivateImpl, NeedsPublicApi]});
        const template = '<div public-api><div needs-public-api></div></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
      });

      it('should support template directives via `<template>` elements.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeViewport]});
        const template =
            '<template some-viewport let-greeting="someTmpl"><span>{{greeting}}</span></template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        var childNodesOfWrapper = getDOM().childNodes(fixture.nativeElement);
        // 1 template + 2 copies.
        expect(childNodesOfWrapper.length).toBe(3);
        expect(childNodesOfWrapper[1]).toHaveText('hello');
        expect(childNodesOfWrapper[2]).toHaveText('again');
      });

      it('should not share empty context for template directives - issue #10045', () => {
        TestBed.configureTestingModule({declarations: [MyComp, PollutedContext, NoContext]});
        const template =
            '<template pollutedContext let-foo="bar">{{foo}}</template><template noContext let-foo="bar">{{foo}}</template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('baz');
      });

      it('should not detach views in ViewContainers when the parent view is destroyed.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeViewport]});
        const template =
            '<div *ngIf="ctxBoolProp"><template some-viewport let-greeting="someTmpl"><span>{{greeting}}</span></template></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        var ngIfEl = fixture.debugElement.children[0];
        var someViewport: SomeViewport = ngIfEl.childNodes[0].injector.get(SomeViewport);
        expect(someViewport.container.length).toBe(2);
        expect(ngIfEl.children.length).toBe(2);

        fixture.componentInstance.ctxBoolProp = false;
        fixture.detectChanges();

        expect(someViewport.container.length).toBe(2);
        expect(fixture.debugElement.children.length).toBe(0);
      });

      it('should use a comment while stamping out `<template>` elements.', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<template></template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var childNodesOfWrapper = getDOM().childNodes(fixture.nativeElement);
        expect(childNodesOfWrapper.length).toBe(1);
        expect(getDOM().isCommentNode(childNodesOfWrapper[0])).toBe(true);
      });

      it('should support template directives via `template` attribute.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeViewport]});
        const template =
            '<span template="some-viewport: let greeting=someTmpl">{{greeting}}</span>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        var childNodesOfWrapper = getDOM().childNodes(fixture.nativeElement);
        // 1 template + 2 copies.
        expect(childNodesOfWrapper.length).toBe(3);
        expect(childNodesOfWrapper[1]).toHaveText('hello');
        expect(childNodesOfWrapper[2]).toHaveText('again');
      });

      it('should allow to transplant TemplateRefs into other ViewContainers', () => {
        TestBed.configureTestingModule({
          declarations: [
            MyComp, SomeDirective, CompWithHost, ToolbarComponent, ToolbarViewContainer, ToolbarPart
          ],
          imports: [CommonModule],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template =
            '<some-directive><toolbar><template toolbarpart let-toolbarProp="toolbarProp">{{ctxProp}},{{toolbarProp}},<cmp-with-host></cmp-with-host></template></toolbar></some-directive>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'From myComp';
        fixture.detectChanges();

        expect(fixture.nativeElement)
            .toHaveText('TOOLBAR(From myComp,From toolbar,Component with an injected host)');
      });

      describe('reference bindings', () => {
        it('should assign a component to a ref-', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template = '<p><child-cmp ref-alice></child-cmp></p>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].children[0].references['alice'])
              .toBeAnInstanceOf(ChildComp);
        });

        it('should assign a directive to a ref-', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ExportDir]});
          const template = '<div><div export-dir #localdir="dir"></div></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].children[0].references['localdir'])
              .toBeAnInstanceOf(ExportDir);
        });

        it('should make the assigned component accessible in property bindings, even if they were declared before the component',
           () => {
             TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
             const template =
                 '<template [ngIf]="true">{{alice.ctxProp}}</template>|{{alice.ctxProp}}|<child-cmp ref-alice></child-cmp>';
             TestBed.overrideComponent(MyComp, {set: {template}});
             const fixture = TestBed.createComponent(MyComp);

             fixture.detectChanges();

             expect(fixture.nativeElement).toHaveText('hello|hello|hello');
           });

        it('should assign two component instances each with a ref-', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template =
              '<p><child-cmp ref-alice></child-cmp><child-cmp ref-bob></child-cmp></p>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var pEl = fixture.debugElement.children[0];

          var alice = pEl.children[0].references['alice'];
          var bob = pEl.children[1].references['bob'];
          expect(alice).toBeAnInstanceOf(ChildComp);
          expect(bob).toBeAnInstanceOf(ChildComp);
          expect(alice).not.toBe(bob);
        });

        it('should assign the component instance to a ref- with shorthand syntax', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template = '<child-cmp #alice></child-cmp>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].references['alice']).toBeAnInstanceOf(ChildComp);
        });

        it('should assign the element instance to a user-defined variable', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template = '<div><div ref-alice><i>Hello</i></div></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var value = fixture.debugElement.children[0].children[0].references['alice'];
          expect(value).not.toBe(null);
          expect(value.tagName.toLowerCase()).toEqual('div');
        });

        it('should assign the TemplateRef to a user-defined variable', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template = '<template ref-alice></template>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var value = fixture.debugElement.childNodes[0].references['alice'];
          expect(value).toBeAnInstanceOf(TemplateRef_);
        });

        it('should preserve case', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template = '<p><child-cmp ref-superAlice></child-cmp></p>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].children[0].references['superAlice'])
              .toBeAnInstanceOf(ChildComp);
        });
      });

      describe('variables', () => {
        it('should allow to use variables in a for loop', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildCompNoTemplate]});
          const template =
              '<template ngFor [ngForOf]="[1]" let-i><child-cmp-no-template #cmp></child-cmp-no-template>{{i}}-{{cmp.ctxProp}}</template>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          fixture.detectChanges();
          // Get the element at index 2, since index 0 is the <template>.
          expect(getDOM().childNodes(fixture.nativeElement)[2]).toHaveText('1-hello');
        });
      });

      describe('OnPush components', () => {

        it('should use ChangeDetectorRef to manually request a check', () => {
          TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithRef]]]});
          const template = '<push-cmp-with-ref #cmp></push-cmp-with-ref>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var cmp = fixture.debugElement.children[0].references['cmp'];

          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          cmp.propagate();

          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(2);
        });

        it('should be checked when its bindings got updated', () => {
          TestBed.configureTestingModule(
              {declarations: [MyComp, PushCmp, EventCmp], imports: [CommonModule]});
          const template = '<push-cmp [prop]="ctxProp" #cmp></push-cmp>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var cmp = fixture.debugElement.children[0].references['cmp'];

          fixture.componentInstance.ctxProp = 'one';
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          fixture.componentInstance.ctxProp = 'two';
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(2);
        });

        if (getDOM().supportsDOMEvents()) {
          it('should allow to destroy a component from within a host event handler',
             fakeAsync(() => {
               TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithHostEvent]]]});
               const template = '<push-cmp-with-host-event></push-cmp-with-host-event>';
               TestBed.overrideComponent(MyComp, {set: {template}});
               const fixture = TestBed.createComponent(MyComp);

               tick();
               fixture.detectChanges();

               var cmpEl = fixture.debugElement.children[0];
               var cmp: PushCmpWithHostEvent = cmpEl.injector.get(PushCmpWithHostEvent);
               cmp.ctxCallback = (_: any) => fixture.destroy();

               expect(() => cmpEl.triggerEventHandler('click', <Event>{})).not.toThrow();
             }));
        }

        it('should be checked when an event is fired', () => {
          TestBed.configureTestingModule(
              {declarations: [MyComp, PushCmp, EventCmp], imports: [CommonModule]});
          const template = '<push-cmp [prop]="ctxProp" #cmp></push-cmp>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var cmpEl = fixture.debugElement.children[0];
          var cmp = cmpEl.componentInstance;
          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          cmpEl.children[0].triggerEventHandler('click', <Event>{});

          // regular element
          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(2);

          // element inside of an *ngIf
          cmpEl.children[1].triggerEventHandler('click', <Event>{});

          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(3);

          // element inside a nested component
          cmpEl.children[2].children[0].triggerEventHandler('click', <Event>{});

          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(4);
        });

        it('should not affect updating properties on the component', () => {
          TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithRef]]]});
          const template = '<push-cmp-with-ref [prop]="ctxProp" #cmp></push-cmp-with-ref>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var cmp = fixture.debugElement.children[0].references['cmp'];

          fixture.componentInstance.ctxProp = 'one';
          fixture.detectChanges();
          expect(cmp.prop).toEqual('one');

          fixture.componentInstance.ctxProp = 'two';
          fixture.detectChanges();
          expect(cmp.prop).toEqual('two');
        });

        if (getDOM().supportsDOMEvents()) {
          it('should be checked when an async pipe requests a check', fakeAsync(() => {
               TestBed.configureTestingModule(
                   {declarations: [MyComp, PushCmpWithAsyncPipe], imports: [CommonModule]});
               const template = '<push-cmp-with-async #cmp></push-cmp-with-async>';
               TestBed.overrideComponent(MyComp, {set: {template}});
               const fixture = TestBed.createComponent(MyComp);

               tick();

               var cmp: PushCmpWithAsyncPipe = fixture.debugElement.children[0].references['cmp'];
               fixture.detectChanges();
               expect(cmp.numberOfChecks).toEqual(1);

               fixture.detectChanges();
               fixture.detectChanges();
               expect(cmp.numberOfChecks).toEqual(1);

               cmp.resolve(2);
               tick();

               fixture.detectChanges();
               expect(cmp.numberOfChecks).toEqual(2);
             }));
        }
      });

      it('should create a component that injects an @Host', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, SomeDirective, CompWithHost],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
            <some-directive>
              <p>
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>`;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var childComponent =
            fixture.debugElement.children[0].children[0].children[0].references['child'];
        expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
      });

      it('should create a component that injects an @Host through viewcontainer directive', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, SomeDirective, CompWithHost],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
            <some-directive>
              <p *ngIf="true">
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>`;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        var tc = fixture.debugElement.children[0].children[0].children[0];

        var childComponent = tc.references['child'];
        expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
      });

      it('should support events via EventEmitter on regular elements', async(() => {
           TestBed.configureTestingModule(
               {declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent]});
           const template = '<div emitter listener></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           var tc = fixture.debugElement.children[0];
           var emitter = tc.injector.get(DirectiveEmittingEvent);
           var listener = tc.injector.get(DirectiveListeningEvent);

           expect(listener.msg).toEqual('');
           var eventCount = 0;

           emitter.event.subscribe({
             next: () => {
               eventCount++;
               if (eventCount === 1) {
                 expect(listener.msg).toEqual('fired !');
                 fixture.destroy();
                 emitter.fireEvent('fired again !');
               } else {
                 expect(listener.msg).toEqual('fired !');
               }
             }
           });

           emitter.fireEvent('fired !');
         }));

      it('should support events via EventEmitter on template elements', async(() => {
           TestBed.configureTestingModule(
               {declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent]});
           const template = '<template emitter listener (event)="ctxProp=$event"></template>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           var tc = fixture.debugElement.childNodes[0];

           var emitter = tc.injector.get(DirectiveEmittingEvent);
           var myComp = fixture.debugElement.injector.get(MyComp);
           var listener = tc.injector.get(DirectiveListeningEvent);

           myComp.ctxProp = '';
           expect(listener.msg).toEqual('');

           emitter.event.subscribe({
             next: () => {
               expect(listener.msg).toEqual('fired !');
               expect(myComp.ctxProp).toEqual('fired !');
             }
           });

           emitter.fireEvent('fired !');
         }));

      it('should support [()] syntax', async(() => {
           TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTwoWayBinding]});
           const template = '<div [(control)]="ctxProp" two-way></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);
           var tc = fixture.debugElement.children[0];
           var dir = tc.injector.get(DirectiveWithTwoWayBinding);

           fixture.componentInstance.ctxProp = 'one';
           fixture.detectChanges();

           expect(dir.control).toEqual('one');

           dir.controlChange.subscribe(
               {next: () => { expect(fixture.componentInstance.ctxProp).toEqual('two'); }});

           dir.triggerChange('two');
         }));

      it('should support render events', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveListeningDomEvent]});
        const template = '<div listener></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        var listener = tc.injector.get(DirectiveListeningDomEvent);

        dispatchEvent(tc.nativeElement, 'domEvent');

        expect(listener.eventTypes).toEqual([
          'domEvent', 'body_domEvent', 'document_domEvent', 'window_domEvent'
        ]);

        fixture.destroy();
        listener.eventTypes = [];
        dispatchEvent(tc.nativeElement, 'domEvent');
        expect(listener.eventTypes).toEqual([]);
      });

      it('should support render global events', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveListeningDomEvent]});
        const template = '<div listener></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        var listener = tc.injector.get(DirectiveListeningDomEvent);
        dispatchEvent(getDOM().getGlobalEventTarget('window'), 'domEvent');
        expect(listener.eventTypes).toEqual(['window_domEvent']);

        listener.eventTypes = [];
        dispatchEvent(getDOM().getGlobalEventTarget('document'), 'domEvent');
        expect(listener.eventTypes).toEqual(['document_domEvent', 'window_domEvent']);

        fixture.destroy();
        listener.eventTypes = [];
        dispatchEvent(getDOM().getGlobalEventTarget('body'), 'domEvent');
        expect(listener.eventTypes).toEqual([]);
      });

      it('should support updating host element via hostAttributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveUpdatingHostAttributes]});
        const template = '<div update-host-attributes></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        expect(getDOM().getAttribute(fixture.debugElement.children[0].nativeElement, 'role'))
            .toEqual('button');
      });

      it('should support updating host element via hostProperties', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveUpdatingHostProperties]});
        const template = '<div update-host-properties></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        var updateHost = tc.injector.get(DirectiveUpdatingHostProperties);

        updateHost.id = 'newId';

        fixture.detectChanges();

        expect(tc.nativeElement.id).toEqual('newId');
      });

      if (getDOM().supportsDOMEvents()) {
        it('should support preventing default on render events', () => {
          TestBed.configureTestingModule({
            declarations:
                [MyComp, DirectiveListeningDomEventPrevent, DirectiveListeningDomEventNoPrevent]
          });
          const template =
              '<input type="checkbox" listenerprevent><input type="checkbox" listenernoprevent>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var dispatchedEvent = getDOM().createMouseEvent('click');
          var dispatchedEvent2 = getDOM().createMouseEvent('click');
          getDOM().dispatchEvent(fixture.debugElement.children[0].nativeElement, dispatchedEvent);
          getDOM().dispatchEvent(fixture.debugElement.children[1].nativeElement, dispatchedEvent2);
          expect(getDOM().isPrevented(dispatchedEvent)).toBe(true);
          expect(getDOM().isPrevented(dispatchedEvent2)).toBe(false);
          expect(getDOM().getChecked(fixture.debugElement.children[0].nativeElement)).toBeFalsy();
          expect(getDOM().getChecked(fixture.debugElement.children[1].nativeElement)).toBeTruthy();
        });
      }

      it('should support render global events from multiple directives', () => {
        TestBed.configureTestingModule(
            {declarations: [MyComp, DirectiveListeningDomEvent, DirectiveListeningDomEventOther]});
        const template = '<div *ngIf="ctxBoolProp" listener listenerother></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        globalCounter = 0;
        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        var tc = fixture.debugElement.children[0];

        var listener = tc.injector.get(DirectiveListeningDomEvent);
        var listenerother = tc.injector.get(DirectiveListeningDomEventOther);
        dispatchEvent(getDOM().getGlobalEventTarget('window'), 'domEvent');
        expect(listener.eventTypes).toEqual(['window_domEvent']);
        expect(listenerother.eventType).toEqual('other_domEvent');
        expect(globalCounter).toEqual(1);


        fixture.componentInstance.ctxBoolProp = false;
        fixture.detectChanges();
        dispatchEvent(getDOM().getGlobalEventTarget('window'), 'domEvent');
        expect(globalCounter).toEqual(1);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();
        dispatchEvent(getDOM().getGlobalEventTarget('window'), 'domEvent');
        expect(globalCounter).toEqual(2);

        // need to destroy to release all remaining global event listeners
        fixture.destroy();
      });

      describe('dynamic ViewContainers', () => {
        beforeEach(() => {
          // we need a module to declarate ChildCompUsingService as an entryComponent otherwise the
          // factory doesn't get created
          @NgModule({
            declarations: [MyComp, DynamicViewport, ChildCompUsingService],
            entryComponents: [ChildCompUsingService],
            schemas: [NO_ERRORS_SCHEMA],
          })
          class MyModule {
          }

          TestBed.configureTestingModule({imports: [MyModule]});
          TestBed.overrideComponent(
              MyComp, {add: {template: '<div><dynamic-vp #dynamic></dynamic-vp></div>'}});
        });

        it('should allow to create a ViewContainerRef at any bound location', async(() => {
             var fixture = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                               .createComponent(MyComp);
             var tc = fixture.debugElement.children[0].children[0];
             var dynamicVp: DynamicViewport = tc.injector.get(DynamicViewport);
             dynamicVp.done.then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.children[0].children[1].nativeElement)
                   .toHaveText('dynamic greet');
             });
           }));
      });

      it('should support static attributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp, NeedsAttribute]});
        const template = '<input static type="text" title>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var tc = fixture.debugElement.children[0];
        var needsAttribute = tc.injector.get(NeedsAttribute);
        expect(needsAttribute.typeAttribute).toEqual('text');
        expect(needsAttribute.staticAttribute).toEqual('');
        expect(needsAttribute.fooAttribute).toEqual(null);
      });

      it('should support custom interpolation', () => {
        TestBed.configureTestingModule({
          declarations: [
            MyComp, ComponentWithCustomInterpolationA, ComponentWithCustomInterpolationB,
            ComponentWithDefaultInterpolation
          ]
        });
        const template = `<div>{{ctxProp}}</div>
<cmp-with-custom-interpolation-a></cmp-with-custom-interpolation-a>
<cmp-with-custom-interpolation-b></cmp-with-custom-interpolation-b>`;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'Default Interpolation';

        fixture.detectChanges();
        expect(fixture.nativeElement)
            .toHaveText(
                'Default Interpolation\nCustom Interpolation A\nCustom Interpolation B (Default Interpolation)');
      });
    });

    describe('dependency injection', () => {
      it('should support bindings', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveProvidingInjectable, DirectiveConsumingInjectable],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
            <directive-providing-injectable >
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
            </directive-providing-injectable>
          `;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var comp = fixture.debugElement.children[0].children[0].references['consuming'];
        expect(comp.injectable).toBeAnInstanceOf(InjectableService);
      });

      it('should support viewProviders', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveProvidingInjectableInView, DirectiveConsumingInjectable],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
          `;
        TestBed.overrideComponent(DirectiveProvidingInjectableInView, {set: {template}});
        const fixture = TestBed.createComponent(DirectiveProvidingInjectableInView);

        var comp = fixture.debugElement.children[0].references['consuming'];
        expect(comp.injectable).toBeAnInstanceOf(InjectableService);
      });

      it('should support unbounded lookup', () => {
        TestBed.configureTestingModule({
          declarations: [
            MyComp, DirectiveProvidingInjectable, DirectiveContainingDirectiveConsumingAnInjectable,
            DirectiveConsumingInjectableUnbounded
          ],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
            <directive-providing-injectable>
              <directive-containing-directive-consuming-an-injectable #dir>
              </directive-containing-directive-consuming-an-injectable>
            </directive-providing-injectable>
          `;
        TestBed.overrideComponent(MyComp, {set: {template}});
        TestBed.overrideComponent(DirectiveContainingDirectiveConsumingAnInjectable, {
          set: {
            template: `
            <directive-consuming-injectable-unbounded></directive-consuming-injectable-unbounded>
          `
          }
        });
        const fixture = TestBed.createComponent(MyComp);

        var comp = fixture.debugElement.children[0].children[0].references['dir'];
        expect(comp.directive.injectable).toBeAnInstanceOf(InjectableService);
      });

      it('should support the event-bus scenario', () => {
        TestBed.configureTestingModule({
          declarations: [
            MyComp, GrandParentProvidingEventBus, ParentProvidingEventBus, ChildConsumingEventBus
          ],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
            <grand-parent-providing-event-bus>
              <parent-providing-event-bus>
                <child-consuming-event-bus>
                </child-consuming-event-bus>
              </parent-providing-event-bus>
            </grand-parent-providing-event-bus>
          `;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var gpComp = fixture.debugElement.children[0];
        var parentComp = gpComp.children[0];
        var childComp = parentComp.children[0];

        var grandParent = gpComp.injector.get(GrandParentProvidingEventBus);
        var parent = parentComp.injector.get(ParentProvidingEventBus);
        var child = childComp.injector.get(ChildConsumingEventBus);

        expect(grandParent.bus.name).toEqual('grandparent');
        expect(parent.bus.name).toEqual('parent');
        expect(parent.grandParentBus).toBe(grandParent.bus);
        expect(child.bus).toBe(parent.bus);
      });

      it('should instantiate bindings lazily', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveConsumingInjectable, ComponentProvidingLoggingInjectable],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `
              <component-providing-logging-injectable #providing>
                <directive-consuming-injectable *ngIf="ctxBoolProp">
                </directive-consuming-injectable>
              </component-providing-logging-injectable>
          `;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        var providing = fixture.debugElement.children[0].references['providing'];
        expect(providing.created).toBe(false);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        expect(providing.created).toBe(true);
      });
    });

    describe('corner cases', () => {
      it('should remove script tags from templates', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = `
            <script>alert("Ooops");</script>
            <div>before<script>alert("Ooops");</script><span>inside</span>after</div>`;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        expect(getDOM().querySelectorAll(fixture.nativeElement, 'script').length).toEqual(0);
      });

      it('should throw when using directives without selector', () => {
        @Directive({})
        class SomeDirective {
        }

        @Component({selector: 'comp', template: ''})
        class SomeComponent {
        }

        TestBed.configureTestingModule({declarations: [MyComp, SomeDirective, SomeComponent]});
        expect(() => TestBed.createComponent(MyComp))
            .toThrowError(`Directive ${stringify(SomeDirective)} has no selector, please add it!`);
      });

      it('should use a default element name for components without selectors', () => {
        let noSelectorComponentFactory: ComponentFactory<SomeComponent>;

        @Component({template: '----'})
        class NoSelectorComponent {
        }

        @Component({selector: 'some-comp', template: '', entryComponents: [NoSelectorComponent]})
        class SomeComponent {
          constructor(componentFactoryResolver: ComponentFactoryResolver) {
            // grab its own component factory
            noSelectorComponentFactory =
                componentFactoryResolver.resolveComponentFactory(NoSelectorComponent);
          }
        }

        TestBed.configureTestingModule({declarations: [SomeComponent, NoSelectorComponent]});

        // get the factory
        TestBed.createComponent(SomeComponent);

        expect(noSelectorComponentFactory.selector).toBe('ng-component');
        expect(
            getDOM()
                .nodeName(
                    noSelectorComponentFactory.create(TestBed.get(Injector)).location.nativeElement)
                .toLowerCase())
            .toEqual('ng-component');

      });
    });

    describe('error handling', () => {
      it('should report a meaningful error when a directive is missing annotation', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeDirectiveMissingAnnotation]});

        expect(() => TestBed.createComponent(MyComp))
            .toThrowError(
                `Unexpected value '${stringify(SomeDirectiveMissingAnnotation)}' declared by the module 'DynamicTestModule'`);
      });

      it('should report a meaningful error when a component is missing view annotation', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ComponentWithoutView]});
        try {
          TestBed.createComponent(ComponentWithoutView);
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toContain(
              `No template specified for component ${stringify(ComponentWithoutView)}`);
        }
      });

      it('should provide an error context when an error happens in DI', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveThrowingAnError],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = `<directive-throwing-error></directive-throwing-error>`;
        TestBed.overrideComponent(MyComp, {set: {template}});

        try {
          TestBed.createComponent(MyComp);
          throw 'Should throw';
        } catch (e) {
          var c = e.context;
          expect(getDOM().nodeName(c.componentRenderElement).toUpperCase()).toEqual('DIV');
          expect((<Injector>c.injector).get).toBeTruthy();
        }
      });

      it('should provide an error context when an error happens in change detection', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveThrowingAnError]});
        const template = `<input [value]="one.two.three" #local>`;
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
        try {
          fixture.detectChanges();
          throw 'Should throw';
        } catch (e) {
          var c = e.context;
          expect(getDOM().nodeName(c.renderNode).toUpperCase()).toEqual('INPUT');
          expect(getDOM().nodeName(c.componentRenderElement).toUpperCase()).toEqual('DIV');
          expect((<Injector>c.injector).get).toBeTruthy();
          expect(c.source).toContain(':0:7');
          expect(c.context).toBe(fixture.componentInstance);
          expect(c.references['local']).toBeDefined();
        }
      });

      it('should provide an error context when an error happens in change detection (text node)',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp]});
           const template = `<div>{{one.two.three}}</div>`;
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);
           try {
             fixture.detectChanges();
             throw 'Should throw';
           } catch (e) {
             var c = e.context;
             expect(c.renderNode).toBeTruthy();
             expect(c.source).toContain(':0:5');
           }
         });

      if (getDOM().supportsDOMEvents()) {  // this is required to use fakeAsync
        it('should provide an error context when an error happens in an event handler',
           fakeAsync(() => {
             TestBed.configureTestingModule({
               declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent],
               schemas: [NO_ERRORS_SCHEMA],
             });
             const template = `<span emitter listener (event)="throwError()" #local></span>`;
             TestBed.overrideComponent(MyComp, {set: {template}});
             const fixture = TestBed.createComponent(MyComp);
             tick();

             var tc = fixture.debugElement.children[0];

             try {
               tc.injector.get(DirectiveEmittingEvent).fireEvent('boom');
             } catch (e) {
               var c = e.context;
               expect(getDOM().nodeName(c.renderNode).toUpperCase()).toEqual('SPAN');
               expect(getDOM().nodeName(c.componentRenderElement).toUpperCase()).toEqual('DIV');
               expect((<Injector>c.injector).get).toBeTruthy();
               expect(c.context).toBe(fixture.componentInstance);
               expect(c.references['local']).toBeDefined();
             }
           }));
      }

      it('should specify a location of an error that happened during change detection (text)',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp]});
           const template = '<div>{{a.b}}</div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           expect(() => fixture.detectChanges()).toThrowError(/:0:5/);
         });

      it('should specify a location of an error that happened during change detection (element property)',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp]});
           const template = '<div [title]="a.b"></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           expect(() => fixture.detectChanges()).toThrowError(/:0:5/);
         });

      it('should specify a location of an error that happened during change detection (directive property)',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp, ChildComp, MyDir]});
           const template = '<child-cmp [dirProp]="a.b"></child-cmp>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           expect(() => fixture.detectChanges()).toThrowError(/:0:11/);
         });
    });

    it('should support imperative views', () => {
      TestBed.configureTestingModule({declarations: [MyComp, SimpleImperativeViewComponent]});
      const template = '<simple-imp-cmp></simple-imp-cmp>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      expect(fixture.nativeElement).toHaveText('hello imp view');
    });

    it('should support moving embedded views around', () => {
      TestBed.configureTestingModule({
        declarations: [MyComp, SomeImperativeViewport],
        providers: [{provide: ANCHOR_ELEMENT, useValue: el('<div></div>')}],
      });
      const template = '<div><div *someImpvp="ctxBoolProp">hello</div></div>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const anchorElement = getTestBed().get(ANCHOR_ELEMENT);
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();
      expect(anchorElement).toHaveText('');

      fixture.componentInstance.ctxBoolProp = true;
      fixture.detectChanges();

      expect(anchorElement).toHaveText('hello');

      fixture.componentInstance.ctxBoolProp = false;
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('');
    });

    describe('Property bindings', () => {
      it('should throw on bindings to unknown properties', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div unknown="{{ctxProp}}"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        try {
          TestBed.createComponent(MyComp);
          throw 'Should throw';
        } catch (e) {
          expect(e.message).toEqual(
              `Template parse errors:\nCan't bind to 'unknown' since it isn't a known property of 'div'. ("<div [ERROR ->]unknown="{{ctxProp}}"></div>"): MyComp@0:5`);
        }
      });

      it('should not throw for property binding to a non-existing property when there is a matching directive property',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
           const template = '<div my-dir [elprop]="ctxProp"></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           expect(() => TestBed.createComponent(MyComp)).not.toThrow();
         });

      it('should not be created when there is a directive with the same property', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTitle]});
        const template = '<span [title]="ctxProp"></span>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'TITLE';
        fixture.detectChanges();

        var el = getDOM().querySelector(fixture.nativeElement, 'span');
        expect(isBlank(el.title) || el.title == '').toBeTruthy();
      });

      it('should work when a directive uses hostProperty to update the DOM element', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTitleAndHostProperty]});
        const template = '<span [title]="ctxProp"></span>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'TITLE';
        fixture.detectChanges();

        var el = getDOM().querySelector(fixture.nativeElement, 'span');
        expect(el.title).toEqual('TITLE');
      });
    });

    describe('logging property updates', () => {
      it('should reflect property values as attributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        const template = '<div>' +
            '<div my-dir [elprop]="ctxProp"></div>' +
            '</div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'hello';
        fixture.detectChanges();

        expect(getDOM().getInnerHTML(fixture.nativeElement))
            .toContain('ng-reflect-dir-prop="hello"');
      });

      it('should reflect property values on template comments', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<template [ngIf]="ctxBoolProp"></template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        expect(getDOM().getInnerHTML(fixture.nativeElement))
            .toContain('"ng\-reflect\-ng\-if"\: "true"');
      });

      it('should indicate when toString() throws', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        const template = '<div my-dir [elprop]="toStringThrow"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        expect(getDOM().getInnerHTML(fixture.nativeElement)).toContain('[ERROR]');
      });
    });

    describe('property decorators', () => {
      it('should support property decorators', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveWithPropDecorators],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = '<with-prop-decorators elProp="aaa"></with-prop-decorators>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        var dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
        expect(dir.dirProp).toEqual('aaa');
      });

      it('should support host binding decorators', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, DirectiveWithPropDecorators],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = '<with-prop-decorators></with-prop-decorators>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        var dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
        dir.myAttr = 'aaa';

        fixture.detectChanges();
        expect(getDOM().getOuterHTML(fixture.debugElement.children[0].nativeElement))
            .toContain('my-attr="aaa"');
      });

      if (getDOM().supportsDOMEvents()) {
        it('should support event decorators', fakeAsync(() => {
             TestBed.configureTestingModule({
               declarations: [MyComp, DirectiveWithPropDecorators],
               schemas: [NO_ERRORS_SCHEMA],
             });
             const template = `<with-prop-decorators (elEvent)="ctxProp='called'">`;
             TestBed.overrideComponent(MyComp, {set: {template}});
             const fixture = TestBed.createComponent(MyComp);

             tick();

             var emitter =
                 fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
             emitter.fireEvent('fired !');

             tick();

             expect(fixture.componentInstance.ctxProp).toEqual('called');
           }));


        it('should support host listener decorators', () => {
          TestBed.configureTestingModule({
            declarations: [MyComp, DirectiveWithPropDecorators],
            schemas: [NO_ERRORS_SCHEMA],
          });
          const template = '<with-prop-decorators></with-prop-decorators>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          fixture.detectChanges();
          var dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
          var native = fixture.debugElement.children[0].nativeElement;
          getDOM().dispatchEvent(native, getDOM().createMouseEvent('click'));

          expect(dir.target).toBe(native);
        });
      }

      it('should support defining views in the component decorator', () => {
        TestBed.configureTestingModule({
          declarations: [MyComp, ComponentWithTemplate],
          imports: [CommonModule],
          schemas: [NO_ERRORS_SCHEMA],
        });
        const template = '<component-with-template></component-with-template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        var native = fixture.debugElement.children[0].nativeElement;
        expect(native).toHaveText('No View Decorator: 123');
      });
    });


    if (getDOM().supportsDOMEvents()) {
      describe('svg', () => {
        it('should support svg elements', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template = '<svg><use xlink:href="Port" /></svg>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var el = fixture.nativeElement;
          var svg = getDOM().childNodes(el)[0];
          var use = getDOM().childNodes(svg)[0];
          expect(getDOM().getProperty(<Element>svg, 'namespaceURI'))
              .toEqual('http://www.w3.org/2000/svg');
          expect(getDOM().getProperty(<Element>use, 'namespaceURI'))
              .toEqual('http://www.w3.org/2000/svg');

          var firstAttribute = getDOM().getProperty(<Element>use, 'attributes')[0];
          expect(firstAttribute.name).toEqual('xlink:href');
          expect(firstAttribute.namespaceURI).toEqual('http://www.w3.org/1999/xlink');
        });

        it('should support foreignObjects with document fragments', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template =
              '<svg><foreignObject><xhtml:div><p>Test</p></xhtml:div></foreignObject></svg>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          var el = fixture.nativeElement;
          var svg = getDOM().childNodes(el)[0];
          var foreignObject = getDOM().childNodes(svg)[0];
          var p = getDOM().childNodes(foreignObject)[0];
          expect(getDOM().getProperty(<Element>svg, 'namespaceURI'))
              .toEqual('http://www.w3.org/2000/svg');
          expect(getDOM().getProperty(<Element>foreignObject, 'namespaceURI'))
              .toEqual('http://www.w3.org/2000/svg');
          expect(getDOM().getProperty(<Element>p, 'namespaceURI'))
              .toEqual('http://www.w3.org/1999/xhtml');
        });
      });

      describe('attributes', () => {

        it('should support attributes with namespace', () => {
          TestBed.configureTestingModule({declarations: [MyComp, SomeCmp]});
          const template = '<svg:use xlink:href="#id" />';
          TestBed.overrideComponent(SomeCmp, {set: {template}});
          const fixture = TestBed.createComponent(SomeCmp);

          let useEl = getDOM().firstChild(fixture.nativeElement);
          expect(getDOM().getAttributeNS(useEl, 'http://www.w3.org/1999/xlink', 'href'))
              .toEqual('#id');
        });

        it('should support binding to attributes with namespace', () => {
          TestBed.configureTestingModule({declarations: [MyComp, SomeCmp]});
          const template = '<svg:use [attr.xlink:href]="value" />';
          TestBed.overrideComponent(SomeCmp, {set: {template}});
          const fixture = TestBed.createComponent(SomeCmp);

          let cmp = fixture.componentInstance;
          let useEl = getDOM().firstChild(fixture.nativeElement);

          cmp.value = '#id';
          fixture.detectChanges();

          expect(getDOM().getAttributeNS(useEl, 'http://www.w3.org/1999/xlink', 'href'))
              .toEqual('#id');

          cmp.value = null;
          fixture.detectChanges();

          expect(getDOM().hasAttributeNS(useEl, 'http://www.w3.org/1999/xlink', 'href'))
              .toEqual(false);
        });
      });
    }
  });
}


@Component({selector: 'cmp-with-default-interpolation', template: `{{text}}`})
class ComponentWithDefaultInterpolation {
  text = 'Default Interpolation';
}

@Component({
  selector: 'cmp-with-custom-interpolation-a',
  template: `<div>{%text%}</div>`,
  interpolation: ['{%', '%}']
})
class ComponentWithCustomInterpolationA {
  text = 'Custom Interpolation A';
}

@Component({
  selector: 'cmp-with-custom-interpolation-b',
  template:
      `<div>{**text%}</div> (<cmp-with-default-interpolation></cmp-with-default-interpolation>)`,
  interpolation: ['{**', '%}']
})
class ComponentWithCustomInterpolationB {
  text = 'Custom Interpolation B';
}

@Injectable()
class MyService {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'simple-imp-cmp', template: ''})
class SimpleImperativeViewComponent {
  done: any;

  constructor(self: ElementRef, renderer: Renderer) {
    var hostElement = self.nativeElement;
    getDOM().appendChild(hostElement, el('hello imp view'));
  }
}

@Directive({selector: 'dynamic-vp'})
class DynamicViewport {
  done: Promise<any>;
  constructor(vc: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver) {
    var myService = new MyService();
    myService.greeting = 'dynamic greet';

    var injector = ReflectiveInjector.resolveAndCreate(
        [{provide: MyService, useValue: myService}], vc.injector);
    this.done =
        Promise.resolve(componentFactoryResolver.resolveComponentFactory(ChildCompUsingService))
            .then((componentFactory) => vc.createComponent(componentFactory, 0, injector));
  }
}

@Directive({selector: '[my-dir]', inputs: ['dirProp: elprop'], exportAs: 'mydir'})
class MyDir {
  dirProp: string;
  constructor() { this.dirProp = ''; }
}

@Directive({selector: '[title]', inputs: ['title']})
class DirectiveWithTitle {
  title: string;
}

@Directive({selector: '[title]', inputs: ['title'], host: {'[title]': 'title'}})
class DirectiveWithTitleAndHostProperty {
  title: string;
}

@Component({selector: 'event-cmp', template: '<div (click)="noop()"></div>'})
class EventCmp {
  noop() {}
}

@Component({
  selector: 'push-cmp',
  inputs: ['prop'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
      '{{field}}<div (click)="noop()"></div><div *ngIf="true" (click)="noop()"></div><event-cmp></event-cmp>'
})
class PushCmp {
  numberOfChecks: number;
  prop: any;

  constructor() { this.numberOfChecks = 0; }

  noop() {}

  get field() {
    this.numberOfChecks++;
    return 'fixed';
  }
}

@Component({
  selector: 'push-cmp-with-ref',
  inputs: ['prop'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{field}}'
})
class PushCmpWithRef {
  numberOfChecks: number;
  ref: ChangeDetectorRef;
  prop: any;

  constructor(ref: ChangeDetectorRef) {
    this.numberOfChecks = 0;
    this.ref = ref;
  }

  get field() {
    this.numberOfChecks++;
    return 'fixed';
  }

  propagate() { this.ref.markForCheck(); }
}

@Component({
  selector: 'push-cmp-with-host-event',
  host: {'(click)': 'ctxCallback($event)'},
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ''
})
class PushCmpWithHostEvent {
  ctxCallback: Function = (_: any) => {};
}

@Component({
  selector: 'push-cmp-with-async',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{field | async}}'
})
class PushCmpWithAsyncPipe {
  numberOfChecks: number = 0;
  resolve: (result: any) => void;
  promise: Promise<any>;

  constructor() {
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }

  get field() {
    this.numberOfChecks++;
    return this.promise;
  }
}

@Component({selector: 'my-comp', template: ''})
class MyComp {
  ctxProp: string;
  ctxNumProp: number;
  ctxBoolProp: boolean;
  toStringThrow = {toString: function() { throw 'boom'; }};

  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }

  throwError() { throw 'boom'; }
}

@Component({
  selector: 'child-cmp',
  inputs: ['dirProp'],
  viewProviders: [MyService],
  template: '{{ctxProp}}'
})
class ChildComp {
  ctxProp: string;
  dirProp: string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Component({selector: 'child-cmp-no-template', template: ''})
class ChildCompNoTemplate {
  ctxProp: string = 'hello';
}

@Component({selector: 'child-cmp-svc', template: '{{ctxProp}}'})
class ChildCompUsingService {
  ctxProp: string;
  constructor(service: MyService) { this.ctxProp = service.greeting; }
}

@Directive({selector: 'some-directive'})
class SomeDirective {
}

class SomeDirectiveMissingAnnotation {}

@Component({
  selector: 'cmp-with-host',
  template: '<p>Component with an injected host</p>',
})
class CompWithHost {
  myHost: SomeDirective;
  constructor(@Host() someComp: SomeDirective) { this.myHost = someComp; }
}

@Component({selector: '[child-cmp2]', viewProviders: [MyService]})
class ChildComp2 {
  ctxProp: string;
  dirProp: string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

class SomeViewportContext {
  constructor(public someTmpl: string) {}
}

@Directive({selector: '[some-viewport]'})
class SomeViewport {
  constructor(public container: ViewContainerRef, templateRef: TemplateRef<SomeViewportContext>) {
    container.createEmbeddedView(templateRef, new SomeViewportContext('hello'));
    container.createEmbeddedView(templateRef, new SomeViewportContext('again'));
  }
}

@Directive({selector: '[pollutedContext]'})
class PollutedContext {
  constructor(private tplRef: TemplateRef<any>, private vcRef: ViewContainerRef) {
    const evRef = this.vcRef.createEmbeddedView(this.tplRef);
    evRef.context.bar = 'baz';
  }
}

@Directive({selector: '[noContext]'})
class NoContext {
  constructor(private tplRef: TemplateRef<any>, private vcRef: ViewContainerRef) {
    this.vcRef.createEmbeddedView(this.tplRef);
  }
}

@Pipe({name: 'double'})
class DoublePipe implements PipeTransform, OnDestroy {
  ngOnDestroy() {}
  transform(value: any) { return `${value}${value}`; }
}

@Directive({selector: '[emitter]', outputs: ['event']})
class DirectiveEmittingEvent {
  msg: string;
  event: EventEmitter<any>;

  constructor() {
    this.msg = '';
    this.event = new EventEmitter();
  }

  fireEvent(msg: string) { this.event.emit(msg); }
}

@Directive({selector: '[update-host-attributes]', host: {'role': 'button'}})
class DirectiveUpdatingHostAttributes {
}

@Directive({selector: '[update-host-properties]', host: {'[id]': 'id'}})
class DirectiveUpdatingHostProperties {
  id: string;

  constructor() { this.id = 'one'; }
}

@Directive({selector: '[listener]', host: {'(event)': 'onEvent($event)'}})
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
class DirectiveListeningDomEvent {
  eventTypes: string[] = [];
  onEvent(eventType: string) { this.eventTypes.push(eventType); }
  onWindowEvent(eventType: string) { this.eventTypes.push('window_' + eventType); }
  onDocumentEvent(eventType: string) { this.eventTypes.push('document_' + eventType); }
  onBodyEvent(eventType: string) { this.eventTypes.push('body_' + eventType); }
}

var globalCounter = 0;
@Directive({selector: '[listenerother]', host: {'(window:domEvent)': 'onEvent($event.type)'}})
class DirectiveListeningDomEventOther {
  eventType: string;
  constructor() { this.eventType = ''; }
  onEvent(eventType: string) {
    globalCounter++;
    this.eventType = 'other_' + eventType;
  }
}

@Directive({selector: '[listenerprevent]', host: {'(click)': 'onEvent($event)'}})
class DirectiveListeningDomEventPrevent {
  onEvent(event: any) { return false; }
}

@Directive({selector: '[listenernoprevent]', host: {'(click)': 'onEvent($event)'}})
class DirectiveListeningDomEventNoPrevent {
  onEvent(event: any) { return true; }
}

@Directive({selector: '[id]', inputs: ['id']})
class IdDir {
  id: string;
}

@Directive({selector: '[customEvent]'})
class EventDir {
  @Output() customEvent = new EventEmitter();
  doSomething() {}
}

@Directive({selector: '[static]'})
class NeedsAttribute {
  typeAttribute: string;
  staticAttribute: string;
  fooAttribute: string;
  constructor(
      @Attribute('type') typeAttribute: string, @Attribute('static') staticAttribute: string,
      @Attribute('foo') fooAttribute: string) {
    this.typeAttribute = typeAttribute;
    this.staticAttribute = staticAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Injectable()
class PublicApi {
}

@Directive({
  selector: '[public-api]',
  providers: [{provide: PublicApi, useExisting: PrivateImpl, deps: []}]
})
class PrivateImpl extends PublicApi {
}

@Directive({selector: '[needs-public-api]'})
class NeedsPublicApi {
  constructor(@Host() api: PublicApi) { expect(api instanceof PrivateImpl).toBe(true); }
}

class ToolbarContext {
  constructor(public toolbarProp: string) {}
}

@Directive({selector: '[toolbarpart]'})
class ToolbarPart {
  templateRef: TemplateRef<ToolbarContext>;
  constructor(templateRef: TemplateRef<ToolbarContext>) { this.templateRef = templateRef; }
}

@Directive({selector: '[toolbarVc]', inputs: ['toolbarVc']})
class ToolbarViewContainer {
  vc: ViewContainerRef;
  constructor(vc: ViewContainerRef) { this.vc = vc; }

  set toolbarVc(part: ToolbarPart) {
    this.vc.createEmbeddedView(part.templateRef, new ToolbarContext('From toolbar'), 0);
  }
}

@Component({
  selector: 'toolbar',
  template: 'TOOLBAR(<div *ngFor="let  part of query" [toolbarVc]="part"></div>)',
})
class ToolbarComponent {
  @ContentChildren(ToolbarPart) query: QueryList<ToolbarPart>;
  ctxProp: string;

  constructor() { this.ctxProp = 'hello world'; }
}

@Directive({selector: '[two-way]', inputs: ['control'], outputs: ['controlChange']})
class DirectiveWithTwoWayBinding {
  controlChange = new EventEmitter();
  control: any = null;

  triggerChange(value: any) { this.controlChange.emit(value); }
}

@Injectable()
class InjectableService {
}

function createInjectableWithLogging(inj: Injector) {
  inj.get(ComponentProvidingLoggingInjectable).created = true;
  return new InjectableService();
}

@Component({
  selector: 'component-providing-logging-injectable',
  providers:
      [{provide: InjectableService, useFactory: createInjectableWithLogging, deps: [Injector]}],
  template: ''
})
class ComponentProvidingLoggingInjectable {
  created: boolean = false;
}


@Directive({selector: 'directive-providing-injectable', providers: [[InjectableService]]})
class DirectiveProvidingInjectable {
}

@Component({
  selector: 'directive-providing-injectable',
  viewProviders: [[InjectableService]],
  template: ''
})
class DirectiveProvidingInjectableInView {
}

@Component({
  selector: 'directive-providing-injectable',
  providers: [{provide: InjectableService, useValue: 'host'}],
  viewProviders: [{provide: InjectableService, useValue: 'view'}],
  template: ''
})
class DirectiveProvidingInjectableInHostAndView {
}


@Component({selector: 'directive-consuming-injectable', template: ''})
class DirectiveConsumingInjectable {
  injectable: any;

  constructor(@Host() @Inject(InjectableService) injectable: any) { this.injectable = injectable; }
}



@Component({selector: 'directive-containing-directive-consuming-an-injectable'})
class DirectiveContainingDirectiveConsumingAnInjectable {
  directive: any;
}

@Component({selector: 'directive-consuming-injectable-unbounded', template: ''})
class DirectiveConsumingInjectableUnbounded {
  injectable: any;

  constructor(
      injectable: InjectableService,
      @SkipSelf() parent: DirectiveContainingDirectiveConsumingAnInjectable) {
    this.injectable = injectable;
    parent.directive = this;
  }
}


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
  providers: [{provide: EventBus, useValue: new EventBus(null, 'grandparent')}]
})
class GrandParentProvidingEventBus {
  bus: EventBus;

  constructor(bus: EventBus) { this.bus = bus; }
}

function createParentBus(peb: EventBus) {
  return new EventBus(peb, 'parent');
}

@Component({
  selector: 'parent-providing-event-bus',
  providers: [{provide: EventBus, useFactory: createParentBus, deps: [[EventBus, new SkipSelf()]]}],
  template: `<child-consuming-event-bus></child-consuming-event-bus>`
})
class ParentProvidingEventBus {
  bus: EventBus;
  grandParentBus: EventBus;

  constructor(bus: EventBus, @SkipSelf() grandParentBus: EventBus) {
    this.bus = bus;
    this.grandParentBus = grandParentBus;
  }
}

@Directive({selector: 'child-consuming-event-bus'})
class ChildConsumingEventBus {
  bus: EventBus;

  constructor(@SkipSelf() bus: EventBus) { this.bus = bus; }
}

@Directive({selector: '[someImpvp]', inputs: ['someImpvp']})
class SomeImperativeViewport {
  view: EmbeddedViewRef<Object>;
  anchor: any;
  constructor(
      public vc: ViewContainerRef, public templateRef: TemplateRef<Object>,
      @Inject(ANCHOR_ELEMENT) anchor: any) {
    this.view = null;
    this.anchor = anchor;
  }

  set someImpvp(value: boolean) {
    if (isPresent(this.view)) {
      this.vc.clear();
      this.view = null;
    }
    if (value) {
      this.view = this.vc.createEmbeddedView(this.templateRef);
      var nodes = this.view.rootNodes;
      for (var i = 0; i < nodes.length; i++) {
        getDOM().appendChild(this.anchor, nodes[i]);
      }
    }
  }
}

@Directive({selector: '[export-dir]', exportAs: 'dir'})
class ExportDir {
}

@Component({selector: 'comp'})
class ComponentWithoutView {
}

@Directive({selector: '[no-duplicate]'})
class DuplicateDir {
  constructor(elRef: ElementRef) {
    getDOM().setText(elRef.nativeElement, getDOM().getText(elRef.nativeElement) + 'noduplicate');
  }
}

@Directive({selector: '[no-duplicate]'})
class OtherDuplicateDir {
  constructor(elRef: ElementRef) {
    getDOM().setText(
        elRef.nativeElement, getDOM().getText(elRef.nativeElement) + 'othernoduplicate');
  }
}

@Directive({selector: 'directive-throwing-error'})
class DirectiveThrowingAnError {
  constructor() { throw new Error('BOOM'); }
}

@Component({
  selector: 'component-with-template',
  template: `No View Decorator: <div *ngFor="let item of items">{{item}}</div>`
})
class ComponentWithTemplate {
  items = [1, 2, 3];
}

@Directive({selector: 'with-prop-decorators'})
class DirectiveWithPropDecorators {
  target: any;

  @Input('elProp') dirProp: string;
  @Output('elEvent') event = new EventEmitter();

  @HostBinding('attr.my-attr') myAttr: string;
  @HostListener('click', ['$event.target'])
  onClick(target: any) { this.target = target; }

  fireEvent(msg: any) { this.event.emit(msg); }
}

@Component({selector: 'some-cmp'})
class SomeCmp {
  value: any;
}
