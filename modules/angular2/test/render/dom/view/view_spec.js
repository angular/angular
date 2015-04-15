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

export function main() {

  describe('RenderView', () => {
    var shadowDomStrategy;
    var eventManager;

    function createProtoView({rootEl, binders}={}) {
      if (isBlank(rootEl)) {
        rootEl = el('<div></div>');
      }
      if (isBlank(binders)) {
        binders = [];
      }
      return new RenderProtoView({
        element: rootEl,
        isRootView: false,
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
        [], [], [], [], eventManager);
    }

    function createHostView(pv, shadowDomView) {
      var view = new RenderView(pv, [el('<div></div>')],
        [], [el('<div></div>')], [], [], eventManager);
      view.setComponentView(shadowDomStrategy, 0, shadowDomView);
      return view;
    }

    beforeEach( () => {
      eventManager = new SpyEventManager();
      shadowDomStrategy = new SpyShadowDomStrategy();
      shadowDomStrategy.spy('constructLightDom').andCallFake( (lightDomView, shadowDomView, el) => {
        return new SpyLightDom();
      });
    });

    describe('setComponentView', () => {

      it('should redistribute when a component is added to a hydrated view', () => {
        var shadowView = new SpyRenderView();
        var hostPv = createHostProtoView(createProtoView());
        var hostView = createHostView(hostPv, shadowView);
        hostView.hydrate(null);
        hostView.setComponentView(shadowDomStrategy, 0, shadowView);
        var lightDomSpy:SpyLightDom = hostView.lightDoms[0];
        expect(lightDomSpy.spy('redistribute')).toHaveBeenCalled();
      });

      it('should not redistribute when a component is added to a dehydrated view', () => {
        var shadowView = new SpyRenderView();
        var hostPv = createHostProtoView(createProtoView());
        var hostView = createHostView(hostPv, shadowView);
        hostView.setComponentView(shadowDomStrategy, 0, shadowView);
        var lightDomSpy:SpyLightDom = hostView.lightDoms[0];
        expect(lightDomSpy.spy('redistribute')).not.toHaveBeenCalled();
      });

    });

    describe('hydrate', () => {

      it('should hydrate existing child components', () => {
        var hostPv = createHostProtoView(createProtoView());
        var shadowView = new SpyRenderView();
        var hostView = createHostView(hostPv, shadowView);

        hostView.hydrate(null);

        expect(shadowView.spy('hydrate')).toHaveBeenCalled();
      });

    });

    describe('dehydrate', () => {
      var hostView;

      function createAndHydrate(nestedProtoView, shadowView) {
        var hostPv = createHostProtoView(nestedProtoView);
        hostView = createHostView(hostPv, shadowView);

        hostView.hydrate(null);
      }

      it('should dehydrate child components', () => {
        var shadowView = new SpyRenderView();
        createAndHydrate(createProtoView(), shadowView);
        hostView.dehydrate();

        expect(shadowView.spy('dehydrate')).toHaveBeenCalled();
      });

      it('should not clear static child components', () => {
        var shadowView = createEmptyView();
        createAndHydrate(createProtoView(), shadowView);
        hostView.dehydrate();

        expect(hostView.componentChildViews[0]).toBe(shadowView);
        expect(shadowView.rootNodes[0].parentNode).toBeTruthy();
      });

      it('should clear dynamic child components', () => {
        var shadowView = createEmptyView();
        createAndHydrate(null, shadowView);
        hostView.dehydrate();

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

@proxy
@IMPLEMENTS(RenderView)
class SpyRenderView extends SpyObject {
  constructor(){super(RenderView);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

