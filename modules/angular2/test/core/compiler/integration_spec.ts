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
  beforeEachBindings,
  it,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  fakeAsync,
  tick,
  clearPendingTimers,
  RootTestComponent
} from 'angular2/test_lib';


import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {
  Type,
  isPresent,
  assertionsEnabled,
  isJsObject,
  global,
  stringify,
  isBlank,
  CONST,
  CONST_EXPR
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {
  PromiseWrapper,
  EventEmitter,
  ObservableWrapper,
  PromiseCompleter,
  Promise
} from 'angular2/src/core/facade/async';

import {
  Injector,
  bind,
  Injectable,
  Binding,
  forwardRef,
  OpaqueToken,
  Inject,
  Host,
  SkipSelf,
  SkipSelfMetadata,
  NgIf,
  NgFor
} from 'angular2/core';

import {
  PipeTransform,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ChangeDetection,
  DynamicChangeDetection,
  ChangeDetectorGenConfig
} from 'angular2/src/core/change_detection/change_detection';

import {
  Directive,
  Component,
  View,
  ViewMetadata,
  Attribute,
  Query,
  Pipe,
  Property,
  Event,
  HostBinding,
  HostListener
} from 'angular2/src/core/metadata';

import {QueryList} from 'angular2/src/core/compiler/query_list';

import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {ViewRef} from 'angular2/src/core/compiler/view_ref';

import {Compiler} from 'angular2/src/core/compiler/compiler';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {TemplateRef} from 'angular2/src/core/compiler/template_ref';

import {DomRenderer} from 'angular2/src/core/render/dom/dom_renderer';
import {IS_DART} from '../../platform';

const ANCHOR_ELEMENT = CONST_EXPR(new OpaqueToken('AnchorElement'));

export function main() {
  describe('integration tests', function() {

    beforeEachBindings(() => [bind(ANCHOR_ELEMENT).toValue(el('<div></div>'))]);

    describe('react to record changes', function() {
      it('should consume text node changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({template: '<div>{{ctxProp}}</div>'}))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = 'Hello World!';

                 rootTC.detectChanges();
                 expect(rootTC.debugElement.nativeElement).toHaveText('Hello World!');
                 async.done();

               });
         }));

      it('should update text node with a blank string when interpolation evaluates to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({template: '<div>{{null}}{{ctxProp}}</div>'}))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = null;

                 rootTC.detectChanges();
                 expect(rootTC.debugElement.nativeElement).toHaveText('');
                 async.done();
               });
         }));

      it('should consume element binding changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({template: '<div [id]="ctxProp"></div>'}))
               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.debugElement.componentInstance.ctxProp = 'Hello World!';
                 rootTC.detectChanges();

                 expect(rootTC.debugElement.componentViewChildren[0].nativeElement.id)
                     .toEqual('Hello World!');
                 async.done();
               });
         }));

      it('should consume binding to aria-* attributes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp,
                            new ViewMetadata({template: '<div [attr.aria-label]="ctxProp"></div>'}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.debugElement.componentInstance.ctxProp = 'Initial aria label';
                 rootTC.detectChanges();
                 expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[0].nativeElement,
                                         'aria-label'))
                     .toEqual('Initial aria label');

                 rootTC.debugElement.componentInstance.ctxProp = 'Changed aria label';
                 rootTC.detectChanges();
                 expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[0].nativeElement,
                                         'aria-label'))
                     .toEqual('Changed aria label');

                 async.done();
               });
         }));

      it('should consume binding to property names where attr name and property name do not match',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp,
                            new ViewMetadata({template: '<div [tabindex]="ctxNumProp"></div>'}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.detectChanges();
                 expect(rootTC.debugElement.componentViewChildren[0].nativeElement.tabIndex)
                     .toEqual(0);

                 rootTC.debugElement.componentInstance.ctxNumProp = 5;
                 rootTC.detectChanges();
                 expect(rootTC.debugElement.componentViewChildren[0].nativeElement.tabIndex)
                     .toEqual(5);

                 async.done();
               });
         }));

      it('should consume binding to camel-cased properties using dash-cased syntax in templates',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp,
                            new ViewMetadata({template: '<input [read-only]="ctxBoolProp">'}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.detectChanges();
                 expect(rootTC.debugElement.componentViewChildren[0].nativeElement.readOnly)
                     .toBeFalsy();

                 rootTC.debugElement.componentInstance.ctxBoolProp = true;
                 rootTC.detectChanges();
                 expect(rootTC.debugElement.componentViewChildren[0].nativeElement.readOnly)
                     .toBeTruthy();

                 async.done();
               });
         }));

      it('should consume binding to inner-html',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp,
                            new ViewMetadata({template: '<div inner-html="{{ctxProp}}"></div>'}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.debugElement.componentInstance.ctxProp = 'Some <span>HTML</span>';
                 rootTC.detectChanges();
                 expect(
                     DOM.getInnerHTML(rootTC.debugElement.componentViewChildren[0].nativeElement))
                     .toEqual('Some <span>HTML</span>');

                 rootTC.debugElement.componentInstance.ctxProp = 'Some other <div>HTML</div>';
                 rootTC.detectChanges();
                 expect(
                     DOM.getInnerHTML(rootTC.debugElement.componentViewChildren[0].nativeElement))
                     .toEqual('Some other <div>HTML</div>');

                 async.done();
               });
         }));

      it('should consume binding to className using class alias',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp,
                  new ViewMetadata({template: '<div class="initial" [class]="ctxProp"></div>'}))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var nativeEl = rootTC.debugElement.componentViewChildren[0].nativeElement;
                 rootTC.debugElement.componentInstance.ctxProp = 'foo bar';
                 rootTC.detectChanges();

                 expect(nativeEl).toHaveCssClass('foo');
                 expect(nativeEl).toHaveCssClass('bar');
                 expect(nativeEl).not.toHaveCssClass('initial');

                 async.done();
               });
         }));

      it('should consume directive watch expression change.',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var tpl = '<div>' +
                     '<div my-dir [elprop]="ctxProp"></div>' +
                     '<div my-dir elprop="Hi there!"></div>' +
                     '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
                     '<div my-dir elprop="One more {{ctxProp}}"></div>' +
                     '</div>';
           tcb.overrideView(MyComp, new ViewMetadata({template: tpl, directives: [MyDir]}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.debugElement.componentInstance.ctxProp = 'Hello World!';
                 rootTC.detectChanges();

                 expect(rootTC.debugElement.componentViewChildren[0].inject(MyDir).dirProp)
                     .toEqual('Hello World!');
                 expect(rootTC.debugElement.componentViewChildren[1].inject(MyDir).dirProp)
                     .toEqual('Hi there!');
                 expect(rootTC.debugElement.componentViewChildren[2].inject(MyDir).dirProp)
                     .toEqual('Hi there!');
                 expect(rootTC.debugElement.componentViewChildren[3].inject(MyDir).dirProp)
                     .toEqual('One more Hello World!');
                 async.done();
               });
         }));

      describe('pipes', () => {
        it("should support pipes in bindings",
           inject(
               [TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
                 tcb.overrideView(
                        MyComp, new ViewMetadata({
                          template: '<div my-dir #dir="mydir" [elprop]="ctxProp | double"></div>',
                          directives: [MyDir],
                          pipes: [DoublePipe]
                        }))

                     .createAsync(MyComp)
                     .then((rootTC) => {
                       rootTC.debugElement.componentInstance.ctxProp = 'a';
                       rootTC.detectChanges();

                       var dir = rootTC.debugElement.componentViewChildren[0].getLocal('dir');
                       expect(dir.dirProp).toEqual('aa');
                       async.done();
                     });
               }));
      });

      it('should support nested components.',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp,
                  new ViewMetadata({template: '<child-cmp></child-cmp>', directives: [ChildComp]}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.detectChanges();

                 expect(rootTC.debugElement.nativeElement).toHaveText('hello');
                 async.done();
               });
         }));

      // GH issue 328 - https://github.com/angular/angular/issues/328
      it('should support different directive types on a single node',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<child-cmp my-dir [elprop]="ctxProp"></child-cmp>',
                              directives: [MyDir, ChildComp]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.debugElement.componentInstance.ctxProp = 'Hello World!';
                 rootTC.detectChanges();

                 var tc = rootTC.debugElement.componentViewChildren[0];

                 expect(tc.inject(MyDir).dirProp).toEqual('Hello World!');
                 expect(tc.inject(ChildComp).dirProp).toEqual(null);

                 async.done();
               });
         }));

      it('should support directives where a binding attribute is not given',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              // No attribute "el-prop" specified.
                              template: '<p my-dir></p>',
                              directives: [MyDir]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => { async.done(); });
         }));

      it('should execute a given directive once, even if specified multiple times',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template: '<p no-duplicate></p>',
                    directives: [
                      DuplicateDir,
                      DuplicateDir,
                      [DuplicateDir, [DuplicateDir, bind(DuplicateDir).toClass(DuplicateDir)]]
                    ]
                  }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 expect(rootTC.debugElement.nativeElement).toHaveText('noduplicate');
                 async.done();
               });
         }));

      it('should use the last directive binding per directive',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<p no-duplicate></p>',
                              directives: [
                                bind(DuplicateDir)
                                    .toClass(DuplicateDir),
                                bind(DuplicateDir).toClass(OtherDuplicateDir)
                              ]
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 expect(rootTC.debugElement.nativeElement).toHaveText('othernoduplicate');
                 async.done();
               });
         }));

      it('should support directives where a selector matches property binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata(
                                        {template: '<p [id]="ctxProp"></p>', directives: [IdDir]}))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var idDir = tc.inject(IdDir);

                 rootTC.debugElement.componentInstance.ctxProp = 'some_id';
                 rootTC.detectChanges();
                 expect(idDir.id).toEqual('some_id');

                 rootTC.debugElement.componentInstance.ctxProp = 'other_id';
                 rootTC.detectChanges();
                 expect(idDir.id).toEqual('other_id');

                 async.done();
               });
         }));

      it('should allow specifying directives as bindings',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<child-cmp></child-cmp>',
                              directives: [bind(ChildComp).toClass(ChildComp)]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();

                 expect(rootTC.debugElement.nativeElement).toHaveText('hello');
                 async.done();
               });
         }));

      it('should read directives metadata from their binding token',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<div public-api><div needs-public-api></div></div>',
                              directives: [bind(PublicApi).toClass(PrivateImpl), NeedsPublicApi]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => { async.done(); });
         }));

      it('should support template directives via `<template>` elements.',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template:
                        '<div><template some-viewport var-greeting="some-tmpl"><copy-me>{{greeting}}</copy-me></template></div>',
                    directives: [SomeViewport]
                  }))

               .createAsync(MyComp)
               .then((rootTC) => {

                 rootTC.detectChanges();

                 var childNodesOfWrapper = rootTC.debugElement.componentViewChildren;
                 // 1 template + 2 copies.
                 expect(childNodesOfWrapper.length).toBe(3);
                 expect(childNodesOfWrapper[1].nativeElement).toHaveText('hello');
                 expect(childNodesOfWrapper[2].nativeElement).toHaveText('again');
                 async.done();
               });
         }));

      it('should support template directives via `template` attribute.',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template:
                        '<div><copy-me template="some-viewport: var greeting=some-tmpl">{{greeting}}</copy-me></div>',
                    directives: [SomeViewport]
                  }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();

                 var childNodesOfWrapper = rootTC.debugElement.componentViewChildren;
                 // 1 template + 2 copies.
                 expect(childNodesOfWrapper.length).toBe(3);
                 expect(childNodesOfWrapper[1].nativeElement).toHaveText('hello');
                 expect(childNodesOfWrapper[2].nativeElement).toHaveText('again');
                 async.done();
               });
         }));

      it('should allow to transplant embedded ProtoViews into other ViewContainers',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template:
                        '<some-directive><toolbar><template toolbarpart var-toolbar-prop="toolbarProp">{{ctxProp}},{{toolbarProp}},<cmp-with-host></cmp-with-host></template></toolbar></some-directive>',
                    directives: [SomeDirective, CompWithHost, ToolbarComponent, ToolbarPart]
                  }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = 'From myComp';
                 rootTC.detectChanges();

                 expect(rootTC.debugElement.nativeElement)
                     .toHaveText(
                         'TOOLBAR(From myComp,From toolbar,Component with an injected host)');

                 async.done();
               });
         }));

      describe("variable bindings", () => {
        it('should assign a component to a var-',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                      tcb.overrideView(MyComp, new ViewMetadata({
                                         template: '<p><child-cmp var-alice></child-cmp></p>',
                                         directives: [ChildComp]
                                       }))

                          .createAsync(MyComp)
                          .then((rootTC) => {
                            expect(rootTC.debugElement.componentViewChildren[0].getLocal('alice'))
                                .toBeAnInstanceOf(ChildComp);

                            async.done();
                          })}));

        it('should assign a directive to a var-',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                    tcb.overrideView(MyComp, new ViewMetadata({
                                       template: '<p><div export-dir #localdir="dir"></div></p>',
                                       directives: [ExportDir]
                                     }))

                        .createAsync(MyComp)
                        .then((rootTC) => {
                          expect(rootTC.debugElement.componentViewChildren[0].getLocal('localdir'))
                              .toBeAnInstanceOf(ExportDir);

                          async.done();
                        });
                  }));

        it('should make the assigned component accessible in property bindings',
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async) => {
                   tcb.overrideView(
                          MyComp, new ViewMetadata({
                            template: '<p><child-cmp var-alice></child-cmp>{{alice.ctxProp}}</p>',
                            directives: [ChildComp]
                          }))

                       .createAsync(MyComp)
                       .then((rootTC) => {
                         rootTC.detectChanges();

                         expect(rootTC.debugElement.nativeElement)
                             .toHaveText('hellohello');  // this first one is the
                                                         // component, the second one is
                                                         // the text binding
                         async.done();
                       })}));

        it('should assign two component instances each with a var-',
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async) => {
                   tcb.overrideView(
                          MyComp, new ViewMetadata({
                            template: '<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>',
                            directives: [ChildComp]
                          }))

                       .createAsync(MyComp)
                       .then((rootTC) => {

                         expect(rootTC.debugElement.componentViewChildren[0].getLocal('alice'))
                             .toBeAnInstanceOf(ChildComp);
                         expect(rootTC.debugElement.componentViewChildren[0].getLocal('bob'))
                             .toBeAnInstanceOf(ChildComp);
                         expect(rootTC.debugElement.componentViewChildren[0].getLocal('alice'))
                             .not.toBe(
                                 rootTC.debugElement.componentViewChildren[0].getLocal('bob'));

                         async.done();
                       })}));

        it('should assign the component instance to a var- with shorthand syntax',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                      tcb.overrideView(MyComp, new ViewMetadata({
                                         template: '<child-cmp #alice></child-cmp>',
                                         directives: [ChildComp]
                                       }))

                          .createAsync(MyComp)
                          .then((rootTC) => {

                            expect(rootTC.debugElement.componentViewChildren[0].getLocal('alice'))
                                .toBeAnInstanceOf(ChildComp);

                            async.done();
                          })}));

        it('should assign the element instance to a user-defined variable',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                      tcb.overrideView(MyComp,
                                       new ViewMetadata(
                                           {template: '<p><div var-alice><i>Hello</i></div></p>'}))

                          .createAsync(MyComp)
                          .then((rootTC) => {

                            var value =
                                rootTC.debugElement.componentViewChildren[0].getLocal('alice');
                            expect(value).not.toBe(null);
                            expect(value.tagName.toLowerCase()).toEqual('div');

                            async.done();
                          })}));

        it('should change dash-case to camel-case',
           inject(
               [TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
                 tcb.overrideView(MyComp, new ViewMetadata({
                                    template: '<p><child-cmp var-super-alice></child-cmp></p>',
                                    directives: [ChildComp]
                                  }))

                     .createAsync(MyComp)
                     .then((rootTC) => {
                       expect(rootTC.debugElement.componentViewChildren[0].getLocal('superAlice'))
                           .toBeAnInstanceOf(ChildComp);

                       async.done();
                     });
               }));

        it('should allow to use variables in a for loop',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             tcb.overrideView(
                    MyComp, new ViewMetadata({
                      template:
                          '<div><div *ng-for="var i of [1]"><child-cmp-no-template #cmp></child-cmp-no-template>{{i}}-{{cmp.ctxProp}}</div></div>',
                      directives: [ChildCompNoTemplate, NgFor]
                    }))

                 .createAsync(MyComp)
                 .then((rootTC) => {
                   rootTC.detectChanges();

                   // Get the element at index 1, since index 0 is the <template>.
                   expect(rootTC.debugElement.componentViewChildren[1].nativeElement)
                       .toHaveText("1-hello");

                   async.done();
                 });
           }));
      });

      describe("OnPush components", () => {
        it("should use ChangeDetectorRef to manually request a check",
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {

                      tcb.overrideView(MyComp, new ViewMetadata({
                                         template: '<push-cmp-with-ref #cmp></push-cmp-with-ref>',
                                         directives: [[[PushCmpWithRef]]]
                                       }))

                          .createAsync(MyComp)
                          .then((rootTC) => {

                            var cmp = rootTC.debugElement.componentViewChildren[0].getLocal('cmp');

                            rootTC.detectChanges();
                            expect(cmp.numberOfChecks).toEqual(1);

                            rootTC.detectChanges();
                            expect(cmp.numberOfChecks).toEqual(1);

                            cmp.propagate();

                            rootTC.detectChanges();
                            expect(cmp.numberOfChecks).toEqual(2);
                            async.done();
                          })}));

        it("should be checked when its bindings got updated",
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {

                      tcb.overrideView(MyComp, new ViewMetadata({
                                         template: '<push-cmp [prop]="ctxProp" #cmp></push-cmp>',
                                         directives: [[[PushCmp]]]
                                       }))

                          .createAsync(MyComp)
                          .then((rootTC) => {
                            var cmp = rootTC.debugElement.componentViewChildren[0].getLocal('cmp');

                            rootTC.debugElement.componentInstance.ctxProp = "one";
                            rootTC.detectChanges();
                            expect(cmp.numberOfChecks).toEqual(1);

                            rootTC.debugElement.componentInstance.ctxProp = "two";
                            rootTC.detectChanges();
                            expect(cmp.numberOfChecks).toEqual(2);

                            async.done();
                          })}));

        it('should not affect updating properties on the component',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                      tcb.overrideView(
                             MyComp, new ViewMetadata({
                               template:
                                   '<push-cmp-with-ref [prop]="ctxProp" #cmp></push-cmp-with-ref>',
                               directives: [[[PushCmpWithRef]]]
                             }))

                          .createAsync(MyComp)
                          .then((rootTC) => {

                            var cmp = rootTC.debugElement.componentViewChildren[0].getLocal('cmp');

                            rootTC.debugElement.componentInstance.ctxProp = "one";
                            rootTC.detectChanges();
                            expect(cmp.prop).toEqual("one");

                            rootTC.debugElement.componentInstance.ctxProp = "two";
                            rootTC.detectChanges();
                            expect(cmp.prop).toEqual("two");

                            async.done();
                          })}));

        if (DOM.supportsDOMEvents()) {
          it('should be checked when an async pipe requests a check',
             inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                      tcb = tcb.overrideView(
                          MyComp, new ViewMetadata({
                            template: '<push-cmp-with-async #cmp></push-cmp-with-async>',
                            directives: [[[PushCmpWithAsyncPipe]]]
                          }));

                      var rootTC: RootTestComponent;
                      tcb.createAsync(MyComp).then(root => { rootTC = root; });
                      tick();

                      var cmp = rootTC.debugElement.componentViewChildren[0].getLocal('cmp');
                      rootTC.detectChanges();
                      expect(cmp.numberOfChecks).toEqual(1);

                      rootTC.detectChanges();
                      rootTC.detectChanges();
                      expect(cmp.numberOfChecks).toEqual(1);

                      cmp.resolve(2);
                      tick();

                      rootTC.detectChanges();
                      expect(cmp.numberOfChecks).toEqual(2);
                    })));
        }
      });

      it('should create a component that injects an @Host',
         inject([TestComponentBuilder, AsyncTestCompleter],
                (tcb: TestComponentBuilder, async) => {
                    tcb.overrideView(MyComp, new ViewMetadata({
                                       template: `
            <some-directive>
              <p>
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>`,
                                       directives: [SomeDirective, CompWithHost]
                                     }))

                        .createAsync(MyComp)
                        .then((rootTC) => {

                          var childComponent =
                              rootTC.debugElement.componentViewChildren[0].getLocal('child');
                          expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);

                          async.done();
                        })}));

      it('should create a component that injects an @Host through viewcontainer directive',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: `
            <some-directive>
              <p *ng-if="true">
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>`,
                              directives: [SomeDirective, CompWithHost, NgIf]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();

                 var tc = rootTC.debugElement.componentViewChildren[0].children[1];

                 var childComponent = tc.getLocal('child');
                 expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);

                 async.done();
               });
         }));

      it('should support events via EventEmitter',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<div emitter listener></div>',
                              directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {

                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var emitter = tc.inject(DirectiveEmitingEvent);
                 var listener = tc.inject(DirectiveListeningEvent);

                 expect(listener.msg).toEqual('');

                 ObservableWrapper.subscribe(emitter.event, (_) => {
                   expect(listener.msg).toEqual('fired !');
                   async.done();
                 });

                 emitter.fireEvent('fired !');
               });
         }));

      it('should support [()] syntax',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<div [(control)]="ctxProp" two-way></div>',
                              directives: [DirectiveWithTwoWayBinding]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var dir = tc.inject(DirectiveWithTwoWayBinding);

                 rootTC.debugElement.componentInstance.ctxProp = 'one';
                 rootTC.detectChanges();

                 expect(dir.value).toEqual('one');

                 ObservableWrapper.subscribe(dir.control, (_) => {
                   expect(rootTC.debugElement.componentInstance.ctxProp).toEqual('two');
                   async.done();
                 });

                 dir.triggerChange('two');
               });
         }));

      it('should support render events',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      {template: '<div listener></div>', directives: [DirectiveListeningDomEvent]}))

               .createAsync(MyComp)
               .then((rootTC) => {

                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var listener = tc.inject(DirectiveListeningDomEvent);

                 dispatchEvent(tc.nativeElement, 'domEvent');

                 expect(listener.eventTypes)
                     .toEqual(
                         ['domEvent', 'body_domEvent', 'document_domEvent', 'window_domEvent']);

                 async.done();
               });
         }));

      it('should support render global events',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      {template: '<div listener></div>', directives: [DirectiveListeningDomEvent]}))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var listener = tc.inject(DirectiveListeningDomEvent);
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(listener.eventTypes).toEqual(['window_domEvent']);

                 listener.eventTypes = [];
                 dispatchEvent(DOM.getGlobalEventTarget("document"), 'domEvent');
                 expect(listener.eventTypes).toEqual(['document_domEvent', 'window_domEvent']);

                 rootTC.destroy();
                 listener.eventTypes = [];
                 dispatchEvent(DOM.getGlobalEventTarget("body"), 'domEvent');
                 expect(listener.eventTypes).toEqual([]);

                 async.done();
               });
         }));

      it('should support updating host element via hostAttributes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<div update-host-attributes></div>',
                              directives: [DirectiveUpdatingHostAttributes]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();

                 expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[0].nativeElement,
                                         "role"))
                     .toEqual("button");

                 async.done();
               });
         }));

      it('should support updating host element via hostProperties',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<div update-host-properties></div>',
                              directives: [DirectiveUpdatingHostProperties]
                            }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var updateHost = tc.inject(DirectiveUpdatingHostProperties);

                 updateHost.id = "newId";

                 rootTC.detectChanges();

                 expect(tc.nativeElement.id).toEqual("newId");

                 async.done();
               });
         }));


      if (DOM.supportsDOMEvents()) {
        it('should support preventing default on render events',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             tcb.overrideView(
                    MyComp, new ViewMetadata({
                      template:
                          '<input type="checkbox" listenerprevent></input><input type="checkbox" listenernoprevent></input>',
                      directives: [
                        DirectiveListeningDomEventPrevent,
                        DirectiveListeningDomEventNoPrevent
                      ]
                    }))

                 .createAsync(MyComp)
                 .then((rootTC) => {
                   var dispatchedEvent = DOM.createMouseEvent('click');
                   var dispatchedEvent2 = DOM.createMouseEvent('click');
                   DOM.dispatchEvent(rootTC.debugElement.componentViewChildren[0].nativeElement,
                                     dispatchedEvent);
                   DOM.dispatchEvent(rootTC.debugElement.componentViewChildren[1].nativeElement,
                                     dispatchedEvent2);
                   expect(DOM.isPrevented(dispatchedEvent)).toBe(true);
                   expect(DOM.isPrevented(dispatchedEvent2)).toBe(false);
                   expect(
                       DOM.getChecked(rootTC.debugElement.componentViewChildren[0].nativeElement))
                       .toBeFalsy();
                   expect(
                       DOM.getChecked(rootTC.debugElement.componentViewChildren[1].nativeElement))
                       .toBeTruthy();
                   async.done();
                 });
           }));
      }

      it('should support render global events from multiple directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template: '<div *ng-if="ctxBoolProp" listener listenerother></div>',
                    directives:
                        [NgIf, DirectiveListeningDomEvent, DirectiveListeningDomEventOther]
                  }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 globalCounter = 0;
                 rootTC.debugElement.componentInstance.ctxBoolProp = true;
                 rootTC.detectChanges();

                 var tc = rootTC.debugElement.componentViewChildren[1];

                 var listener = tc.inject(DirectiveListeningDomEvent);
                 var listenerother = tc.inject(DirectiveListeningDomEventOther);
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(listener.eventTypes).toEqual(['window_domEvent']);
                 expect(listenerother.eventType).toEqual('other_domEvent');
                 expect(globalCounter).toEqual(1);


                 rootTC.debugElement.componentInstance.ctxBoolProp = false;
                 rootTC.detectChanges();
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(globalCounter).toEqual(1);

                 rootTC.debugElement.componentInstance.ctxBoolProp = true;
                 rootTC.detectChanges();
                 dispatchEvent(DOM.getGlobalEventTarget("window"), 'domEvent');
                 expect(globalCounter).toEqual(2);

                 async.done();
               });
         }));

      describe('dynamic ViewContainers', () => {

        it('should allow to create a ViewContainerRef at any bound location',
           inject([TestComponentBuilder, AsyncTestCompleter, Compiler],
                  (tcb: TestComponentBuilder, async, compiler) => {
                    tcb.overrideView(MyComp, new ViewMetadata({
                                       template: '<div><dynamic-vp #dynamic></dynamic-vp></div>',
                                       directives: [DynamicViewport]
                                     }))

                        .createAsync(MyComp)
                        .then((rootTC) => {
                          var tc = rootTC.debugElement.componentViewChildren[0];
                          var dynamicVp = tc.inject(DynamicViewport);
                          dynamicVp.done.then((_) => {
                            rootTC.detectChanges();
                            expect(rootTC.debugElement.componentViewChildren[1].nativeElement)
                                .toHaveText('dynamic greet');
                            async.done();
                          });
                        });
                  }));

      });

      it('should support static attributes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      {template: '<input static type="text" title>', directives: [NeedsAttribute]}))
               .createAsync(MyComp)
               .then((rootTC) => {
                 var tc = rootTC.debugElement.componentViewChildren[0];
                 var needsAttribute = tc.inject(NeedsAttribute);
                 expect(needsAttribute.typeAttribute).toEqual('text');
                 expect(needsAttribute.staticAttribute).toEqual('');
                 expect(needsAttribute.fooAttribute).toEqual(null);

                 async.done();
               });
         }));
    });

    describe("dependency injection", () => {
      it("should support bindings",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template: `
            <directive-providing-injectable >
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
            </directive-providing-injectable>
          `,
                    directives: [DirectiveProvidingInjectable, DirectiveConsumingInjectable]
                  }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 var comp = rootTC.debugElement.componentViewChildren[0].getLocal("consuming");
                 expect(comp.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support viewBindings",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(DirectiveProvidingInjectableInView, new ViewMetadata({
                              template: `
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
          `,
                              directives: [DirectiveConsumingInjectable]
                            }))
               .createAsync(DirectiveProvidingInjectableInView)
               .then((rootTC) => {
                 var comp = rootTC.debugElement.componentViewChildren[0].getLocal("consuming");
                 expect(comp.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support unbounded lookup",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
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
                            }))
               .overrideView(DirectiveContainingDirectiveConsumingAnInjectable, new ViewMetadata({
                               template: `
            <directive-consuming-injectable-unbounded></directive-consuming-injectable-unbounded>
          `,
                               directives: [DirectiveConsumingInjectableUnbounded]
                             }))

               .createAsync(MyComp)
               .then((rootTC) => {
                 var comp = rootTC.debugElement.componentViewChildren[0].getLocal("dir");
                 expect(comp.directive.injectable).toBeAnInstanceOf(InjectableService);

                 async.done();
               });
         }));

      it("should support the event-bus scenario",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: `
            <grand-parent-providing-event-bus>
              <parent-providing-event-bus>
                <child-consuming-event-bus>
                </child-consuming-event-bus>
              </parent-providing-event-bus>
            </grand-parent-providing-event-bus>
          `,
                              directives: [
                                GrandParentProvidingEventBus,
                                ParentProvidingEventBus,
                                ChildConsumingEventBus
                              ]
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 var gpComp = rootTC.debugElement.componentViewChildren[0];
                 var parentComp = gpComp.children[0];
                 var childComp = parentComp.children[0];

                 var grandParent = gpComp.inject(GrandParentProvidingEventBus);
                 var parent = parentComp.inject(ParentProvidingEventBus);
                 var child = childComp.inject(ChildConsumingEventBus);

                 expect(grandParent.bus.name).toEqual("grandparent");
                 expect(parent.bus.name).toEqual("parent");
                 expect(parent.grandParentBus).toBe(grandParent.bus);
                 expect(child.bus).toBe(parent.bus);

                 async.done();
               });
         }));

      it("should instantiate bindings lazily",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template: `
              <component-providing-logging-injectable #providing>
                <directive-consuming-injectable *ng-if="ctxBoolProp">
                </directive-consuming-injectable>
              </component-providing-logging-injectable>
          `,
                    directives:
                        [DirectiveConsumingInjectable, ComponentProvidingLoggingInjectable, NgIf]
                  }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 var providing = rootTC.debugElement.componentViewChildren[0].getLocal("providing");
                 expect(providing.created).toBe(false);

                 rootTC.debugElement.componentInstance.ctxBoolProp = true;
                 rootTC.detectChanges();

                 expect(providing.created).toBe(true);

                 async.done();
               });
         }));
    });

    describe("corner cases", () => {
      it('should remove script tags from templates',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: `
            <script>alert("Ooops");</script>
            <div>before<script>alert("Ooops");</script><span>inside</span>after</div>`
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 expect(DOM.querySelectorAll(rootTC.debugElement.nativeElement, 'script').length)
                     .toEqual(0);
                 async.done();
               });
         }));
    });

    describe("error handling", () => {
      it('should report a meaningful error when a directive is missing annotation',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb = tcb.overrideView(MyComp,
                                  new ViewMetadata({directives: [SomeDirectiveMissingAnnotation]}));

           PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) => {
             expect(e.message).toEqual(
                 `No Directive annotation found on ${stringify(SomeDirectiveMissingAnnotation)}`);
             async.done();
             return null;
           });
         }));

      it('should report a meaningful error when a component is missing view annotation',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           PromiseWrapper.catchError(tcb.createAsync(ComponentWithoutView), (e) => {
             expect(e.message).toEqual(
                 `No View annotation found on component ${stringify(ComponentWithoutView)}`);
             async.done();
             return null;
           });
         }));

      it('should report a meaningful error when a directive is null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

           tcb = tcb.overrideView(MyComp, new ViewMetadata({directives: [[null]]}));

           PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) => {
             expect(e.message).toEqual(
                 `Unexpected directive value 'null' on the View of component '${stringify(MyComp)}'`);
             async.done();
             return null;
           });
         }));

      it('should provide an error context when an error happens in DI',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

           tcb =
               tcb.overrideView(MyComp, new ViewMetadata({
                                  directives: [DirectiveThrowingAnError],
                                  template: `<directive-throwing-error></<directive-throwing-error>`
                                }));

           PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) => {
             var c = e.context;
             expect(DOM.nodeName(c.element).toUpperCase()).toEqual("DIRECTIVE-THROWING-ERROR");
             expect(DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
             expect(c.injector).toBeAnInstanceOf(Injector);
             async.done();
             return null;
           });
         }));

      it('should provide an error context when an error happens in change detection',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

           tcb = tcb.overrideView(
               MyComp, new ViewMetadata({template: `<input [value]="one.two.three" #local>`}));

           tcb.createAsync(MyComp).then(rootTC => {
             try {
               rootTC.detectChanges();
               throw "Should throw";
             } catch (e) {
               var c = e.context;
               expect(DOM.nodeName(c.element).toUpperCase()).toEqual("INPUT");
               expect(DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
               expect(c.injector).toBeAnInstanceOf(Injector);
               expect(c.expression).toContain("one.two.three");
               expect(c.context).toBe(rootTC.debugElement.componentInstance);
               expect(c.locals["local"]).toBeDefined();
             }

             async.done();
           });
         }));

      it('should provide an error context when an error happens in change detection (text node)',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

           tcb = tcb.overrideView(MyComp, new ViewMetadata({template: `{{one.two.three}}`}));

           tcb.createAsync(MyComp).then(rootTC => {
             try {
               rootTC.detectChanges();
               throw "Should throw";
             } catch (e) {
               var c = e.context;
               expect(c.element).toBeNull();
               expect(c.injector).toBeNull();
             }

             async.done();
           });
         }));

      if (DOM.supportsDOMEvents()) {  // this is required to use fakeAsync
        it('should provide an error context when an error happens in an event handler',
           inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {

                    tcb = tcb.overrideView(
                        MyComp, new ViewMetadata({
                          template: `<span emitter listener (event)="throwError()" #local></span>`,
                          directives: [DirectiveEmitingEvent, DirectiveListeningEvent]
                        }));

                    var rootTC: RootTestComponent;
                    tcb.createAsync(MyComp).then(root => { rootTC = root; });
                    tick();

                    var tc = rootTC.debugElement.componentViewChildren[0];
                    tc.inject(DirectiveEmitingEvent).fireEvent("boom");

                    try {
                      tick();
                      throw "Should throw";
                    } catch (e) {
                      clearPendingTimers();

                      var c = e.context;
                      expect(DOM.nodeName(c.element).toUpperCase()).toEqual("SPAN");
                      expect(DOM.nodeName(c.componentElement).toUpperCase()).toEqual("DIV");
                      expect(c.injector).toBeAnInstanceOf(Injector);
                      expect(c.context).toBe(rootTC.debugElement.componentInstance);
                      expect(c.locals["local"]).toBeDefined();
                    }
                  })));
      }

      if (!IS_DART) {
        it('should report a meaningful error when a directive is undefined',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {

             var undefinedValue;

             tcb = tcb.overrideView(MyComp, new ViewMetadata({directives: [undefinedValue]}));

             PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) => {
               expect(e.message).toEqual(
                   `Unexpected directive value 'undefined' on the View of component '${stringify(MyComp)}'`);
               async.done();
               return null;
             });
           }));
      }

      it('should specify a location of an error that happened during change detection (text)',
         inject([TestComponentBuilder, AsyncTestCompleter],
                (tcb: TestComponentBuilder, async) => {

                    tcb.overrideView(MyComp, new ViewMetadata({template: '{{a.b}}'}))

                        .createAsync(MyComp)
                        .then((rootTC) => {
                          expect(() => rootTC.detectChanges())
                              .toThrowError(containsRegexp(`{{a.b}} in ${stringify(MyComp)}`));
                          async.done();
                        })}));

      it('should specify a location of an error that happened during change detection (element property)',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async) => {

                 tcb.overrideView(MyComp, new ViewMetadata({template: '<div [title]="a.b"></div>'}))

                     .createAsync(MyComp)
                     .then((rootTC) => {
                       expect(() => rootTC.detectChanges())
                           .toThrowError(containsRegexp(`a.b in ${stringify(MyComp)}`));
                       async.done();
                     })}));

      it('should specify a location of an error that happened during change detection (directive property)',
         inject([TestComponentBuilder, AsyncTestCompleter],
                (tcb: TestComponentBuilder, async) => {

                    tcb.overrideView(MyComp, new ViewMetadata({
                                       template: '<child-cmp [title]="a.b"></child-cmp>',
                                       directives: [ChildComp]
                                     }))

                        .createAsync(MyComp)
                        .then((rootTC) => {
                          expect(() => rootTC.detectChanges())
                              .toThrowError(containsRegexp(`a.b in ${stringify(MyComp)}`));
                          async.done();
                        })}));
    });

    it('should support imperative views',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata({
                            template: '<simple-imp-cmp></simple-imp-cmp>',
                            directives: [SimpleImperativeViewComponent]
                          }))
             .createAsync(MyComp)
             .then((rootTC) => {
               expect(rootTC.debugElement.nativeElement).toHaveText('hello imp view');
               async.done();
             });
       }));

    it('should support moving embedded views around',
       inject([TestComponentBuilder, AsyncTestCompleter, ANCHOR_ELEMENT], (tcb, async,
                                                                           anchorElement) => {
         tcb.overrideView(MyComp, new ViewMetadata({
                            template: '<div><div *some-impvp="ctxBoolProp">hello</div></div>',
                            directives: [SomeImperativeViewport]
                          }))
             .createAsync(MyComp)
             .then((rootTC: RootTestComponent) => {
               rootTC.detectChanges();
               expect(anchorElement).toHaveText('');

               rootTC.debugElement.componentInstance.ctxBoolProp = true;
               rootTC.detectChanges();

               expect(anchorElement).toHaveText('hello');

               rootTC.debugElement.componentInstance.ctxBoolProp = false;
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('');

               async.done();
             });
       }));

    describe('Property bindings', () => {
      if (!IS_DART) {
        it('should throw on bindings to unknown properties',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             tcb =
                 tcb.overrideView(MyComp,
                                  new ViewMetadata({template: '<div unknown="{{ctxProp}}"></div>'}))

                     PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) => {
                       expect(e.message).toEqual(
                           `Can't bind to 'unknown' since it isn't a known property of the '<div>' element and there are no matching directives with a corresponding property`);
                       async.done();
                       return null;
                     });
           }));

        it('should not throw for property binding to a non-existing property when there is a matching directive property',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             tcb.overrideView(
                    MyComp,
                    new ViewMetadata(
                        {template: '<div my-dir [elprop]="ctxProp"></div>', directives: [MyDir]}))
                 .createAsync(MyComp)
                 .then((val) => { async.done(); });
           }));
      }

      it('should not be created when there is a directive with the same property',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<span [title]="ctxProp"></span>',
                              directives: [DirectiveWithTitle]
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = "TITLE";
                 rootTC.detectChanges();

                 var el = DOM.querySelector(rootTC.debugElement.nativeElement, "span");
                 expect(isBlank(el.title) || el.title == '').toBeTruthy();

                 async.done();

               });
         }));

      it('should work when a directive uses hostProperty to update the DOM element',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<span [title]="ctxProp"></span>',
                              directives: [DirectiveWithTitleAndHostProperty]
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = "TITLE";
                 rootTC.detectChanges();

                 var el = DOM.querySelector(rootTC.debugElement.nativeElement, "span");
                 expect(el.title).toEqual("TITLE");

                 async.done();

               });
         }));
    });

    describe('logging property updates', () => {
      beforeEachBindings(() => [
        bind(ChangeDetection)
            .toValue(
                new DynamicChangeDetection(new ChangeDetectorGenConfig(true, true, true, false)))
      ]);

      it('should reflect property values as attributes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var tpl = '<div>' +
                     '<div my-dir [elprop]="ctxProp"></div>' +
                     '</div>';
           tcb.overrideView(MyComp, new ViewMetadata({template: tpl, directives: [MyDir]}))

               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.debugElement.componentInstance.ctxProp = 'hello';
                 rootTC.detectChanges();

                 expect(DOM.getInnerHTML(rootTC.debugElement.nativeElement))
                     .toContain('ng-reflect-dir-prop="hello"');
                 async.done();
               });
         }));
    });

    describe('different proto view storages', () => {
      function runWithMode(mode: string) {
        return inject(
            [TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
              tcb.overrideView(MyComp,
                               new ViewMetadata({template: `<!--${mode}--><div>{{ctxProp}}</div>`}))
                  .createAsync(MyComp)
                  .then((rootTC) => {
                    rootTC.debugElement.componentInstance.ctxProp = 'Hello World!';

                    rootTC.detectChanges();
                    expect(rootTC.debugElement.nativeElement).toHaveText('Hello World!');
                    async.done();
                  });
            });
      }

      it('should work with storing DOM nodes', runWithMode('cache'));

      it('should work with serializing the DOM nodes', runWithMode('nocache'));
    });

    // Disabled until a solution is found, refs:
    // - https://github.com/angular/angular/issues/776
    // - https://github.com/angular/angular/commit/81f3f32
    xdescribe('Missing directive checks', () => {
      function expectCompileError(tcb, inlineTpl, errMessage, done) {
        tcb = tcb.overrideView(MyComp, new ViewMetadata({template: inlineTpl}));
        PromiseWrapper.then(
            tcb.createAsync(MyComp),
            (value) => {
              throw new BaseException(
                  "Test failure: should not have come here as an exception was expected");
            },
            (err) => {
              expect(err.message).toEqual(errMessage);
              done();
            });
      }

      if (assertionsEnabled()) {
        it('should raise an error if no directive is registered for a template with template bindings',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             expectCompileError(tcb, '<div><div template="if: foo"></div></div>',
                                'Missing directive to handle \'if\' in <div template="if: foo">',
                                () => async.done());
           }));

        it('should raise an error for missing template directive (1)',
           inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                               async) => {
             expectCompileError(tcb, '<div><template foo></template></div>',
                                'Missing directive to handle: <template foo>', () => async.done());
           }));

        it('should raise an error for missing template directive (2)',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                    expectCompileError(tcb, '<div><template *ng-if="condition"></template></div>',
                                       'Missing directive to handle: <template *ng-if="condition">',
                                       () => async.done());
                  }));

        it('should raise an error for missing template directive (3)',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                    expectCompileError(
                        tcb, '<div *ng-if="condition"></div>',
                        'Missing directive to handle \'if\' in MyComp: <div *ng-if="condition">',
                        () => async.done());
                  }));
      }
    });

    describe('property decorators', () => {
      it('should support property decorators',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(
                  MyComp, new ViewMetadata({
                    template: '<with-prop-decorators el-prop="aaa"></with-prop-decorators>',
                    directives: [DirectiveWithPropDecorators]
                  }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 var dir = rootTC.debugElement.componentViewChildren[0].inject(
                     DirectiveWithPropDecorators);
                 expect(dir.dirProp).toEqual("aaa");
                 async.done();
               });
         }));

      it('should support host binding decorators',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({
                              template: '<with-prop-decorators></with-prop-decorators>',
                              directives: [DirectiveWithPropDecorators]
                            }))
               .createAsync(MyComp)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 var dir = rootTC.debugElement.componentViewChildren[0].inject(
                     DirectiveWithPropDecorators);
                 dir.myAttr = "aaa";

                 rootTC.detectChanges();
                 expect(
                     DOM.getOuterHTML(rootTC.debugElement.componentViewChildren[0].nativeElement))
                     .toContain('my-attr="aaa"');
                 async.done();
               });
         }));

      if (DOM.supportsDOMEvents()) {
        it('should support events decorators',
           inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                    tcb = tcb.overrideView(
                        MyComp, new ViewMetadata({
                          template: `<with-prop-decorators (el-event)="ctxProp='called'">`,
                          directives: [DirectiveWithPropDecorators]
                        }));

                    var rootTC: RootTestComponent;
                    tcb.createAsync(MyComp).then(root => { rootTC = root; });
                    tick();

                    var emitter = rootTC.debugElement.componentViewChildren[0].inject(
                        DirectiveWithPropDecorators);
                    emitter.fireEvent('fired !');

                    tick();

                    expect(rootTC.debugElement.componentInstance.ctxProp).toEqual("called");
                  })));


        it('should support host listener decorators',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                    tcb.overrideView(MyComp, new ViewMetadata({
                                       template: '<with-prop-decorators></with-prop-decorators>',
                                       directives: [DirectiveWithPropDecorators]
                                     }))
                        .createAsync(MyComp)
                        .then((rootTC) => {
                          rootTC.detectChanges();
                          var dir = rootTC.debugElement.componentViewChildren[0].inject(
                              DirectiveWithPropDecorators);
                          var native = rootTC.debugElement.componentViewChildren[0].nativeElement;
                          DOM.dispatchEvent(native, DOM.createMouseEvent('click'));

                          expect(dir.target).toBe(native);
                          async.done();
                        });
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
@View({template: ''})
@Injectable()
class SimpleImperativeViewComponent {
  done;

  constructor(self: ElementRef, renderer: DomRenderer) {
    var hostElement = renderer.getNativeElementSync(self);
    DOM.appendChild(hostElement, el('hello imp view'));
  }
}

@Directive({selector: 'dynamic-vp'})
@Injectable()
class DynamicViewport {
  done;
  constructor(vc: ViewContainerRef, compiler: Compiler) {
    var myService = new MyService();
    myService.greeting = 'dynamic greet';

    var bindings = Injector.resolve([bind(MyService).toValue(myService)]);
    this.done = compiler.compileInHost(ChildCompUsingService)
                    .then((hostPv) => {vc.createHostView(hostPv, 0, bindings)});
  }
}

@Directive({selector: '[my-dir]', properties: ['dirProp: elprop'], exportAs: 'mydir'})
@Injectable()
class MyDir {
  dirProp: string;
  constructor() { this.dirProp = ''; }
}

@Directive({selector: '[title]', properties: ['title']})
class DirectiveWithTitle {
  title: string;
}

@Directive({selector: '[title]', properties: ['title'], host: {'[title]': 'title'}})
class DirectiveWithTitleAndHostProperty {
  title: string;
}

@Component(
    {selector: 'push-cmp', properties: ['prop'], changeDetection: ChangeDetectionStrategy.OnPush})
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

@Component({
  selector: 'push-cmp-with-ref',
  properties: ['prop'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
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

  propagate() { this.ref.markForCheck(); }
}

@Component({selector: 'push-cmp-with-async', changeDetection: ChangeDetectionStrategy.OnPush})
@View({template: '{{field | async}}'})
@Injectable()
class PushCmpWithAsyncPipe {
  numberOfChecks: number = 0;
  promise: Promise<any>;
  completer: PromiseCompleter<any>;

  constructor() {
    this.completer = PromiseWrapper.completer();
    this.promise = this.completer.promise;
  }

  get field() {
    this.numberOfChecks++;
    return this.promise;
  }

  resolve(value) { this.completer.resolve(value); }
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

  throwError() { throw 'boom'; }
}

@Component({selector: 'child-cmp', properties: ['dirProp'], viewBindings: [MyService]})
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

@Component({selector: 'child-cmp-no-template'})
@View({directives: [], template: ''})
@Injectable()
class ChildCompNoTemplate {
  ctxProp: string = 'hello';
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

@Component({selector: 'cmp-with-host'})
@View({template: '<p>Component with an injected host</p>', directives: [SomeDirective]})
@Injectable()
class CompWithHost {
  myHost: SomeDirective;
  constructor(@Host() someComp: SomeDirective) { this.myHost = someComp; }
}

@Component({selector: '[child-cmp2]', viewBindings: [MyService]})
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
  constructor(container: ViewContainerRef, templateRef: TemplateRef) {
    container.createEmbeddedView(templateRef).setLocal('some-tmpl', 'hello');
    container.createEmbeddedView(templateRef).setLocal('some-tmpl', 'again');
  }
}

@Pipe({name: 'double'})
class DoublePipe implements PipeTransform {
  onDestroy() {}
  transform(value, args = null) { return `${value}${value}`; }
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

@Directive({selector: '[update-host-actions]', host: {'@setAttr': 'setAttribute'}})
@Injectable()
class DirectiveUpdatingHostActions {
  setAttr: EventEmitter;

  constructor() { this.setAttr = new EventEmitter(); }

  triggerSetAttr(attrValue) { ObservableWrapper.callNext(this.setAttr, ["key", attrValue]); }
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
  eventTypes: string[] = [];
  onEvent(eventType: string) { this.eventTypes.push(eventType); }
  onWindowEvent(eventType: string) { this.eventTypes.push("window_" + eventType); }
  onDocumentEvent(eventType: string) { this.eventTypes.push("document_" + eventType); }
  onBodyEvent(eventType: string) { this.eventTypes.push("body_" + eventType); }
}

var globalCounter = 0;
@Directive({selector: '[listenerother]', host: {'(window:domEvent)': 'onEvent($event.type)'}})
@Injectable()
class DirectiveListeningDomEventOther {
  eventType: string;
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
  staticAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: String,
              @Attribute('static') staticAttribute: String,
              @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.staticAttribute = staticAttribute;
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
  constructor(@Host() api: PublicApi) { expect(api instanceof PrivateImpl).toBe(true); }
}

@Directive({selector: '[toolbarpart]'})
@Injectable()
class ToolbarPart {
  templateRef: TemplateRef;
  constructor(templateRef: TemplateRef) { this.templateRef = templateRef; }
}

@Directive({selector: '[toolbar-vc]', properties: ['toolbarVc']})
@Injectable()
class ToolbarViewContainer {
  vc: ViewContainerRef;
  constructor(vc: ViewContainerRef) { this.vc = vc; }

  set toolbarVc(part: ToolbarPart) {
    var view = this.vc.createEmbeddedView(part.templateRef, 0);
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

function createInjectableWithLogging(inj: Injector) {
  inj.get(ComponentProvidingLoggingInjectable).created = true;
  return new InjectableService();
}

@Component({
  selector: 'component-providing-logging-injectable',
  bindings:
      [new Binding(InjectableService, {toFactory: createInjectableWithLogging, deps: [Injector]})]
})
@View({template: ''})
@Injectable()
class ComponentProvidingLoggingInjectable {
  created: boolean = false;
}


@Directive({selector: 'directive-providing-injectable', bindings: [[InjectableService]]})
@Injectable()
class DirectiveProvidingInjectable {
}

@Component({selector: 'directive-providing-injectable', viewBindings: [[InjectableService]]})
@View({template: ''})
@Injectable()
class DirectiveProvidingInjectableInView {
}

@Component({
  selector: 'directive-providing-injectable',
  bindings: [new Binding(InjectableService, {toValue: 'host'})],
  viewBindings: [new Binding(InjectableService, {toValue: 'view'})]
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

  constructor(@Host() @Inject(InjectableService) injectable) { this.injectable = injectable; }
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

  constructor(injectable: InjectableService,
              @SkipSelf() parent: DirectiveContainingDirectiveConsumingAnInjectable) {
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
  bindings: [new Binding(EventBus, {toValue: new EventBus(null, "grandparent")})]
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
  bindings: [
    new Binding(EventBus,
                {toFactory: createParentBus, deps: [[EventBus, new SkipSelfMetadata()]]})
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

@Directive({selector: '[some-impvp]', properties: ['someImpvp']})
@Injectable()
class SomeImperativeViewport {
  view: ViewRef;
  anchor;
  constructor(public vc: ViewContainerRef, public templateRef: TemplateRef,
              public renderer: DomRenderer, @Inject(ANCHOR_ELEMENT) anchor) {
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
      var nodes = this.renderer.getRootNodes(this.view.renderFragment);
      for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(this.anchor, nodes[i]);
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
    DOM.setText(elRef.nativeElement, DOM.getText(elRef.nativeElement) + 'noduplicate');
  }
}

@Directive({selector: '[no-duplicate]'})
class OtherDuplicateDir {
  constructor(elRef: ElementRef) {
    DOM.setText(elRef.nativeElement, DOM.getText(elRef.nativeElement) + 'othernoduplicate');
  }
}

@Directive({selector: 'directive-throwing-error'})
class DirectiveThrowingAnError {
  constructor() { throw new BaseException("BOOM"); }
}

@Directive({selector: 'with-prop-decorators'})
class DirectiveWithPropDecorators {
  target;

  @Property("elProp") dirProp: string;
  @Event('elEvent') event = new EventEmitter();

  @HostBinding("attr.my-attr") myAttr: string;
  @HostListener("click", ["$event.target"])
  onClick(target) {
    this.target = target;
  }

  fireEvent(msg) { ObservableWrapper.callNext(this.event, msg); }
}
