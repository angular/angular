import {describe, xit, it, expect, beforeEach, ddescribe, iit, el, proxy} from 'angular2/test_lib';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'angular2/src/core/compiler/view';
import {ProtoElementInjector, ElementInjector, DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {EmulatedScopedShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component, Decorator, Viewport, Directive, onChange, onAllChangesDone} from 'angular2/src/core/annotations/annotations';
import {Lexer, Parser, DynamicProtoChangeDetector,
  ChangeDetector} from 'angular2/change_detection';
import {EventEmitter} from 'angular2/src/core/annotations/di';
import {List, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {int, IMPLEMENTS} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import {View, PropertyUpdate} from 'angular2/src/core/compiler/view';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';
import {EventManager, DomEventsPlugin} from 'angular2/src/core/events/event_manager';
import {reflector} from 'angular2/src/reflection/reflection';

@proxy
@IMPLEMENTS(ViewContainer)
class FakeViewContainer {
  templateElement;

  constructor(templateElement) {
    this.templateElement = templateElement;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

@proxy
@IMPLEMENTS(View)
class FakeView {
  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

export function main() {
  describe('view', function() {
    var parser, someComponentDirective, someViewportDirective;

    function createView(protoView, eventManager: EventManager = null) {
      var ctx = new MyEvaluationContext();
      var view = protoView.instantiate(null, eventManager);
      view.hydrate(null, null, null, ctx, null);
      return view;
    }

    beforeEach(() => {
      parser = new Parser(new Lexer());
      someComponentDirective = new DirectiveMetadataReader().read(SomeComponent);
      someViewportDirective = new DirectiveMetadataReader().read(SomeViewport);
    });

    describe('instantiated from protoView', () => {
      var view;
      beforeEach(() => {
        var pv = new ProtoView(el('<div id="1"></div>'), new DynamicProtoChangeDetector(null), null);
        view = pv.instantiate(null, null);
      });

      it('should be dehydrated by default', () => {
        expect(view.hydrated()).toBe(false);
      });

      it('should be able to be hydrated and dehydrated', () => {
        var ctx = new Object();
        view.hydrate(null, null, null, ctx, null);
        expect(view.hydrated()).toBe(true);

        view.dehydrate();
        expect(view.hydrated()).toBe(false);
      });

      it('should hydrate and dehydrate the change detector', () => {
        var ctx = new Object();
        view.hydrate(null, null, null, ctx, null);
        expect(view.changeDetector.hydrated()).toBe(true);

        view.dehydrate();
        expect(view.changeDetector.hydrated()).toBe(false);
      });

      it('should use the view pool to reuse views', () => {
        var pv = new ProtoView(el('<div id="1"></div>'), new DynamicProtoChangeDetector(null), null);
        var fakeView = new FakeView();
        pv.returnToPool(fakeView);

        expect(pv.instantiate(null, null)).toBe(fakeView);
      });
    });

    describe('with locals', function() {
      var view;
      beforeEach(() => {
        var pv = new ProtoView(el('<div id="1"></div>'), new DynamicProtoChangeDetector(null), null);
        pv.bindVariable('context-foo', 'template-foo');
        view = createView(pv);
      });

      it('should support setting of declared locals', () => {
        view.setLocal('context-foo', 'bar');
        expect(view.locals.get('template-foo')).toBe('bar');
      });

      it('should not throw on undeclared locals', () => {
        expect(() => view.setLocal('setMePlease', 'bar')).not.toThrow();
      });

      it('when dehydrated should set locals to null', () => {
        view.setLocal('context-foo', 'bar');
        view.dehydrate();
        view.hydrate(null, null, null, new Object(), null);
        expect(view.locals.get('template-foo')).toBe(null);
      });

      it('should throw when trying to set on dehydrated view', () => {
        view.dehydrate();
        expect(() => view.setLocal('context-foo', 'bar')).toThrowError();
      });
    });

    describe('instantiated and hydrated', function() {

      function createCollectDomNodesTestCases(useTemplateElement:boolean) {

        function templateAwareCreateElement(html) {
          return el(useTemplateElement ? `<template>${html}</template>` : html);
        }

        it('should collect the root node in the ProtoView element', () => {
          var pv = new ProtoView(templateAwareCreateElement('<div id="1"></div>'),
            new DynamicProtoChangeDetector(null), null);
          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.nodes.length).toBe(1);
          expect(DOM.getAttribute(view.nodes[0], 'id')).toEqual('1');
        });

        describe('collect elements with property bindings', () => {

          it('should collect property bindings on the root element if it has the ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div [prop]="a" class="ng-binding"></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, null);
            pv.bindElementProperty(parser.parseBinding('a', null), 'prop', reflector.setter('prop'));

            var view = pv.instantiate(null, null);
            view.hydrate(null, null, null, null, null);
            expect(view.bindElements.length).toEqual(1);
            expect(view.bindElements[0]).toBe(view.nodes[0]);
          });

          it('should collect property bindings on child elements with ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div><span></span><span class="ng-binding"></span></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, null);
            pv.bindElementProperty(parser.parseBinding('b', null), 'a', reflector.setter('a'));

            var view = pv.instantiate(null, null);
            view.hydrate(null, null, null, null, null);
            expect(view.bindElements.length).toEqual(1);
            expect(view.bindElements[0]).toBe(view.nodes[0].childNodes[1]);
          });

        });

        describe('collect text nodes with bindings', () => {

          it('should collect text nodes under the root element', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div class="ng-binding">{{}}<span></span>{{}}</div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, null);
            pv.bindTextNode(0, parser.parseBinding('a', null));
            pv.bindTextNode(2, parser.parseBinding('b', null));

            var view = pv.instantiate(null, null);
            view.hydrate(null, null, null, null, null);
            expect(view.textNodes.length).toEqual(2);
            expect(view.textNodes[0]).toBe(view.nodes[0].childNodes[0]);
            expect(view.textNodes[1]).toBe(view.nodes[0].childNodes[2]);
          });

          it('should collect text nodes with bindings on child elements with ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div><span> </span><span class="ng-binding">{{}}</span></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, null);
            pv.bindTextNode(0, parser.parseBinding('b', null));

            var view = pv.instantiate(null, null);
            view.hydrate(null, null, null, null, null);
            expect(view.textNodes.length).toEqual(1);
            expect(view.textNodes[0]).toBe(view.nodes[0].childNodes[1].childNodes[0]);
          });

        });
      }

      describe('inplace instantiation', () => {
        it('should be supported.', () => {
          var template = el('<div></div>');
          var pv = new ProtoView(template, new DynamicProtoChangeDetector(null),
            new NativeShadowDomStrategy(null));
          pv.instantiateInPlace = true;
          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.nodes[0]).toBe(template);
        });

        it('should be off by default.', () => {
          var template = el('<div></div>')
          var pv = new ProtoView(template, new DynamicProtoChangeDetector(null),
            new NativeShadowDomStrategy(null))
          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.nodes[0]).not.toBe(template);
        });
      });

      describe('collect dom nodes with a regular element as root', () => {
        createCollectDomNodesTestCases(false);
      });

      describe('collect dom nodes with a template element as root', () => {
        createCollectDomNodesTestCases(true);
      });

      describe('create ElementInjectors', () => {
        it('should use the directives of the ProtoElementInjector', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, new ProtoElementInjector(null, 1, [SomeDirective]));

          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.elementInjectors.length).toBe(1);
          expect(view.elementInjectors[0].get(SomeDirective) instanceof SomeDirective).toBe(true);
        });

        it('should use the correct parent', () => {
          var pv = new ProtoView(el('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new DynamicProtoChangeDetector(null), null);
          var protoParent = new ProtoElementInjector(null, 0, [SomeDirective]);
          pv.bindElement(null, 0, protoParent);
          pv.bindElement(null, 0, new ProtoElementInjector(protoParent, 1, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.elementInjectors.length).toBe(2);
          expect(view.elementInjectors[0].get(SomeDirective) instanceof SomeDirective).toBe(true);
          expect(view.elementInjectors[1].parent).toBe(view.elementInjectors[0]);
        });

        it('should not pass the host injector when a parent injector exists', () => {
          var pv = new ProtoView(el('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new DynamicProtoChangeDetector(null), null);
          var protoParent = new ProtoElementInjector(null, 0, [SomeDirective]);
          pv.bindElement(null, 0, protoParent);
          var testProtoElementInjector = new TestProtoElementInjector(protoParent, 1, [AnotherDirective]);
          pv.bindElement(null, 0, testProtoElementInjector);

          var hostProtoInjector = new ProtoElementInjector(null, 0, []);
          var hostInjector = hostProtoInjector.instantiate(null, null);
          var view;
          expect(() => view = pv.instantiate(hostInjector, null)).not.toThrow();
          expect(testProtoElementInjector.parentElementInjector).toBe(view.elementInjectors[0]);
          expect(testProtoElementInjector.hostElementInjector).toBeNull();
        });

        it('should pass the host injector when there is no parent injector', () => {
          var pv = new ProtoView(el('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeDirective]));
          var testProtoElementInjector = new TestProtoElementInjector(null, 1, [AnotherDirective]);
          pv.bindElement(null, 0, testProtoElementInjector);

          var hostProtoInjector = new ProtoElementInjector(null, 0, []);
          var hostInjector = hostProtoInjector.instantiate(null, null);
          expect(() => pv.instantiate(hostInjector, null)).not.toThrow();
          expect(testProtoElementInjector.parentElementInjector).toBeNull();
          expect(testProtoElementInjector.hostElementInjector).toBe(hostInjector);
        });
      });

      describe('collect root element injectors', () => {

        it('should collect a single root element injector', () => {
          var pv = new ProtoView(el('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new DynamicProtoChangeDetector(null), null);
          var protoParent = new ProtoElementInjector(null, 0, [SomeDirective]);
          pv.bindElement(null, 0, protoParent);
          pv.bindElement(null, 0, new ProtoElementInjector(protoParent, 1, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.rootElementInjectors.length).toBe(1);
          expect(view.rootElementInjectors[0].get(SomeDirective) instanceof SomeDirective).toBe(true);
        });

        it('should collect multiple root element injectors', () => {
          var pv = new ProtoView(el('<div><span class="ng-binding"></span><span class="ng-binding"></span></div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, new ProtoElementInjector(null, 1, [SomeDirective]));
          pv.bindElement(null, 0, new ProtoElementInjector(null, 2, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          view.hydrate(null, null, null, null, null);
          expect(view.rootElementInjectors.length).toBe(2)
          expect(view.rootElementInjectors[0].get(SomeDirective) instanceof SomeDirective).toBe(true);
          expect(view.rootElementInjectors[1].get(AnotherDirective) instanceof AnotherDirective).toBe(true);
        });

      });

      describe('with component views', () => {
        var ctx;

        function createComponentWithSubPV(subProtoView) {
          var pv = new ProtoView(el('<cmp class="ng-binding"></cmp>'),
            new DynamicProtoChangeDetector(null), new NativeShadowDomStrategy(null));
          var binder = pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeComponent], true));
          binder.componentDirective = someComponentDirective;
          binder.nestedProtoView = subProtoView;
          return pv;
        }

        function createNestedView(protoView) {
          ctx = new MyEvaluationContext();
          var view = protoView.instantiate(null, null);
          view.hydrate(new Injector([]), null, null, ctx, null);
          return view;
        }

        it('should expose component services to the component', () => {
          var subpv = new ProtoView(el('<span></span>'), new DynamicProtoChangeDetector(null), null);
          var pv = createComponentWithSubPV(subpv);

          var view = createNestedView(pv);

          var comp = view.rootElementInjectors[0].get(SomeComponent);
          expect(comp.service).toBeAnInstanceOf(SomeService);
        });

        it('should expose component services and component instance to directives in the shadow Dom',
          () => {
            var subpv = new ProtoView(
              el('<div dec class="ng-binding">hello shadow dom</div>'),
              new DynamicProtoChangeDetector(null),
              null);
            subpv.bindElement(null, 0, 
              new ProtoElementInjector(null, 0, [ServiceDependentDecorator]));
            var pv = createComponentWithSubPV(subpv);

            var view = createNestedView(pv);

            var subView = view.componentChildViews[0];
            var subInj = subView.rootElementInjectors[0];
            var subDecorator = subInj.get(ServiceDependentDecorator);
            var comp = view.rootElementInjectors[0].get(SomeComponent);

            expect(subDecorator).toBeAnInstanceOf(ServiceDependentDecorator);
            expect(subDecorator.service).toBe(comp.service);
            expect(subDecorator.component).toBe(comp);
          });

        function expectViewHasNoDirectiveInstances(view) {
          view.elementInjectors.forEach((inj) => expect(inj.hasInstances()).toBe(false));
        }

        it('dehydration should dehydrate child component views too', () => {
          var subpv = new ProtoView(
            el('<div dec class="ng-binding">hello shadow dom</div>'),
            new DynamicProtoChangeDetector(null),
            null);
          subpv.bindElement(null, 0, 
            new ProtoElementInjector(null, 0, [ServiceDependentDecorator]));
          var pv = createComponentWithSubPV(subpv);

          var view = createNestedView(pv);
          view.dehydrate();

          expect(view.hydrated()).toBe(false);
          expectViewHasNoDirectiveInstances(view);
          view.componentChildViews.forEach(
            (view) => expectViewHasNoDirectiveInstances(view));
        });

        it('should create shadow dom (Native Strategy)', () => {
          var subpv = new ProtoView(el('<span>hello shadow dom</span>'),
            new DynamicProtoChangeDetector(null),
            null);
          var pv = createComponentWithSubPV(subpv);

          var view = createNestedView(pv);

          expect(view.nodes[0].shadowRoot.childNodes[0].childNodes[0].nodeValue).toEqual('hello shadow dom');
        });

        it('should emulate shadow dom (Emulated Strategy)', () => {
          var subpv = new ProtoView(el('<span>hello shadow dom</span>'),
            new DynamicProtoChangeDetector(null), null);

          var pv = new ProtoView(el('<cmp class="ng-binding"></cmp>'),
            new DynamicProtoChangeDetector(null), new EmulatedScopedShadowDomStrategy(null, null, null));
          var binder = pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeComponent], true));
          binder.componentDirective = new DirectiveMetadataReader().read(SomeComponent);
          binder.nestedProtoView = subpv;

          var view = createNestedView(pv);
          expect(view.nodes[0].childNodes[0].childNodes[0].nodeValue).toEqual('hello shadow dom');
        });

      });

      describe('with template views', () => {
        function createViewWithViewport() {
          var templateProtoView = new ProtoView(
            el('<div id="1"></div>'), new DynamicProtoChangeDetector(null), null);
          var pv = new ProtoView(el('<someTmpl class="ng-binding"></someTmpl>'),
            new DynamicProtoChangeDetector(null), new NativeShadowDomStrategy(null));
          var binder = pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeViewport]));
          binder.viewportDirective = someViewportDirective;
          binder.nestedProtoView = templateProtoView;

          return createView(pv);
        }

        it('should create a ViewContainer for the Viewport directive', () => {
          var view = createViewWithViewport();

          var tmplComp = view.rootElementInjectors[0].get(SomeViewport);
          expect(tmplComp.viewContainer).not.toBe(null);
        });

        it('dehydration should dehydrate viewcontainers', () => {
          var view = createViewWithViewport();

          var tmplComp = view.rootElementInjectors[0].get(SomeViewport);
          expect(tmplComp.viewContainer.hydrated()).toBe(false);
        });
      });

      if (DOM.supportsDOMEvents()) {
        describe('event handlers', () => {
          var view, ctx, called, receivedEvent, dispatchedEvent;

          function createViewAndContext(protoView) {
            view = createView(protoView,
                new EventManager([new DomEventsPlugin()], new FakeVmTurnZone()));
            ctx = view.context;
            called = 0;
            receivedEvent = null;
            ctx.callMe = (event) => {
              called += 1;
              receivedEvent = event;
            }
          }

          function dispatchClick(el) {
            dispatchedEvent = DOM.createMouseEvent('click');
            DOM.dispatchEvent(el, dispatchedEvent);
          }

          function createProtoView() {
            var pv = new ProtoView(el('<div class="ng-binding"><div></div></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, new TestProtoElementInjector(null, 0, []));
            pv.bindEvent('click', parser.parseBinding('callMe($event)', null));
            return pv;
          }

          it('should fire on non-bubbling native events', () => {
            createViewAndContext(createProtoView());

            dispatchClick(view.nodes[0]);

            expect(called).toEqual(1);
            expect(receivedEvent).toBe(dispatchedEvent);
          });

          it('should not fire on a bubbled native events', () => {
            createViewAndContext(createProtoView());

            dispatchClick(view.nodes[0].firstChild);

            // This test passes trivially on webkit browsers due to
            // https://bugs.webkit.org/show_bug.cgi?id=122755
            expect(called).toEqual(0);
          });

          it('should not throw if the view is dehydrated', () => {
            createViewAndContext(createProtoView());

            view.dehydrate();
            expect(() => dispatchClick(view.nodes[0])).not.toThrow();
            expect(called).toEqual(0);
          });

          it('should support custom event emitters', () => {
            var pv = new ProtoView(el('<div class="ng-binding"><div></div></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, new TestProtoElementInjector(null, 0, [EventEmitterDirective]));
            pv.bindEvent('click', parser.parseBinding('callMe($event)', null));

            createViewAndContext(pv);
            var dir = view.elementInjectors[0].get(EventEmitterDirective);

            var dispatchedEvent = new Object();

            dir.click(dispatchedEvent);
            expect(receivedEvent).toBe(dispatchedEvent);
            expect(called).toEqual(1);

            // Should not eval the binding, because custom emitter takes over.
            dispatchClick(view.nodes[0]);

            expect(called).toEqual(1);
          });

          it('should bind to directive events', () => {
            var pv = new ProtoView(el('<div class="ng-binding"></div>'),
              new DynamicProtoChangeDetector(null), null);
            pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeDirectiveWithEventHandler]));
            pv.bindEvent('click', parser.parseAction('onEvent($event)', null), 0);
            view = createView(pv, new EventManager([new DomEventsPlugin()], new FakeVmTurnZone()));

            var directive = view.elementInjectors[0].get(SomeDirectiveWithEventHandler);
            expect(directive.event).toEqual(null);

            dispatchClick(view.nodes[0]);
            expect(directive.event).toBe(dispatchedEvent);
          });
        });
      }

      describe('react to record changes', () => {
        var view, cd, ctx;

        function createViewAndChangeDetector(protoView) {
          view = createView(protoView);
          ctx = view.context;
          cd = view.changeDetector;
        }

        it('should consume text node changes', () => {
          var pv = new ProtoView(el('<div class="ng-binding">{{}}</div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, null);
          pv.bindTextNode(0, parser.parseBinding('foo', null));
          createViewAndChangeDetector(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.textNodes[0].nodeValue).toEqual('buz');
        });

        it('should consume element binding changes', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, null);
          pv.bindElementProperty(parser.parseBinding('foo', null), 'id', reflector.setter('id'));
          createViewAndChangeDetector(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.bindElements[0].id).toEqual('buz');
        });

        it('should consume directive watch expression change', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);
          pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [SomeDirective]));
          pv.bindDirectiveProperty(0, parser.parseBinding('foo', null), 'prop', reflector.setter('prop'));
          createViewAndChangeDetector(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.elementInjectors[0].get(SomeDirective).prop).toEqual('buz');
        });

        it('should notify a directive about changes after all its properties have been set', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);

          pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [
            DirectiveBinding.createFromType(DirectiveImplementingOnChange, new Directive({lifecycle: [onChange]}))
          ]));
          pv.bindDirectiveProperty( 0, parser.parseBinding('a', null), 'a', reflector.setter('a'));
          pv.bindDirectiveProperty( 0, parser.parseBinding('b', null), 'b', reflector.setter('b'));
          createViewAndChangeDetector(pv);

          ctx.a = 100;
          ctx.b = 200;
          cd.detectChanges();

          var directive = view.elementInjectors[0].get(DirectiveImplementingOnChange);
          expect(directive.c).toEqual(300);
        });

        it('should provide a map of updated properties using onChange callback', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);

          pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [
            DirectiveBinding.createFromType(DirectiveImplementingOnChange, new Directive({lifecycle: [onChange]}))
          ]));
          pv.bindDirectiveProperty( 0, parser.parseBinding('a', null), 'a', reflector.setter('a'));
          pv.bindDirectiveProperty( 0, parser.parseBinding('b', null), 'b', reflector.setter('b'));
          createViewAndChangeDetector(pv);

          var directive = view.elementInjectors[0].get(DirectiveImplementingOnChange);

          ctx.a = 0;
          ctx.b = 0;
          cd.detectChanges();

          expect(directive.changes).toEqual({
            "a" : PropertyUpdate.createWithoutPrevious(0),
            "b" : PropertyUpdate.createWithoutPrevious(0)
          });

          ctx.a = 100;
          cd.detectChanges();
          expect(directive.changes).toEqual({"a" : new PropertyUpdate(100, 0)});
        });
        
        it('should invoke the onAllChangesDone callback', () => {
          var pv = new ProtoView(el('<div class="ng-binding"></div>'),
            new DynamicProtoChangeDetector(null), null);

          pv.bindElement(null, 0, new ProtoElementInjector(null, 0, [
            DirectiveBinding.createFromType(DirectiveImplementingOnAllChangesDone, new Directive({lifecycle: [onAllChangesDone]}))
          ]));

          createViewAndChangeDetector(pv);
          cd.detectChanges();

          var directive = view.elementInjectors[0].get(DirectiveImplementingOnAllChangesDone);
          expect(directive.onAllChangesDoneCalled).toBe(true);
        });
      });
    });

    describe('protoView createRootProtoView', () => {
      var element, pv;
      beforeEach(() => {
        element = DOM.createElement('div');
        pv = new ProtoView(el('<div>hi</div>'), new DynamicProtoChangeDetector(null),
          new NativeShadowDomStrategy(null));
      });

      it('should create the root component when instantiated', () => {
        var rootProtoView = ProtoView.createRootProtoView(pv, element,
          someComponentDirective, new DynamicProtoChangeDetector(null),
          new NativeShadowDomStrategy(null));
        var view = rootProtoView.instantiate(null, null);
        view.hydrate(new Injector([]), null, null, null, null);
        expect(view.rootElementInjectors[0].get(SomeComponent)).not.toBe(null);
      });

      it('should inject the protoView into the shadowDom', () => {
        var rootProtoView = ProtoView.createRootProtoView(pv, element,
          someComponentDirective, new DynamicProtoChangeDetector(null),
          new NativeShadowDomStrategy(null));
        var view = rootProtoView.instantiate(null, null);
        view.hydrate(new Injector([]), null, null, null, null);
        expect(element.shadowRoot.childNodes[0].childNodes[0].nodeValue).toEqual('hi');
      });
    });
  });
}

