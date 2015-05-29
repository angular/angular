import {Injector, Binding, Injectable} from 'angular2/di';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import {ElementRef} from './element_ref';
import {ProtoViewRef, ViewRef, internalView, internalProtoView} from './view_ref';
import {ViewContainerRef} from './view_container_ref';
import {Renderer, RenderViewRef, RenderViewState, RenderViewActivateConfig} from 'angular2/src/render/api';
import {AppViewManagerUtils} from './view_manager_utils';
import {AppViewPool} from './view_pool';
import {AppViewListener} from './view_listener';

/**
 * Entry point for creating, moving views in the view hierarchy and destroying views.
 * This manager contains all recursion and delegates to helper methods
 * in AppViewManagerUtils and the Renderer, so unit tests get simpler.
 */
@Injectable()
export class AppViewManager {
  _viewPool: AppViewPool;
  _viewListener: AppViewListener;
  _utils: AppViewManagerUtils;
  _renderer: Renderer;

  constructor(viewPool: AppViewPool, viewListener: AppViewListener, utils: AppViewManagerUtils,
              renderer: Renderer) {
    this._viewPool = viewPool;
    this._viewListener = viewListener;
    this._utils = utils;
    this._renderer = renderer;
  }

  getComponentView(hostLocation: ElementRef): ViewRef {
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    return new ViewRef(hostView.componentChildViews[boundElementIndex]);
  }

  getViewContainer(location: ElementRef): ViewContainerRef {
    var hostView = internalView(location.parentView);
    return hostView.elementInjectors[location.boundElementIndex].getViewContainerRef();
  }

  getComponent(hostLocation: ElementRef): any {
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    return this._utils.getComponentInstance(hostView, boundElementIndex);
  }

  createDynamicComponentView(hostLocation: ElementRef, componentProtoViewRef: ProtoViewRef,
                             componentBinding: Binding, injector: Injector): ViewRef {
    var componentProtoView = internalProtoView(componentProtoViewRef);
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    var binder = hostView.proto.elementBinders[boundElementIndex];
    if (!binder.hasDynamicComponent()) {
      throw new BaseException(
          `There is no dynamic component directive at element ${boundElementIndex}`)
    }
    var componentView = this._viewPool.getView(componentProtoView);
    var wasCached = isPresent(componentView);

    var componentRenderView = this._renderer.activateComponentView(hostView.render, boundElementIndex,
      wasCached ? this._getCachedViewActivateConfig(componentView) : this._getNonExistingViewActivateConfig(componentProtoView));
    if (!wasCached) {
      componentView = this._utils.createView(componentProtoView, componentRenderView, this,
        this._renderer);
      this._createAndAttachViewRecurse(componentView);
    }
    this._utils.attachComponentView(hostView, boundElementIndex, componentView);
    this._utils.hydrateDynamicComponentInElementInjector(hostView, boundElementIndex,
      componentBinding, injector);
    this._utils.hydrateComponentView(hostView, boundElementIndex);
    this._viewHydrateRecurse(componentView, wasCached);

    return new ViewRef(componentView);
  }

  createRootHostView(hostProtoViewRef: ProtoViewRef, overrideSelector: string,
                     injector: Injector): ViewRef {
    var hostProtoView = internalProtoView(hostProtoViewRef);
    var hostElementSelector = overrideSelector;
    if (isBlank(hostElementSelector)) {
      hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
    }
    var renderView = this._renderer.activateRootHostView(hostProtoView.render, hostElementSelector);
    var hostView = this._utils.createView(hostProtoView, renderView, this, this._renderer);
    this._createAndAttachViewRecurse(hostView);
    this._utils.hydrateRootHostView(hostView, injector);
    this._viewHydrateRecurse(hostView, true);
    return new ViewRef(hostView);
  }

  destroyRootHostView(hostViewRef: ViewRef) {
    // Note: don't put the hostView into the view pool
    // as it is depending on the element for which it was created.
    var hostView = internalView(hostViewRef);

    // We always want to detach the component view so that
    // it can be reused, although the root view cannot,
    // as it is tied to a particular element.
    this._utils.dehydrateView(hostView);
    this._viewDehydrateRecurse(hostView, true);
    this._destroyView(hostView, false);
  }

