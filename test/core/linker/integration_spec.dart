library angular2.test.core.linker.integration_spec;

import "package:angular2/testing_internal.dart"
    show
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
        ComponentFixture;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/lang.dart"
    show
        Type,
        isPresent,
        assertionsEnabled,
        isJsObject,
        global,
        stringify,
        isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/async.dart"
    show
        PromiseWrapper,
        EventEmitter,
        ObservableWrapper,
        PromiseCompleter,
        Future;
import "package:angular2/core.dart"
    show
        Injector,
        bind,
        provide,
        Injectable,
        Provider,
        OpaqueToken,
        Inject,
        Host,
        SkipSelf,
        SkipSelfMetadata,
        NgIf,
        NgFor;
import "package:angular2/common.dart" show AsyncPipe;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        PipeTransform,
        ChangeDetectorRef,
        ChangeDetectionStrategy,
        ChangeDetectorGenConfig;
import "package:angular2/src/core/metadata.dart"
    show
        Directive,
        Component,
        View,
        ViewMetadata,
        Attribute,
        Query,
        Pipe,
        Input,
        Output,
        HostBinding,
        HostListener;
import "package:angular2/src/core/linker/query_list.dart" show QueryList;
import "package:angular2/src/core/linker/view_container_ref.dart"
    show ViewContainerRef;
import "package:angular2/src/core/linker/view_ref.dart" show ViewRef, ViewRef_;
import "package:angular2/src/core/linker/compiler.dart" show Compiler;
import "package:angular2/src/core/linker/element_ref.dart" show ElementRef;
import "package:angular2/src/core/linker/template_ref.dart" show TemplateRef;
import "package:angular2/src/core/render/dom/dom_renderer.dart"
    show DomRenderer;
import "package:angular2/src/facade/lang.dart" show IS_DART;

