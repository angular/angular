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

import {DomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {ElementBinder} from 'angular2/src/render/dom/view/element_binder';
import {DomView} from 'angular2/src/render/dom/view/view';
import {ViewContainer} from 'angular2/src/render/dom/view/view_container';
import {LightDom} from 'angular2/src/render/dom/shadow_dom/light_dom';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {

  describe('DomView', () => {
    function createProtoView(binders = null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var rootEl = el('<div></div>');
      return new DomProtoView({
        element: rootEl,
        elementBinders: binders
      });
    }

    function createView(pv=null, boundElementCount=0) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var root = el('<div><div></div></div>');
      var boundElements = [];
      for (var i=0; i<boundElementCount; i++) {
        ListWrapper.push(boundElements, el('<span></span'));
      }
      return new DomView(pv, [DOM.childNodes(root)[0]],
        [], boundElements, []);
    }

    describe('getDirectParentLightDom', () => {

      it('should return the LightDom of the direct parent', () => {
        var pv = createProtoView(
          [new ElementBinder(), new ElementBinder({
            parentIndex: 0,
            distanceToParent: 1
          })]
        );
        var view = createView(pv, 2);
        view.lightDoms[0] = new SpyLightDom();
        view.lightDoms[1] = new SpyLightDom();
        expect(view.getDirectParentLightDom(1)).toBe(view.lightDoms[0]);
      });

      it('should return null if the direct parent is not bound', () => {
        var pv = createProtoView(
          [new ElementBinder(), new ElementBinder(), new ElementBinder({
            parentIndex: 0,
            distanceToParent: 2
          })]
        );
        var view = createView(pv, 3);
        view.lightDoms[0] = new SpyLightDom();
        view.lightDoms[1] = new SpyLightDom();
        view.lightDoms[2] = new SpyLightDom();
        expect(view.getDirectParentLightDom(2)).toBe(null);
      });

    });

    describe('getOrCreateViewContainer', () => {
      it('should create a new container', () => {
        var pv = createProtoView([new ElementBinder()]);
        var view = createView(pv, 1);
        expect(view.getOrCreateViewContainer(0) instanceof ViewContainer).toBe(true);
      });

      it('should return an existing container', () => {
        var pv = createProtoView([new ElementBinder()]);
        var view = createView(pv, 1);
        var vc = view.getOrCreateViewContainer(0);
        expect(view.getOrCreateViewContainer(0)).toBe(vc);
      });
    });

  });
}

@proxy
@IMPLEMENTS(LightDom)
class SpyLightDom extends SpyObject {
  constructor(){super(LightDom);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

