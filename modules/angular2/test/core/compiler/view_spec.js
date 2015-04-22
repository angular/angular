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
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';

import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {Renderer} from 'angular2/src/render/api';
import {ChangeDetector} from 'angular2/change_detection';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {ElementInjector} from 'angular2/src/core/compiler/element_injector';

export function main() {
  describe('AppView', () => {
    var renderer;

    beforeEach( () => {
      renderer = new SpyRenderer();
    });

    function createElementInjector() {
      return new SpyElementInjector();
    }

    function createEmptyElBinder() {
      return new ElementBinder(0, null, 0, null, null, null);
    }

    function createEmbeddedProtoViewElBinder(nestedProtoView) {
      var binder = new ElementBinder(0, null, 0, null, null, null);
      binder.nestedProtoView = nestedProtoView;
      return binder;
    }

    function createProtoView(binders = null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var res = new AppProtoView(null, null);
      res.elementBinders = binders;
      return res;
    }

    function createViewWithOneBoundElement(pv) {
      var view = new AppView(renderer, null, pv, MapWrapper.create());
      var changeDetector = new SpyChangeDetector();
      var eij = createElementInjector();
      view.init(changeDetector, [eij], [eij],
          [null], [null]);
      return view;
    }

    describe('getOrCreateViewContainer()', () => {

      it('should create a new container', () => {
        var pv = createProtoView([createEmptyElBinder()]);
        var view = createViewWithOneBoundElement(pv);
        expect(view.getOrCreateViewContainer(0) instanceof ViewContainer).toBe(true);
      });

      it('should return an existing container', () => {
        var pv = createProtoView([createEmptyElBinder()]);
        var view = createViewWithOneBoundElement(pv);
        var vc = view.getOrCreateViewContainer(0);
        expect(view.getOrCreateViewContainer(0)).toBe(vc);
      });

      it('should store an existing nestedProtoView in the container', () => {
        var defaultProtoView = createProtoView();
        var pv = createProtoView([createEmbeddedProtoViewElBinder(defaultProtoView)]);
        var view = createViewWithOneBoundElement(pv);
        var vc = view.getOrCreateViewContainer(0);
        expect(vc.defaultProtoView).toBe(defaultProtoView);
      });

    });

  });
}

@proxy
@IMPLEMENTS(Renderer)
class SpyRenderer extends SpyObject {
  constructor(){super(Renderer);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(ChangeDetector)
class SpyChangeDetector extends SpyObject {
  constructor(){super(ChangeDetector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjector extends SpyObject {
  constructor(){super(ElementInjector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