const ANCHOR_ELEMENT = const OpaqueToken("AnchorElement");
main() {
  describe("integration tests", () {
    beforeEachBindings(
        () => [provide(ANCHOR_ELEMENT, useValue: el("<div></div>"))]);
    describe("react to record changes", () {
      it(
          "should consume text node changes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: "<div>{{ctxProp}}</div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "Hello World!";
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("Hello World!");
              async.done();
            });
          }));
      it(
          "should update text node with a blank string when interpolation evaluates to null",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div>{{null}}{{ctxProp}}</div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = null;
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText("");
              async.done();
            });
          }));
      it(
          "should consume element binding changes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: "<div [id]=\"ctxProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "Hello World!";
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .nativeElement
                  .id).toEqual("Hello World!");
              async.done();
            });
          }));
      it(
          "should consume binding to aria-* attributes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div [attr.aria-label]=\"ctxProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp =
                  "Initial aria label";
              fixture.detectChanges();
              expect(DOM.getAttribute(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "aria-label")).toEqual("Initial aria label");
              fixture.debugElement.componentInstance.ctxProp =
                  "Changed aria label";
              fixture.detectChanges();
              expect(DOM.getAttribute(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "aria-label")).toEqual("Changed aria label");
              async.done();
            });
          }));
      it(
          "should remove an attribute when attribute expression evaluates to null",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div [attr.foo]=\"ctxProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "bar";
              fixture.detectChanges();
              expect(DOM.getAttribute(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "foo")).toEqual("bar");
              fixture.debugElement.componentInstance.ctxProp = null;
              fixture.detectChanges();
              expect(DOM.hasAttribute(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "foo")).toBeFalsy();
              async.done();
            });
          }));
      it(
          "should remove style when when style expression evaluates to null",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div [style.height.px]=\"ctxProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "10";
              fixture.detectChanges();
              expect(DOM.getStyle(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "height")).toEqual("10px");
              fixture.debugElement.componentInstance.ctxProp = null;
              fixture.detectChanges();
              expect(DOM.getStyle(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "height")).toEqual("");
              async.done();
            });
          }));
      it(
          "should consume binding to property names where attr name and property name do not match",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div [tabindex]=\"ctxNumProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .nativeElement
                  .tabIndex).toEqual(0);
              fixture.debugElement.componentInstance.ctxNumProp = 5;
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .nativeElement
                  .tabIndex).toEqual(5);
              async.done();
            });
          }));
      it(
          "should consume binding to camel-cased properties using dash-cased syntax in templates",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<input [read-only]=\"ctxBoolProp\">"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .nativeElement
                  .readOnly).toBeFalsy();
              fixture.debugElement.componentInstance.ctxBoolProp = true;
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .nativeElement
                  .readOnly).toBeTruthy();
              async.done();
            });
          }));
      it(
          "should consume binding to inner-html",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div inner-html=\"{{ctxProp}}\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp =
                  "Some <span>HTML</span>";
              fixture.detectChanges();
              expect(DOM.getInnerHTML(
                  fixture.debugElement.componentViewChildren[0]
                      .nativeElement)).toEqual("Some <span>HTML</span>");
              fixture.debugElement.componentInstance.ctxProp =
                  "Some other <div>HTML</div>";
              fixture.detectChanges();
              expect(DOM.getInnerHTML(
                  fixture.debugElement.componentViewChildren[0]
                      .nativeElement)).toEqual("Some other <div>HTML</div>");
              async.done();
            });
          }));
      it(
          "should consume binding to className using class alias",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<div class=\"initial\" [class]=\"ctxProp\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              var nativeEl =
                  fixture.debugElement.componentViewChildren[0].nativeElement;
              fixture.debugElement.componentInstance.ctxProp = "foo bar";
              fixture.detectChanges();
              expect(nativeEl).toHaveCssClass("foo");
              expect(nativeEl).toHaveCssClass("bar");
              expect(nativeEl).not.toHaveCssClass("initial");
              async.done();
            });
          }));
      it(
          "should consume directive watch expression change.",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var tpl = "<div>" +
                "<div my-dir [elprop]=\"ctxProp\"></div>" +
                "<div my-dir elprop=\"Hi there!\"></div>" +
                "<div my-dir elprop=\"Hi {{'there!'}}\"></div>" +
                "<div my-dir elprop=\"One more {{ctxProp}}\"></div>" +
                "</div>";
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: tpl, directives: [MyDir]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "Hello World!";
              fixture.detectChanges();
              expect(fixture.debugElement.componentViewChildren[0]
                  .inject(MyDir)
                  .dirProp).toEqual("Hello World!");
              expect(fixture.debugElement.componentViewChildren[1]
                  .inject(MyDir)
                  .dirProp).toEqual("Hi there!");
              expect(fixture.debugElement.componentViewChildren[2]
                  .inject(MyDir)
                  .dirProp).toEqual("Hi there!");
              expect(fixture.debugElement.componentViewChildren[3]
                  .inject(MyDir)
                  .dirProp).toEqual("One more Hello World!");
              async.done();
            });
          }));
      describe("pipes", () {
        it(
            "should support pipes in bindings",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<div my-dir #dir=\"mydir\" [elprop]=\"ctxProp | double\"></div>",
                          directives: [MyDir],
                          pipes: [DoublePipe]))
                  .createAsync(MyComp)
                  .then((fixture) {
                fixture.debugElement.componentInstance.ctxProp = "a";
                fixture.detectChanges();
                var dir = fixture.debugElement.componentViewChildren[0]
                    .getLocal("dir");
                expect(dir.dirProp).toEqual("aa");
                async.done();
              });
            }));
      });
      it(
          "should support nested components.",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<child-cmp></child-cmp>",
                        directives: [ChildComp]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText("hello");
              async.done();
            });
          }));
      // GH issue 328 - https://github.com/angular/angular/issues/328
      it(
          "should support different directive types on a single node",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<child-cmp my-dir [elprop]=\"ctxProp\"></child-cmp>",
                        directives: [MyDir, ChildComp]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "Hello World!";
              fixture.detectChanges();
              var tc = fixture.debugElement.componentViewChildren[0];
              expect(tc.inject(MyDir).dirProp).toEqual("Hello World!");
              expect(tc.inject(ChildComp).dirProp).toEqual(null);
              async.done();
            });
          }));
      it(
          "should support directives where a binding attribute is not given",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<p my-dir></p>", directives: [MyDir]))
                .createAsync(MyComp)
                .then((fixture) {
              async.done();
            });
          }));
      it(
          "should execute a given directive once, even if specified multiple times",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<p no-duplicate></p>",
                        directives: [
                          DuplicateDir,
                          DuplicateDir,
                          [
                            DuplicateDir,
                            [DuplicateDir]
                          ]
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("noduplicate");
              async.done();
            });
          }));
      it(
          "should support directives where a selector matches property binding",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<p [id]=\"ctxProp\"></p>",
                        directives: [IdDir]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var idDir = tc.inject(IdDir);
              fixture.debugElement.componentInstance.ctxProp = "some_id";
              fixture.detectChanges();
              expect(idDir.id).toEqual("some_id");
              fixture.debugElement.componentInstance.ctxProp = "other_id";
              fixture.detectChanges();
              expect(idDir.id).toEqual("other_id");
              async.done();
            });
          }));
      it(
          "should read directives metadata from their binding token",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<div public-api><div needs-public-api></div></div>",
                        directives: [PrivateImpl, NeedsPublicApi]))
                .createAsync(MyComp)
                .then((fixture) {
              async.done();
            });
          }));
      it(
          "should support template directives via `<template>` elements.",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<template some-viewport var-greeting=\"some-tmpl\"><copy-me>{{greeting}}</copy-me></template>",
                        directives: [SomeViewport]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var childNodesOfWrapper =
                  DOM.childNodes(fixture.debugElement.nativeElement);
              // 1 template + 2 copies.
              expect(childNodesOfWrapper.length).toBe(3);
              expect(childNodesOfWrapper[1]).toHaveText("hello");
              expect(childNodesOfWrapper[2]).toHaveText("again");
              async.done();
            });
          }));
      it(
          "should support template directives via `template` attribute.",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<copy-me template=\"some-viewport: var greeting=some-tmpl\">{{greeting}}</copy-me>",
                        directives: [SomeViewport]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var childNodesOfWrapper =
                  DOM.childNodes(fixture.debugElement.nativeElement);
              // 1 template + 2 copies.
              expect(childNodesOfWrapper.length).toBe(3);
              expect(childNodesOfWrapper[1]).toHaveText("hello");
              expect(childNodesOfWrapper[2]).toHaveText("again");
              async.done();
            });
          }));
      it(
          "should allow to transplant embedded ProtoViews into other ViewContainers",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<some-directive><toolbar><template toolbarpart var-toolbar-prop=\"toolbarProp\">{{ctxProp}},{{toolbarProp}},<cmp-with-host></cmp-with-host></template></toolbar></some-directive>",
                        directives: [
                          SomeDirective,
                          CompWithHost,
                          ToolbarComponent,
                          ToolbarPart
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "From myComp";
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText(
                  "TOOLBAR(From myComp,From toolbar,Component with an injected host)");
              async.done();
            });
          }));
      describe("variable bindings", () {
        it(
            "should assign a component to a var-",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template: "<p><child-cmp var-alice></child-cmp></p>",
                          directives: [ChildComp]))
                  .createAsync(MyComp)
                  .then((fixture) {
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("alice")).toBeAnInstanceOf(ChildComp);
                async.done();
              });
            }));
        it(
            "should assign a directive to a var-",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<p><div export-dir #localdir=\"dir\"></div></p>",
                          directives: [ExportDir]))
                  .createAsync(MyComp)
                  .then((fixture) {
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("localdir")).toBeAnInstanceOf(ExportDir);
                async.done();
              });
            }));
        it(
            "should make the assigned component accessible in property bindings",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<p><child-cmp var-alice></child-cmp>{{alice.ctxProp}}</p>",
                          directives: [ChildComp]))
                  .createAsync(MyComp)
                  .then((fixture) {
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("hellohello");
                // component, the second one is

                // the text binding
                async.done();
              });
            }));
        it(
            "should assign two component instances each with a var-",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>",
                          directives: [ChildComp]))
                  .createAsync(MyComp)
                  .then((fixture) {
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("alice")).toBeAnInstanceOf(ChildComp);
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("bob")).toBeAnInstanceOf(ChildComp);
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("alice")).not.toBe(fixture
                    .debugElement.componentViewChildren[0].getLocal("bob"));
                async.done();
              });
            }));
        it(
            "should assign the component instance to a var- with shorthand syntax",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template: "<child-cmp #alice></child-cmp>",
                          directives: [ChildComp]))
                  .createAsync(MyComp)
                  .then((fixture) {
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("alice")).toBeAnInstanceOf(ChildComp);
                async.done();
              });
            }));
        it(
            "should assign the element instance to a user-defined variable",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template: "<p><div var-alice><i>Hello</i></div></p>"))
                  .createAsync(MyComp)
                  .then((fixture) {
                var value = fixture.debugElement.componentViewChildren[0]
                    .getLocal("alice");
                expect(value).not.toBe(null);
                expect(value.tagName.toLowerCase()).toEqual("div");
                async.done();
              });
            }));
        it(
            "should change dash-case to camel-case",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<p><child-cmp var-super-alice></child-cmp></p>",
                          directives: [ChildComp]))
                  .createAsync(MyComp)
                  .then((fixture) {
                expect(fixture.debugElement.componentViewChildren[0]
                    .getLocal("superAlice")).toBeAnInstanceOf(ChildComp);
                async.done();
              });
            }));
        it(
            "should allow to use variables in a for loop",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<template ng-for [ng-for-of]=\"[1]\" var-i><child-cmp-no-template #cmp></child-cmp-no-template>{{i}}-{{cmp.ctxProp}}</template>",
                          directives: [ChildCompNoTemplate, NgFor]))
                  .createAsync(MyComp)
                  .then((fixture) {
                fixture.detectChanges();
                // Get the element at index 2, since index 0 is the <template>.
                expect(DOM.childNodes(fixture.debugElement.nativeElement)[2])
                    .toHaveText("1-hello");
                async.done();
              });
            }));
      });
      describe("OnPush components", () {
        it(
            "should use ChangeDetectorRef to manually request a check",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<push-cmp-with-ref #cmp></push-cmp-with-ref>",
                          directives: [
                            [
                              [PushCmpWithRef]
                            ]
                          ]))
                  .createAsync(MyComp)
                  .then((fixture) {
                var cmp = fixture.debugElement.componentViewChildren[0]
                    .getLocal("cmp");
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(1);
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(1);
                cmp.propagate();
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(2);
                async.done();
              });
            }));
        it(
            "should be checked when its bindings got updated",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<push-cmp [prop]=\"ctxProp\" #cmp></push-cmp>",
                          directives: [
                            [
                              [PushCmp]
                            ]
                          ]))
                  .createAsync(MyComp)
                  .then((fixture) {
                var cmp = fixture.debugElement.componentViewChildren[0]
                    .getLocal("cmp");
                fixture.debugElement.componentInstance.ctxProp = "one";
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(1);
                fixture.debugElement.componentInstance.ctxProp = "two";
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(2);
                async.done();
              });
            }));
        it(
            "should not affect updating properties on the component",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<push-cmp-with-ref [prop]=\"ctxProp\" #cmp></push-cmp-with-ref>",
                          directives: [
                            [
                              [PushCmpWithRef]
                            ]
                          ]))
                  .createAsync(MyComp)
                  .then((fixture) {
                var cmp = fixture.debugElement.componentViewChildren[0]
                    .getLocal("cmp");
                fixture.debugElement.componentInstance.ctxProp = "one";
                fixture.detectChanges();
                expect(cmp.prop).toEqual("one");
                fixture.debugElement.componentInstance.ctxProp = "two";
                fixture.detectChanges();
                expect(cmp.prop).toEqual("two");
                async.done();
              });
            }));
        if (DOM.supportsDOMEvents()) {
          it(
              "should be checked when an async pipe requests a check",
              inject([TestComponentBuilder],
                  fakeAsync((TestComponentBuilder tcb) {
                tcb = tcb.overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<push-cmp-with-async #cmp></push-cmp-with-async>",
                        directives: [
                          [
                            [PushCmpWithAsyncPipe]
                          ]
                        ]));
                ComponentFixture fixture;
                tcb.createAsync(MyComp).then((root) {
                  fixture = root;
                });
                tick();
                var cmp = fixture.debugElement.componentViewChildren[0]
                    .getLocal("cmp");
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(1);
                fixture.detectChanges();
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(1);
                cmp.resolve(2);
                tick();
                fixture.detectChanges();
                expect(cmp.numberOfChecks).toEqual(2);
              })));
        }
      });
      it(
          "should create a component that injects an @Host",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <some-directive>
              <p>
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>''',
                        directives: [SomeDirective, CompWithHost]))
                .createAsync(MyComp)
                .then((fixture) {
              var childComponent = fixture.debugElement.componentViewChildren[0]
                  .getLocal("child");
              expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
              async.done();
            });
          }));
      it(
          "should create a component that injects an @Host through viewcontainer directive",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <some-directive>
              <p *ng-if="true">
                <cmp-with-host #child></cmp-with-host>
              </p>
            </some-directive>''',
                        directives: [SomeDirective, CompWithHost, NgIf]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var tc =
                  fixture.debugElement.componentViewChildren[0].children[1];
              var childComponent = tc.getLocal("child");
              expect(childComponent.myHost).toBeAnInstanceOf(SomeDirective);
              async.done();
            });
          }));
      it(
          "should support events via EventEmitter on regular elements",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div emitter listener></div>",
                        directives: [
                          DirectiveEmitingEvent,
                          DirectiveListeningEvent
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var emitter = tc.inject(DirectiveEmitingEvent);
              var listener = tc.inject(DirectiveListeningEvent);
              expect(listener.msg).toEqual("");
              ObservableWrapper.subscribe(emitter.event, (_) {
                expect(listener.msg).toEqual("fired !");
                async.done();
              });
              emitter.fireEvent("fired !");
            });
          }));
      it(
          "should support events via EventEmitter on template elements",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<template emitter listener (event)=\"ctxProp=\$event\"></template>",
                        directives: [
                          DirectiveEmitingEvent,
                          DirectiveListeningEvent
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var emitter = tc.inject(DirectiveEmitingEvent);
              var myComp = tc.inject(MyComp);
              var listener = tc.inject(DirectiveListeningEvent);
              myComp.ctxProp = "";
              expect(listener.msg).toEqual("");
              ObservableWrapper.subscribe(emitter.event, (_) {
                expect(listener.msg).toEqual("fired !");
                expect(myComp.ctxProp).toEqual("fired !");
                async.done();
              });
              emitter.fireEvent("fired !");
            });
          }));
      it(
          "should support [()] syntax",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div [(control)]=\"ctxProp\" two-way></div>",
                        directives: [DirectiveWithTwoWayBinding]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var dir = tc.inject(DirectiveWithTwoWayBinding);
              fixture.debugElement.componentInstance.ctxProp = "one";
              fixture.detectChanges();
              expect(dir.control).toEqual("one");
              ObservableWrapper.subscribe(dir.controlChange, (_) {
                expect(fixture.debugElement.componentInstance.ctxProp)
                    .toEqual("two");
                async.done();
              });
              dir.triggerChange("two");
            });
          }));
      it(
          "should support render events",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div listener></div>",
                        directives: [DirectiveListeningDomEvent]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var listener = tc.inject(DirectiveListeningDomEvent);
              dispatchEvent(tc.nativeElement, "domEvent");
              expect(listener.eventTypes).toEqual([
                "domEvent",
                "body_domEvent",
                "document_domEvent",
                "window_domEvent"
              ]);
              async.done();
            });
          }));
      it(
          "should support render global events",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div listener></div>",
                        directives: [DirectiveListeningDomEvent]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var listener = tc.inject(DirectiveListeningDomEvent);
              dispatchEvent(DOM.getGlobalEventTarget("window"), "domEvent");
              expect(listener.eventTypes).toEqual(["window_domEvent"]);
              listener.eventTypes = [];
              dispatchEvent(DOM.getGlobalEventTarget("document"), "domEvent");
              expect(listener.eventTypes)
                  .toEqual(["document_domEvent", "window_domEvent"]);
              fixture.destroy();
              listener.eventTypes = [];
              dispatchEvent(DOM.getGlobalEventTarget("body"), "domEvent");
              expect(listener.eventTypes).toEqual([]);
              async.done();
            });
          }));
      it(
          "should support updating host element via hostAttributes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div update-host-attributes></div>",
                        directives: [DirectiveUpdatingHostAttributes]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              expect(DOM.getAttribute(
                  fixture.debugElement.componentViewChildren[0].nativeElement,
                  "role")).toEqual("button");
              async.done();
            });
          }));
      it(
          "should support updating host element via hostProperties",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<div update-host-properties></div>",
                        directives: [DirectiveUpdatingHostProperties]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var updateHost = tc.inject(DirectiveUpdatingHostProperties);
              updateHost.id = "newId";
              fixture.detectChanges();
              expect(tc.nativeElement.id).toEqual("newId");
              async.done();
            });
          }));
      if (DOM.supportsDOMEvents()) {
        it(
            "should support preventing default on render events",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<input type=\"checkbox\" listenerprevent></input><input type=\"checkbox\" listenernoprevent></input>",
                          directives: [
                            DirectiveListeningDomEventPrevent,
                            DirectiveListeningDomEventNoPrevent
                          ]))
                  .createAsync(MyComp)
                  .then((fixture) {
                var dispatchedEvent = DOM.createMouseEvent("click");
                var dispatchedEvent2 = DOM.createMouseEvent("click");
                DOM.dispatchEvent(
                    fixture.debugElement.componentViewChildren[0].nativeElement,
                    dispatchedEvent);
                DOM.dispatchEvent(
                    fixture.debugElement.componentViewChildren[1].nativeElement,
                    dispatchedEvent2);
                expect(DOM.isPrevented(dispatchedEvent)).toBe(true);
                expect(DOM.isPrevented(dispatchedEvent2)).toBe(false);
                expect(DOM.getChecked(fixture.debugElement
                    .componentViewChildren[0].nativeElement)).toBeFalsy();
                expect(DOM.getChecked(fixture.debugElement
                    .componentViewChildren[1].nativeElement)).toBeTruthy();
                async.done();
              });
            }));
      }
      it(
          "should support render global events from multiple directives",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<div *ng-if=\"ctxBoolProp\" listener listenerother></div>",
                        directives: [
                          NgIf,
                          DirectiveListeningDomEvent,
                          DirectiveListeningDomEventOther
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              globalCounter = 0;
              fixture.debugElement.componentInstance.ctxBoolProp = true;
              fixture.detectChanges();
              var tc = fixture.debugElement.componentViewChildren[1];
              var listener = tc.inject(DirectiveListeningDomEvent);
              var listenerother = tc.inject(DirectiveListeningDomEventOther);
              dispatchEvent(DOM.getGlobalEventTarget("window"), "domEvent");
              expect(listener.eventTypes).toEqual(["window_domEvent"]);
              expect(listenerother.eventType).toEqual("other_domEvent");
              expect(globalCounter).toEqual(1);
              fixture.debugElement.componentInstance.ctxBoolProp = false;
              fixture.detectChanges();
              dispatchEvent(DOM.getGlobalEventTarget("window"), "domEvent");
              expect(globalCounter).toEqual(1);
              fixture.debugElement.componentInstance.ctxBoolProp = true;
              fixture.detectChanges();
              dispatchEvent(DOM.getGlobalEventTarget("window"), "domEvent");
              expect(globalCounter).toEqual(2);
              async.done();
            });
          }));
      describe("dynamic ViewContainers", () {
        it(
            "should allow to create a ViewContainerRef at any bound location",
            inject([TestComponentBuilder, AsyncTestCompleter, Compiler],
                (TestComponentBuilder tcb, async, compiler) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<div><dynamic-vp #dynamic></dynamic-vp></div>",
                          directives: [DynamicViewport]))
                  .createAsync(MyComp)
                  .then((fixture) {
                var tc = fixture.debugElement.componentViewChildren[0];
                var dynamicVp = tc.inject(DynamicViewport);
                dynamicVp.done.then((_) {
                  fixture.detectChanges();
                  expect(fixture.debugElement.componentViewChildren[1]
                      .nativeElement).toHaveText("dynamic greet");
                  async.done();
                });
              });
            }));
      });
      it(
          "should support static attributes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<input static type=\"text\" title>",
                        directives: [NeedsAttribute]))
                .createAsync(MyComp)
                .then((fixture) {
              var tc = fixture.debugElement.componentViewChildren[0];
              var needsAttribute = tc.inject(NeedsAttribute);
              expect(needsAttribute.typeAttribute).toEqual("text");
              expect(needsAttribute.staticAttribute).toEqual("");
              expect(needsAttribute.fooAttribute).toEqual(null);
              async.done();
            });
          }));
    });
    describe("dependency injection", () {
      it(
          "should support bindings",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <directive-providing-injectable >
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
            </directive-providing-injectable>
          ''',
                        directives: [
                          DirectiveProvidingInjectable,
                          DirectiveConsumingInjectable
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              var comp = fixture.debugElement.componentViewChildren[0]
                  .getLocal("consuming");
              expect(comp.injectable).toBeAnInstanceOf(InjectableService);
              async.done();
            });
          }));
      it(
          "should support viewProviders",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    DirectiveProvidingInjectableInView,
                    new ViewMetadata(
                        template: '''
              <directive-consuming-injectable #consuming>
              </directive-consuming-injectable>
          ''',
                        directives: [DirectiveConsumingInjectable]))
                .createAsync(DirectiveProvidingInjectableInView)
                .then((fixture) {
              var comp = fixture.debugElement.componentViewChildren[0]
                  .getLocal("consuming");
              expect(comp.injectable).toBeAnInstanceOf(InjectableService);
              async.done();
            });
          }));
      it(
          "should support unbounded lookup",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <directive-providing-injectable>
              <directive-containing-directive-consuming-an-injectable #dir>
              </directive-containing-directive-consuming-an-injectable>
            </directive-providing-injectable>
          ''',
                        directives: [
                          DirectiveProvidingInjectable,
                          DirectiveContainingDirectiveConsumingAnInjectable
                        ]))
                .overrideView(
                    DirectiveContainingDirectiveConsumingAnInjectable,
                    new ViewMetadata(
                        template: '''
            <directive-consuming-injectable-unbounded></directive-consuming-injectable-unbounded>
          ''',
                        directives: [DirectiveConsumingInjectableUnbounded]))
                .createAsync(MyComp)
                .then((fixture) {
              var comp =
                  fixture.debugElement.componentViewChildren[0].getLocal("dir");
              expect(comp.directive.injectable)
                  .toBeAnInstanceOf(InjectableService);
              async.done();
            });
          }));
      it(
          "should support the event-bus scenario",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <grand-parent-providing-event-bus>
              <parent-providing-event-bus>
                <child-consuming-event-bus>
                </child-consuming-event-bus>
              </parent-providing-event-bus>
            </grand-parent-providing-event-bus>
          ''',
                        directives: [
                          GrandParentProvidingEventBus,
                          ParentProvidingEventBus,
                          ChildConsumingEventBus
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              var gpComp = fixture.debugElement.componentViewChildren[0];
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
      it(
          "should instantiate bindings lazily",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
              <component-providing-logging-injectable #providing>
                <directive-consuming-injectable *ng-if="ctxBoolProp">
                </directive-consuming-injectable>
              </component-providing-logging-injectable>
          ''',
                        directives: [
                          DirectiveConsumingInjectable,
                          ComponentProvidingLoggingInjectable,
                          NgIf
                        ]))
                .createAsync(MyComp)
                .then((fixture) {
              var providing = fixture.debugElement.componentViewChildren[0]
                  .getLocal("providing");
              expect(providing.created).toBe(false);
              fixture.debugElement.componentInstance.ctxBoolProp = true;
              fixture.detectChanges();
              expect(providing.created).toBe(true);
              async.done();
            });
          }));
    });
    describe("corner cases", () {
      it(
          "should remove script tags from templates",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: '''
            <script>alert("Ooops");</script>
            <div>before<script>alert("Ooops");</script><span>inside</span>after</div>'''))
                .createAsync(MyComp)
                .then((fixture) {
              expect(DOM
                  .querySelectorAll(
                      fixture.debugElement.nativeElement, "script")
                  .length).toEqual(0);
              async.done();
            });
          }));
    });
    describe("error handling", () {
      it(
          "should report a meaningful error when a directive is missing annotation",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb = tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    template: "",
                    directives: [SomeDirectiveMissingAnnotation]));
            PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) {
              expect(e.message).toEqual(
                  '''No Directive annotation found on ${ stringify ( SomeDirectiveMissingAnnotation )}''');
              async.done();
              return null;
            });
          }));
      it(
          "should report a meaningful error when a component is missing view annotation",
          inject([TestComponentBuilder], (TestComponentBuilder tcb) {
            try {
              tcb.createAsync(ComponentWithoutView);
            } catch (e, e_stack) {
              expect(e.message).toContain(
                  '''must have either \'template\', \'templateUrl\', or \'@View\' set.''');
              return null;
            }
          }));
      it(
          "should report a meaningful error when a directive is null",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb = tcb.overrideView(
                MyComp,
                new ViewMetadata(directives: [
                  [null]
                ], template: ""));
            PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) {
              expect(e.message).toEqual(
                  '''Unexpected directive value \'null\' on the View of component \'${ stringify ( MyComp )}\'''');
              async.done();
              return null;
            });
          }));
      it(
          "should provide an error context when an error happens in DI",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb = tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    directives: [DirectiveThrowingAnError],
                    template:
                        '''<directive-throwing-error></<directive-throwing-error>'''));
            PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) {
              var c = e.context;
              expect(DOM.nodeName(c.element).toUpperCase())
                  .toEqual("DIRECTIVE-THROWING-ERROR");
              expect(DOM.nodeName(c.componentElement).toUpperCase())
                  .toEqual("DIV");
              expect(c.injector).toBeAnInstanceOf(Injector);
              async.done();
              return null;
            });
          }));
      it(
          "should provide an error context when an error happens in change detection",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb = tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    template: '''<input [value]="one.two.three" #local>'''));
            tcb.createAsync(MyComp).then((fixture) {
              try {
                fixture.detectChanges();
                throw "Should throw";
              } catch (e, e_stack) {
                var c = e.context;
                expect(DOM.nodeName(c.element).toUpperCase()).toEqual("INPUT");
                expect(DOM.nodeName(c.componentElement).toUpperCase())
                    .toEqual("DIV");
                expect(c.injector).toBeAnInstanceOf(Injector);
                expect(c.expression).toContain("one.two.three");
                expect(c.context).toBe(fixture.debugElement.componentInstance);
                expect(c.locals["local"]).toBeDefined();
              }
              async.done();
            });
          }));
      it(
          "should provide an error context when an error happens in change detection (text node)",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb = tcb.overrideView(
                MyComp, new ViewMetadata(template: '''{{one.two.three}}'''));
            tcb.createAsync(MyComp).then((fixture) {
              try {
                fixture.detectChanges();
                throw "Should throw";
              } catch (e, e_stack) {
                var c = e.context;
                expect(c.element).toBeNull();
                expect(c.injector).toBeNull();
              }
              async.done();
            });
          }));
      if (DOM.supportsDOMEvents()) {
        it(
            "should provide an error context when an error happens in an event handler",
            inject([TestComponentBuilder],
                fakeAsync((TestComponentBuilder tcb) {
              tcb = tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          '''<span emitter listener (event)="throwError()" #local></span>''',
                      directives: [
                        DirectiveEmitingEvent,
                        DirectiveListeningEvent
                      ]));
              ComponentFixture fixture;
              tcb.createAsync(MyComp).then((root) {
                fixture = root;
              });
              tick();
              var tc = fixture.debugElement.componentViewChildren[0];
              tc.inject(DirectiveEmitingEvent).fireEvent("boom");
              try {
                tick();
                throw "Should throw";
              } catch (e, e_stack) {
                clearPendingTimers();
                var c = e.context;
                expect(DOM.nodeName(c.element).toUpperCase()).toEqual("SPAN");
                expect(DOM.nodeName(c.componentElement).toUpperCase())
                    .toEqual("DIV");
                expect(c.injector).toBeAnInstanceOf(Injector);
                expect(c.context).toBe(fixture.debugElement.componentInstance);
                expect(c.locals["local"]).toBeDefined();
              }
            })));
      }
      if (!IS_DART) {
        it(
            "should report a meaningful error when a directive is undefined",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              var undefinedValue;
              tcb = tcb.overrideView(MyComp,
                  new ViewMetadata(directives: [undefinedValue], template: ""));
              PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) {
                expect(e.message).toEqual(
                    '''Unexpected directive value \'undefined\' on the View of component \'${ stringify ( MyComp )}\'''');
                async.done();
                return null;
              });
            }));
      }
      it(
          "should specify a location of an error that happened during change detection (text)",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(MyComp, new ViewMetadata(template: "{{a.b}}"))
                .createAsync(MyComp)
                .then((fixture) {
              expect(() => fixture.detectChanges()).toThrowError(
                  containsRegexp('''{{a.b}} in ${ stringify ( MyComp )}'''));
              async.done();
            });
          }));
      it(
          "should specify a location of an error that happened during change detection (element property)",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: "<div [title]=\"a.b\"></div>"))
                .createAsync(MyComp)
                .then((fixture) {
              expect(() => fixture.detectChanges()).toThrowError(
                  containsRegexp('''a.b in ${ stringify ( MyComp )}'''));
              async.done();
            });
          }));
      it(
          "should specify a location of an error that happened during change detection (directive property)",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<child-cmp [title]=\"a.b\"></child-cmp>",
                        directives: [ChildComp]))
                .createAsync(MyComp)
                .then((fixture) {
              expect(() => fixture.detectChanges()).toThrowError(
                  containsRegexp('''a.b in ${ stringify ( MyComp )}'''));
              async.done();
            });
          }));
    });
    it(
        "should support imperative views",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template: "<simple-imp-cmp></simple-imp-cmp>",
                      directives: [SimpleImperativeViewComponent]))
              .createAsync(MyComp)
              .then((fixture) {
            expect(fixture.debugElement.nativeElement)
                .toHaveText("hello imp view");
            async.done();
          });
        }));
    it(
        "should support moving embedded views around",
        inject([TestComponentBuilder, AsyncTestCompleter, ANCHOR_ELEMENT],
            (tcb, async, anchorElement) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          "<div><div *some-impvp=\"ctxBoolProp\">hello</div></div>",
                      directives: [SomeImperativeViewport]))
              .createAsync(MyComp)
              .then((ComponentFixture fixture) {
            fixture.detectChanges();
            expect(anchorElement).toHaveText("");
            fixture.debugElement.componentInstance.ctxBoolProp = true;
            fixture.detectChanges();
            expect(anchorElement).toHaveText("hello");
            fixture.debugElement.componentInstance.ctxBoolProp = false;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("");
            async.done();
          });
        }));
    describe("Property bindings", () {
      if (!IS_DART) {
        it(
            "should throw on bindings to unknown properties",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb = tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      template: "<div unknown=\"{{ctxProp}}\"></div>"));
              PromiseWrapper.catchError(tcb.createAsync(MyComp), (e) {
                expect(e.message).toEqual('''Template parse errors:
Can\'t bind to \'unknown\' since it isn\'t a known native property in MyComp > div:nth-child(0)[unknown={{ctxProp}}]''');
                async.done();
                return null;
              });
            }));
        it(
            "should not throw for property binding to a non-existing property when there is a matching directive property",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template: "<div my-dir [elprop]=\"ctxProp\"></div>",
                          directives: [MyDir]))
                  .createAsync(MyComp)
                  .then((val) {
                async.done();
              });
            }));
      }
      it(
          "should not be created when there is a directive with the same property",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<span [title]=\"ctxProp\"></span>",
                        directives: [DirectiveWithTitle]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "TITLE";
              fixture.detectChanges();
              var el =
                  DOM.querySelector(fixture.debugElement.nativeElement, "span");
              expect(isBlank(el.title) || el.title == "").toBeTruthy();
              async.done();
            });
          }));
      it(
          "should work when a directive uses hostProperty to update the DOM element",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<span [title]=\"ctxProp\"></span>",
                        directives: [DirectiveWithTitleAndHostProperty]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "TITLE";
              fixture.detectChanges();
              var el =
                  DOM.querySelector(fixture.debugElement.nativeElement, "span");
              expect(el.title).toEqual("TITLE");
              async.done();
            });
          }));
    });
    describe("logging property updates", () {
      beforeEachBindings(() => [
            provide(ChangeDetectorGenConfig,
                useValue: new ChangeDetectorGenConfig(true, true, false))
          ]);
      it(
          "should reflect property values as attributes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var tpl =
                "<div>" + "<div my-dir [elprop]=\"ctxProp\"></div>" + "</div>";
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: tpl, directives: [MyDir]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.debugElement.componentInstance.ctxProp = "hello";
              fixture.detectChanges();
              expect(DOM.getInnerHTML(fixture.debugElement.nativeElement))
                  .toContain("ng-reflect-dir-prop=\"hello\"");
              async.done();
            });
          }));
    });
    describe("different proto view storages", () {
      runWithMode(String mode) {
        return inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template: '''<!--${ mode}--><div>{{ctxProp}}</div>'''))
              .createAsync(MyComp)
              .then((fixture) {
            fixture.debugElement.componentInstance.ctxProp = "Hello World!";
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("Hello World!");
            async.done();
          });
        });
      }
      it("should work with storing DOM nodes", runWithMode("cache"));
      it("should work with serializing the DOM nodes", runWithMode("nocache"));
    });
    // Disabled until a solution is found, refs:

    // - https://github.com/angular/angular/issues/776

    // - https://github.com/angular/angular/commit/81f3f32
    xdescribe("Missing directive checks", () {
      expectCompileError(tcb, inlineTpl, errMessage, done) {
        tcb = tcb.overrideView(MyComp, new ViewMetadata(template: inlineTpl));
        PromiseWrapper.then(tcb.createAsync(MyComp), (value) {
          throw new BaseException(
              "Test failure: should not have come here as an exception was expected");
        }, (err) {
          expect(err.message).toEqual(errMessage);
          done();
        });
      }
      if (assertionsEnabled()) {
        it(
            "should raise an error if no directive is registered for a template with template bindings",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              expectCompileError(
                  tcb,
                  "<div><div template=\"if: foo\"></div></div>",
                  "Missing directive to handle 'if' in <div template=\"if: foo\">",
                  () => async.done());
            }));
        it(
            "should raise an error for missing template directive (1)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              expectCompileError(
                  tcb,
                  "<div><template foo></template></div>",
                  "Missing directive to handle: <template foo>",
                  () => async.done());
            }));
        it(
            "should raise an error for missing template directive (2)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              expectCompileError(
                  tcb,
                  "<div><template *ng-if=\"condition\"></template></div>",
                  "Missing directive to handle: <template *ng-if=\"condition\">",
                  () => async.done());
            }));
        it(
            "should raise an error for missing template directive (3)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              expectCompileError(
                  tcb,
                  "<div *ng-if=\"condition\"></div>",
                  "Missing directive to handle 'if' in MyComp: <div *ng-if=\"condition\">",
                  () => async.done());
            }));
      }
    });
    describe("property decorators", () {
      it(
          "should support property decorators",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<with-prop-decorators el-prop=\"aaa\"></with-prop-decorators>",
                        directives: [DirectiveWithPropDecorators]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var dir = fixture.debugElement.componentViewChildren[0]
                  .inject(DirectiveWithPropDecorators);
              expect(dir.dirProp).toEqual("aaa");
              async.done();
            });
          }));
      it(
          "should support host binding decorators",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<with-prop-decorators></with-prop-decorators>",
                        directives: [DirectiveWithPropDecorators]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var dir = fixture.debugElement.componentViewChildren[0]
                  .inject(DirectiveWithPropDecorators);
              dir.myAttr = "aaa";
              fixture.detectChanges();
              expect(DOM.getOuterHTML(
                  fixture.debugElement.componentViewChildren[0]
                      .nativeElement)).toContain("my-attr=\"aaa\"");
              async.done();
            });
          }));
      if (DOM.supportsDOMEvents()) {
        it(
            "should support events decorators",
            inject([TestComponentBuilder],
                fakeAsync((TestComponentBuilder tcb) {
              tcb = tcb.overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          '''<with-prop-decorators (el-event)="ctxProp=\'called\'">''',
                      directives: [DirectiveWithPropDecorators]));
              ComponentFixture fixture;
              tcb.createAsync(MyComp).then((root) {
                fixture = root;
              });
              tick();
              var emitter = fixture.debugElement.componentViewChildren[0]
                  .inject(DirectiveWithPropDecorators);
              emitter.fireEvent("fired !");
              tick();
              expect(fixture.debugElement.componentInstance.ctxProp)
                  .toEqual("called");
            })));
        it(
            "should support host listener decorators",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template:
                              "<with-prop-decorators></with-prop-decorators>",
                          directives: [DirectiveWithPropDecorators]))
                  .createAsync(MyComp)
                  .then((fixture) {
                fixture.detectChanges();
                var dir = fixture.debugElement.componentViewChildren[0]
                    .inject(DirectiveWithPropDecorators);
                var native =
                    fixture.debugElement.componentViewChildren[0].nativeElement;
                DOM.dispatchEvent(native, DOM.createMouseEvent("click"));
                expect(dir.target).toBe(native);
                async.done();
              });
            }));
      }
      it(
          "should support defining views in the component decorator",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template:
                            "<component-with-template></component-with-template>",
                        directives: [ComponentWithTemplate]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              var native =
                  fixture.debugElement.componentViewChildren[0].nativeElement;
              expect(native).toHaveText("No View Decorator: 123");
              async.done();
            });
          }));
    });
    if (DOM.supportsDOMEvents()) {
      describe("svg", () {
        it(
            "should support svg elements",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb
                  .overrideView(
                      MyComp,
                      new ViewMetadata(
                          template: "<svg><use xlink:href=\"Port\" /></svg>"))
                  .createAsync(MyComp)
                  .then((fixture) {
                var el = fixture.debugElement.nativeElement;
                var svg = DOM.childNodes(el)[0];
                var use = DOM.childNodes(svg)[0];
                expect(DOM.getProperty((svg as dynamic), "namespaceURI"))
                    .toEqual("http://www.w3.org/2000/svg");
                expect(DOM.getProperty((use as dynamic), "namespaceURI"))
                    .toEqual("http://www.w3.org/2000/svg");
                if (!IS_DART) {
                  var firstAttribute =
                      DOM.getProperty((use as dynamic), "attributes")[0];
                  expect(firstAttribute.name).toEqual("xlink:href");
                  expect(firstAttribute.namespaceURI)
                      .toEqual("http://www.w3.org/1999/xlink");
                } else {
                  // For Dart where '_Attr' has no instance getter 'namespaceURI'
                  expect(DOM.getOuterHTML((use as dynamic)))
                      .toContain("xmlns:xlink");
                }
                async.done();
              });
            }));
      });
    }
  });
}

