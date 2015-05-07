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
import {RenderViewPool} from 'angular2/src/render/dom/view/view_pool';
import {RenderView} from 'angular2/src/render/dom/view/view';
import {RenderProtoView} from 'angular2/src/render/dom/view/proto_view';
import {MapWrapper, Map} from 'angular2/src/facade/collection';

export function main() {
  // Attention: keep these tests in sync with AppViewPool!
  describe('RenderViewPool', () => {

    function createViewPool({capacity}):RenderViewPool {
      return new RenderViewPool(capacity);
    }

    function createProtoView() {
      return new RenderProtoView();
    }

    function createView(pv) {
      return new RenderView(pv, [], [], [], []);
    }

    it('should support multiple RenderProtoViews', () => {
      var vf = createViewPool({ capacity: 2 });
      var pv1 = createProtoView();
      var pv2 = createProtoView();
      var view1 = createView(pv1);
      var view2 = createView(pv2);
      vf.returnView(view1);
      vf.returnView(view2);

      expect(vf.getView(pv1)).toBe(view1);
      expect(vf.getView(pv2)).toBe(view2);
    });

    it('should reuse the newest view that has been returned', () => {
      var pv = createProtoView();
      var vf = createViewPool({ capacity: 2 });
      var view1 = createView(pv);
      var view2 = createView(pv);
      vf.returnView(view1);
      vf.returnView(view2);

      expect(vf.getView(pv)).toBe(view2);
    });

    it('should not add views when the capacity has been reached', () => {
      var pv = createProtoView();
      var vf = createViewPool({ capacity: 2 });
      var view1 = createView(pv);
      var view2 = createView(pv);
      var view3 = createView(pv);
      vf.returnView(view1);
      vf.returnView(view2);
      vf.returnView(view3);

      expect(vf.getView(pv)).toBe(view2);
      expect(vf.getView(pv)).toBe(view1);
    });

  });
}
