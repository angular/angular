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
  beforeEachProviders,
  it,
  xit,
  SpyObject,
  proxy
} from 'angular2/testing_internal';
import {AppViewPool} from 'angular2/src/core/linker/view_pool';
import {AppProtoView, AppView} from 'angular2/src/core/linker/view';
import {MapWrapper, Map} from 'angular2/src/facade/collection';

export function main() {
  describe('AppViewPool', () => {

    function createViewPool({capacity}): AppViewPool { return new AppViewPool(capacity); }

    function createProtoView() {
      return new AppProtoView(null, null, null, null, null, null, null);
    }

    function createView(pv) {
      return new AppView(null, pv, null, null, null, new Map<string, any>(), null, null, null);
    }

    it('should support multiple AppProtoViews', () => {
      var vf = createViewPool({capacity: 2});
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
      var vf = createViewPool({capacity: 2});
      var view1 = createView(pv);
      var view2 = createView(pv);
      vf.returnView(view1);
      vf.returnView(view2);

      expect(vf.getView(pv)).toBe(view2);
    });

    it('should not add views when the capacity has been reached', () => {
      var pv = createProtoView();
      var vf = createViewPool({capacity: 2});
      var view1 = createView(pv);
      var view2 = createView(pv);
      var view3 = createView(pv);
      expect(vf.returnView(view1)).toBe(true);
      expect(vf.returnView(view2)).toBe(true);
      expect(vf.returnView(view3)).toBe(false);

      expect(vf.getView(pv)).toBe(view2);
      expect(vf.getView(pv)).toBe(view1);
    });

  });
}