@Injectable()
class MyService {
  String greeting;
  MyService() {
    this.greeting = "hello";
  }
}

@Component(selector: "simple-imp-cmp")
@View(template: "")
@Injectable()
class SimpleImperativeViewComponent {
  var done;
  SimpleImperativeViewComponent(ElementRef self, DomRenderer renderer) {
    var hostElement = renderer.getNativeElementSync(self);
    DOM.appendChild(hostElement, el("hello imp view"));
  }
}

@Directive(selector: "dynamic-vp")
@Injectable()
class DynamicViewport {
  var done;
  DynamicViewport(ViewContainerRef vc, Compiler compiler) {
    var myService = new MyService();
    myService.greeting = "dynamic greet";
    var bindings = Injector.resolve([provide(MyService, useValue: myService)]);
    this.done = compiler.compileInHost(ChildCompUsingService).then((hostPv) {
      vc.createHostView(hostPv, 0, bindings);
    });
  }
}

@Directive(
    selector: "[my-dir]", inputs: const ["dirProp: elprop"], exportAs: "mydir")
@Injectable()
class MyDir {
  String dirProp;
  MyDir() {
    this.dirProp = "";
  }
}

@Directive(selector: "[title]", inputs: const ["title"])
class DirectiveWithTitle {
  String title;
}

