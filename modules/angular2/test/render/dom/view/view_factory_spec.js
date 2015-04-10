import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach, el} from 'angular2/test_lib';

import {ViewFactory} from 'angular2/src/render/dom/view/view_factory';
import {RenderProtoView} from 'angular2/src/render/dom/view/proto_view';
import {RenderView} from 'angular2/src/render/dom/view/view';

export function main() {
  function createViewFactory({capacity}):ViewFactory {
    return new ViewFactory(capacity, null, null);
  }

  function createPv() {
    return new RenderProtoView({
      element: el('<div></div>'),
      isRootView: false,
      elementBinders: []
    });
  }

  describe('RenderViewFactory', () => {
    it('should create views', () => {
      var pv = createPv();
      var vf = createViewFactory({
        capacity: 1
      });
      expect(vf.getView(pv) instanceof RenderView).toBe(true);
    });

    describe('caching', () => {

      it('should support multiple RenderProtoViews', () => {
        var capacity;
        var pv1 = createPv();
        var pv2 = createPv();
        var vf = createViewFactory({ capacity: 2 });
        var view1 = vf.getView(pv1);
        var view2 = vf.getView(pv2);
        vf.returnView(view1);
        vf.returnView(view2);

        expect(vf.getView(pv1)).toBe(view1);
        expect(vf.getView(pv2)).toBe(view2);
      });

      it('should reuse the newest view that has been returned', () => {
        var capacity;
        var pv = createPv();
        var vf = createViewFactory({ capacity: 2 });
        var view1 = vf.getView(pv);
        var view2 = vf.getView(pv);
        vf.returnView(view1);
        vf.returnView(view2);

        expect(vf.getView(pv)).toBe(view2);
      });

      it('should not add views when the capacity has been reached', () => {
        var capacity;
        var pv = createPv();
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

  });
}
