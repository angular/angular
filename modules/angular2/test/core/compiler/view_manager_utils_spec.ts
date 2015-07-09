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
  SpyObject,
  SpyChangeDetector,
  proxy,
  Log
} from 'angular2/test_lib';

import {Injector, bind} from 'angular2/di';
import {IMPLEMENTS, isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {
  DirectiveBinding,
  ElementInjector,
  PreBuiltObjects,
  ProtoElementInjector
} from 'angular2/src/core/compiler/element_injector';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Component} from 'angular2/annotations';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';

export function main() {
  // TODO(tbosch): add more tests here!

  describe('AppViewManagerUtils', () => {

    var directiveResolver;
    var utils;

    function createInjector() { return Injector.resolveAndCreate([]); }

    function createDirectiveBinding(type) {
      var annotation = directiveResolver.resolve(type);
      return DirectiveBinding.createFromType(type, annotation);
    }

    function createEmptyElBinder() { return new ElementBinder(0, null, 0, null, null); }

    function createComponentElBinder(nestedProtoView = null) {
      var binding = createDirectiveBinding(SomeComponent);
      var binder = new ElementBinder(0, null, 0, null, binding);
      binder.nestedProtoView = nestedProtoView;
      return binder;
    }

    function createProtoView(binders = null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var res = new AppProtoView(null, null, null, null);
      res.elementBinders = binders;
      return res;
    }

    function createElementInjector(parent = null) {
      var host = new SpyElementInjector();
      var elementInjector =
          isPresent(parent) ? new SpyElementInjectorWithParent(parent) : new SpyElementInjector();
      return SpyObject.stub(elementInjector,
                            {
                              'isExportingComponent': false,
                              'isExportingElement': false,
                              'getEventEmitterAccessors': [],
                              'getHostActionAccessors': [],
                              'getComponent': null,
                              'getHost': host
                            },
                            {});
    }

    function createView(pv = null, nestedInjectors = false) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var view = new AppView(null, pv, new Map());
      var elementInjectors = ListWrapper.createGrowableSize(pv.elementBinders.length);
      var preBuiltObjects = ListWrapper.createFixedSize(pv.elementBinders.length);
      for (var i = 0; i < pv.elementBinders.length; i++) {
        if (nestedInjectors && i > 0) {
          elementInjectors[i] = createElementInjector(elementInjectors[i - 1]);
        } else {
          elementInjectors[i] = createElementInjector();
        }
        preBuiltObjects[i] = new SpyPreBuiltObjects();
      }
      view.init(<any>new SpyChangeDetector(), elementInjectors, elementInjectors, preBuiltObjects,
                ListWrapper.createFixedSize(pv.elementBinders.length));
      return view;
    }

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      utils = new AppViewManagerUtils();
    });

    describe("hydrateComponentView", () => {

      it("should hydrate the change detector after hydrating element injectors", () => {
        var log = new Log();

        var componentView = createView(createProtoView([createEmptyElBinder()]));
        var hostView = createView(createProtoView([createComponentElBinder(createProtoView())]));
        hostView.componentChildViews = [componentView];

        var spyEi = <any>componentView.elementInjectors[0];
        spyEi.spy('hydrate').andCallFake(log.fn('hydrate'));

        var spyCd = <any>componentView.changeDetector;
        spyCd.spy('hydrate').andCallFake(log.fn('hydrateCD'));

        utils.hydrateComponentView(hostView, 0);

        expect(log.result()).toEqual('hydrate; hydrateCD');
      });

    });

    describe('shared hydrate functionality', () => {

      it("should set up event listeners", () => {
        var dir = new Object();

        var hostPv = createProtoView([createComponentElBinder(null), createEmptyElBinder()]);
        var hostView = createView(hostPv);
        var spyEventAccessor1 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[0], {
          'getHostActionAccessors': [],
          'getEventEmitterAccessors': [[spyEventAccessor1]],
          'getDirectiveAtIndex': dir
        });
        var spyEventAccessor2 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[1], {
          'getHostActionAccessors': [],
          'getEventEmitterAccessors': [[spyEventAccessor2]],
          'getDirectiveAtIndex': dir
        });

        var shadowView = createView();
        utils.attachComponentView(hostView, 0, shadowView);

        utils.hydrateRootHostView(hostView, createInjector());

        expect(spyEventAccessor1.spy('subscribe')).toHaveBeenCalledWith(hostView, 0, dir);
        expect(spyEventAccessor2.spy('subscribe')).toHaveBeenCalledWith(hostView, 1, dir);
      });

      it("should set up host action listeners", () => {
        var dir = new Object();

        var hostPv = createProtoView([createComponentElBinder(null), createEmptyElBinder()]);
        var hostView = createView(hostPv);
        var spyActionAccessor1 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[0], {
          'getHostActionAccessors': [[spyActionAccessor1]],
          'getEventEmitterAccessors': [],
          'getDirectiveAtIndex': dir
        });
        var spyActionAccessor2 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[1], {
          'getHostActionAccessors': [[spyActionAccessor2]],
          'getEventEmitterAccessors': [],
          'getDirectiveAtIndex': dir
        });

        var shadowView = createView();
        utils.attachComponentView(hostView, 0, shadowView);

        utils.hydrateRootHostView(hostView, createInjector());

        expect(spyActionAccessor1.spy('subscribe')).toHaveBeenCalledWith(hostView, 0, dir);
        expect(spyActionAccessor2.spy('subscribe')).toHaveBeenCalledWith(hostView, 1, dir);
      });

    });

    describe('attachViewInContainer', () => {
      var parentView, contextView, childView;

      function createViews(numInj = 1) {
        var parentPv = createProtoView([createEmptyElBinder()]);
        parentView = createView(parentPv);

        var binders = [];
        for (var i = 0; i < numInj; i++) binders.push(createEmptyElBinder());
        var contextPv = createProtoView(binders);
        contextView = createView(contextPv, true);

        var childPv = createProtoView([createEmptyElBinder()]);
        childView = createView(childPv);
      }

      it('should link the views rootElementInjectors at the given context', () => {
        createViews();
        utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
        expect(contextView.elementInjectors.length).toEqual(2);
      });

      it('should link the views rootElementInjectors after the elementInjector at the given context',
         () => {
           createViews(2);
           utils.attachViewInContainer(parentView, 0, contextView, 1, 0, childView);
           expect(childView.rootElementInjectors[0].spy('linkAfter'))
               .toHaveBeenCalledWith(contextView.elementInjectors[0], null);
         });
    });

    describe('hydrateViewInContainer', () => {
      var parentView, contextView, childView;

      function createViews() {
        var parentPv = createProtoView([createEmptyElBinder()]);
        parentView = createView(parentPv);

        var contextPv = createProtoView([createEmptyElBinder()]);
        contextView = createView(contextPv);

        var childPv = createProtoView([createEmptyElBinder()]);
        childView = createView(childPv);
        utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
      }

      it("should instantiate the elementInjectors with the host of the context's elementInjector",
         () => {
           createViews();

           utils.hydrateViewInContainer(parentView, 0, contextView, 0, 0, null);
           expect(childView.rootElementInjectors[0].spy('hydrate'))
               .toHaveBeenCalledWith(null, contextView.elementInjectors[0].getHost(),
                                     childView.preBuiltObjects[0]);
         });
    });

    describe('hydrateRootHostView', () => {
      var hostView;

      function createViews() {
        var hostPv = createProtoView([createComponentElBinder()]);
        hostView = createView(hostPv);
      }

      it("should instantiate the elementInjectors with the given injector and an empty host element injector",
         () => {
           var injector = createInjector();
           createViews();

           utils.hydrateRootHostView(hostView, injector);
           expect(hostView.rootElementInjectors[0].spy('hydrate'))
               .toHaveBeenCalledWith(injector, null, hostView.preBuiltObjects[0]);
         });

    });

  });
}

@Component({selector: 'someComponent'})
class SomeComponent {
}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjector extends SpyObject {
  constructor() { super(ElementInjector); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjectorWithParent extends SpyObject {
  parent: ElementInjector;
  constructor(parent) {
    super(ElementInjector);
    this.parent = parent;
  }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(PreBuiltObjects)
class SpyPreBuiltObjects extends SpyObject {
  constructor() { super(PreBuiltObjects); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(Injector)
class SpyInjector extends SpyObject {
  constructor() { super(Injector); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
