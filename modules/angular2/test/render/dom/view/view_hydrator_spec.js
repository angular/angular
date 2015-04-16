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
  SpyObject, proxy
} from 'angular2/test_lib';
import {IMPLEMENTS, isBlank} from 'angular2/src/facade/lang';

import {RenderProtoView} from 'angular2/src/render/dom/view/proto_view';
import {ElementBinder} from 'angular2/src/render/dom/view/element_binder';
import {RenderView} from 'angular2/src/render/dom/view/view';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {LightDom} from 'angular2/src/render/dom/shadow_dom/light_dom';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ViewFactory} from 'angular2/src/render/dom/view/view_factory';
import {RenderViewHydrator} from 'angular2/src/render/dom/view/view_hydrator';

export function main() {

  describe('RenderViewHydrator', () => {
    var shadowDomStrategy;
    var eventManager;
    var viewFactory;
    var viewHydrator;

    function createProtoView({rootEl, binders}={}) {
      if (isBlank(rootEl)) {
        rootEl = el('<div></div>');
      }
      if (isBlank(binders)) {
        binders = [];
      }
      return new RenderProtoView({
        element: rootEl,
        elementBinders: binders
      });
    }

    function createComponentElBinder(componentId, nestedProtoView = null) {
      var binder = new ElementBinder({
        componentId: componentId,
        textNodeIndices: []
      });
      binder.nestedProtoView = nestedProtoView;
      return binder;
    }

    function createHostProtoView(nestedProtoView) {
      return createProtoView({
          binders: [
            createComponentElBinder(
              'someComponent',
              nestedProtoView
            )
          ]
        });
    }

    function createEmptyView() {
      var root = el('<div><div></div></div>');
      return new RenderView(createProtoView(), [DOM.childNodes(root)[0]],
        [], [], []);
    }

    function createHostView(pv, shadowDomView) {
      var view = new RenderView(pv, [el('<div></div>')],
        [], [el('<div></div>')], [null]);
      viewFactory.setComponentView(view, 0, shadowDomView);
      return view;
    }

    function hydrate(view) {
      viewHydrator.hydrateInPlaceHostView(null, view);
    }

    function dehydrate(view) {
      viewHydrator.dehydrateInPlaceHostView(null, view);
    }

    beforeEach( () => {
      eventManager = new SpyEventManager();
      shadowDomStrategy = new SpyShadowDomStrategy();
      shadowDomStrategy.spy('constructLightDom').andCallFake( (lightDomView, shadowDomView, el) => {
        return new SpyLightDom();
      });
      viewFactory = new ViewFactory(1, eventManager, shadowDomStrategy);
      viewHydrator = new RenderViewHydrator(eventManager, viewFactory);
    });

    describe('hydrateDynamicComponentView', () => {

      it('should redistribute', () => {
        var shadowView = createEmptyView();
        var hostPv = createHostProtoView(createProtoView());
        var hostView = createHostView(hostPv, shadowView);
        viewHydrator.hydrateDynamicComponentView(hostView, 0, shadowView);
        var lightDomSpy:SpyLightDom = hostView.lightDoms[0];
        expect(lightDomSpy.spy('redistribute')).toHaveBeenCalled();
      });

    });

    describe('hydrate... shared functionality', () => {

      it('should hydrate existing child components', () => {
        var hostPv = createHostProtoView(createProtoView());
        var shadowView = createEmptyView();
        createHostView(hostPv, shadowView);

        hydrate(shadowView);

        expect(shadowView.hydrated).toBe(true);
      });

    });

    describe('dehydrate... shared functionality', () => {
      var hostView;

      function createAndHydrate(nestedProtoView, shadowView) {
        var hostPv = createHostProtoView(nestedProtoView);
        hostView = createHostView(hostPv, shadowView);

        hydrate(hostView);
      }

      it('should dehydrate child components', () => {
        var shadowView = createEmptyView();
        createAndHydrate(createProtoView(), shadowView);

        expect(shadowView.hydrated).toBe(true);
        dehydrate(hostView);

        expect(shadowView.hydrated).toBe(false);
      });

      it('should not clear static child components', () => {
        var shadowView = createEmptyView();
        createAndHydrate(createProtoView(), shadowView);
        dehydrate(hostView);

        expect(hostView.componentChildViews[0]).toBe(shadowView);
        expect(shadowView.rootNodes[0].parentNode).toBeTruthy();
      });

      it('should clear dynamic child components', () => {
        var shadowView = createEmptyView();
        createAndHydrate(null, shadowView);
        dehydrate(hostView);

        expect(hostView.componentChildViews[0]).toBe(null);
        expect(shadowView.rootNodes[0].parentNode).toBe(null);
      });

    });

  });
}

@proxy
@IMPLEMENTS(EventManager)
class SpyEventManager extends SpyObject {
  constructor(){super(EventManager);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(ShadowDomStrategy)
class SpyShadowDomStrategy extends SpyObject {
  constructor(){super(ShadowDomStrategy);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(LightDom)
class SpyLightDom extends SpyObject {
  constructor(){super(LightDom);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