@Directive(
    selector: "[title]",
    inputs: const ["title"],
    host: const {"[title]": "title"})
class DirectiveWithTitleAndHostProperty {
  String title;
}

@Component(
    selector: "push-cmp",
    inputs: const ["prop"],
    changeDetection: ChangeDetectionStrategy.OnPush)
@View(template: "{{field}}")
@Injectable()
class PushCmp {
  num numberOfChecks;
  var prop;
  PushCmp() {
    this.numberOfChecks = 0;
  }
  get field {
    this.numberOfChecks++;
    return "fixed";
  }
}

@Component(
    selector: "push-cmp-with-ref",
    inputs: const ["prop"],
    changeDetection: ChangeDetectionStrategy.OnPush)
@View(template: "{{field}}")
@Injectable()
class PushCmpWithRef {
  num numberOfChecks;
  ChangeDetectorRef ref;
  var prop;
  PushCmpWithRef(ChangeDetectorRef ref) {
    this.numberOfChecks = 0;
    this.ref = ref;
  }
  get field {
    this.numberOfChecks++;
    return "fixed";
  }

  propagate() {
    this.ref.markForCheck();
  }
}

@Component(
    selector: "push-cmp-with-async",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: "{{field | async}}",
    pipes: const [AsyncPipe])
@Injectable()
class PushCmpWithAsyncPipe {
  num numberOfChecks = 0;
  Future<dynamic> promise;
  PromiseCompleter<dynamic> completer;
  PushCmpWithAsyncPipe() {
    this.completer = PromiseWrapper.completer();
    this.promise = this.completer.promise;
  }
  get field {
    this.numberOfChecks++;
    return this.promise;
  }

