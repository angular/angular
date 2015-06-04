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
  SpyObject,
  proxy
} from 'angular2/test_lib';
import {Injector, bind} from 'angular2/di';
import {IMPLEMENTS, isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AppProtoView, AppView, AppViewContainer} from 'angular2/src/core/compiler/view';
import {ProtoViewRef, ViewRef, internalView} from 'angular2/src/core/compiler/view_ref';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {Renderer, RenderViewRef, RenderProtoViewRef} from 'angular2/src/render/api';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveBinding, ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Component} from 'angular2/annotations';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {AppViewPool} from 'angular2/src/core/compiler/view_pool';

export function main() {
  // TODO(tbosch): add missing tests

  describe('AppViewManager', () => {
    var renderer;
    var utils;
    var viewListener;
    var viewPool;
    var manager;
    var directiveResolver;
    var createdViews;
    var createdRenderViews;

    function wrapPv(protoView: AppProtoView): ProtoViewRef { return new ProtoViewRef(protoView); }

    function wrapView(view: AppView): ViewRef { return new ViewRef(view); }

    function elementRef(parentView, boundElementIndex) {
      return new ElementRef(parentView, boundElementIndex);
    }

    function createDirectiveBinding(type) {
      var annotation = directiveResolver.resolve(type);
      return DirectiveBinding.createFromType(type, annotation);
    }

    function createEmptyElBinder() { return new ElementBinder(0, null, 0, null, null, null); }

    function createComponentElBinder(nestedProtoView = null) {
      var binding = createDirectiveBinding(SomeComponent);
      var binder = new ElementBinder(0, null, 0, null, null, binding);
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
      var res = new AppProtoView(new MockProtoViewRef(staticChildComponentCount), null, null);
      res.elementBinders = binders;
      return res;
    }

    function createElementInjector() {
      return SpyObject.stub(new SpyElementInjector(),
                            {
                              'isExportingComponent': false,
                              'isExportingElement': false,
                              'getEventEmitterAccessors': [],
                              'getComponent': null
                            },
                            {});
    }

    function createView(pv = null, renderViewRef = null) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      if (isBlank(renderViewRef)) {
        renderViewRef = new RenderViewRef();
      }
      var view = new AppView(renderer, pv, MapWrapper.create());
      view.render = renderViewRef;
      var elementInjectors = ListWrapper.createFixedSize(pv.elementBinders.length);
      for (var i = 0; i < pv.elementBinders.length; i++) {
        elementInjectors[i] = createElementInjector();
      }
      view.init(null, elementInjectors, [], ListWrapper.createFixedSize(pv.elementBinders.length),
                ListWrapper.createFixedSize(pv.elementBinders.length));
      return view;
    }

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      renderer = new SpyRenderer();
      utils = new SpyAppViewManagerUtils();
      viewListener = new SpyAppViewListener();
      viewPool = new SpyAppViewPool();
      manager = new AppViewManager(viewPool, viewListener, utils, renderer);
      createdViews = [];
      createdRenderViews = [];

      utils.spy('createView')
          .andCallFake((proto, renderViewRef, _a, _b) => {
            var view = createView(proto, renderViewRef);
            ListWrapper.push(createdViews, view);
            return view;
          });
      utils.spy('attachComponentView')
          .andCallFake((hostView, elementIndex, childView) => {
            hostView.componentChildViews[elementIndex] = childView;
          });
      utils.spy('attachViewInContainer')
          .andCallFake((parentView, elementIndex, _a, _b, atIndex, childView) => {
            var viewContainer = parentView.viewContainers[elementIndex];
            if (isBlank(viewContainer)) {
              viewContainer = new AppViewContainer();
              parentView.viewContainers[elementIndex] = viewContainer;
            }
            ListWrapper.insert(viewContainer.views, atIndex, childView);
          });
      renderer.spy('createRootHostView')
          .andCallFake((_b, _c) => {
            var rv = new RenderViewRef();
            ListWrapper.push(createdRenderViews, rv);
            return rv;
          });
      renderer.spy('createView')
          .andCallFake((_a) => {
            var rv = new RenderViewRef();
            ListWrapper.push(createdRenderViews, rv);
            return rv;
          });
      viewPool.spy('returnView').andReturn(true);
    });

    describe('createDynamicComponentView', () => {

      describe('basic functionality', () => {
        var hostView, componentProtoView;
        beforeEach(() => {
          hostView = createView(createProtoView([createComponentElBinder(null)]));
          componentProtoView = createProtoView();
        });

        it('should create the view', () => {
          expect(internalView(manager.createDynamicComponentView(
                     elementRef(wrapView(hostView), 0), wrapPv(componentProtoView), null, null)))
              .toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(componentProtoView);
          expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
        });

        it('should get the view from the pool', () => {
          var createdView;
          viewPool.spy('getView').andCallFake((protoView) => {
            createdView = createView(protoView);
            return createdView;
          });
          expect(internalView(manager.createDynamicComponentView(
                     elementRef(wrapView(hostView), 0), wrapPv(componentProtoView), null, null)))
              .toBe(createdView);
          expect(utils.spy('createView')).not.toHaveBeenCalled();
          expect(renderer.spy('createView')).not.toHaveBeenCalled();
          expect(viewListener.spy('viewCreated')).not.toHaveBeenCalled();
        });

        it('should attach the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null)
              expect(utils.spy('attachComponentView'))
                  .toHaveBeenCalledWith(hostView, 0, createdViews[0]);
          expect(renderer.spy('attachComponentView'))
              .toHaveBeenCalledWith(hostView.render, 0, createdViews[0].render);
        });

        it('should hydrate the dynamic component', () => {
          var injector = new Injector([], null, false);
          var componentBinding = bind(SomeComponent).toClass(SomeComponent);
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), componentBinding,
                                             injector);
          expect(utils.spy('hydrateDynamicComponentInElementInjector'))
              .toHaveBeenCalledWith(hostView, 0, componentBinding, injector);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(hostView, 0);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should create and set the render view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          expect(renderer.spy('createView')).toHaveBeenCalledWith(componentProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          var cmpView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

      describe('error cases', () => {

        it('should not allow to use non component indices', () => {
          var hostView = createView(createProtoView([createEmptyElBinder()]));
          var componentProtoView = createProtoView();
          expect(() => manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                                          wrapPv(componentProtoView), null, null))
              .toThrowError('There is no dynamic component directive at element 0');
        });

        it('should not allow to use static component indices', () => {
          var hostView = createView(createProtoView([createComponentElBinder(createProtoView())]));
          var componentProtoView = createProtoView();
          expect(() => manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                                          wrapPv(componentProtoView), null, null))
              .toThrowError('There is no dynamic component directive at element 0');
        });

      });

      describe('recursively destroy dynamic child component views', () => {
                                                                        // TODO
                                                                    });

    });

    describe('static child components', () => {

      describe('recursively create when not cached', () => {
        var hostView, componentProtoView, nestedProtoView;
        beforeEach(() => {
          hostView = createView(createProtoView([createComponentElBinder(null)]));
          nestedProtoView = createProtoView();
          componentProtoView = createProtoView([createComponentElBinder(nestedProtoView)]);
        });

        it('should create the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          expect(createdViews[0].proto).toBe(componentProtoView);
          expect(createdViews[1].proto).toBe(nestedProtoView);
        });

        it('should hydrate the view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(createdViews[0], 0);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should set the render view', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          expect(createdViews[1].render).toBe(createdRenderViews[1])
        });

        it('should set the event dispatcher', () => {
          manager.createDynamicComponentView(elementRef(wrapView(hostView), 0),
                                             wrapPv(componentProtoView), null, null);
          var cmpView = createdViews[1];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

      describe('recursively hydrate when getting from from the cache',
               () => {
                   // TODO(tbosch): implement this
               });

      describe('recursively dehydrate', () => {
                                            // TODO(tbosch): implement this
                                        });

    });

    describe('createFreeHostView', () => {

      // Note: We don't add tests for recursion or viewpool here as we assume that
      // this is using the same mechanism as the other methods...

      describe('basic functionality', () => {
        var parentHostView, parentView, hostProtoView;
        beforeEach(() => {
          parentHostView = createView(createProtoView([createComponentElBinder(null)]));
          parentView = createView();
          utils.attachComponentView(parentHostView, 0, parentView);
          hostProtoView = createProtoView([createComponentElBinder(null)]);
        });

        it('should create the view', () => {
          expect(internalView(manager.createFreeHostView(elementRef(wrapView(parentHostView), 0),
                                                         wrapPv(hostProtoView), null)))
              .toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(hostProtoView);
          expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
        });

        it('should attachAndHydrate the view', () => {
          var injector = new Injector([], null, false);
          manager.createFreeHostView(elementRef(wrapView(parentHostView), 0), wrapPv(hostProtoView),
                                     injector);
          expect(utils.spy('attachAndHydrateFreeHostView'))
              .toHaveBeenCalledWith(parentHostView, 0, createdViews[0], injector);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should create and set the render view', () => {
          manager.createFreeHostView(elementRef(wrapView(parentHostView), 0), wrapPv(hostProtoView),
                                     null);
          expect(renderer.spy('createView')).toHaveBeenCalledWith(hostProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createFreeHostView(elementRef(wrapView(parentHostView), 0), wrapPv(hostProtoView),
                                     null);
          var cmpView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

    });


    describe('destroyFreeHostView', () => {
      describe('basic functionality', () => {
        var parentHostView, parentView, hostProtoView, hostView, hostRenderViewRef;
        beforeEach(() => {
          parentHostView = createView(createProtoView([createComponentElBinder(null)]));
          parentView = createView();
          utils.attachComponentView(parentHostView, 0, parentView);
          hostProtoView = createProtoView([createComponentElBinder(null)]);
          hostView = internalView(manager.createFreeHostView(
              elementRef(wrapView(parentHostView), 0), wrapPv(hostProtoView), null));
          hostRenderViewRef = hostView.render;
        });

        it('should detach', () => {
          manager.destroyFreeHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(utils.spy('detachFreeHostView')).toHaveBeenCalledWith(parentView, hostView);
        });

        it('should dehydrate', () => {
          manager.destroyFreeHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(hostView);
          expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(hostView.render);
        });

        it('should detach the render view', () => {
          manager.destroyFreeHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(renderer.spy('detachFreeView')).toHaveBeenCalledWith(hostRenderViewRef);
        });

        it('should return the view to the pool', () => {
          manager.destroyFreeHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(hostView);
          expect(renderer.spy('destroyView')).not.toHaveBeenCalled();
        });

        it('should destroy the view if the pool is full', () => {
          viewPool.spy('returnView').andReturn(false);
          manager.destroyFreeHostView(elementRef(wrapView(parentHostView), 0), wrapView(hostView));
          expect(renderer.spy('destroyView')).toHaveBeenCalledWith(hostView.render);
          expect(viewListener.spy('viewDestroyed')).toHaveBeenCalledWith(hostView);
        });

      });

      describe('recursively destroy inPlaceHostViews', () => {
                                                           // TODO
                                                       });

    });

    describe('createFreeEmbeddedView', () => {

      // Note: We don't add tests for recursion or viewpool here as we assume that
      // this is using the same mechanism as the other methods...

      describe('basic functionality', () => {
        var parentView, childProtoView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
        });

        it('should create the view', () => {
          expect(internalView(manager.createFreeEmbeddedView(elementRef(wrapView(parentView), 0),
                                                             wrapPv(childProtoView), null)))
              .toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(childProtoView);
          expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
        });

        it('should attachAndHydrate the view', () => {
          var injector = new Injector([], null, false);
          manager.createFreeEmbeddedView(elementRef(wrapView(parentView), 0),
                                         wrapPv(childProtoView), injector);
          expect(utils.spy('attachAndHydrateFreeEmbeddedView'))
              .toHaveBeenCalledWith(parentView, 0, createdViews[0], injector);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should create and set the render view', () => {
          manager.createFreeEmbeddedView(elementRef(wrapView(parentView), 0),
                                         wrapPv(childProtoView), null);
          expect(renderer.spy('createView')).toHaveBeenCalledWith(childProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createFreeEmbeddedView(elementRef(wrapView(parentView), 0),
                                         wrapPv(childProtoView), null);
          var cmpView = createdViews[0];
          expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
        });
      });

    });


    describe('destroyFreeEmbeddedView', () => {
      describe('basic functionality', () => {
        var parentView, childProtoView, childView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
          childView = internalView(manager.createFreeEmbeddedView(
              elementRef(wrapView(parentView), 0), wrapPv(childProtoView), null));
        });

        it('should detach', () => {
          manager.destroyFreeEmbeddedView(elementRef(wrapView(parentView), 0), wrapView(childView));
          expect(utils.spy('detachFreeEmbeddedView'))
              .toHaveBeenCalledWith(parentView, 0, childView);
        });

        it('should dehydrate', () => {
          manager.destroyFreeEmbeddedView(elementRef(wrapView(parentView), 0), wrapView(childView));
          expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(childView);
          expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(childView.render);
        });

        it('should detach the render view', () => {
          manager.destroyFreeEmbeddedView(elementRef(wrapView(parentView), 0), wrapView(childView));
          expect(renderer.spy('detachFreeView')).toHaveBeenCalledWith(childView.render);
        });

        it('should return the view to the pool', () => {
          manager.destroyFreeEmbeddedView(elementRef(wrapView(parentView), 0), wrapView(childView));
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
          expect(renderer.spy('destroyView')).not.toHaveBeenCalled();
        });

        it('should destroy the view if the pool is full', () => {
          viewPool.spy('returnView').andReturn(false);
          manager.destroyFreeEmbeddedView(elementRef(wrapView(parentView), 0), wrapView(childView));
          expect(renderer.spy('destroyView')).toHaveBeenCalledWith(childView.render);
          expect(viewListener.spy('viewDestroyed')).toHaveBeenCalledWith(childView);
        });

      });

      describe('recursively destroyFreeEmbeddedView', () => {
                                                          // TODO
                                                      });

    });

    describe('createRootHostView', () => {

      var hostProtoView;
      beforeEach(() => { hostProtoView = createProtoView([createComponentElBinder(null)]); });

      it('should create the view', () => {
        expect(internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null)))
            .toBe(createdViews[0]);
        expect(createdViews[0].proto).toBe(hostProtoView);
        expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
      });

      it('should hydrate the view', () => {
        var injector = new Injector([], null, false);
        manager.createRootHostView(wrapPv(hostProtoView), null, injector);
        expect(utils.spy('hydrateRootHostView')).toHaveBeenCalledWith(createdViews[0], injector);
        expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
      });

      it('should create and set the render view using the component selector', () => {
        manager.createRootHostView(wrapPv(hostProtoView), null, null)
            expect(renderer.spy('createRootHostView'))
                .toHaveBeenCalledWith(hostProtoView.render, 'someComponent');
        expect(createdViews[0].render).toBe(createdRenderViews[0]);
      });

      it('should allow to override the selector', () => {
        var selector = 'someOtherSelector';
        manager.createRootHostView(wrapPv(hostProtoView), selector, null)
            expect(renderer.spy('createRootHostView'))
                .toHaveBeenCalledWith(hostProtoView.render, selector);
      });

      it('should set the event dispatcher', () => {
        manager.createRootHostView(wrapPv(hostProtoView), null, null);
        var cmpView = createdViews[0];
        expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(cmpView.render, cmpView);
      });

    });


    describe('destroyRootHostView', () => {
      var hostProtoView, hostView, hostRenderViewRef;
      beforeEach(() => {
        hostProtoView = createProtoView([createComponentElBinder(null)]);
        hostView = internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
        hostRenderViewRef = hostView.render;
      });

      it('should dehydrate', () => {
        manager.destroyRootHostView(wrapView(hostView));
        expect(utils.spy('dehydrateView')).toHaveBeenCalledWith(hostView);
        expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(hostView.render);
      });

      it('should destroy the render view', () => {
        manager.destroyRootHostView(wrapView(hostView));
        expect(renderer.spy('destroyView')).toHaveBeenCalledWith(hostRenderViewRef);
        expect(viewListener.spy('viewDestroyed')).toHaveBeenCalledWith(hostView);
      });

      it('should not return the view to the pool', () => {
        manager.destroyRootHostView(wrapView(hostView));
        expect(viewPool.spy('returnView')).not.toHaveBeenCalled();
      });

    });

    describe('createViewInContainer', () => {

      describe('basic functionality', () => {
        var parentView, childProtoView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
        });

        it('should create a ViewContainerRef if not yet existing', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                        wrapPv(childProtoView), null);
          expect(parentView.viewContainers[0]).toBeTruthy();
        });

        it('should create the view', () => {
          expect(internalView(manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                                            wrapPv(childProtoView), null)))
              .toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(childProtoView);
          expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
        });

        it('should attach the view', () => {
          var contextView = createView();
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                        wrapPv(childProtoView),
                                        elementRef(wrapView(contextView), 1), null);
          expect(utils.spy('attachViewInContainer'))
              .toHaveBeenCalledWith(parentView, 0, contextView, 1, 0, createdViews[0]);
          expect(renderer.spy('attachViewInContainer'))
              .toHaveBeenCalledWith(parentView.render, 0, 0, createdViews[0].render);
        });

        it('should hydrate the view', () => {
          var injector = new Injector([], null, false);
          var contextView = createView();
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                        wrapPv(childProtoView),
                                        elementRef(wrapView(contextView), 1), injector);
          expect(utils.spy('hydrateViewInContainer'))
              .toHaveBeenCalledWith(parentView, 0, contextView, 1, 0, injector);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should create and set the render view', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                        wrapPv(childProtoView), null, null);
          expect(renderer.spy('createView')).toHaveBeenCalledWith(childProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createViewInContainer(elementRef(wrapView(parentView), 0), 0,
                                        wrapPv(childProtoView), null, null);
          var childView = createdViews[0];
          expect(renderer.spy('setEventDispatcher'))
              .toHaveBeenCalledWith(childView.render, childView);
        });

      });
    });

    describe('destroyViewInContainer', () => {

      describe('basic functionality', () => {
        var parentView, childProtoView, childView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
          childView = internalView(manager.createViewInContainer(
              elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView), null));
        });

        it('should dehydrate', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(utils.spy('dehydrateView'))
              .toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
          expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(childView.render);
        });

        it('should detach', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
          expect(renderer.spy('detachViewInContainer'))
              .toHaveBeenCalledWith(parentView.render, 0, 0, childView.render);
        });

        it('should return the view to the pool', () => {
          manager.destroyViewInContainer(elementRef(wrapView(parentView), 0), 0);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
        });
      });

      describe('recursively destroy views in ViewContainers', () => {
        var parentView, childProtoView, childView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
          childView = internalView(manager.createViewInContainer(
              elementRef(wrapView(parentView), 0), 0, wrapPv(childProtoView), null));
        });

        it('should dehydrate', () => {
          manager.destroyRootHostView(wrapView(parentView));
          expect(utils.spy('dehydrateView'))
              .toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
          expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(childView.render);
        });

        it('should detach', () => {
          manager.destroyRootHostView(wrapView(parentView));
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
          expect(renderer.spy('detachViewInContainer'))
              .toHaveBeenCalledWith(parentView.render, 0, 0, childView.render);
        });

        it('should return the view to the pool', () => {
          manager.destroyRootHostView(wrapView(parentView));
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

class MockProtoViewRef extends RenderProtoViewRef {
  nestedComponentCount: number;
  constructor(nestedComponentCount: number) {
    super();
    this.nestedComponentCount = nestedComponentCount;
  }
}

@Component({selector: 'someComponent'})
class SomeComponent {
}

@proxy
@IMPLEMENTS(Renderer)
class SpyRenderer extends SpyObject {
  constructor() { super(Renderer); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(AppViewPool)
class SpyAppViewPool extends SpyObject {
  constructor() { super(AppViewPool); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(AppViewManagerUtils)
class SpyAppViewManagerUtils extends SpyObject {
  constructor() { super(AppViewManagerUtils); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(AppViewListener)
class SpyAppViewListener extends SpyObject {
  constructor() { super(AppViewListener); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(ElementInjector)
class SpyElementInjector extends SpyObject {
  constructor() { super(ElementInjector); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
