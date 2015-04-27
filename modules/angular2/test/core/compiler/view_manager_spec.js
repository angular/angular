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

import {AppProtoView, AppView, AppViewContainer} from 'angular2/src/core/compiler/view';
import {Renderer, ViewRef, ProtoViewRef, RenderViewContainerRef} from 'angular2/src/render/api';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveBinding, ElementInjector, ElementRef} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewPool} from 'angular2/src/core/compiler/view_pool';

export function main() {
  // TODO(tbosch): add missing tests

  describe('AppViewManager', () => {
    var renderer;
    var utils;
    var viewPool;
    var manager;
    var reader;
    var createdViews;
    var createdRenderViews;

    function elementRef(parentView, boundElementIndex) {
      return new ElementRef(null, parentView, boundElementIndex, null, null, null);
    }

    function createDirectiveBinding(type) {
      var meta = reader.read(type);
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
      var staticChildComponentCount = 0;
      for (var i = 0; i < binders.length; i++) {
        if (binders[i].hasStaticComponent()) {
          staticChildComponentCount++;
        }
      }
      var res = new AppProtoView(new MockProtoViewRef(staticChildComponentCount), null);
      res.elementBinders = binders;
      return res;
    }

    function createElementInjector() {
      return SpyObject.stub(new SpyElementInjector(), {
        'isExportingComponent' : false,
        'isExportingElement' : false,
        'getEventEmitterAccessors' : [],
        'getComponent' : null
      }, {});
    }

    function createView(pv=null) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var view = new AppView(renderer, pv, MapWrapper.create());
      var elementInjectors = ListWrapper.createFixedSize(pv.elementBinders.length);
      for (var i=0; i<pv.elementBinders.length; i++) {
        elementInjectors[i] = createElementInjector();
      }
      view.init(null,
        elementInjectors,
        [],
        ListWrapper.createFixedSize(pv.elementBinders.length),
        ListWrapper.createFixedSize(pv.elementBinders.length)
      );
      return view;
    }

    beforeEach( () => {
      reader = new DirectiveMetadataReader();
      renderer = new SpyRenderer();
      utils = new SpyAppViewManagerUtils();
      viewPool = new SpyAppViewPool();
      manager = new AppViewManager(viewPool, utils, renderer);
      createdViews = [];
      createdRenderViews = [];

      utils.spy('createView').andCallFake( (proto, _a, _b) => {
        var view = createView(proto);
        ListWrapper.push(createdViews, view);
        return view;
      });
      utils.spy('attachComponentView').andCallFake( (hostView, elementIndex, childView) => {
        hostView.componentChildViews[elementIndex] = childView;
      });
      utils.spy('attachViewInContainer').andCallFake( (parentView, elementIndex, atIndex, childView) => {
        var viewContainer = parentView.viewContainers[elementIndex];
        if (isBlank(viewContainer)) {
          viewContainer = new AppViewContainer();
          parentView.viewContainers[elementIndex] = viewContainer;
        }
        ListWrapper.insert(viewContainer.views, atIndex, childView);
      });
      var createRenderViewRefs = function(renderPvRef) {
        var res = [];
        for (var i=0; i<renderPvRef.nestedComponentCount+1; i++) {
          var renderViewRef = new ViewRef();
          ListWrapper.push(res, renderViewRef);
          ListWrapper.push(createdRenderViews, renderViewRef);
        }
        return res;
      }
      renderer.spy('createDynamicComponentView').andCallFake( (_a, _b, childPvRef) => {
        return createRenderViewRefs(childPvRef);
      });
      renderer.spy('createInPlaceHostView').andCallFake( (_a, _b, childPvRef) => {
        return createRenderViewRefs(childPvRef);
      });
      renderer.spy('createViewInContainer').andCallFake( (_a, _b, childPvRef) => {
        return createRenderViewRefs(childPvRef);
      });
    });

    describe('createDynamicComponentView', () => {

      describe('basic functionality', () => {
        var hostView, componentProtoView;
        beforeEach( () => {
          hostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          hostView.render = new ViewRef();
          componentProtoView = createProtoView();
        });

        it('should create the view', () => {
          expect(
              manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null)
          ).toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(componentProtoView);
        });

        it('should get the view from the pool', () => {
          var createdView;
          viewPool.spy('getView').andCallFake( (protoView) => {
            createdView = createView(protoView);
            return createdView;
          });
          expect(
              manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null)
          ).toBe(createdView);
          expect(utils.spy('createView')).not.toHaveBeenCalled();
        });

        it('should attach the view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null)
          expect(utils.spy('attachComponentView')).toHaveBeenCalledWith(hostView, 0, createdViews[0]);
        });

        it('should hydrate the dynamic component', () => {
          var injector = new Injector([], null, false);
          var componentBinding = bind(SomeComponent).toClass(SomeComponent);
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, componentBinding, injector);
          expect(utils.spy('hydrateDynamicComponentInElementInjector')).toHaveBeenCalledWith(hostView, 0, componentBinding, injector);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(hostView, 0);
        });

        it('should create and set the render view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          expect(renderer.spy('createDynamicComponentView')).toHaveBeenCalledWith(hostView.render, 0, componentProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          var cmpView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

      describe('error cases', () => {

        it('should not allow to use non component indices', () => {
          var hostView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          var componentProtoView = createProtoView();
          expect(
            () => manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null)
          ).toThrowError('There is no dynamic component directive at element 0');
        });

        it('should not allow to use static component indices', () => {
          var hostView = createView(createProtoView(
            [createComponentElBinder(createProtoView())]
          ));
          var componentProtoView = createProtoView();
          expect(
            () => manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null)
          ).toThrowError('There is no dynamic component directive at element 0');
        });

      });

      describe('recursively destroy dynamic child component views', () => {
        // TODO
      });

    });

    describe('static child components', () => {

      describe('recursively create when not cached', () => {
        var hostView, componentProtoView, nestedProtoView;
        beforeEach( () => {
          hostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          hostView.render = new ViewRef();
          nestedProtoView = createProtoView();
          componentProtoView = createProtoView([
            createComponentElBinder(nestedProtoView)
          ]);
        });

        it('should create the view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          expect(createdViews[0].proto).toBe(componentProtoView);
          expect(createdViews[1].proto).toBe(nestedProtoView);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(createdViews[0], 0);
        });

        it('should set the render view', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          expect(createdViews[1].render).toBe(createdRenderViews[1])
        });

        it('should set the event dispatcher', () => {
          manager.createDynamicComponentView(elementRef(hostView, 0), componentProtoView, null, null);
          var cmpView = createdViews[1];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

      describe('recursively hydrate when getting from from the cache', () => {
        // TODO(tbosch): implement this
      });

      describe('recursively dehydrate', () => {
        // TODO(tbosch): implement this
      });

    });

    describe('createInPlaceHostView', () => {

      // Note: We don't add tests for recursion or viewpool here as we assume that
      // this is using the same mechanism as the other methods...

      describe('basic functionality', () => {
        var parentHostView, parentView, hostProtoView;
        beforeEach( () => {
          parentHostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          parentView = createView();
          utils.attachComponentView(parentHostView, 0, parentView);
          parentView.render = new ViewRef();
          hostProtoView = createProtoView(
            [createComponentElBinder(null)]
          );
        });

        it('should create the view', () => {
          expect(
            manager.createInPlaceHostView(elementRef(parentHostView, 0), null, hostProtoView, null)
          ).toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(hostProtoView);
        });

        it('should attachAndHydrate the view', () => {
          var injector = new Injector([], null, false);
          manager.createInPlaceHostView(elementRef(parentHostView, 0), null, hostProtoView, injector);
          expect(utils.spy('attachAndHydrateInPlaceHostView')).toHaveBeenCalledWith(parentHostView, 0, createdViews[0], injector);
        });

        it('should create and set the render view', () => {
          var elementOrSelector = 'someSelector';
          manager.createInPlaceHostView(elementRef(parentHostView, 0), elementOrSelector, hostProtoView, null)
          expect(renderer.spy('createInPlaceHostView')).toHaveBeenCalledWith(parentView.render, elementOrSelector, hostProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createInPlaceHostView(elementRef(parentHostView, 0), null, hostProtoView, null);
          var cmpView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

    });


    describe('destroyInPlaceHostView', () => {
      describe('basic functionality', () => {
        var parentHostView, parentView, hostProtoView, hostView, hostRenderViewRef;
        beforeEach( () => {
          parentHostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          parentView = createView();
          utils.attachComponentView(parentHostView, 0, parentView);
          parentView.render = new ViewRef();
          hostProtoView = createProtoView(
            [createComponentElBinder(null)]
          );
          hostView = manager.createInPlaceHostView(elementRef(parentHostView, 0), null, hostProtoView, null);
          hostRenderViewRef = hostView.render;
        });

        it('should dehydrate', () => {
          manager.destroyInPlaceHostView(elementRef(parentHostView, 0), hostView);
          expect(utils.spy('detachInPlaceHostView')).toHaveBeenCalledWith(parentView, hostView);
        });

        it('should detach', () => {
          manager.destroyInPlaceHostView(elementRef(parentHostView, 0), hostView);
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(hostView);
        });

        it('should destroy and clear the render view', () => {
          manager.destroyInPlaceHostView(elementRef(parentHostView, 0), hostView);
          expect(renderer.spy('destroyInPlaceHostView')).toHaveBeenCalledWith(parentView.render, hostRenderViewRef);
          expect(hostView.render).toBe(null);
        });

        it('should return the view to the pool', () => {
          manager.destroyInPlaceHostView(elementRef(parentHostView, 0), hostView);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(hostView);
        });
      });

      describe('recursively destroy inPlaceHostViews', () => {
        // TODO
      });

    });

    describe('createViewInContainer', () => {

      describe('basic functionality', () => {
        var parentView, childProtoView;
        beforeEach( () => {
          parentView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          parentView.render = new ViewRef();
          childProtoView = createProtoView();
        });

        it('should create a ViewContainerRef if not yet existing', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null);
          expect(parentView.viewContainers[0]).toBeTruthy();
        });

        it('should create the view', () => {
          expect(
            manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null)
          ).toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(childProtoView);
        });

        it('should attach the view', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null)
          expect(utils.spy('attachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0, createdViews[0]);
        });

        it('should hydrate the view', () => {
          var injector = new Injector([], null, false);
          manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, injector);
          expect(utils.spy('hydrateViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0, injector);
        });

        it('should create and set the render view', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null);
          expect(renderer.spy('createViewInContainer')).toHaveBeenCalledWith(
            new RenderViewContainerRef(parentView.render, 0), 0, childProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null);
          var childView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(childView.render, childView);
        });

      });
    });

    describe('destroyViewInContainer', () => {

      describe('basic functionality', () => {
        var parentView, childProtoView, childView;
        beforeEach( () => {
          parentView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          parentView.render = new ViewRef();
          childProtoView = createProtoView();
          childView = manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null);
        });

        it('should dehydrate', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
        });

        it('should detach', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
        });

        it('should destroy and clear the render view', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(renderer.spy('destroyViewInContainer')).toHaveBeenCalledWith(new RenderViewContainerRef(parentView.render, 0), 0);
          expect(childView.render).toBe(null);
        });

        it('should return the view to the pool', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
        });
      });

      describe('recursively destroy views in ViewContainers', () => {
        var parentView, childProtoView, childView;
        beforeEach( () => {
          parentView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          parentView.render = new ViewRef();
          childProtoView = createProtoView();
          childView = manager.createViewInContainer(elementRef(parentView, 0), 0, childProtoView, null);
        });

        it('should dehydrate', () => {
          manager.destroyInPlaceHostView(null, parentView);
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
        });

        it('should detach', () => {
          manager.destroyInPlaceHostView(null, parentView);
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
        });

        it('should not destroy but clear the render view', () => {
          manager.destroyInPlaceHostView(null, parentView);
          expect(renderer.spy('destroyViewInContainer')).not.toHaveBeenCalled();
          expect(childView.render).toBe(null);
        });

        it('should return the view to the pool', () => {
          manager.destroyInPlaceHostView(null, parentView);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
        });

      });

    });

    describe('attachViewInContainer', () => {

    });

    describe('detachViewInContainer', () => {

    });

  });
}

class MockProtoViewRef extends ProtoViewRef {
  nestedComponentCount:number;
  constructor(nestedComponentCount:number) {
    super();
    this.nestedComponentCount = nestedComponentCount;
  }
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
@IMPLEMENTS(AppViewPool)
class SpyAppViewPool extends SpyObject {
  constructor(){super(AppViewPool);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(AppViewManagerUtils)
class SpyAppViewManagerUtils extends SpyObject {
  constructor(){super(AppViewManagerUtils);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjector extends SpyObject {
  constructor(){super(ElementInjector);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
