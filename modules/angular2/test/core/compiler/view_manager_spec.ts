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
import {IMPLEMENTS} from 'angular2/src/core/facade/lang';

import {
  AppProtoView,
  AppView,
  AppViewContainer,
  AppProtoViewMergeMapping
} from 'angular2/src/core/compiler/view';
import {ProtoViewRef, ViewRef, internalView} from 'angular2/src/core/compiler/view_ref';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {TemplateRef} from 'angular2/src/core/compiler/template_ref';
import {
  Renderer,
  RenderViewRef,
  RenderProtoViewRef,
  RenderFragmentRef,
  ViewType,
  RenderProtoViewMergeMapping,
  RenderViewWithFragments
} from 'angular2/src/core/render/api';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {AppViewPool} from 'angular2/src/core/compiler/view_pool';

import {
  createHostPv,
  createComponentPv,
  createEmbeddedPv,
  createEmptyElBinder,
  createNestedElBinder,
  createProtoElInjector
} from './view_manager_utils_spec';

export function main() {
  // TODO(tbosch): add missing tests

  describe('AppViewManager', () => {
    var renderer;
    var utils: AppViewManagerUtils;
    var viewListener;
    var viewPool;
    var manager: AppViewManager;
    var createdRenderViews: RenderViewWithFragments[];

    function wrapPv(protoView: AppProtoView): ProtoViewRef { return new ProtoViewRef(protoView); }

    function wrapView(view: AppView): ViewRef { return new ViewRef(view); }

    function resetSpies() {
      viewListener.spy('viewCreated').reset();
      viewListener.spy('viewDestroyed').reset();
      renderer.spy('createView').reset();
      renderer.spy('destroyView').reset();
      renderer.spy('createRootHostView').reset();
      renderer.spy('setEventDispatcher').reset();
      renderer.spy('hydrateView').reset();
      renderer.spy('dehydrateView').reset();
      viewPool.spy('returnView').reset();
    }

    beforeEach(() => {
      renderer = new SpyRenderer();
      utils = new AppViewManagerUtils();
      viewListener = new SpyAppViewListener();
      viewPool = new SpyAppViewPool();
      manager = new AppViewManager(viewPool, viewListener, utils, renderer);
      createdRenderViews = [];

      renderer.spy('createRootHostView')
          .andCallFake((_a, renderFragmentCount, _b) => {
            var fragments = [];
            for (var i = 0; i < renderFragmentCount; i++) {
              fragments.push(new RenderFragmentRef());
            }
            var rv = new RenderViewWithFragments(new RenderViewRef(), fragments);
            createdRenderViews.push(rv);
            return rv;
          });
      renderer.spy('createView')
          .andCallFake((_a, renderFragmentCount) => {
            var fragments = [];
            for (var i = 0; i < renderFragmentCount; i++) {
              fragments.push(new RenderFragmentRef());
            }
            var rv = new RenderViewWithFragments(new RenderViewRef(), fragments);
            createdRenderViews.push(rv);
            return rv;
          });
      viewPool.spy('returnView').andReturn(true);
    });

    describe('createRootHostView', () => {

      var hostProtoView: AppProtoView;
      beforeEach(
          () => { hostProtoView = createHostPv([createNestedElBinder(createComponentPv())]); });

      it('should create the view', () => {
        var rootView =
            internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
        expect(rootView.proto).toBe(hostProtoView);
        expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(rootView);
      });

      it('should hydrate the view', () => {
        var injector = Injector.resolveAndCreate([]);
        var rootView = internalView(
            <ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, injector));
        expect(rootView.hydrated()).toBe(true);
        expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(rootView.render);
      });

      it('should create and set the render view using the component selector', () => {
        var rootView =
            internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
        expect(renderer.spy('createRootHostView'))
            .toHaveBeenCalledWith(hostProtoView.mergeMapping.renderProtoViewRef,
                                  hostProtoView.mergeMapping.renderFragmentCount, 'someComponent');
        expect(rootView.render).toBe(createdRenderViews[0].viewRef);
        expect(rootView.renderFragment).toBe(createdRenderViews[0].fragmentRefs[0]);
      });

      it('should allow to override the selector', () => {
        var selector = 'someOtherSelector';
        internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), selector, null));
        expect(renderer.spy('createRootHostView'))
            .toHaveBeenCalledWith(hostProtoView.mergeMapping.renderProtoViewRef,
                                  hostProtoView.mergeMapping.renderFragmentCount, selector);
      });

      it('should set the event dispatcher', () => {
        var rootView =
            internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
        expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(rootView.render, rootView);
      });

    });


    describe('destroyRootHostView', () => {
      var hostProtoView: AppProtoView;
      var hostView: AppView;
      var hostRenderViewRef: RenderViewRef;
      beforeEach(() => {
        hostProtoView = createHostPv([createNestedElBinder(createComponentPv())]);
        hostView =
            internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
        hostRenderViewRef = hostView.render;
      });

      it('should dehydrate', () => {
        manager.destroyRootHostView(wrapView(hostView));
        expect(hostView.hydrated()).toBe(false);
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
        var hostView: AppView;
        var childProtoView: AppProtoView;
        var vcRef: ElementRef;
        var templateRef: TemplateRef;
        beforeEach(() => {
          childProtoView = createEmbeddedPv();
          var hostProtoView = createHostPv(
              [createNestedElBinder(createComponentPv([createNestedElBinder(childProtoView)]))]);
          hostView =
              internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
          vcRef = hostView.elementRefs[1];
          templateRef = new TemplateRef(hostView.elementRefs[1]);
          resetSpies();
        });

        describe('create the first view', () => {

          it('should create an AppViewContainer if not yet existing', () => {
            manager.createEmbeddedViewInContainer(vcRef, 0, templateRef);
            expect(hostView.viewContainers[1]).toBeTruthy();
          });

          it('should use an existing nested view', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            expect(childView.proto).toBe(childProtoView);
            expect(childView).toBe(hostView.views[2]);
            expect(viewListener.spy('viewCreated')).not.toHaveBeenCalled();
            expect(renderer.spy('createView')).not.toHaveBeenCalled();
          });

          it('should attach the fragment', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            expect(childView.proto).toBe(childProtoView);
            expect(hostView.viewContainers[1].views.length).toBe(1);
            expect(hostView.viewContainers[1].views[0]).toBe(childView);
            expect(renderer.spy('attachFragmentAfterElement'))
                .toHaveBeenCalledWith(vcRef, childView.renderFragment);
          });

          it('should hydrate the view but not the render view', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            expect(childView.hydrated()).toBe(true);
            expect(renderer.spy('hydrateView')).not.toHaveBeenCalled();
          });

          it('should not set the EventDispatcher', () => {
            internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            expect(renderer.spy('setEventDispatcher')).not.toHaveBeenCalled();
          });

        });

        describe('create the second view', () => {
          var firstChildView;
          beforeEach(() => {
            firstChildView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            resetSpies();
          });

          it('should create a new view', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            expect(childView.proto).toBe(childProtoView);
            expect(childView).not.toBe(firstChildView);
            expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(childView);
            expect(renderer.spy('createView'))
                .toHaveBeenCalledWith(childProtoView.mergeMapping.renderProtoViewRef,
                                      childProtoView.mergeMapping.renderFragmentCount);
            expect(childView.render).toBe(createdRenderViews[1].viewRef);
            expect(childView.renderFragment).toBe(createdRenderViews[1].fragmentRefs[0]);
          });

          it('should attach the fragment', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            expect(childView.proto).toBe(childProtoView);
            expect(hostView.viewContainers[1].views[1]).toBe(childView);
            expect(renderer.spy('attachFragmentAfterFragment'))
                .toHaveBeenCalledWith(firstChildView.renderFragment, childView.renderFragment);
          });

          it('should hydrate the view', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            expect(childView.hydrated()).toBe(true);
            expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(childView.render);
          });

          it('should set the EventDispatcher', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            expect(renderer.spy('setEventDispatcher'))
                .toHaveBeenCalledWith(childView.render, childView);
          });

        });

        describe('create another view when the first view has been returned', () => {
          beforeEach(() => {
            internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            manager.destroyViewInContainer(vcRef, 0);
            resetSpies();
          });

          it('should use an existing nested view', () => {
            var childView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            expect(childView.proto).toBe(childProtoView);
            expect(childView).toBe(hostView.views[2]);
            expect(viewListener.spy('viewCreated')).not.toHaveBeenCalled();
            expect(renderer.spy('createView')).not.toHaveBeenCalled();
          });

        });

        describe('create a host view', () => {

          it('should always create a new view and not use the embedded view', () => {
            var newHostPv = createHostPv([createNestedElBinder(createComponentPv())]);
            var newHostView = internalView(
                <ViewRef>manager.createHostViewInContainer(vcRef, 0, wrapPv(newHostPv), null));
            expect(newHostView.proto).toBe(newHostPv);
            expect(newHostView).not.toBe(hostView.views[2]);
            expect(viewListener.spy('viewCreated')).toHaveBeenCalledWith(newHostView);
            expect(renderer.spy('createView'))
                .toHaveBeenCalledWith(newHostPv.mergeMapping.renderProtoViewRef,
                                      newHostPv.mergeMapping.renderFragmentCount);
          });

        });

      });
    });

    describe('destroyViewInContainer', () => {

      describe('basic functionality', () => {
        var hostView: AppView;
        var childProtoView: AppProtoView;
        var vcRef: ElementRef;
        var templateRef: TemplateRef;
        var firstChildView: AppView;
        beforeEach(() => {
          childProtoView = createEmbeddedPv();
          var hostProtoView = createHostPv(
              [createNestedElBinder(createComponentPv([createNestedElBinder(childProtoView)]))]);
          hostView =
              internalView(<ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
          vcRef = hostView.elementRefs[1];
          templateRef = new TemplateRef(hostView.elementRefs[1]);
          firstChildView =
              internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
          resetSpies();
        });

        describe('destroy the first view', () => {
          it('should dehydrate the app view but not the render view', () => {
            manager.destroyViewInContainer(vcRef, 0);
            expect(firstChildView.hydrated()).toBe(false);
            expect(renderer.spy('dehydrateView')).not.toHaveBeenCalled();
          });

          it('should detach', () => {
            manager.destroyViewInContainer(vcRef, 0);
            expect(hostView.viewContainers[1].views).toEqual([]);
            expect(renderer.spy('detachFragment'))
                .toHaveBeenCalledWith(firstChildView.renderFragment);
          });

          it('should not return the view to the pool', () => {
            manager.destroyViewInContainer(vcRef, 0);
            expect(viewPool.spy('returnView')).not.toHaveBeenCalled();
          });

        });

        describe('destroy another view', () => {
          var secondChildView;
          beforeEach(() => {
            secondChildView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            resetSpies();
          });

          it('should dehydrate', () => {
            manager.destroyViewInContainer(vcRef, 1);
            expect(secondChildView.hydrated()).toBe(false);
            expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(secondChildView.render);
          });

          it('should detach', () => {
            manager.destroyViewInContainer(vcRef, 1);
            expect(hostView.viewContainers[1].views[0]).toBe(firstChildView);
            expect(renderer.spy('detachFragment'))
                .toHaveBeenCalledWith(secondChildView.renderFragment);
          });

          it('should return the view to the pool', () => {
            manager.destroyViewInContainer(vcRef, 1);
            expect(viewPool.spy('returnView')).toHaveBeenCalledWith(secondChildView);
          });

        });
      });

      describe('recursively destroy views in ViewContainers', () => {

        describe('destroy child views when a component is destroyed', () => {
          var hostView: AppView;
          var childProtoView: AppProtoView;
          var vcRef: ElementRef;
          var templateRef: TemplateRef;
          var firstChildView: AppView;
          var secondChildView: AppView;
          beforeEach(() => {
            childProtoView = createEmbeddedPv();
            var hostProtoView = createHostPv(
                [createNestedElBinder(createComponentPv([createNestedElBinder(childProtoView)]))]);
            hostView = internalView(
                <ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
            vcRef = hostView.elementRefs[1];
            templateRef = new TemplateRef(hostView.elementRefs[1]);
            firstChildView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
            secondChildView =
                internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
            resetSpies();
          });

          it('should dehydrate', () => {
            manager.destroyRootHostView(wrapView(hostView));
            expect(firstChildView.hydrated()).toBe(false);
            expect(secondChildView.hydrated()).toBe(false);
            expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(hostView.render);
            expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(secondChildView.render);
          });

          it('should detach', () => {
            manager.destroyRootHostView(wrapView(hostView));
            expect(hostView.viewContainers[1].views).toEqual([]);
            expect(renderer.spy('detachFragment'))
                .toHaveBeenCalledWith(firstChildView.renderFragment);
            expect(renderer.spy('detachFragment'))
                .toHaveBeenCalledWith(secondChildView.renderFragment);
          });

          it('should return the view to the pool', () => {
            manager.destroyRootHostView(wrapView(hostView));
            expect(viewPool.spy('returnView')).not.toHaveBeenCalledWith(firstChildView);
            expect(viewPool.spy('returnView')).toHaveBeenCalledWith(secondChildView);
          });

        });

        describe('destroy child views over multiple levels', () => {
          var hostView: AppView;
          var childProtoView: AppProtoView;
          var nestedChildProtoView: AppProtoView;
          var vcRef: ElementRef;
          var templateRef: TemplateRef;
          var nestedVcRefs: ElementRef[];
          var childViews: AppView[];
          var nestedChildViews: AppView[];
          beforeEach(() => {
            nestedChildProtoView = createEmbeddedPv();
            childProtoView = createEmbeddedPv([
              createNestedElBinder(
                  createComponentPv([createNestedElBinder(nestedChildProtoView)]))
            ]);
            var hostProtoView = createHostPv(
                [createNestedElBinder(createComponentPv([createNestedElBinder(childProtoView)]))]);
            hostView = internalView(
                <ViewRef>manager.createRootHostView(wrapPv(hostProtoView), null, null));
            vcRef = hostView.elementRefs[1];
            templateRef = new TemplateRef(hostView.elementRefs[1]);
            nestedChildViews = [];
            childViews = [];
            nestedVcRefs = [];
            for (var i = 0; i < 2; i++) {
              var view = internalView(manager.createEmbeddedViewInContainer(vcRef, i, templateRef));
              childViews.push(view);
              var nestedVcRef = view.elementRefs[view.elementOffset];
              nestedVcRefs.push(nestedVcRef);
              for (var j = 0; j < 2; j++) {
                var nestedView = internalView(
                    manager.createEmbeddedViewInContainer(nestedVcRef, j, templateRef));
                nestedChildViews.push(nestedView);
              }
            }
            resetSpies();
          });

          it('should dehydrate all child views', () => {
            manager.destroyRootHostView(wrapView(hostView));
            childViews.forEach((childView) => expect(childView.hydrated()).toBe(false));
            nestedChildViews.forEach((childView) => expect(childView.hydrated()).toBe(false));
          });

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
@IMPLEMENTS(AppViewListener)
class SpyAppViewListener extends SpyObject {
  constructor() { super(AppViewListener); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
