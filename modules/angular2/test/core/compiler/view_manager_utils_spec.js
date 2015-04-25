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

import {Injector, bind} from 'angular2/di';
import {IMPLEMENTS, isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {ChangeDetector} from 'angular2/change_detection';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveBinding, ElementInjector, ElementRef} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';

export function main() {
  // TODO(tbosch): add more tests here!

  describe('AppViewManagerUtils', () => {

    var metadataReader;
    var utils;

    function createInjector() {
      return new Injector([], null, false);
    }

    function createDirectiveBinding(type) {
      var meta = metadataReader.read(type);
      return DirectiveBinding.createFromType(meta.type, meta.annotation);
    }

    function createEmptyElBinder() {
      return new ElementBinder(0, null, 0, null, null, null);
    }

    function createComponentElBinder(nestedProtoView = null) {
      var binding = createDirectiveBinding(SomeComponent);
      var binder = new ElementBinder(0, null, 0, null, binding, null);
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

    function createElementInjector() {
      return SpyObject.stub(new SpyElementInjector(), {
        'isExportingComponent' : false,
        'isExportingElement' : false,
        'getEventEmitterAccessors' : [],
        'getComponent' : null,
        'getDynamicallyLoadedComponent': null
      }, {});
    }

    function createView(pv=null) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var view = new AppView(null, pv, MapWrapper.create());
      var elementInjectors = ListWrapper.createFixedSize(pv.elementBinders.length);
      for (var i=0; i<pv.elementBinders.length; i++) {
        elementInjectors[i] = createElementInjector();
      }
      view.init(new SpyChangeDetector(),
        elementInjectors,
        [],
        ListWrapper.createFixedSize(pv.elementBinders.length),
        ListWrapper.createFixedSize(pv.elementBinders.length)
      );
      return view;
    }

    beforeEach( () => {
      metadataReader = new DirectiveMetadataReader();
      utils = new AppViewManagerUtils(metadataReader);
    });

    describe('hydrateDynamicComponentInElementInjector', () => {

      it('should not allow to overwrite an existing component', () => {
        var hostView = createView(createProtoView(
          [createComponentElBinder(createProtoView())]
        ));
        var componentBinding = bind(SomeComponent).toClass(SomeComponent);
        SpyObject.stub(hostView.elementInjectors[0], {
          'getDynamicallyLoadedComponent': new SomeComponent()
        });
        expect(
          () => utils.hydrateDynamicComponentInElementInjector(hostView, 0, componentBinding, null)
        ).toThrowError('There already is a dynamic component loaded at element 0');
      });

    });

    describe('shared hydrate functionality', () => {

      it("should set up event listeners", () => {
        var dir = new Object();

        var hostPv = createProtoView([
          createComponentElBinder(null),
          createEmptyElBinder()
        ]);
        var hostView = createView(hostPv);
        var spyEventAccessor1 = SpyObject.stub({"subscribe" : null});
        SpyObject.stub(hostView.elementInjectors[0], {
          'getEventEmitterAccessors': [[spyEventAccessor1]],
          'getDirectiveAtIndex': dir
        });
        var spyEventAccessor2 = SpyObject.stub({"subscribe" : null});
        SpyObject.stub(hostView.elementInjectors[1], {
          'getEventEmitterAccessors': [[spyEventAccessor2]],
          'getDirectiveAtIndex': dir
        });

        var shadowView = createView();
        utils.attachComponentView(hostView, 0, shadowView);

        utils.attachAndHydrateInPlaceHostView(null, null, hostView, createInjector());

        expect(spyEventAccessor1.spy('subscribe')).toHaveBeenCalledWith(hostView, 0, dir);
        expect(spyEventAccessor2.spy('subscribe')).toHaveBeenCalledWith(hostView, 1, dir);
      });

    });

  });

}

@Component({ selector: 'someComponent' })
class SomeComponent {}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjector extends SpyObject {
  constructor(){super(ElementInjector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(ChangeDetector)
class SpyChangeDetector extends SpyObject {
  constructor(){super(ChangeDetector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
