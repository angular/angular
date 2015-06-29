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
    var createdViews: any[];
    var createdRenderViews: any[];

    function wrapPv(protoView: AppProtoView): ProtoViewRef { return new ProtoViewRef(protoView); }

    function wrapView(view: AppView): ViewRef { return new ViewRef(view); }

    function elementRef(parentView, boundElementIndex) {
      return parentView.elementRefs[boundElementIndex];
    }

    function createDirectiveBinding(type) {
      var annotation = directiveResolver.resolve(type);
      return DirectiveBinding.createFromType(type, annotation);
    }

    function createEmptyElBinder() { return new ElementBinder(0, null, 0, null, null); }

    function createComponentElBinder(nestedProtoView = null) {
      var binding = createDirectiveBinding(SomeComponent);
      var binder = new ElementBinder(0, null, 0, null, binding);
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
      var res = new AppProtoView(new MockProtoViewRef(staticChildComponentCount), null, null, null);
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
      var view = new AppView(renderer, pv, new Map());
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
            createdViews.push(view);
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
            createdRenderViews.push(rv);
            return rv;
          });
      renderer.spy('createView')
          .andCallFake((_a) => {
            var rv = new RenderViewRef();
            createdRenderViews.push(rv);
            return rv;
          });
      viewPool.spy('returnView').andReturn(true);
    });

    describe('static child components', () => {

      describe('recursively create when not cached', () => {
        var rootProtoView, hostProtoView, componentProtoView, hostView, componentView;
        beforeEach(() => {
          componentProtoView = createProtoView();
          hostProtoView = createProtoView([createComponentElBinder(componentProtoView)]);
          rootProtoView = createProtoView([createComponentElBinder(hostProtoView)]);
          manager.createRootHostView(wrapPv(rootProtoView), null, null);
          hostView = createdViews[1];
          componentView = createdViews[2];
        });

        it('should create the view', () => {
          expect(hostView.proto).toBe(hostProtoView);
          expect(componentView.proto).toBe(componentProtoView);
        });

        it('should hydrate the view', () => {
          expect(utils.spy('hydrateComponentView')).toHaveBeenCalledWith(hostView, 0);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(componentView.render);
        });

        it('should set the render view',
           () => {expect(componentView.render).toBe(createdRenderViews[2])});

        it('should set the event dispatcher', () => {
          expect(renderer.spy('setEventDispatcher'))
              .toHaveBeenCalledWith(componentView.render, componentView);
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
        var injector = Injector.resolveAndCreate([]);
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
          manager.createViewInContainer(elementRef(parentView, 0), 0, wrapPv(childProtoView), null);
          expect(parentView.viewContainers[0]).toBeTruthy();
        });

        it('should create the view', () => {
          expect(internalView(manager.createViewInContainer(elementRef(parentView, 0), 0,
                                                            wrapPv(childProtoView), null)))
              .toBe(createdViews[0]);
          expect(createdViews[0].proto).toBe(childProtoView);
          expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(createdViews[0]);
        });

        it('should attach the view', () => {
          var contextView =
              createView(createProtoView([createEmptyElBinder(), createEmptyElBinder()]));
          var elRef = elementRef(parentView, 0);
          manager.createViewInContainer(elRef, 0, wrapPv(childProtoView),
                                        elementRef(contextView, 1), null);
          expect(utils.spy('attachViewInContainer'))
              .toHaveBeenCalledWith(parentView, 0, contextView, 1, 0, createdViews[0]);
          expect(renderer.spy('attachViewInContainer'))
              .toHaveBeenCalledWith(elRef, 0, createdViews[0].render);
        });

        it('should hydrate the view', () => {
          var contextView =
              createView(createProtoView([createEmptyElBinder(), createEmptyElBinder()]));
          manager.createViewInContainer(elementRef(parentView, 0), 0, wrapPv(childProtoView),
                                        elementRef(contextView, 1), []);
          expect(utils.spy('hydrateViewInContainer'))
              .toHaveBeenCalledWith(parentView, 0, contextView, 1, 0, []);
          expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(createdViews[0].render);
        });

        it('should create and set the render view', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, wrapPv(childProtoView), null,
                                        null);
          expect(renderer.spy('createView')).toHaveBeenCalledWith(childProtoView.render);
          expect(createdViews[0].render).toBe(createdRenderViews[0]);
        });

        it('should set the event dispatcher', () => {
          manager.createViewInContainer(elementRef(parentView, 0), 0, wrapPv(childProtoView), null,
                                        null);
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
          childView = internalView(manager.createViewInContainer(elementRef(parentView, 0), 0,
                                                                 wrapPv(childProtoView), null));
        });

        it('should dehydrate', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(utils.spy('dehydrateView'))
              .toHaveBeenCalledWith(parentView.viewContainers[0].views[0]);
          expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(childView.render);
        });

        it('should detach', () => {
          var elRef = elementRef(parentView, 0);
          manager.destroyViewInContainer(elRef, 0);
          expect(utils.spy('detachViewInContainer')).toHaveBeenCalledWith(parentView, 0, 0);
          expect(renderer.spy('detachViewInContainer'))
              .toHaveBeenCalledWith(elRef, 0, childView.render);
        });

        it('should return the view to the pool', () => {
          manager.destroyViewInContainer(elementRef(parentView, 0), 0);
          expect(viewPool.spy('returnView')).toHaveBeenCalledWith(childView);
        });
      });

      describe('recursively destroy views in ViewContainers', () => {
        var parentView, childProtoView, childView;
        beforeEach(() => {
          parentView = createView(createProtoView([createEmptyElBinder()]));
          childProtoView = createProtoView();
          childView = internalView(manager.createViewInContainer(elementRef(parentView, 0), 0,
                                                                 wrapPv(childProtoView), null));
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
              .toHaveBeenCalledWith(parentView.elementRefs[0], 0, childView.render);
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