class SomeDirective {
  prop;
  constructor() {
    this.prop = 'foo';
  }
}

class DirectiveImplementingOnChange {
  a;
  b;
  c;
  changes;

  onChange(changes) {
    this.c = this.a + this.b;
    this.changes = changes;
  }
}

class DirectiveImplementingOnAllChangesDone {
  onAllChangesDoneCalled;

  onAllChangesDone() {
    this.onAllChangesDoneCalled = true;
  }
}

class SomeService {}

@Component({services: [SomeService]})
class SomeComponent {
  service: SomeService;
  constructor(service: SomeService) {
    this.service = service;
  }
}

@Decorator({
  selector: '[dec]'
})
class ServiceDependentDecorator {
  component: SomeComponent;
  service: SomeService;
  constructor(component: SomeComponent, service: SomeService) {
    this.component = component;
    this.service = service;
  }
}

@Viewport({
  selector: 'someTmpl'
})
class SomeViewport {
  viewContainer: ViewContainer;
  constructor(viewContainer: ViewContainer) {
    this.viewContainer = viewContainer;
  }
}

class AnotherDirective {
  prop:string;
  constructor() {
    this.prop = 'anotherFoo';
  }
}

class EventEmitterDirective {
  _clicker:Function;
  constructor(@EventEmitter('click') clicker:Function) {
    this._clicker = clicker;
  }
  click(eventData) {
    this._clicker(eventData);
  }
}

class SomeDirectiveWithEventHandler {
  event;

  constructor() {
    this.event = null;
  }

  onEvent(event) {
    this.event = event;
  }
}

class MyEvaluationContext {
  foo:string;
  a;
  b;
  callMe;
  constructor() {
    this.foo = 'bar';
  };
}

class TestProtoElementInjector extends ProtoElementInjector {
  parentElementInjector: ElementInjector;
  hostElementInjector: ElementInjector;

  constructor(parent:ProtoElementInjector, index:int, bindings:List, firstBindingIsComponent:boolean = false) {
    super(parent, index, bindings, firstBindingIsComponent);
  }

  instantiate(parent:ElementInjector, host:ElementInjector):ElementInjector {
    this.parentElementInjector = parent;
    this.hostElementInjector = host;
    return super.instantiate(parent, host);
  }
}

class FakeVmTurnZone extends VmTurnZone {
  constructor() {
    super({enableLongStackTrace: false});
  }

  run(fn) {
    fn();
  }

  runOutsideAngular(fn) {
    fn();
  }
}
