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

import {RenderProtoView} from 'angular2/src/render/dom/view/proto_view';
import {RenderView} from 'angular2/src/render/dom/view/view';
import {RenderViewContainer} from 'angular2/src/render/dom/view/view_container';
import {DirectDomRenderViewRef, internalView} from 'angular2/src/render/dom/view/view_ref';
import {DirectDomRenderProtoViewRef, internalView} from 'angular2/src/render/dom/view/proto_view_ref';
import {RenderElementRef, RenderProtoViewRef, RenderViewRef} from 'angular2/src/render/api';
import {ElementBinder} from 'angular2/src/render/dom/view/element_binder';
import {RenderViewManager} from 'angular2/src/render/dom/view/view_manager';
import {RenderViewManagerUtils} from 'angular2/src/render/dom/view/view_manager_utils';
import {RenderViewPool} from 'angular2/src/render/dom/view/view_pool';

export function main() {
  // Attention: keep these tests in sync with the tests for AppViewManager!

  // TODO(tbosch): add missing tests
  describe('RenderViewManager', () => {
    var utils;
    var viewPool;
    var manager;
    var createdViews;

    function wrapPv(protoView:RenderProtoView):RenderProtoViewRef {
      return new DirectDomRenderProtoViewRef(protoView);
    }

    function wrapView(view:RenderView):RenderViewRef {
      return new DirectDomRenderViewRef(view);
    }

    function elementRef(parentView, boundElementIndex) {
      return new RenderElementRef(parentView, boundElementIndex);
    }

    function createEmptyElBinder() {
      return new ElementBinder();
    }

    function createComponentElBinder(nestedProtoView = null) {
      var binder = new ElementBinder({
        componentId: 'someComponent',
        nestedProtoView: nestedProtoView
      });
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
      return new RenderProtoView({
        elementBinders: binders
      });
    }

    function createView(pv=null) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var view = new RenderView(pv, [],
        ListWrapper.createFixedSize(pv.elementBinders.length),
        ListWrapper.createFixedSize(pv.elementBinders.length),
        ListWrapper.createFixedSize(pv.elementBinders.length)
      );
      return view;
    }

    beforeEach( () => {
      utils = new SpyRenderViewManagerUtils();
      viewPool = new SpyRenderViewPool();
      manager = new RenderViewManager(viewPool, utils);
      createdViews = [];

      utils.spy('createView').andCallFake( (proto) => {
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
          viewContainer = new RenderViewContainer();
          parentView.viewContainers[elementIndex] = viewContainer;
        }
        ListWrapper.insert(viewContainer.views, atIndex, childView);
      });
    });

    describe('createDynamicComponentView', () => {

      describe('basic functionality', () => {
        var hostView, componentProtoView;
        beforeEach( () => {
          hostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          componentProtoView = createProtoView();
        });

        it('should create the view', () => {
          expect(
              internalView(manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView)))
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
              internalView(manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView)))
          ).toBe(createdView);
          expect(utils.spy('createView')).not.toHaveBeenCalled();
        });

        it('should attach the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView))
          expect(utils.spy('attachComponentView')).toHaveBeenCalledWith(hostView, 0, createdViews[0]);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView));
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(hostView, 0);
        });

      });

      describe('error cases', () => {

        it('should not allow to use non component indices', () => {
          var hostView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          var componentProtoView = createProtoView();
          expect(
            () => manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView))
          ).toThrowError('There is no dynamic component directive at element 0');
        });

        it('should not allow to use static component indices', () => {
          var hostView = createView(createProtoView(
            [createComponentElBinder(createProtoView())]
          ));
          var componentProtoView = createProtoView();
          expect(
            () => manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView))
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
          nestedProtoView = createProtoView();
          componentProtoView = createProtoView([
            createComponentElBinder(nestedProtoView)
          ]);
        });

        it('should create the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView));
          expect(createdViews[0].proto).toBe(componentProtoView);
          expect(createdViews[1].proto).toBe(nestedProtoView);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0), wrapPv(componentProtoView));
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(createdViews[0], 0);
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
          hostProtoView = createProtoView(
            [createComponentElBinder(null)]
          );
        });

        it('should create the view', () => {
          expect(
            internalView(manager.createInPlaceHostView(elementRef(wrapView(parentHostView), 0), null, wrapPv(hostProtoView)))
          ).toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(hostProtoView);
        });

        it('should attachAndHydrate the view', () => {
          var renderLocation = 'someLocation';
          manager.createInPlaceHostView(elementRef(wrapView(parentHostView), 0), renderLocation, wrapPv(hostProtoView));
          expect(utils.spy('attachAndHydrateInPlaceHostView')).toHaveBeenCalledWith(parentHostView, 0, renderLocation, createdViews[0]);
        });

      });

    });


    describe('destroyInPlaceHostView', () => {
      describe('basic functionality', () => {
        var parentHostView, parentView, hostProtoView, hostView;
        beforeEach( () => {
          parentHostView = createView(createProtoView(
            [createComponentElBinder(null)]
          ));
          parentView = createView();
          utils.attachComponentView(parentHostView, 0, parentView);
          hostProtoView = createProtoView(
            [createComponentElBinder(null)]
          );
          hostView = internalView(manager.createInPlaceHostView(elementRef(wrapView(parentHostView), 0), null, wrapPv(hostProtoView)));
        });

        it('should dehydrate', () => {
          manager.destroyInPlaceHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(utils.spy('detachInPlaceHostView')).toHaveBeenCalledWith(parentView, hostView);
        });

        it('should detach', () => {
          manager.destroyInPlaceHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(hostView);
        });

        it('should return the view to the pool', () => {
          manager.destroyInPlaceHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
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
          childProtoView = createProtoView();
        });

        it('should create a ViewContainer if not yet existing', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView));
          expect(parentView.viewContainers[0]).toBeTruthy();
        });

        it('should create the view', () => {
          expect(
            internalView(manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView)))
          ).toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(childProtoView);
        });

        it('should attach the view', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView))
          expect(utils.spy('attachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0, createdViews[0]);
        });

        it('should hydrate the view', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView));
          expect(utils.spy('hydrateViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
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
          childProtoView = createProtoView();
          childView = internalView(manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView)));
        });

        it('should dehydrate', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
        });

        it('should detach', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
        });

        it('should return the view to the pool', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
        });
      });

      describe('recursively destroy views in ViewContainers', () => {
        var parentView, childProtoView, childView;
        beforeEach( () => {
          parentView = createView(createProtoView(
            [createEmptyElBinder()]
          ));
          childProtoView = createProtoView();
          childView = internalView(manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView)));
        });

        it('should dehydrate', () => {
          manager.destroyInPlaceHostView(null, wrapView(parentView));
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
        });

        it('should detach', () => {
          manager.destroyInPlaceHostView(null, wrapView(parentView));
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
        });

        it('should return the view to the pool', () => {
          manager.destroyInPlaceHostView(null, wrapView(parentView));
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

@proxy
@IMPLEMENTS(RenderViewPool)
class SpyRenderViewPool extends SpyObject {
  constructor(){super(RenderViewPool);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@proxy
@IMPLEMENTS(RenderViewManagerUtils)
class SpyRenderViewManagerUtils extends SpyObject {
  constructor(){super(RenderViewManagerUtils);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}
