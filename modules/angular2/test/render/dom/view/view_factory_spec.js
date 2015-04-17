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
import {ListWrapper} from 'angular2/src/facade/collection';
import {ViewFactory} from 'angular2/src/render/dom/view/view_factory';
import {RenderProtoView} from 'angular2/src/render/dom/view/proto_view';
import {RenderView} from 'angular2/src/render/dom/view/view';
import {ElementBinder} from 'angular2/src/render/dom/view/element_binder';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {LightDom} from 'angular2/src/render/dom/shadow_dom/light_dom'
import {EventManager} from 'angular2/src/render/dom/events/event_manager';

export function main() {
  describe('RenderViewFactory', () => {
    var eventManager;
    var shadowDomStrategy;

    function createViewFactory({capacity}):ViewFactory {
      return new ViewFactory(capacity, eventManager, shadowDomStrategy);
    }

    function createProtoView(rootEl=null, binders=null) {
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


    beforeEach( () => {
      eventManager = new SpyEventManager();
      shadowDomStrategy = new SpyShadowDomStrategy();
    });

    it('should create views without cache', () => {
      var pv = createProtoView();
      var vf = createViewFactory({
        capacity: 0
      });
      expect(vf.getView(pv) instanceof RenderView).toBe(true);
    });

    describe('caching', () => {

      it('should support multiple RenderProtoViews', () => {
        var pv1 = createProtoView();
        var pv2 = createProtoView();
        var vf = createViewFactory({ capacity: 2 });
        var view1 = vf.getView(pv1);
        var view2 = vf.getView(pv2);
        vf.returnView(view1);
        vf.returnView(view2);

        expect(vf.getView(pv1)).toBe(view1);
        expect(vf.getView(pv2)).toBe(view2);
      });

      it('should reuse the newest view that has been returned', () => {
        var pv = createProtoView();
        var vf = createViewFactory({ capacity: 2 });
        var view1 = vf.getView(pv);
        var view2 = vf.getView(pv);
        vf.returnView(view1);
        vf.returnView(view2);

        expect(vf.getView(pv)).toBe(view2);
      });

      it('should not add views when the capacity has been reached', () => {
        var pv = createProtoView();
        var vf = createViewFactory({ capacity: 2 });
        var view1 = vf.getView(pv);
        var view2 = vf.getView(pv);
        var view3 = vf.getView(pv);
        vf.returnView(view1);
        vf.returnView(view2);
        vf.returnView(view3);

        expect(vf.getView(pv)).toBe(view2);
        expect(vf.getView(pv)).toBe(view1);
      });

    });

    describe('child components', () => {

      var vf, log;

      beforeEach(() => {
        vf = createViewFactory({capacity: 1});
        log = [];
        shadowDomStrategy.spy('attachTemplate').andCallFake( (el, view) => {
          ListWrapper.push(log, ['attachTemplate', el, view]);
        });
        shadowDomStrategy.spy('constructLightDom').andCallFake( (lightDomView, shadowDomView, el) => {
          ListWrapper.push(log, ['constructLightDom', lightDomView, shadowDomView, el]);
          return new SpyLightDom();
        });
      });

      it('should create static child component views', () => {
        var hostPv = createProtoView(el('<div><div class="ng-binding"></div></div>'), [
          createComponentElBinder(
            'someComponent',
            createProtoView()
          )
        ]);
        var hostView = vf.getView(hostPv);
        var shadowView = hostView.componentChildViews[0];
        expect(shadowView).toBeTruthy();
        expect(hostView.lightDoms[0]).toBeTruthy();
        expect(log[0]).toEqual(['constructLightDom', hostView, shadowView, hostView.boundElements[0]]);
        expect(log[1]).toEqual(['attachTemplate', hostView.boundElements[0], shadowView]);
      });

      it('should not create dynamic child component views', () => {
        var hostPv = createProtoView(el('<div><div class="ng-binding"></div></div>'), [
          createComponentElBinder(
            'someComponent',
            null
          )
        ]);
        var hostView = vf.getView(hostPv);
        var shadowView = hostView.componentChildViews[0];
        expect(shadowView).toBeFalsy();
        expect(hostView.lightDoms[0]).toBeFalsy();
        expect(log).toEqual([]);
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
