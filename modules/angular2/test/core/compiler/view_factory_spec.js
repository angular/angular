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
import {ViewFactory} from 'angular2/src/core/compiler/view_factory';
import {Renderer, ViewRef} from 'angular2/src/render/api';
import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {DirectiveBinding, ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {ChangeDetector, ProtoChangeDetector} from 'angular2/change_detection';

export function main() {
  describe('AppViewFactory', () => {
    var reader;
    var renderer;

    beforeEach( () => {
      renderer = new SpyRenderer();
      reader = new DirectiveMetadataReader();
    });

    function createViewFactory({capacity}):ViewFactory {
      return new ViewFactory(capacity, renderer, null);
    }

    function createProtoChangeDetector() {
      var pcd = new SpyProtoChangeDetector();
      pcd.spy('instantiate').andCallFake( (dispatcher, bindingRecords, variableBindings, directiveRecords) => {
        return new SpyChangeDetector();
      });
      return pcd;
    }

    function createProtoView(binders=null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var pv = new AppProtoView(null, createProtoChangeDetector());
      pv.elementBinders = binders;
      return pv;
    }

    function createDirectiveBinding(type) {
      var meta = reader.read(type);
      return DirectiveBinding.createFromType(meta.type, meta.annotation);
    }

    function createComponentElBinder(binding, nestedProtoView = null) {
      var binder = new ElementBinder(0, null, 0, null, binding, null);
      binder.nestedProtoView = nestedProtoView;
      return binder;
    }

    it('should create views', () => {
      var pv = createProtoView();
      var vf = createViewFactory({
        capacity: 1
      });
      expect(vf.getView(pv) instanceof AppView).toBe(true);
    });

    describe('caching', () => {

      it('should support multiple AppProtoViews', () => {
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

      var vf;

      beforeEach(() => {
        vf = createViewFactory({capacity: 1});
      });

      it('should create static child component views', () => {
        var hostPv = createProtoView([
          createComponentElBinder(
            createDirectiveBinding(SomeComponent),
            createProtoView()
          )
        ]);
        var hostView = vf.getView(hostPv);
        var shadowView = hostView.componentChildViews[0];
        expect(shadowView).toBeTruthy();
        expect(hostView.changeDetector.spy('addShadowDomChild')).toHaveBeenCalledWith(shadowView.changeDetector);
      });

      it('should not create dynamic child component views', () => {
        var hostPv = createProtoView([
          createComponentElBinder(
            createDirectiveBinding(SomeComponent),
            null
          )
        ]);
        var hostView = vf.getView(hostPv);
        var shadowView = hostView.componentChildViews[0];
        expect(shadowView).toBeFalsy();
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
@IMPLEMENTS(ProtoChangeDetector)
class SpyProtoChangeDetector extends SpyObject {
  constructor(){super(ProtoChangeDetector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