  resolve(value) {
    this.completer.resolve(value);
  }
}

@Component(selector: "my-comp")
@View(directives: const [])
@Injectable()
class MyComp {
  String ctxProp;
  var ctxNumProp;
  var ctxBoolProp;
  MyComp() {
    this.ctxProp = "initial value";
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }
  throwError() {
    throw "boom";
  }
}

@Component(
    selector: "child-cmp",
    inputs: const ["dirProp"],
    viewProviders: const [MyService])
@View(directives: const [MyDir], template: "{{ctxProp}}")
@Injectable()
class ChildComp {
  String ctxProp;
  String dirProp;
  ChildComp(MyService service) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Component(selector: "child-cmp-no-template")
@View(directives: const [], template: "")
@Injectable()
class ChildCompNoTemplate {
  String ctxProp = "hello";
}

@Component(selector: "child-cmp-svc")
@View(template: "{{ctxProp}}")
@Injectable()
class ChildCompUsingService {
  String ctxProp;
  ChildCompUsingService(MyService service) {
    this.ctxProp = service.greeting;
  }
}

@Directive(selector: "some-directive")
@Injectable()
class SomeDirective {}

class SomeDirectiveMissingAnnotation {}

@Component(selector: "cmp-with-host")
@View(
    template: "<p>Component with an injected host</p>",
    directives: const [SomeDirective])
@Injectable()
class CompWithHost {
  SomeDirective myHost;
  CompWithHost(@Host() SomeDirective someComp) {
    this.myHost = someComp;
  }
}

@Component(selector: "[child-cmp2]", viewProviders: const [MyService])
@Injectable()
class ChildComp2 {
  String ctxProp;
  String dirProp;
  ChildComp2(MyService service) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Directive(selector: "[some-viewport]")
@Injectable()
class SomeViewport {
  SomeViewport(ViewContainerRef container, TemplateRef templateRef) {
    container.createEmbeddedView(templateRef).setLocal("some-tmpl", "hello");
    container.createEmbeddedView(templateRef).setLocal("some-tmpl", "again");
  }
}

@Pipe(name: "double")
class DoublePipe implements PipeTransform {
  onDestroy() {}
  transform(value, [args = null]) {
    return '''${ value}${ value}''';
  }
}

@Directive(selector: "[emitter]", outputs: const ["event"])
@Injectable()
class DirectiveEmitingEvent {
  String msg;
  EventEmitter<dynamic> event;
  DirectiveEmitingEvent() {
    this.msg = "";
    this.event = new EventEmitter();
  }
  fireEvent(String msg) {
    ObservableWrapper.callNext(this.event, msg);
  }
}

@Directive(selector: "[update-host-attributes]", host: const {"role": "button"})
@Injectable()
class DirectiveUpdatingHostAttributes {}

@Directive(selector: "[update-host-properties]", host: const {"[id]": "id"})
@Injectable()
class DirectiveUpdatingHostProperties {
  String id;
  DirectiveUpdatingHostProperties() {
    this.id = "one";
  }
}

@Directive(
    selector: "[update-host-actions]", host: const {"@setAttr": "setAttribute"})
@Injectable()
class DirectiveUpdatingHostActions {
  EventEmitter<dynamic> setAttr;
  DirectiveUpdatingHostActions() {
    this.setAttr = new EventEmitter();
  }
  triggerSetAttr(attrValue) {
    ObservableWrapper.callNext(this.setAttr, ["key", attrValue]);
  }
}

@Directive(selector: "[listener]", host: const {"(event)": "onEvent(\$event)"})
@Injectable()
class DirectiveListeningEvent {
  String msg;
  DirectiveListeningEvent() {
    this.msg = "";
  }
  onEvent(String msg) {
    this.msg = msg;
  }
}

@Directive(
    selector: "[listener]",
    host: const {
      "(domEvent)": "onEvent(\$event.type)",
      "(window:domEvent)": "onWindowEvent(\$event.type)",
      "(document:domEvent)": "onDocumentEvent(\$event.type)",
      "(body:domEvent)": "onBodyEvent(\$event.type)"
    })
@Injectable()
class DirectiveListeningDomEvent {
  List<String> eventTypes = [];
  onEvent(String eventType) {
    this.eventTypes.add(eventType);
  }