  createFreeHostView(parentComponentLocation: ElementRef, hostProtoViewRef: ProtoViewRef,
                     injector: Injector): ViewRef {
    var hostProtoView = internalProtoView(hostProtoViewRef);
    var parentComponentHostView = internalView(parentComponentLocation.parentView);
    var parentComponentBoundElementIndex = parentComponentLocation.boundElementIndex;
    var hostView = this._viewPool.getView(hostProtoView);
    var wasCached = isPresent(hostView);
    var hostRenderView = this._renderer.activateFreeHostView(parentComponentHostView.render,
      wasCached ? this._getCachedViewActivateConfig(hostView) : this._getNonExistingViewActivateConfig(hostProtoView));
    if (!wasCached) {
      hostView = this._utils.createView(hostProtoView, hostRenderView, this,
        this._renderer);
      this._createAndAttachViewRecurse(hostView);
    }
    this._utils.attachAndHydrateFreeHostView(parentComponentHostView,
                                             parentComponentBoundElementIndex, hostView, injector);
    this._viewHydrateRecurse(hostView, wasCached);
    return new ViewRef(hostView);
  }

  destroyFreeHostView(parentComponentLocation: ElementRef, hostViewRef: ViewRef) {
    var hostView = internalView(hostViewRef);
    var parentView = internalView(parentComponentLocation.parentView)
                         .componentChildViews[parentComponentLocation.boundElementIndex];
    this._destroyFreeHostView(parentView, hostView);
  }

  createViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                        protoViewRef: ProtoViewRef, context: ElementRef = null,
                        injector: Injector = null): ViewRef {
    var protoView = internalProtoView(protoViewRef);
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var contextView = null;
    var contextBoundElementIndex = null;
    if (isPresent(context)) {
      contextView = internalView(context.parentView);
      contextBoundElementIndex = context.boundElementIndex;
    }
    var view = this._viewPool.getView(protoView);
    var wasCached = isPresent(view);

    var renderView = this._renderer.activateViewInContainer(parentView.render, boundElementIndex, atIndex,
      wasCached ? this._getCachedViewActivateConfig(view) : this._getNonExistingViewActivateConfig(protoView));
    if (!wasCached) {
      view = this._utils.createView(protoView, renderView, this,
        this._renderer);
      this._createAndAttachViewRecurse(view);
    }

    this._utils.attachViewInContainer(parentView, boundElementIndex, contextView,
                                      contextBoundElementIndex, atIndex, view);
    this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView,
                                       contextBoundElementIndex, atIndex, injector);
    this._viewHydrateRecurse(view, wasCached);
    return new ViewRef(view);
  }

  destroyViewInContainer(viewContainerLocation: ElementRef, atIndex: number) {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    this._destroyViewInContainer(parentView, boundElementIndex, atIndex);
  }

  attachViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                        viewRef: ViewRef): ViewRef {
    var view = internalView(viewRef);
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    // TODO(tbosch): the public methods attachViewInContainer/detachViewInContainer
    // are used for moving elements without the same container.
    // We will change this into an atomic `move` operation, which should preserve the
    // previous parent injector (see https://github.com/angular/angular/issues/1377).
    // Right now we are destroying any special
    // context view that might have been used.
    this._utils.attachViewInContainer(parentView, boundElementIndex, null, null, atIndex, view);
    this._renderer.endMoveViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    return viewRef;
  }

  detachViewInContainer(viewContainerLocation: ElementRef, atIndex: number): ViewRef {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.beginMoveViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    return new ViewRef(view);
  }

  _getNonExistingViewActivateConfig(protoView: viewModule.AppProtoView): RenderViewActivateConfig {
    return new RenderViewActivateConfig(protoView.render, null, RenderViewState.NON_EXISTING);
  }

  _getCachedViewActivateConfig(cachedView: viewModule.AppView): RenderViewActivateConfig {
    return new RenderViewActivateConfig(cachedView.proto.render, cachedView.render, RenderViewState.CREATED);
  }

  _getAttachedViewActivateConfig(cachedView: viewModule.AppView): RenderViewActivateConfig {
    return new RenderViewActivateConfig(cachedView.proto.render, cachedView.render, RenderViewState.ATTACHED);
  }

  _createAndAttachViewRecurse(hostView: viewModule.AppView) {
    var binders = hostView.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (binder.hasStaticComponent()) {
        var componentProtoView = binder.nestedProtoView;
        var componentView = this._viewPool.getView(componentProtoView);
        var wasCached = isPresent(componentView);
        var componentRenderView = this._renderer.activateComponentView(hostView.render, binderIdx,
          wasCached ? this._getCachedViewActivateConfig(componentView) : this._getNonExistingViewActivateConfig(componentProtoView));
        if (!wasCached) {
          componentView = this._utils.createView(componentProtoView, componentRenderView, this,
            this._renderer);
        }
        this._utils.attachComponentView(hostView, binderIdx, componentView);
        this._createAndAttachViewRecurse(componentView);
      }
    }
  }

  _destroyView(view:viewModule.AppView, cacheable:boolean = true):boolean {
    var wasCached = false;
    if (cacheable) {
      wasCached = this._viewPool.returnView(view);
    }
    if (!wasCached) {
      this._viewListener.viewDestroyed(view);
    }
    return wasCached;
  }

  _destroyViewInContainer(parentView, boundElementIndex, atIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.dehydrateView(view);
    this._viewDehydrateRecurse(view, false);
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    var wasCached = this._destroyView(view);
    this._renderer.deactivateViewInContainer(parentView.render, boundElementIndex, atIndex, view.render, wasCached ? RenderViewState.CREATED : RenderViewState.NON_EXISTING);
  }

  _destroyComponentView(hostView, boundElementIndex, componentView) {
    this._utils.dehydrateView(componentView);
    this._viewDehydrateRecurse(componentView, false);
    this._utils.detachComponentView(hostView, boundElementIndex);
    var wasCached = this._destroyView(componentView);
    this._renderer.deactivateComponentView(hostView.render, boundElementIndex, componentView.render, wasCached ? RenderViewState.CREATED : RenderViewState.NON_EXISTING);
  }

  _destroyFreeHostView(parentView, hostView) {
    this._utils.dehydrateView(hostView);
    this._viewDehydrateRecurse(hostView, true);
    this._utils.detachFreeHostView(parentView, hostView);
    var wasCached = this._destroyView(hostView);
    this._renderer.deactivateFreeHostView(parentView.render, hostView.render, wasCached ? RenderViewState.CREATED : RenderViewState.NON_EXISTING);
  }

  _viewHydrateRecurse(hostView: viewModule.AppView, activateRenderViews: boolean) {
    var binders = hostView.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i].hasStaticComponent()) {
        var componentView = hostView.componentChildViews[i];
        if (activateRenderViews) {
          this._renderer.activateComponentView(hostView.render, i, this._getAttachedViewActivateConfig(componentView));
        }
        this._utils.hydrateComponentView(hostView, i);
        this._viewHydrateRecurse(componentView, activateRenderViews);
      }
    }
  }

  _viewDehydrateRecurse(view: viewModule.AppView, forceDestroyComponents:boolean) {
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; i++) {
      var componentView = view.componentChildViews[i];
      if (isPresent(componentView)) {
        if (binders[i].hasDynamicComponent() || forceDestroyComponents) {
          this._destroyComponentView(view, i, componentView);
        } else {
          this._renderer.deactivateComponentView(view.render, i, componentView.render, RenderViewState.ATTACHED);
          this._viewDehydrateRecurse(componentView, false);
        }
      }
      var vc = view.viewContainers[i];
      if (isPresent(vc)) {
        for (var j = vc.views.length - 1; j >= 0; j--) {
          this._destroyViewInContainer(view, i, j);
        }
      }
    }

    // freeHostViews
    for (var i = view.freeHostViews.length - 1; i >= 0; i--) {
      var hostView = view.freeHostViews[i];
      this._destroyFreeHostView(view, hostView);
    }
  }
}
