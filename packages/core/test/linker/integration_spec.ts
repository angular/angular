/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Compiler, ComponentFactory, ComponentRef, ErrorHandler, EventEmitter, Host, Inject, Injectable, InjectionToken, Injector, NgModule, NgModuleRef, NO_ERRORS_SCHEMA, OnDestroy, SkipSelf, ViewChild, ViewRef, ɵivyEnabled as ivyEnabled} from '@angular/core';
import {ChangeDetectionStrategy, ChangeDetectorRef, PipeTransform} from '@angular/core/src/change_detection/change_detection';
import {getDebugContext} from '@angular/core/src/errors';
import {ComponentFactoryResolver} from '@angular/core/src/linker/component_factory_resolver';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {QueryList} from '@angular/core/src/linker/query_list';
import {TemplateRef} from '@angular/core/src/linker/template_ref';
import {ViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {EmbeddedViewRef} from '@angular/core/src/linker/view_ref';
import {Attribute, Component, ContentChildren, Directive, HostBinding, HostListener, Input, Output, Pipe} from '@angular/core/src/metadata';
import {fakeAsync, getTestBed, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {createMouseEvent, dispatchEvent, el, isCommentNode} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {modifiedInIvy, obsoleteInIvy, onlyInIvy} from '@angular/private/testing';

import {stringify} from '../../src/util/stringify';

const ANCHOR_ELEMENT = new InjectionToken('AnchorElement');

if (ivyEnabled) {
  describe('ivy', () => {
    declareTests();
  });
} else {
  describe('jit', () => {
    declareTests({useJit: true});
  });
  describe('no jit', () => {
    declareTests({useJit: false});
  });
}

function declareTests(config?: {useJit: boolean}) {
  describe('integration tests', function() {
    beforeEach(() => {
      TestBed.configureCompiler({...config});
    });

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
        fixture.componentInstance.ctxProp = null!;

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('');
      });

      it('should allow both null and undefined in expressions', () => {
        const template = '<div>{{null == undefined}}|{{null === undefined}}</div>';
        const fixture = TestBed.configureTestingModule({declarations: [MyComp]})
                            .overrideComponent(MyComp, {set: {template}})
                            .createComponent(MyComp);
        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('true|false');
      });

      it('should support an arbitrary number of interpolations in an element', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template =
            `<div>before{{'0'}}a{{'1'}}b{{'2'}}c{{'3'}}d{{'4'}}e{{'5'}}f{{'6'}}g{{'7'}}h{{'8'}}i{{'9'}}j{{'10'}}after</div>`;
        const fixture =
            TestBed.overrideComponent(MyComp, {set: {template}}).createComponent(MyComp);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('before0a1b2c3d4e5f6g7h8i9j10after');
      });

      it('should use a blank string when interpolation evaluates to null or undefined with an arbitrary number of interpolations',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp]});
           const template =
               `<div>0{{null}}a{{undefined}}b{{null}}c{{undefined}}d{{null}}e{{undefined}}f{{null}}g{{undefined}}h{{null}}i{{undefined}}j{{null}}1</div>`;
           const fixture =
               TestBed.overrideComponent(MyComp, {set: {template}}).createComponent(MyComp);

           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('0abcdefghij1');
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
        expect(fixture.debugElement.children[0].nativeElement.getAttribute('aria-label'))
            .toEqual('Initial aria label');

        fixture.componentInstance.ctxProp = 'Changed aria label';
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.getAttribute('aria-label'))
            .toEqual('Changed aria label');
      });

      it('should remove an attribute when attribute expression evaluates to null', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [attr.foo]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'bar';
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.getAttribute('foo')).toEqual('bar');

        fixture.componentInstance.ctxProp = null!;
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.hasAttribute('foo')).toBeFalsy();
      });

      it('should remove style when when style expression evaluates to null', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const template = '<div [style.height.px]="ctxProp"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = '10';
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.style['height']).toEqual('10px');

        fixture.componentInstance.ctxProp = null!;
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.style['height']).toEqual('');
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
        expect(fixture.debugElement.children[0].nativeElement.innerHTML)
            .toEqual('Some <span>HTML</span>');

        fixture.componentInstance.ctxProp = 'Some other <div>HTML</div>';
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.innerHTML)
            .toEqual('Some other <div>HTML</div>');
      });

      modifiedInIvy('Binding to the class property directly works differently')
          .it('should consume binding to className using class alias', () => {
            TestBed.configureTestingModule({declarations: [MyComp]});
            const template = '<div class="initial" [class]="ctxProp"></div>';
            TestBed.overrideComponent(MyComp, {set: {template}});
            const fixture = TestBed.createComponent(MyComp);

            const nativeEl = fixture.debugElement.children[0].nativeElement;
            fixture.componentInstance.ctxProp = 'foo bar';
            fixture.detectChanges();

            expect(nativeEl).toHaveCssClass('foo');
            expect(nativeEl).toHaveCssClass('bar');
            expect(nativeEl).not.toHaveCssClass('initial');
          });

      it('should consume binding to htmlFor using for alias', () => {
        const template = '<label [for]="ctxProp"></label>';
        const fixture = TestBed.configureTestingModule({declarations: [MyComp]})
                            .overrideComponent(MyComp, {set: {template}})
                            .createComponent(MyComp);

        const nativeEl = fixture.debugElement.children[0].nativeElement;
        fixture.debugElement.componentInstance.ctxProp = 'foo';
        fixture.detectChanges();

        expect(nativeEl.htmlFor).toBe('foo');
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

        const containerSpan = fixture.debugElement.children[0];

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

          const dir = fixture.debugElement.children[0].references!['dir'];
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

        const tc = fixture.debugElement.children[0];

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

        const tc = fixture.debugElement.children[0];
        const idDir = tc.injector.get(IdDir);

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

        const tc = fixture.debugElement.children[0];
        expect(tc.injector.get(EventDir)).not.toBeNull();
      });

      it('should display correct error message for uninitialized @Output', () => {
        @Component({selector: 'my-uninitialized-output', template: '<p>It works!</p>'})
        class UninitializedOutputComp {
          @Output() customEvent!: EventEmitter<any>;
        }

        const template =
            '<my-uninitialized-output (customEvent)="doNothing()"></my-uninitialized-output>';
        TestBed.overrideComponent(MyComp, {set: {template}});

        TestBed.configureTestingModule({declarations: [MyComp, UninitializedOutputComp]});
        expect(() => TestBed.createComponent(MyComp))
            .toThrowError('@Output customEvent not initialized in \'UninitializedOutputComp\'.');
      });

      it('should read directives metadata from their binding token', () => {
        TestBed.configureTestingModule({declarations: [MyComp, PrivateImpl, NeedsPublicApi]});
        const template = '<div public-api><div needs-public-api></div></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
      });

      modifiedInIvy('Comment node order changed')
          .it('should support template directives via `<ng-template>` elements.', () => {
            TestBed.configureTestingModule({declarations: [MyComp, SomeViewport]});
            const template =
                '<ng-template some-viewport let-greeting="someTmpl"><span>{{greeting}}</span></ng-template>';
            TestBed.overrideComponent(MyComp, {set: {template}});
            const fixture = TestBed.createComponent(MyComp);

            fixture.detectChanges();

            const childNodesOfWrapper = fixture.nativeElement.childNodes;
            // 1 template + 2 copies.
            expect(childNodesOfWrapper.length).toBe(3);
            expect(childNodesOfWrapper[1]).toHaveText('hello');
            expect(childNodesOfWrapper[2]).toHaveText('again');
          });

      it('should not share empty context for template directives - issue #10045', () => {
        TestBed.configureTestingModule({declarations: [MyComp, PollutedContext, NoContext]});
        const template =
            '<ng-template pollutedContext let-foo="bar">{{foo}}</ng-template><ng-template noContext let-foo="bar">{{foo}}</ng-template>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('baz');
      });

      it('should not detach views in ViewContainers when the parent view is destroyed.', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeViewport]});
        const template =
            '<div *ngIf="ctxBoolProp"><ng-template some-viewport let-greeting="someTmpl"><span>{{greeting}}</span></ng-template></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        const ngIfEl = fixture.debugElement.children[0];
        const someViewport: SomeViewport =
            ngIfEl.childNodes
                .find(
                    debugElement => debugElement.nativeNode.nodeType ===
                        Node.COMMENT_NODE)!.injector.get(SomeViewport);
        expect(someViewport.container.length).toBe(2);
        expect(ngIfEl.children.length).toBe(2);

        fixture.componentInstance.ctxBoolProp = false;
        fixture.detectChanges();

        expect(someViewport.container.length).toBe(2);
        expect(fixture.debugElement.children.length).toBe(0);
      });

      it('should use a comment while stamping out `<ng-template>` elements.', () => {
        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]})
                .overrideComponent(MyComp, {set: {template: '<ng-template></ng-template>'}})
                .createComponent(MyComp);

        const childNodesOfWrapper = fixture.nativeElement.childNodes;
        expect(childNodesOfWrapper.length).toBe(1);
        expect(isCommentNode(childNodesOfWrapper[0])).toBe(true);
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
            '<some-directive><toolbar><ng-template toolbarpart let-toolbarProp="toolbarProp">{{ctxProp}},{{toolbarProp}},<cmp-with-host></cmp-with-host></ng-template></toolbar></some-directive>';
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

          expect(fixture.debugElement.children[0].children[0].references!['alice'])
              .toBeAnInstanceOf(ChildComp);
        });

        it('should assign a directive to a ref-', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ExportDir]});
          const template = '<div><div export-dir #localdir="dir"></div></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].children[0].references!['localdir'])
              .toBeAnInstanceOf(ExportDir);
        });

        it('should assign a directive to a ref when it has multiple exportAs names', () => {
          TestBed.configureTestingModule(
              {declarations: [MyComp, DirectiveWithMultipleExportAsNames]});

          const template = '<div multiple-export-as #x="dirX" #y="dirY"></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});

          const fixture = TestBed.createComponent(MyComp);
          expect(fixture.debugElement.children[0].references!['x'])
              .toBeAnInstanceOf(DirectiveWithMultipleExportAsNames);
          expect(fixture.debugElement.children[0].references!['y'])
              .toBeAnInstanceOf(DirectiveWithMultipleExportAsNames);
        });

        it('should make the assigned component accessible in property bindings, even if they were declared before the component',
           () => {
             TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
             const template =
                 '<ng-template [ngIf]="true">{{alice.ctxProp}}</ng-template>|{{alice.ctxProp}}|<child-cmp ref-alice></child-cmp>';
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

          const pEl = fixture.debugElement.children[0];

          const alice = pEl.children[0].references!['alice'];
          const bob = pEl.children[1].references!['bob'];
          expect(alice).toBeAnInstanceOf(ChildComp);
          expect(bob).toBeAnInstanceOf(ChildComp);
          expect(alice).not.toBe(bob);
        });

        it('should assign the component instance to a ref- with shorthand syntax', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template = '<child-cmp #alice></child-cmp>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].references!['alice']).toBeAnInstanceOf(ChildComp);
        });

        it('should assign the element instance to a user-defined variable', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template = '<div><div ref-alice><i>Hello</i></div></div>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const value = fixture.debugElement.children[0].children[0].references!['alice'];
          expect(value).not.toBe(null);
          expect(value.tagName.toLowerCase()).toEqual('div');
        });

        it('should assign the TemplateRef to a user-defined variable', () => {
          const fixture =
              TestBed.configureTestingModule({declarations: [MyComp]})
                  .overrideComponent(
                      MyComp, {set: {template: '<ng-template ref-alice></ng-template>'}})
                  .createComponent(MyComp);

          const value = fixture.debugElement.childNodes[0].references!['alice'];
          expect(value.createEmbeddedView).toBeTruthy();
        });

        it('should preserve case', () => {
          TestBed.configureTestingModule({declarations: [MyComp, ChildComp]});
          const template = '<p><child-cmp ref-superAlice></child-cmp></p>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          expect(fixture.debugElement.children[0].children[0].references!['superAlice'])
              .toBeAnInstanceOf(ChildComp);
        });
      });

      describe('variables', () => {
        modifiedInIvy('Comment node order changed')
            .it('should allow to use variables in a for loop', () => {
              const template =
                  '<ng-template ngFor [ngForOf]="[1]" let-i><child-cmp-no-template #cmp></child-cmp-no-template>{{i}}-{{cmp.ctxProp}}</ng-template>';

              const fixture =
                  TestBed.configureTestingModule({declarations: [MyComp, ChildCompNoTemplate]})
                      .overrideComponent(MyComp, {set: {template}})
                      .createComponent(MyComp);

              fixture.detectChanges();
              // Get the element at index 2, since index 0 is the <ng-template>.
              expect(fixture.nativeElement.childNodes[2]).toHaveText('1-hello');
            });
      });

      describe('OnPush components', () => {
        it('should use ChangeDetectorRef to manually request a check', () => {
          TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithRef]]]});
          const template = '<push-cmp-with-ref #cmp></push-cmp-with-ref>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const cmp = fixture.debugElement.children[0].references!['cmp'];

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

          const cmp = fixture.debugElement.children[0].references!['cmp'];

          fixture.componentInstance.ctxProp = 'one';
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          fixture.componentInstance.ctxProp = 'two';
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(2);
        });

        if (getDOM().supportsDOMEvents) {
          it('should allow to destroy a component from within a host event handler',
             fakeAsync(() => {
               TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithHostEvent]]]});
               const template = '<push-cmp-with-host-event></push-cmp-with-host-event>';
               TestBed.overrideComponent(MyComp, {set: {template}});
               const fixture = TestBed.createComponent(MyComp);

               tick();
               fixture.detectChanges();

               const cmpEl = fixture.debugElement.children[0];
               const cmp: PushCmpWithHostEvent = cmpEl.injector.get(PushCmpWithHostEvent);
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

          const cmpEl = fixture.debugElement.children[0];
          const cmp = cmpEl.componentInstance;
          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          // regular element
          cmpEl.children[0].triggerEventHandler('click', <Event>{});
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

          // host element
          cmpEl.triggerEventHandler('click', <Event>{});
          fixture.detectChanges();
          fixture.detectChanges();
          expect(cmp.numberOfChecks).toEqual(5);
        });

        it('should not affect updating properties on the component', () => {
          TestBed.configureTestingModule({declarations: [MyComp, [[PushCmpWithRef]]]});
          const template = '<push-cmp-with-ref [prop]="ctxProp" #cmp></push-cmp-with-ref>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const cmp = fixture.debugElement.children[0].references!['cmp'];

          fixture.componentInstance.ctxProp = 'one';
          fixture.detectChanges();
          expect(cmp.prop).toEqual('one');

          fixture.componentInstance.ctxProp = 'two';
          fixture.detectChanges();
          expect(cmp.prop).toEqual('two');
        });

        it('should be checked when an async pipe requests a check', fakeAsync(() => {
             TestBed.configureTestingModule(
                 {declarations: [MyComp, PushCmpWithAsyncPipe], imports: [CommonModule]});
             const template = '<push-cmp-with-async #cmp></push-cmp-with-async>';
             TestBed.overrideComponent(MyComp, {set: {template}});
             const fixture = TestBed.createComponent(MyComp);

             tick();

             const cmp: PushCmpWithAsyncPipe = fixture.debugElement.children[0].references!['cmp'];
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

        const childComponent =
            fixture.debugElement.children[0].children[0].children[0].references!['child'];
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

        const tc = fixture.debugElement.children[0].children[0].children[0];

        const childComponent = tc.references!['child'];
        expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
      });

      it('should support events via EventEmitter on regular elements', waitForAsync(() => {
           TestBed.configureTestingModule(
               {declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent]});
           const template = '<div emitter listener></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);

           const tc = fixture.debugElement.children[0];
           const emitter = tc.injector.get(DirectiveEmittingEvent);
           const listener = tc.injector.get(DirectiveListeningEvent);

           expect(listener.msg).toEqual('');
           let eventCount = 0;

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

      it('should support events via EventEmitter on template elements', waitForAsync(() => {
           const fixture =
               TestBed
                   .configureTestingModule(
                       {declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent]})
                   .overrideComponent(MyComp, {
                     set: {
                       template:
                           '<ng-template emitter listener (event)="ctxProp=$event"></ng-template>'
                     }
                   })
                   .createComponent(MyComp);
           const tc = fixture.debugElement.childNodes.find(
               debugElement => debugElement.nativeNode.nodeType === Node.COMMENT_NODE)!;

           const emitter = tc.injector.get(DirectiveEmittingEvent);
           const myComp = fixture.debugElement.injector.get(MyComp);
           const listener = tc.injector.get(DirectiveListeningEvent);

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

      it('should support [()] syntax', waitForAsync(() => {
           TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTwoWayBinding]});
           const template = '<div [(control)]="ctxProp" two-way></div>';
           TestBed.overrideComponent(MyComp, {set: {template}});
           const fixture = TestBed.createComponent(MyComp);
           const tc = fixture.debugElement.children[0];
           const dir = tc.injector.get(DirectiveWithTwoWayBinding);

           fixture.componentInstance.ctxProp = 'one';
           fixture.detectChanges();

           expect(dir.control).toEqual('one');

           dir.controlChange.subscribe({
             next: () => {
               expect(fixture.componentInstance.ctxProp).toEqual('two');
             }
           });

           dir.triggerChange('two');
         }));

      it('should support render events', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveListeningDomEvent]});
        const template = '<div listener></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        const tc = fixture.debugElement.children[0];
        const listener = tc.injector.get(DirectiveListeningDomEvent);

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
        const doc = TestBed.inject(DOCUMENT);

        const tc = fixture.debugElement.children[0];
        const listener = tc.injector.get(DirectiveListeningDomEvent);
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'window'), 'domEvent');
        expect(listener.eventTypes).toEqual(['window_domEvent']);

        listener.eventTypes = [];
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'document'), 'domEvent');
        expect(listener.eventTypes).toEqual(['document_domEvent', 'window_domEvent']);

        fixture.destroy();
        listener.eventTypes = [];
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'body'), 'domEvent');
        expect(listener.eventTypes).toEqual([]);
      });

      it('should support updating host element via hostAttributes on root elements', () => {
        @Component({host: {'role': 'button'}, template: ''})
        class ComponentUpdatingHostAttributes {
        }

        TestBed.configureTestingModule({declarations: [ComponentUpdatingHostAttributes]});
        const fixture = TestBed.createComponent(ComponentUpdatingHostAttributes);

        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.getAttribute('role')).toEqual('button');
      });

      it('should support updating host element via hostAttributes on host elements', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveUpdatingHostAttributes]});
        const template = '<div update-host-attributes></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();

        expect(fixture.debugElement.children[0].nativeElement.getAttribute('role'))
            .toEqual('button');
      });

      it('should support updating host element via hostProperties', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveUpdatingHostProperties]});
        const template = '<div update-host-properties></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        const tc = fixture.debugElement.children[0];
        const updateHost = tc.injector.get(DirectiveUpdatingHostProperties);

        updateHost.id = 'newId';

        fixture.detectChanges();

        expect(tc.nativeElement.id).toEqual('newId');
      });

      it('should not use template variables for expressions in hostProperties', () => {
        @Directive({selector: '[host-properties]', host: {'[id]': 'id', '[title]': 'unknownProp'}})
        class DirectiveWithHostProps {
          id = 'one';
          unknownProp = 'unknownProp';
        }

        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithHostProps]})
                .overrideComponent(
                    MyComp,
                    {set: {template: `<div *ngFor="let id of ['forId']" host-properties></div>`}})
                .createComponent(MyComp);
        fixture.detectChanges();

        const tc = fixture.debugElement.children[0];
        expect(tc.properties['id']).toBe('one');
        expect(tc.properties['title']).toBe('unknownProp');
      });

      it('should not allow pipes in hostProperties', () => {
        @Directive({selector: '[host-properties]', host: {'[id]': 'id | uppercase'}})
        class DirectiveWithHostProps {
        }

        TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithHostProps]});
        const template = '<div host-properties></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        expect(() => TestBed.createComponent(MyComp))
            .toThrowError(/Host binding expression cannot contain pipes/);
      });

      it('should not use template variables for expressions in hostListeners', () => {
        @Directive({selector: '[host-listener]', host: {'(click)': 'doIt(id, unknownProp)'}})
        class DirectiveWithHostListener {
          id = 'one';
          // TODO(issue/24571): remove '!'.
          receivedArgs!: any[];

          doIt(...args: any[]) {
            this.receivedArgs = args;
          }
        }

        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithHostListener]})
                .overrideComponent(
                    MyComp,
                    {set: {template: `<div *ngFor="let id of ['forId']" host-listener></div>`}})
                .createComponent(MyComp);
        fixture.detectChanges();
        const tc = fixture.debugElement.children[0];
        tc.triggerEventHandler('click', {});
        const dir: DirectiveWithHostListener = tc.injector.get(DirectiveWithHostListener);
        expect(dir.receivedArgs).toEqual(['one', undefined]);
      });

      it('should not allow pipes in hostListeners', () => {
        @Directive({selector: '[host-listener]', host: {'(click)': 'doIt() | somePipe'}})
        class DirectiveWithHostListener {
        }

        TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithHostListener]});
        const template = '<div host-listener></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        expect(() => TestBed.createComponent(MyComp))
            .toThrowError(/Cannot have a pipe in an action expression/);
      });



      if (getDOM().supportsDOMEvents) {
        it('should support preventing default on render events', () => {
          TestBed.configureTestingModule({
            declarations:
                [MyComp, DirectiveListeningDomEventPrevent, DirectiveListeningDomEventNoPrevent]
          });
          const template =
              '<input type="checkbox" listenerprevent><input type="checkbox" listenernoprevent>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const dispatchedEvent = createMouseEvent('click');
          const dispatchedEvent2 = createMouseEvent('click');
          getDOM().dispatchEvent(fixture.debugElement.children[0].nativeElement, dispatchedEvent);
          getDOM().dispatchEvent(fixture.debugElement.children[1].nativeElement, dispatchedEvent2);
          expect(isPrevented(dispatchedEvent)).toBe(true);
          expect(isPrevented(dispatchedEvent2)).toBe(false);
          expect(fixture.debugElement.children[0].nativeElement.checked).toBeFalsy();
          expect(fixture.debugElement.children[1].nativeElement.checked).toBeTruthy();
        });
      }

      it('should support render global events from multiple directives', () => {
        TestBed.configureTestingModule(
            {declarations: [MyComp, DirectiveListeningDomEvent, DirectiveListeningDomEventOther]});
        const template = '<div *ngIf="ctxBoolProp" listener listenerother></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);
        const doc = TestBed.inject(DOCUMENT);

        globalCounter = 0;
        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        const tc = fixture.debugElement.children[0];

        const listener = tc.injector.get(DirectiveListeningDomEvent);
        const listenerother = tc.injector.get(DirectiveListeningDomEventOther);
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'window'), 'domEvent');
        expect(listener.eventTypes).toEqual(['window_domEvent']);
        expect(listenerother.eventType).toEqual('other_domEvent');
        expect(globalCounter).toEqual(1);


        fixture.componentInstance.ctxBoolProp = false;
        fixture.detectChanges();
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'window'), 'domEvent');
        expect(globalCounter).toEqual(1);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();
        dispatchEvent(getDOM().getGlobalEventTarget(doc, 'window'), 'domEvent');
        expect(globalCounter).toEqual(2);

        // need to destroy to release all remaining global event listeners
        fixture.destroy();
      });

      describe('ViewContainerRef', () => {
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

        describe('.createComponent', () => {
          it('should allow to create a component at any bound location', waitForAsync(() => {
               const fixture = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                                   .createComponent(MyComp);
               const tc = fixture.debugElement.children[0].children[0];
               const dynamicVp: DynamicViewport = tc.injector.get(DynamicViewport);
               dynamicVp.create();
               fixture.detectChanges();
               expect(fixture.debugElement.children[0].children[1].nativeElement)
                   .toHaveText('dynamic greet');
             }));

          it('should allow to create multiple components at a location', waitForAsync(() => {
               const fixture = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                                   .createComponent(MyComp);
               const tc = fixture.debugElement.children[0].children[0];
               const dynamicVp: DynamicViewport = tc.injector.get(DynamicViewport);
               dynamicVp.create();
               dynamicVp.create();
               fixture.detectChanges();
               expect(fixture.debugElement.children[0].children[1].nativeElement)
                   .toHaveText('dynamic greet');
               expect(fixture.debugElement.children[0].children[2].nativeElement)
                   .toHaveText('dynamic greet');
             }));

          it('should create a component that has been freshly compiled', () => {
            @Component({template: ''})
            class RootComp {
              constructor(public vc: ViewContainerRef) {}
            }

            @NgModule({
              declarations: [RootComp],
              providers: [{provide: 'someToken', useValue: 'someRootValue'}],
            })
            class RootModule {
            }

            @Component({template: ''})
            class MyComp {
              constructor(@Inject('someToken') public someToken: string) {}
            }

            @NgModule({
              declarations: [MyComp],
              providers: [{provide: 'someToken', useValue: 'someValue'}],
            })
            class MyModule {
            }

            const compFixture =
                TestBed.configureTestingModule({imports: [RootModule]}).createComponent(RootComp);
            const compiler = TestBed.inject(Compiler);
            const myCompFactory =
                <ComponentFactory<MyComp>>compiler.compileModuleAndAllComponentsSync(MyModule)
                    .componentFactories[0];

            // Note: the ComponentFactory was created directly via the compiler, i.e. it
            // does not have an association to an NgModuleRef.
            // -> expect the providers of the module that the view container belongs to.
            const compRef = compFixture.componentInstance.vc.createComponent(myCompFactory);
            expect(compRef.instance.someToken).toBe('someRootValue');
          });

          it('should create a component with the passed NgModuleRef', () => {
            @Component({template: ''})
            class RootComp {
              constructor(public vc: ViewContainerRef) {}
            }

            @Component({template: ''})
            class MyComp {
              constructor(@Inject('someToken') public someToken: string) {}
            }

            @NgModule({
              declarations: [RootComp, MyComp],
              entryComponents: [MyComp],
              providers: [{provide: 'someToken', useValue: 'someRootValue'}],
            })
            class RootModule {
            }

            @NgModule({providers: [{provide: 'someToken', useValue: 'someValue'}]})
            class MyModule {
            }

            const compFixture =
                TestBed.configureTestingModule({imports: [RootModule]}).createComponent(RootComp);
            const compiler = TestBed.inject(Compiler);
            const myModule =
                compiler.compileModuleSync(MyModule).create(TestBed.inject(NgModuleRef).injector);
            const myCompFactory =
                TestBed.inject(ComponentFactoryResolver).resolveComponentFactory(MyComp);

            // Note: MyComp was declared as entryComponent in the RootModule,
            // but we pass MyModule to the createComponent call.
            // -> expect the providers of MyModule!
            const compRef = compFixture.componentInstance.vc.createComponent(
                myCompFactory, undefined, undefined, undefined, myModule);
            expect(compRef.instance.someToken).toBe('someValue');
          });

          it('should create a component with the NgModuleRef of the ComponentFactoryResolver',
             () => {
               @Component({template: ''})
               class RootComp {
                 constructor(public vc: ViewContainerRef) {}
               }

               @NgModule({
                 declarations: [RootComp],
                 providers: [{provide: 'someToken', useValue: 'someRootValue'}],
               })
               class RootModule {
               }

               @Component({template: ''})
               class MyComp {
                 constructor(@Inject('someToken') public someToken: string) {}
               }

               @NgModule({
                 declarations: [MyComp],
                 entryComponents: [MyComp],
                 providers: [{provide: 'someToken', useValue: 'someValue'}],
               })
               class MyModule {
               }

               const compFixture = TestBed.configureTestingModule({imports: [RootModule]})
                                       .createComponent(RootComp);
               const compiler = TestBed.inject(Compiler);
               const myModule = compiler.compileModuleSync(MyModule).create(
                   TestBed.inject(NgModuleRef).injector);
               const myCompFactory =
                   myModule.componentFactoryResolver.resolveComponentFactory(MyComp);

               // Note: MyComp was declared as entryComponent in MyModule,
               // and we don't pass an explicit ModuleRef to the createComponent call.
               // -> expect the providers of MyModule!
               const compRef = compFixture.componentInstance.vc.createComponent(myCompFactory);
               expect(compRef.instance.someToken).toBe('someValue');
             });
        });

        describe('.insert', () => {
          it('should throw with destroyed views', waitForAsync(() => {
               const fixture = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                                   .createComponent(MyComp);
               const tc = fixture.debugElement.children[0].children[0];
               const dynamicVp: DynamicViewport = tc.injector.get(DynamicViewport);
               const ref = dynamicVp.create();
               fixture.detectChanges();

               ref.destroy();
               expect(() => {
                 dynamicVp.insert(ref.hostView);
               }).toThrowError('Cannot insert a destroyed View in a ViewContainer!');
             }));
        });

        describe('.move', () => {
          it('should throw with destroyed views', waitForAsync(() => {
               const fixture = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                                   .createComponent(MyComp);
               const tc = fixture.debugElement.children[0].children[0];
               const dynamicVp: DynamicViewport = tc.injector.get(DynamicViewport);
               const ref = dynamicVp.create();
               fixture.detectChanges();

               ref.destroy();
               expect(() => {
                 dynamicVp.move(ref.hostView, 1);
               }).toThrowError('Cannot move a destroyed View in a ViewContainer!');
             }));
        });
      });

      it('should support static attributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp, NeedsAttribute]});
        const template = '<input static type="text" title>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        const tc = fixture.debugElement.children[0];
        const needsAttribute = tc.injector.get(NeedsAttribute);
        expect(needsAttribute.typeAttribute).toEqual('text');
        expect(needsAttribute.staticAttribute).toEqual('');
        expect(needsAttribute.fooAttribute).toBeNull();
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
                'Default InterpolationCustom Interpolation ACustom Interpolation B (Default Interpolation)');
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

        const comp = fixture.debugElement.children[0].children[0].references!['consuming'];
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

        const comp = fixture.debugElement.children[0].references!['consuming'];
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

        const comp = fixture.debugElement.children[0].children[0].references!['dir'];
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

        const gpComp = fixture.debugElement.children[0];
        const parentComp = gpComp.children[0];
        const childComp = parentComp.children[0];

        const grandParent = gpComp.injector.get(GrandParentProvidingEventBus);
        const parent = parentComp.injector.get(ParentProvidingEventBus);
        const child = childComp.injector.get(ChildConsumingEventBus);

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

        const providing = fixture.debugElement.children[0].references!['providing'];
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

        expect(fixture.nativeElement.querySelectorAll('script').length).toEqual(0);
      });

      it('should throw when using directives without selector in NgModule declarations', () => {
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

      it('should not throw when using directives without selector as base class not in declarations',
         () => {
           @Directive({})
           abstract class Base {
             constructor(readonly injector: Injector) {}
           }

           @Directive()
           abstract class EmptyDir {
           }

           @Directive({inputs: ['a', 'b']})
           class TestDirWithInputs {
           }

           @Component({selector: 'comp', template: ''})
           class SomeComponent extends Base {
           }

           @Component({selector: 'comp2', template: ''})
           class SomeComponent2 extends EmptyDir {
           }

           @Component({selector: 'comp3', template: ''})
           class SomeComponent3 extends TestDirWithInputs {
           }

           TestBed.configureTestingModule(
               {declarations: [MyComp, SomeComponent, SomeComponent2, SomeComponent3]});
           expect(() => TestBed.createComponent(MyComp)).not.toThrowError();
         });

      it('should throw when using directives with empty string selector', () => {
        @Directive({selector: ''})
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
        let noSelectorComponentFactory: ComponentFactory<SomeComponent> = undefined!;

        @Component({template: '----'})
        class NoSelectorComponent {
        }

        @Component({selector: 'some-comp', template: '', entryComponents: [NoSelectorComponent]})
        class SomeComponent {
          constructor(componentFactoryResolver: ComponentFactoryResolver) {
            // grab its own component factory
            noSelectorComponentFactory =
                componentFactoryResolver.resolveComponentFactory(NoSelectorComponent)!;
          }
        }

        TestBed.configureTestingModule({declarations: [SomeComponent, NoSelectorComponent]});

        // get the factory
        TestBed.createComponent(SomeComponent);

        expect(noSelectorComponentFactory.selector).toBe('ng-component');

        expect(noSelectorComponentFactory.create(Injector.NULL)
                   .location.nativeElement.nodeName.toLowerCase())
            .toEqual('ng-component');
      });
    });

    describe('error handling', () => {
      it('should report a meaningful error when a directive is missing annotation', () => {
        TestBed.configureTestingModule({declarations: [MyComp, SomeDirectiveMissingAnnotation]});

        expect(() => TestBed.createComponent(MyComp))
            .toThrowError(`Unexpected value '${
                stringify(
                    SomeDirectiveMissingAnnotation)}' declared by the module 'DynamicTestModule'. Please add a @Pipe/@Directive/@Component annotation.`);
      });

      it('should report a meaningful error when a component is missing view annotation', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ComponentWithoutView]});
        try {
          TestBed.createComponent(ComponentWithoutView);
        } catch (e) {
          expect(e.message).toContain(
              `No template specified for component ${stringify(ComponentWithoutView)}`);
        }
      });

      obsoleteInIvy('DebugContext is not patched on exceptions in ivy')
          .it('should provide an error context when an error happens in DI', () => {
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
              const c = getDebugContext(e);
              expect(c.componentRenderElement.nodeName.toUpperCase()).toEqual('DIV');
              expect((<Injector>c.injector).get).toBeTruthy();
            }
          });

      obsoleteInIvy('DebugContext is not patched on exceptions in ivy')
          .it('should provide an error context when an error happens in change detection', () => {
            TestBed.configureTestingModule({declarations: [MyComp, DirectiveThrowingAnError]});
            const template = `<input [value]="one.two.three" #local>`;
            TestBed.overrideComponent(MyComp, {set: {template}});
            const fixture = TestBed.createComponent(MyComp);
            try {
              fixture.detectChanges();
              throw 'Should throw';
            } catch (e) {
              const c = getDebugContext(e);
              expect(c.renderNode.nodeName.toUpperCase()).toEqual('INPUT');
              expect(c.componentRenderElement.nodeName.toUpperCase()).toEqual('DIV');
              expect((<Injector>c.injector).get).toBeTruthy();
              expect(c.context).toEqual(fixture.componentInstance);
              expect(c.references['local']).toBeDefined();
            }
          });

      obsoleteInIvy('DebugContext is not patched on exceptions in ivy')
          .it('should provide an error context when an error happens in change detection (text node)',
              () => {
                TestBed.configureTestingModule({declarations: [MyComp]});
                const template = `<div>{{one.two.three}}</div>`;
                TestBed.overrideComponent(MyComp, {set: {template}});
                const fixture = TestBed.createComponent(MyComp);
                try {
                  fixture.detectChanges();
                  throw 'Should throw';
                } catch (e) {
                  const c = getDebugContext(e);
                  expect(c.renderNode).toBeTruthy();
                }
              });

      obsoleteInIvy('DebugContext is not patched on exceptions in ivy')
          .it('should provide an error context when an error happens in an event handler',
              fakeAsync(() => {
                TestBed.configureTestingModule({
                  declarations: [MyComp, DirectiveEmittingEvent, DirectiveListeningEvent],
                  schemas: [NO_ERRORS_SCHEMA],
                });
                const template = `<span emitter listener (event)="throwError()" #local></span>`;
                TestBed.overrideComponent(MyComp, {set: {template}});
                const fixture = TestBed.createComponent(MyComp);
                tick();

                const tc = fixture.debugElement.children[0];

                const errorHandler = tc.injector.get(ErrorHandler);
                let err: any;
                spyOn(errorHandler, 'handleError').and.callFake((e: any) => err = e);
                tc.injector.get(DirectiveEmittingEvent).fireEvent('boom');

                expect(err).toBeTruthy();
                const c = getDebugContext(err);
                expect(c.renderNode.nodeName.toUpperCase()).toEqual('SPAN');
                expect(c.componentRenderElement.nodeName.toUpperCase()).toEqual('DIV');
                expect((<Injector>c.injector).get).toBeTruthy();
                expect(c.context).toEqual(fixture.componentInstance);
                expect(c.references['local']).toBeDefined();
              }));
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


    describe('moving embedded views of projectable nodes in a dynamic component', () => {
      @Component({selector: 'menu-item', template: ''})
      class DynamicMenuItem {
        @ViewChild('templateRef', {static: true}) templateRef!: TemplateRef<any>;
        itemContent!: string;
      }

      @NgModule({
        declarations: [DynamicMenuItem],
        entryComponents: [DynamicMenuItem],
      })
      class DynamicMenuItemModule {
      }

      @Component({selector: 'test', template: `<ng-container #menuItemsContainer></ng-container>`})
      class TestCmp {
        constructor(public cfr: ComponentFactoryResolver) {}
        @ViewChild('menuItemsContainer', {static: true, read: ViewContainerRef})
        menuItemsContainer!: ViewContainerRef;
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [TestCmp],
          imports: [DynamicMenuItemModule],
        });
      });

      const createElWithContent = (content: string, tagName = 'span') => {
        const element = document.createElement(tagName);
        element.textContent = content;
        return element;
      };

      it('should support moving embedded views of projectable nodes', () => {
        TestBed.overrideTemplate(
            DynamicMenuItem, `<ng-template #templateRef><ng-content></ng-content></ng-template>`);

        const fixture = TestBed.createComponent(TestCmp);
        const menuItemsContainer = fixture.componentInstance.menuItemsContainer;
        const dynamicCmptFactory =
            fixture.componentInstance.cfr.resolveComponentFactory(DynamicMenuItem);

        const cmptRefWithAa =
            dynamicCmptFactory.create(Injector.NULL, [[createElWithContent('Aa')]]);
        const cmptRefWithBb =
            dynamicCmptFactory.create(Injector.NULL, [[createElWithContent('Bb')]]);
        const cmptRefWithCc =
            dynamicCmptFactory.create(Injector.NULL, [[createElWithContent('Cc')]]);

        menuItemsContainer.insert(cmptRefWithAa.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithBb.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithCc.instance.templateRef.createEmbeddedView({}));

        menuItemsContainer.move(menuItemsContainer.get(0)!, 1);
        expect(fixture.nativeElement.textContent).toBe('BbAaCc');
        menuItemsContainer.move(menuItemsContainer.get(2)!, 1);
        expect(fixture.nativeElement.textContent).toBe('BbCcAa');
      });

      it('should support moving embedded views of projectable nodes in multiple slots', () => {
        TestBed.overrideTemplate(
            DynamicMenuItem,
            `<ng-template #templateRef><ng-content select="span"></ng-content><ng-content select="button"></ng-content></ng-template>`);

        const fixture = TestBed.createComponent(TestCmp);
        const menuItemsContainer = fixture.componentInstance.menuItemsContainer;
        const dynamicCmptFactory =
            fixture.componentInstance.cfr.resolveComponentFactory(DynamicMenuItem);

        const cmptRefWithAa = dynamicCmptFactory.create(
            Injector.NULL, [[createElWithContent('A')], [createElWithContent('a', 'button')]]);
        const cmptRefWithBb = dynamicCmptFactory.create(
            Injector.NULL, [[createElWithContent('B')], [createElWithContent('b', 'button')]]);
        const cmptRefWithCc = dynamicCmptFactory.create(
            Injector.NULL, [[createElWithContent('C')], [createElWithContent('c', 'button')]]);

        menuItemsContainer.insert(cmptRefWithAa.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithBb.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithCc.instance.templateRef.createEmbeddedView({}));

        menuItemsContainer.move(menuItemsContainer.get(0)!, 1);
        expect(fixture.nativeElement.textContent).toBe('BbAaCc');
        menuItemsContainer.move(menuItemsContainer.get(2)!, 1);
        expect(fixture.nativeElement.textContent).toBe('BbCcAa');
      });

      it('should support moving embedded views of projectable nodes in multiple slots and interpolations',
         () => {
           TestBed.overrideTemplate(
               DynamicMenuItem,
               `<ng-template #templateRef><ng-content select="span"></ng-content>{{itemContent}}<ng-content select="button"></ng-content></ng-template>`);

           TestBed.configureTestingModule(
               {declarations: [TestCmp], imports: [DynamicMenuItemModule]});

           const fixture = TestBed.createComponent(TestCmp);
           const menuItemsContainer = fixture.componentInstance.menuItemsContainer;
           const dynamicCmptFactory =
               fixture.componentInstance.cfr.resolveComponentFactory(DynamicMenuItem);

           const cmptRefWithAa = dynamicCmptFactory.create(
               Injector.NULL, [[createElWithContent('A')], [createElWithContent('a', 'button')]]);
           const cmptRefWithBb = dynamicCmptFactory.create(
               Injector.NULL, [[createElWithContent('B')], [createElWithContent('b', 'button')]]);
           const cmptRefWithCc = dynamicCmptFactory.create(
               Injector.NULL, [[createElWithContent('C')], [createElWithContent('c', 'button')]]);

           menuItemsContainer.insert(cmptRefWithAa.instance.templateRef.createEmbeddedView({}));
           menuItemsContainer.insert(cmptRefWithBb.instance.templateRef.createEmbeddedView({}));
           menuItemsContainer.insert(cmptRefWithCc.instance.templateRef.createEmbeddedView({}));

           cmptRefWithAa.instance.itemContent = '0';
           cmptRefWithBb.instance.itemContent = '1';
           cmptRefWithCc.instance.itemContent = '2';

           fixture.detectChanges();

           menuItemsContainer.move(menuItemsContainer.get(0)!, 1);
           expect(fixture.nativeElement.textContent).toBe('B1bA0aC2c');
           menuItemsContainer.move(menuItemsContainer.get(2)!, 1);
           expect(fixture.nativeElement.textContent).toBe('B1bC2cA0a');
         });

      it('should support moving embedded views with empty projectable slots', () => {
        TestBed.overrideTemplate(
            DynamicMenuItem, `<ng-template #templateRef><ng-content></ng-content></ng-template>`);

        const fixture = TestBed.createComponent(TestCmp);
        const menuItemsContainer = fixture.componentInstance.menuItemsContainer;
        const dynamicCmptFactory =
            fixture.componentInstance.cfr.resolveComponentFactory(DynamicMenuItem);

        const cmptRefWithAa = dynamicCmptFactory.create(Injector.NULL, [[]]);
        const cmptRefWithBb =
            dynamicCmptFactory.create(Injector.NULL, [[createElWithContent('Bb')]]);
        const cmptRefWithCc =
            dynamicCmptFactory.create(Injector.NULL, [[createElWithContent('Cc')]]);

        menuItemsContainer.insert(cmptRefWithAa.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithBb.instance.templateRef.createEmbeddedView({}));
        menuItemsContainer.insert(cmptRefWithCc.instance.templateRef.createEmbeddedView({}));

        menuItemsContainer.move(menuItemsContainer.get(0)!, 1);  // [ Bb, NULL, Cc]
        expect(fixture.nativeElement.textContent).toBe('BbCc');
        menuItemsContainer.move(menuItemsContainer.get(2)!, 1);  // [ Bb, Cc, NULL]
        expect(fixture.nativeElement.textContent).toBe('BbCc');
        menuItemsContainer.move(menuItemsContainer.get(0)!, 1);  // [ Cc, Bb, NULL]
        expect(fixture.nativeElement.textContent).toBe('CcBb');
      });
    });

    describe('Property bindings', () => {
      modifiedInIvy('Unknown property error throws an error instead of logging it')
          .it('should throw on bindings to unknown properties', () => {
            TestBed.configureTestingModule({declarations: [MyComp]});
            const template = '<div unknown="{{ctxProp}}"></div>';
            TestBed.overrideComponent(MyComp, {set: {template}});
            try {
              TestBed.createComponent(MyComp);
              throw 'Should throw';
            } catch (e) {
              expect(e.message).toMatch(
                  /Template parse errors:\nCan't bind to 'unknown' since it isn't a known property of 'div'. \("<div \[ERROR ->\]unknown="{{ctxProp}}"><\/div>"\): .*MyComp.html@0:5/);
            }
          });

      onlyInIvy('Unknown property logs an error message instead of throwing')
          .it('should throw on bindings to unknown properties', () => {
            TestBed.configureTestingModule({declarations: [MyComp]});
            const template = '<div unknown="{{ctxProp}}"></div>';
            TestBed.overrideComponent(MyComp, {set: {template}});

            const spy = spyOn(console, 'error');
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
            expect(spy.calls.mostRecent().args[0])
                .toMatch(/Can't bind to 'unknown' since it isn't a known property of 'div'./);
          });

      modifiedInIvy('Unknown property error thrown instead of logging it')
          .it('should throw on bindings to unknown properties', () => {
            TestBed.configureTestingModule({imports: [CommonModule], declarations: [MyComp]});
            const template = '<div *ngFor="let item in ctxArrProp">{{item}}</div>';
            TestBed.overrideComponent(MyComp, {set: {template}});

            try {
              const fixture = TestBed.createComponent(MyComp);
              fixture.detectChanges();
              throw 'Should throw';
            } catch (e) {
              expect(e.message).toMatch(
                  /Can't bind to 'ngForIn' since it isn't a known property of 'div'./);
            }
          });

      onlyInIvy('Unknown property logs an error message instead of throwing it')
          .it('should throw on bindings to unknown properties', () => {
            TestBed.configureTestingModule({imports: [CommonModule], declarations: [MyComp]});
            const template = '<div *ngFor="let item in ctxArrProp">{{item}}</div>';
            TestBed.overrideComponent(MyComp, {set: {template}});
            const spy = spyOn(console, 'error');
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
            expect(spy.calls.mostRecent().args[0])
                .toMatch(/Can't bind to 'ngForIn' since it isn't a known property of 'div'./);
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

        const el = fixture.nativeElement.querySelector('span');
        expect(el.title).toBeFalsy();
      });

      it('should work when a directive uses hostProperty to update the DOM element', () => {
        TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTitleAndHostProperty]});
        const template = '<span [title]="ctxProp"></span>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'TITLE';
        fixture.detectChanges();

        const el = fixture.nativeElement.querySelector('span');
        expect(el.title).toEqual('TITLE');
      });
    });

    describe('logging property updates', () => {
      it('should reflect property values as attributes', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        TestBed.overrideComponent(
            MyComp, {set: {template: `<div my-dir [elprop]="ctxProp"></div>`}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'hello';
        fixture.detectChanges();

        const html = fixture.nativeElement.innerHTML;
        expect(html).toContain('ng-reflect-dir-prop="hello"');
      });

      it('should reflect property values on unbound inputs', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        TestBed.overrideComponent(
            MyComp, {set: {template: `<div my-dir elprop="hello" title="Reflect test"></div>`}});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const html = fixture.nativeElement.innerHTML;
        expect(html).toContain('ng-reflect-dir-prop="hello"');
        expect(html).not.toContain('ng-reflect-title');
      });

      it(`should work with prop names containing '$'`, () => {
        TestBed.configureTestingModule({declarations: [ParentCmp, SomeCmpWithInput]});
        const fixture = TestBed.createComponent(ParentCmp);
        fixture.detectChanges();

        const html = fixture.nativeElement.innerHTML;
        expect(html).toContain('ng-reflect-test_="hello"');
      });

      it('should reflect property values on template comments', () => {
        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]})
                .overrideComponent(
                    MyComp, {set: {template: `<ng-template [ngIf]="ctxBoolProp"></ng-template>`}})
                .createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        const html = fixture.nativeElement.innerHTML;
        expect(html).toContain('"ng-reflect-ng-if": "true"');
      });

      it('should reflect property values on ng-containers', () => {
        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]})
                .overrideComponent(
                    MyComp,
                    {set: {template: `<ng-container *ngIf="ctxBoolProp">content</ng-container>`}})
                .createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        const html = fixture.nativeElement.innerHTML;
        expect(html).toContain('"ng-reflect-ng-if": "true"');
      });

      it('should reflect property values of multiple directive bound to the same input name',
         () => {
           TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyDir2]});
           TestBed.overrideComponent(
               MyComp, {set: {template: `<div my-dir my-dir2 [elprop]="ctxProp"></div>`}});
           const fixture = TestBed.createComponent(MyComp);

           fixture.componentInstance.ctxProp = 'hello';
           fixture.detectChanges();

           const html = fixture.nativeElement.innerHTML;
           expect(html).toContain('ng-reflect-dir-prop="hello"');
           expect(html).toContain('ng-reflect-dir-prop2="hello"');
         });

      it('should indicate when toString() throws', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir]});
        const template = '<div my-dir [elprop]="toStringThrow"></div>';
        TestBed.overrideComponent(MyComp, {set: {template}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toContain('[ERROR]');
      });

      it('should not reflect undefined values', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyDir2]});
        TestBed.overrideComponent(
            MyComp, {set: {template: `<div my-dir [elprop]="ctxProp"></div>`}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'hello';
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).toContain('ng-reflect-dir-prop="hello"');

        fixture.componentInstance.ctxProp = undefined!;
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).not.toContain('ng-reflect-');
      });

      it('should not reflect null values', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyDir2]});
        TestBed.overrideComponent(
            MyComp, {set: {template: `<div my-dir [elprop]="ctxProp"></div>`}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = 'hello';
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).toContain('ng-reflect-dir-prop="hello"');

        fixture.componentInstance.ctxProp = null!;
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).not.toContain('ng-reflect-');
      });

      it('should reflect empty strings', () => {
        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyDir2]});
        TestBed.overrideComponent(
            MyComp, {set: {template: `<div my-dir [elprop]="ctxProp"></div>`}});
        const fixture = TestBed.createComponent(MyComp);

        fixture.componentInstance.ctxProp = '';
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).toContain('ng-reflect-dir-prop=""');
      });

      it('should not reflect in comment nodes when the value changes to undefined', () => {
        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]})
                .overrideComponent(
                    MyComp, {set: {template: `<ng-template [ngIf]="ctxBoolProp"></ng-template>`}})
                .createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        let html = fixture.nativeElement.innerHTML;
        expect(html).toContain('bindings={');
        expect(html).toContain('"ng-reflect-ng-if": "true"');

        fixture.componentInstance.ctxBoolProp = undefined!;
        fixture.detectChanges();

        html = fixture.nativeElement.innerHTML;
        expect(html).toContain('bindings={');
        expect(html).not.toContain('ng-reflect');
      });

      it('should reflect in comment nodes when the value changes to null', () => {
        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]})
                .overrideComponent(
                    MyComp, {set: {template: `<ng-template [ngIf]="ctxBoolProp"></ng-template>`}})
                .createComponent(MyComp);

        fixture.componentInstance.ctxBoolProp = true;
        fixture.detectChanges();

        let html = fixture.nativeElement.innerHTML;
        expect(html).toContain('bindings={');
        expect(html).toContain('"ng-reflect-ng-if": "true"');

        fixture.componentInstance.ctxBoolProp = null!;
        fixture.detectChanges();

        html = fixture.nativeElement.innerHTML;
        expect(html).toContain('bindings={');
        expect(html).toContain('"ng-reflect-ng-if": null');
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
        const dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
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
        const dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
        dir.myAttr = 'aaa';

        fixture.detectChanges();
        expect(fixture.debugElement.children[0].nativeElement.outerHTML).toContain('my-attr="aaa"');
      });

      if (getDOM().supportsDOMEvents) {
        it('should support event decorators', fakeAsync(() => {
             TestBed.configureTestingModule({
               declarations: [MyComp, DirectiveWithPropDecorators],
               schemas: [NO_ERRORS_SCHEMA],
             });
             const template = `<with-prop-decorators (elEvent)="ctxProp='called'">`;
             TestBed.overrideComponent(MyComp, {set: {template}});
             const fixture = TestBed.createComponent(MyComp);

             tick();

             const emitter =
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
          const dir = fixture.debugElement.children[0].injector.get(DirectiveWithPropDecorators);
          const native = fixture.debugElement.children[0].nativeElement;
          getDOM().dispatchEvent(native, createMouseEvent('click'));

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
        const native = fixture.debugElement.children[0].nativeElement;
        expect(native).toHaveText('No View Decorator: 123');
      });
    });

    describe('whitespaces in templates', () => {
      it('should not remove whitespaces by default', waitForAsync(() => {
           @Component({
             selector: 'comp',
             template: '<span>foo</span>  <span>bar</span>',
           })
           class MyCmp {
           }

           const f = TestBed.configureTestingModule({declarations: [MyCmp]}).createComponent(MyCmp);
           f.detectChanges();

           expect(f.nativeElement.childNodes.length).toBe(2);
         }));

      it('should not remove whitespaces when explicitly requested not to do so',
         waitForAsync(() => {
           @Component({
             selector: 'comp',
             template: '<span>foo</span>  <span>bar</span>',
             preserveWhitespaces: true,
           })
           class MyCmp {
           }

           const f = TestBed.configureTestingModule({declarations: [MyCmp]}).createComponent(MyCmp);
           f.detectChanges();

           expect(f.nativeElement.childNodes.length).toBe(3);
         }));

      it('should remove whitespaces when explicitly requested to do so', waitForAsync(() => {
           @Component({
             selector: 'comp',
             template: '<span>foo</span>  <span>bar</span>',
             preserveWhitespaces: false,
           })
           class MyCmp {
           }

           const f = TestBed.configureTestingModule({declarations: [MyCmp]}).createComponent(MyCmp);
           f.detectChanges();

           expect(f.nativeElement.childNodes.length).toBe(2);
         }));
    });

    if (getDOM().supportsDOMEvents) {
      describe('svg', () => {
        it('should support svg elements', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template = '<svg><use xlink:href="Port" /></svg>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const el = fixture.nativeElement;
          const svg = el.childNodes[0];
          const use = svg.childNodes[0];
          expect(svg.namespaceURI).toEqual('http://www.w3.org/2000/svg');
          expect(use.namespaceURI).toEqual('http://www.w3.org/2000/svg');

          const firstAttribute = use.attributes[0];
          expect(firstAttribute.name).toEqual('xlink:href');
          expect(firstAttribute.namespaceURI).toEqual('http://www.w3.org/1999/xlink');
        });

        it('should support foreignObjects with document fragments', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          const template =
              '<svg><foreignObject><xhtml:div><p>Test</p></xhtml:div></foreignObject></svg>';
          TestBed.overrideComponent(MyComp, {set: {template}});
          const fixture = TestBed.createComponent(MyComp);

          const el = fixture.nativeElement;
          const svg = el.childNodes[0];
          const foreignObject = svg.childNodes[0];
          const p = foreignObject.childNodes[0];
          expect(svg.namespaceURI).toEqual('http://www.w3.org/2000/svg');
          expect(foreignObject.namespaceURI).toEqual('http://www.w3.org/2000/svg');
          expect(p.namespaceURI).toEqual('http://www.w3.org/1999/xhtml');
        });
      });

      describe('attributes', () => {
        it('should support attributes with namespace', () => {
          TestBed.configureTestingModule({declarations: [MyComp, SomeCmp]});
          const template = '<svg:use xlink:href="#id" />';
          TestBed.overrideComponent(SomeCmp, {set: {template}});
          const fixture = TestBed.createComponent(SomeCmp);

          const useEl = fixture.nativeElement.firstChild;
          expect(useEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toEqual('#id');
        });

        it('should support binding to attributes with namespace', () => {
          TestBed.configureTestingModule({declarations: [MyComp, SomeCmp]});
          const template = '<svg:use [attr.xlink:href]="value" />';
          TestBed.overrideComponent(SomeCmp, {set: {template}});
          const fixture = TestBed.createComponent(SomeCmp);

          const cmp = fixture.componentInstance;
          const useEl = fixture.nativeElement.firstChild;

          cmp.value = '#id';
          fixture.detectChanges();

          expect(useEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toEqual('#id');

          cmp.value = null;
          fixture.detectChanges();

          expect(useEl.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).toEqual(false);
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
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({selector: 'simple-imp-cmp', template: ''})
class SimpleImperativeViewComponent {
  done: any;

  constructor(self: ElementRef) {
    const hostElement = self.nativeElement;
    hostElement.appendChild(el('hello imp view'));
  }
}

@Directive({selector: 'dynamic-vp'})
class DynamicViewport {
  private componentFactory: ComponentFactory<ChildCompUsingService>;
  private injector: Injector;
  constructor(private vc: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver) {
    const myService = new MyService();
    myService.greeting = 'dynamic greet';

    this.injector = Injector.create([{provide: MyService, useValue: myService}], vc.injector);
    this.componentFactory =
        componentFactoryResolver.resolveComponentFactory(ChildCompUsingService)!;
  }

  create(): ComponentRef<ChildCompUsingService> {
    return this.vc.createComponent(this.componentFactory, this.vc.length, this.injector);
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    return this.vc.insert(viewRef, index);
  }

  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    return this.vc.move(viewRef, currentIndex);
  }
}

@Directive({selector: '[my-dir]', inputs: ['dirProp: elprop'], exportAs: 'mydir'})
class MyDir {
  dirProp: string;
  constructor() {
    this.dirProp = '';
  }
}

@Directive({selector: '[my-dir2]', inputs: ['dirProp2: elprop'], exportAs: 'mydir2'})
class MyDir2 {
  dirProp2: string;
  constructor() {
    this.dirProp2 = '';
  }
}

@Directive({selector: '[title]', inputs: ['title']})
class DirectiveWithTitle {
  // TODO(issue/24571): remove '!'.
  title!: string;
}

@Directive({selector: '[title]', inputs: ['title'], host: {'[title]': 'title'}})
class DirectiveWithTitleAndHostProperty {
  // TODO(issue/24571): remove '!'.
  title!: string;
}

@Component({selector: 'event-cmp', template: '<div (click)="noop()"></div>'})
class EventCmp {
  noop() {}
}

@Component({
  selector: 'push-cmp',
  inputs: ['prop'],
  host: {'(click)': 'true'},
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
      '{{field}}<div (click)="noop()"></div><div *ngIf="true" (click)="noop()"></div><event-cmp></event-cmp>'
})
class PushCmp {
  numberOfChecks: number;
  prop: any;

  constructor() {
    this.numberOfChecks = 0;
  }

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

  propagate() {
    this.ref.markForCheck();
  }
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
  // TODO(issue/24571): remove '!'.
  resolve!: (result: any) => void;
  promise: Promise<any>;

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
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
  ctxArrProp: number[];
  toStringThrow = {
    toString: function() {
      throw 'boom';
    }
  };

  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
    this.ctxArrProp = [0, 1, 2];
  }

  throwError() {
    throw 'boom';
  }
}

@Component({
  selector: 'child-cmp',
  inputs: ['dirProp'],
  viewProviders: [MyService],
  template: '{{ctxProp}}'
})
class ChildComp {
  ctxProp: string;
  dirProp: string|null;
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
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
  }
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
  constructor(@Host() someComp: SomeDirective) {
    this.myHost = someComp;
  }
}

@Component({selector: '[child-cmp2]', viewProviders: [MyService]})
class ChildComp2 {
  ctxProp: string;
  dirProp: string|null;
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
  transform(value: any) {
    return `${value}${value}`;
  }
}

@Directive({selector: '[emitter]', outputs: ['event']})
class DirectiveEmittingEvent {
  msg: string;
  event: EventEmitter<any>;

  constructor() {
    this.msg = '';
    this.event = new EventEmitter();
  }

  fireEvent(msg: string) {
    this.event.emit(msg);
  }
}

@Directive({selector: '[update-host-attributes]', host: {'role': 'button'}})
class DirectiveUpdatingHostAttributes {
}

@Directive({selector: '[update-host-properties]', host: {'[id]': 'id'}})
class DirectiveUpdatingHostProperties {
  id: string;

  constructor() {
    this.id = 'one';
  }
}

@Directive({selector: '[listener]', host: {'(event)': 'onEvent($event)'}})
class DirectiveListeningEvent {
  msg: string;

  constructor() {
    this.msg = '';
  }

  onEvent(msg: string) {
    this.msg = msg;
  }
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
  onEvent(eventType: string) {
    this.eventTypes.push(eventType);
  }
  onWindowEvent(eventType: string) {
    this.eventTypes.push('window_' + eventType);
  }
  onDocumentEvent(eventType: string) {
    this.eventTypes.push('document_' + eventType);
  }
  onBodyEvent(eventType: string) {
    this.eventTypes.push('body_' + eventType);
  }
}

let globalCounter = 0;
@Directive({selector: '[listenerother]', host: {'(window:domEvent)': 'onEvent($event.type)'}})
class DirectiveListeningDomEventOther {
  eventType: string;
  constructor() {
    this.eventType = '';
  }
  onEvent(eventType: string) {
    globalCounter++;
    this.eventType = 'other_' + eventType;
  }
}

@Directive({selector: '[listenerprevent]', host: {'(click)': 'onEvent($event)'}})
class DirectiveListeningDomEventPrevent {
  onEvent(event: any) {
    return false;
  }
}

@Directive({selector: '[listenernoprevent]', host: {'(click)': 'onEvent($event)'}})
class DirectiveListeningDomEventNoPrevent {
  onEvent(event: any) {
    return true;
  }
}

@Directive({selector: '[id]', inputs: ['id']})
class IdDir {
  // TODO(issue/24571): remove '!'.
  id!: string;
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
  constructor(@Host() api: PublicApi) {
    expect(api instanceof PrivateImpl).toBe(true);
  }
}

class ToolbarContext {
  constructor(public toolbarProp: string) {}
}

@Directive({selector: '[toolbarpart]'})
class ToolbarPart {
  templateRef: TemplateRef<ToolbarContext>;
  constructor(templateRef: TemplateRef<ToolbarContext>) {
    this.templateRef = templateRef;
  }
}

@Directive({selector: '[toolbarVc]', inputs: ['toolbarVc']})
class ToolbarViewContainer {
  constructor(public vc: ViewContainerRef) {}

  set toolbarVc(part: ToolbarPart) {
    this.vc.createEmbeddedView(part.templateRef, new ToolbarContext('From toolbar'), 0);
  }
}

@Component({
  selector: 'toolbar',
  template: 'TOOLBAR(<div *ngFor="let  part of query" [toolbarVc]="part"></div>)',
})
class ToolbarComponent {
  // TODO(issue/24571): remove '!'.
  @ContentChildren(ToolbarPart) query!: QueryList<ToolbarPart>;
  ctxProp: string = 'hello world';

  constructor() {}
}

@Directive({selector: '[two-way]', inputs: ['control'], outputs: ['controlChange']})
class DirectiveWithTwoWayBinding {
  controlChange = new EventEmitter();
  control: any = null;

  triggerChange(value: any) {
    this.controlChange.emit(value);
  }
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

  constructor(@Host() @Inject(InjectableService) injectable: any) {
    this.injectable = injectable;
  }
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
  providers: [{provide: EventBus, useValue: new EventBus(null!, 'grandparent')}]
})
class GrandParentProvidingEventBus {
  bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }
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

  constructor(@SkipSelf() bus: EventBus) {
    this.bus = bus;
  }
}

@Directive({selector: '[someImpvp]', inputs: ['someImpvp']})
class SomeImperativeViewport {
  view: EmbeddedViewRef<Object>|null;
  anchor: any;
  constructor(
      public vc: ViewContainerRef, public templateRef: TemplateRef<Object>,
      @Inject(ANCHOR_ELEMENT) anchor: any) {
    this.view = null;
    this.anchor = anchor;
  }

  set someImpvp(value: boolean) {
    if (this.view) {
      this.vc.clear();
      this.view = null;
    }

    if (value) {
      this.view = this.vc.createEmbeddedView(this.templateRef);
      const nodes = this.view.rootNodes;
      for (let i = 0; i < nodes.length; i++) {
        this.anchor.appendChild(nodes[i]);
      }
    }
  }
}

@Directive({selector: '[export-dir]', exportAs: 'dir'})
class ExportDir {
}

@Directive({selector: '[multiple-export-as]', exportAs: 'dirX, dirY'})
export class DirectiveWithMultipleExportAsNames {
}

@Component({selector: 'comp'})
class ComponentWithoutView {
}

@Directive({selector: '[no-duplicate]'})
class DuplicateDir {
  constructor(elRef: ElementRef) {
    elRef.nativeElement.textContent += 'noduplicate';
  }
}

@Directive({selector: '[no-duplicate]'})
class OtherDuplicateDir {
  constructor(elRef: ElementRef) {
    elRef.nativeElement.textContent += 'othernoduplicate';
  }
}

@Directive({selector: 'directive-throwing-error'})
class DirectiveThrowingAnError {
  constructor() {
    throw new Error('BOOM');
  }
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

  // TODO(issue/24571): remove '!'.
  @Input('elProp') dirProp!: string;
  @Output('elEvent') event = new EventEmitter();

  // TODO(issue/24571): remove '!'.
  @HostBinding('attr.my-attr') myAttr!: string;
  @HostListener('click', ['$event.target'])
  onClick(target: any) {
    this.target = target;
  }

  fireEvent(msg: any) {
    this.event.emit(msg);
  }
}

@Component({selector: 'some-cmp'})
class SomeCmp {
  value: any;
}

@Component({
  selector: 'parent-cmp',
  template: `<cmp [test$]="name"></cmp>`,
})
export class ParentCmp {
  name: string = 'hello';
}

@Component({selector: 'cmp', template: ''})
class SomeCmpWithInput {
  @Input() test$: any;
}

function isPrevented(evt: Event): boolean {
  return evt.defaultPrevented || evt.returnValue != null && !evt.returnValue;
}