  onWindowEvent(String eventType) {
    this.eventTypes.add("window_" + eventType);
  }

  onDocumentEvent(String eventType) {
    this.eventTypes.add("document_" + eventType);
  }

  onBodyEvent(String eventType) {
    this.eventTypes.add("body_" + eventType);
  }
}

var globalCounter = 0;

@Directive(
    selector: "[listenerother]",
    host: const {"(window:domEvent)": "onEvent(\$event.type)"})
@Injectable()
class DirectiveListeningDomEventOther {
  String eventType;
  DirectiveListeningDomEventOther() {
    this.eventType = "";
  }
  onEvent(String eventType) {
    globalCounter++;
    this.eventType = "other_" + eventType;
  }
}

@Directive(
    selector: "[listenerprevent]", host: const {"(click)": "onEvent(\$event)"})
@Injectable()
class DirectiveListeningDomEventPrevent {
  onEvent(event) {
    return false;
  }
}

@Directive(
    selector: "[listenernoprevent]",
    host: const {"(click)": "onEvent(\$event)"})
@Injectable()
class DirectiveListeningDomEventNoPrevent {
  onEvent(event) {
    return true;
  }
}

@Directive(selector: "[id]", inputs: const ["id"])
@Injectable()
class IdDir {
  String id;
}

@Directive(selector: "[static]")
@Injectable()
class NeedsAttribute {
  var typeAttribute;
  var staticAttribute;
  var fooAttribute;
  NeedsAttribute(
      @Attribute("type") String typeAttribute,
      @Attribute("static") String staticAttribute,
      @Attribute("foo") String fooAttribute) {
    this.typeAttribute = typeAttribute;
    this.staticAttribute = staticAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Injectable()
class PublicApi {}

@Directive(
    selector: "[public-api]",
    providers: const [
      const Provider(PublicApi, useExisting: PrivateImpl, deps: const [])
    ])
@Injectable()
class PrivateImpl extends PublicApi {}

@Directive(selector: "[needs-public-api]")
@Injectable()
class NeedsPublicApi {
  NeedsPublicApi(@Host() PublicApi api) {
    expect(api is PrivateImpl).toBe(true);
  }
}

@Directive(selector: "[toolbarpart]")
@Injectable()
class ToolbarPart {
  TemplateRef templateRef;
  ToolbarPart(TemplateRef templateRef) {
    this.templateRef = templateRef;
  }
}

@Directive(selector: "[toolbar-vc]", inputs: const ["toolbarVc"])
@Injectable()
class ToolbarViewContainer {
  ViewContainerRef vc;
  ToolbarViewContainer(ViewContainerRef vc) {
    this.vc = vc;
  }
  set toolbarVc(ToolbarPart part) {
    var view = this.vc.createEmbeddedView(part.templateRef, 0);
    view.setLocal("toolbarProp", "From toolbar");
  }
}

@Component(selector: "toolbar")
@View(
    template:
        "TOOLBAR(<div *ng-for=\"var part of query\" [toolbar-vc]=\"part\"></div>)",
    directives: const [ToolbarViewContainer, NgFor])
@Injectable()
class ToolbarComponent {
  QueryList<ToolbarPart> query;
  String ctxProp;
  ToolbarComponent(@Query(ToolbarPart) QueryList<ToolbarPart> query) {
    this.ctxProp = "hello world";
    this.query = query;
  }
}

@Directive(
    selector: "[two-way]",
    inputs: const ["control"],
    outputs: const ["controlChange"])
@Injectable()
class DirectiveWithTwoWayBinding {
  var controlChange = new EventEmitter();
  var control = null;
  triggerChange(value) {
    ObservableWrapper.callNext(this.controlChange, value);
  }
}

@Injectable()
class InjectableService {}

createInjectableWithLogging(Injector inj) {
  inj.get(ComponentProvidingLoggingInjectable).created = true;
  return new InjectableService();
}

@Component(
    selector: "component-providing-logging-injectable",
    providers: const [
      const Provider(InjectableService,
          useFactory: createInjectableWithLogging, deps: const [Injector])
    ])
@View(template: "")
@Injectable()
class ComponentProvidingLoggingInjectable {
  bool created = false;
}

@Directive(
    selector: "directive-providing-injectable",
    providers: const [
      const [InjectableService]
    ])
@Injectable()
class DirectiveProvidingInjectable {}

@Component(
    selector: "directive-providing-injectable",
    viewProviders: const [
      const [InjectableService]
    ])
@View(template: "")
@Injectable()
class DirectiveProvidingInjectableInView {}

@Component(
    selector: "directive-providing-injectable",
    providers: const [const Provider(InjectableService, useValue: "host")],
    viewProviders: const [const Provider(InjectableService, useValue: "view")])
@View(template: "")
@Injectable()
class DirectiveProvidingInjectableInHostAndView {}

@Component(selector: "directive-consuming-injectable")
@View(template: "")
@Injectable()
class DirectiveConsumingInjectable {
  var injectable;
  DirectiveConsumingInjectable(@Host() @Inject(InjectableService) injectable) {
    this.injectable = injectable;
  }
}

@Component(selector: "directive-containing-directive-consuming-an-injectable")
@Injectable()
class DirectiveContainingDirectiveConsumingAnInjectable {
  var directive;
}

@Component(selector: "directive-consuming-injectable-unbounded")
@View(template: "")
@Injectable()
class DirectiveConsumingInjectableUnbounded {
  var injectable;
  DirectiveConsumingInjectableUnbounded(InjectableService injectable,
      @SkipSelf() DirectiveContainingDirectiveConsumingAnInjectable parent) {
    this.injectable = injectable;
    parent.directive = this;
  }
}

class EventBus {
  final EventBus parentEventBus;
  final String name;
  const EventBus(EventBus parentEventBus, String name)
      : parentEventBus = parentEventBus,
        name = name;
}

@Directive(
    selector: "grand-parent-providing-event-bus",
    providers: const [
      const Provider(EventBus, useValue: const EventBus(null, "grandparent"))
    ])
class GrandParentProvidingEventBus {
  EventBus bus;
  GrandParentProvidingEventBus(EventBus bus) {
    this.bus = bus;
  }
}

createParentBus(peb) {
  return new EventBus(peb, "parent");
}

@Component(
    selector: "parent-providing-event-bus",
    providers: const [
      const Provider(EventBus,
          useFactory: createParentBus,
          deps: const [
            const [EventBus, const SkipSelfMetadata()]
          ])
    ])
@View(
    directives: const [ChildConsumingEventBus],
    template: '''
    <child-consuming-event-bus></child-consuming-event-bus>
  ''')
class ParentProvidingEventBus {
  EventBus bus;
  EventBus grandParentBus;
  ParentProvidingEventBus(EventBus bus, @SkipSelf() EventBus grandParentBus) {
    this.bus = bus;
    this.grandParentBus = grandParentBus;
  }
}

@Directive(selector: "child-consuming-event-bus")
class ChildConsumingEventBus {
  EventBus bus;
  ChildConsumingEventBus(@SkipSelf() EventBus bus) {
    this.bus = bus;
  }
}

@Directive(selector: "[some-impvp]", inputs: const ["someImpvp"])
@Injectable()
class SomeImperativeViewport {
  ViewContainerRef vc;
  TemplateRef templateRef;
  DomRenderer renderer;
  ViewRef view;
  var anchor;
  SomeImperativeViewport(this.vc, this.templateRef, this.renderer,
      @Inject(ANCHOR_ELEMENT) anchor) {
    this.view = null;
    this.anchor = anchor;
  }
  set someImpvp(bool value) {
    if (isPresent(this.view)) {
      this.vc.clear();
      this.view = null;
    }
    if (value) {
      this.view = this.vc.createEmbeddedView(this.templateRef);
      var nodes =
          this.renderer.getRootNodes(((this.view as ViewRef_)).renderFragment);
      for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(this.anchor, nodes[i]);
      }
    }
  }
}

@Directive(selector: "[export-dir]", exportAs: "dir")
class ExportDir {}

@Component(selector: "comp")
class ComponentWithoutView {}

@Directive(selector: "[no-duplicate]")
class DuplicateDir {
  DuplicateDir(ElementRef elRef) {
    DOM.setText(
        elRef.nativeElement, DOM.getText(elRef.nativeElement) + "noduplicate");
  }
}

@Directive(selector: "[no-duplicate]")
class OtherDuplicateDir {
  OtherDuplicateDir(ElementRef elRef) {
    DOM.setText(elRef.nativeElement,
        DOM.getText(elRef.nativeElement) + "othernoduplicate");
  }
}

@Directive(selector: "directive-throwing-error")
class DirectiveThrowingAnError {
  DirectiveThrowingAnError() {
    throw new BaseException("BOOM");
  }
}

@Component(
    selector: "component-with-template",
    directives: const [NgFor],
    template:
        '''No View Decorator: <div *ng-for="#item of items">{{item}}</div>''')
class ComponentWithTemplate {
  var items = [1, 2, 3];
}

@Directive(selector: "with-prop-decorators")
class DirectiveWithPropDecorators {
  var target;
  @Input("elProp") String dirProp;
  @Output("elEvent") var event = new EventEmitter();
  @HostBinding("attr.my-attr") String myAttr;
  @HostListener("click", const ["\$event.target"]) onClick(target) {
    this.target = target;
  }

  fireEvent(msg) {
    ObservableWrapper.callNext(this.event, msg);
  }
}
