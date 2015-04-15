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
import {Renderer, ViewRef} from 'angular2/src/render/api';
import {ChangeDetector} from 'angular2/change_detection';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveBinding, ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';

export function main() {
  describe('AppView', () => {
    var renderer;
    var reader;

    beforeEach( () => {
      renderer = new SpyRenderer();
      reader = new DirectiveMetadataReader();
    });

    function createDirectiveBinding(type) {
      var meta = reader.read(type);
      return DirectiveBinding.createFromType(meta.type, meta.annotation);
    }

    function createElementInjector() {
      var res = new SpyElementInjector();
      res.spy('isExportingComponent').andCallFake( () => false );
      res.spy('isExportingElement').andCallFake( () => false );
      return res;
    }

    function createEmptyElBinder() {
      return new ElementBinder(0, null, 0, null, null, null);
    }

    function createComponentElBinder(binding, nestedProtoView = null) {
      var binder = new ElementBinder(0, null, 0, null, binding, null);
      binder.nestedProtoView = nestedProtoView;
      return binder;
    }

    function createProtoView(binders = null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var res = new AppProtoView(renderer, null, null);
      res.elementBinders = binders;
      return res;
    }

    function createHostProtoView(nestedProtoView) {
      return createProtoView([
          createComponentElBinder(
            createDirectiveBinding(SomeComponent),
            nestedProtoView
          )
        ]);
    }

    function createHostView(pv, shadowView, componentInstance) {
      var view = new AppView(pv, MapWrapper.create());
      var changeDetector = new SpyChangeDetector();
      var eij = createElementInjector();
      eij.spy('getComponent').andCallFake( () => componentInstance );
      view.init(changeDetector, [eij], [eij],
          [null], [null], [shadowView]);
      return view;
    }

    describe('setDynamicComponentChildView', () => {

      it('should not allow to use non component indices', () => {
        var pv = createProtoView([createEmptyElBinder()]);
        var view = createHostView(pv, null, null);
        var shadowView = new FakeAppView();
        expect(
          () => view.setDynamicComponentChildView(0, shadowView)
        ).toThrowError('There is no dynamic component directive at element 0');
      });

      it('should not allow to use static component indices', () => {
        var pv = createHostProtoView(createProtoView());
        var view = createHostView(pv, null, null);
        var shadowView = new FakeAppView();
        expect(
          () => view.setDynamicComponentChildView(0, shadowView)
        ).toThrowError('There is no dynamic component directive at element 0');
      });

      it('should not allow to overwrite an existing component', () => {
        var pv = createHostProtoView(null);
        var shadowView = new FakeAppView();
        var view = createHostView(pv, null, null);
        view.setDynamicComponentChildView(0, shadowView);
        expect(
          () => view.setDynamicComponentChildView(0, shadowView)
        ).toThrowError('There already is a bound component at element 0');
      });

    });

    describe('hydrate', () => {

      it('should hydrate existing child components', () => {
        var hostPv = createHostProtoView(createProtoView());
        var componentInstance = {};
        var shadowView = new FakeAppView();
        var hostView = createHostView(hostPv, shadowView, componentInstance);
        renderer.spy('createView').andCallFake( (_) => {
          return [new ViewRef(), new ViewRef()];
        });

        hostView.hydrate(null, null, null, null);

        expect(shadowView.spy('hydrate')).not.toHaveBeenCalled();
        expect(shadowView.spy('internalHydrateRecurse')).toHaveBeenCalled();
      });

    });

    describe('dehydrate', () => {
      var hostView;
      var shadowView;

      function createAndHydrate(nestedProtoView) {
        var componentInstance = {};
        shadowView = new FakeAppView();
        var hostPv = createHostProtoView(nestedProtoView);
        hostView = createHostView(hostPv, shadowView, componentInstance);
        renderer.spy('createView').andCallFake( (_) => {
          return [new ViewRef(), new ViewRef()];
        });

        hostView.hydrate(null, null, null, null);
      }

      it('should dehydrate child components', () => {
        createAndHydrate(createProtoView());
        hostView.dehydrate();

        expect(shadowView.spy('dehydrate')).not.toHaveBeenCalled();
        expect(shadowView.spy('internalDehydrateRecurse')).toHaveBeenCalled();
      });

      it('should not clear static child components', () => {
        createAndHydrate(createProtoView());
        hostView.dehydrate();

        expect(hostView.componentChildViews[0]).toBe(shadowView);
        expect(hostView.changeDetector.spy('removeShadowDomChild')).not.toHaveBeenCalled();
      });

      it('should clear dynamic child components', () => {
        createAndHydrate(null);
        hostView.dehydrate();

        expect(hostView.componentChildViews[0]).toBe(null);
        expect(hostView.changeDetector.spy('removeShadowDomChild')).toHaveBeenCalledWith(shadowView.changeDetector);
      });

    });

  });
}

@Component({ selector: 'someComponent' })
class SomeComponent {}

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

@proxy
@IMPLEMENTS(AppView)
class FakeAppView extends SpyObject {
  constructor(){super(AppView);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
