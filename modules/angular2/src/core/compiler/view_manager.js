import {Injector, Injectable, Binding} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as eli from './element_injector';
import * as viewModule from './view';
import {Renderer, ViewRef, RenderViewContainerRef} from 'angular2/src/render/api';
import {AppViewManagerUtils} from './view_manager_utils';
import {AppViewPool} from './view_pool';

/**
 * Entry point for creating, moving views in the view hierarchy and destroying views.
 * This manager contains all recursion and delegates to helper methods
 * in AppViewManagerUtils and the Renderer, so unit tests get simpler.
 */
@Injectable()
export class AppViewManager {
  _viewPool:AppViewPool;
  _utils:AppViewManagerUtils;
  _renderer:Renderer;

  constructor(viewPool:AppViewPool, utils:AppViewManagerUtils, renderer:Renderer) {
    this._renderer = renderer;
    this._viewPool = viewPool;
    this._utils = utils;
  }

  createDynamicComponentView(hostLocation:eli.ElementRef,
      componentProtoView:viewModule.AppProtoView, componentBinding:Binding, injector:Injector):viewModule.AppView {
    var hostView = hostLocation.hostView;
    var boundElementIndex = hostLocation.boundElementIndex;
    var binder = hostView.proto.elementBinders[boundElementIndex];
    if (!binder.hasDynamicComponent()) {
      throw new BaseException(`There is no dynamic component directive at element ${boundElementIndex}`)
    }

    var componentView = this._createViewRecurse(componentProtoView);
    var renderViewRefs = this._renderer.createDynamicComponentView(hostView.render, boundElementIndex, componentProtoView.render);
    componentView.render = renderViewRefs[0];
    this._utils.attachComponentView(hostView, boundElementIndex, componentView);
    this._utils.hydrateDynamicComponentInElementInjector(hostView, boundElementIndex, componentBinding, injector);
    this._utils.hydrateComponentView(hostView, boundElementIndex);

    this._viewHydrateRecurse(componentView, renderViewRefs, 1);
    return componentView;
  }

  createInPlaceHostView(parentComponentLocation:eli.ElementRef,
      hostElementSelector, hostProtoView:viewModule.AppProtoView, injector:Injector):viewModule.AppView {
    var parentComponentHostView = null;
    var parentComponentBoundElementIndex = null;
    var parentRenderViewRef = null;
    if (isPresent(parentComponentLocation)) {
      parentComponentHostView = parentComponentLocation.hostView;
      parentComponentBoundElementIndex = parentComponentLocation.boundElementIndex;
      parentRenderViewRef = parentComponentHostView.componentChildViews[parentComponentBoundElementIndex].render;
    }
    var hostView = this._createViewRecurse(hostProtoView);
    var renderViewRefs = this._renderer.createInPlaceHostView(parentRenderViewRef, hostElementSelector, hostView.proto.render);
    hostView.render = renderViewRefs[0];
    this._utils.attachAndHydrateInPlaceHostView(parentComponentHostView, parentComponentBoundElementIndex, hostView, injector);
    this._viewHydrateRecurse(hostView, renderViewRefs, 1);
    return hostView;
  }

  destroyInPlaceHostView(parentComponentLocation:eli.ElementRef, hostView:viewModule.AppView) {
    var parentView = null;
    var parentRenderViewRef = null;
    if (isPresent(parentComponentLocation)) {
      parentView = parentComponentLocation.hostView.componentChildViews[parentComponentLocation.boundElementIndex];
      parentRenderViewRef = parentView.render;
    }
    var hostViewRenderRef = hostView.render;
    this._viewDehydrateRecurse(hostView);
    this._utils.detachInPlaceHostView(parentView, hostView);
    this._renderer.destroyInPlaceHostView(parentRenderViewRef, hostViewRenderRef);
    this._destroyView(hostView);
  }

  createViewInContainer(viewContainerLocation:eli.ElementRef,
      atIndex:number, protoView:viewModule.AppProtoView, injector:Injector = null):viewModule.AppView {
    var parentView = viewContainerLocation.hostView;
    var boundElementIndex:number = viewContainerLocation.boundElementIndex;
    var view = this._createViewRecurse(protoView);
    var renderViewRefs = this._renderer.createViewInContainer(this._getRenderViewContainerRef(parentView, boundElementIndex), atIndex, view.proto.render);
    view.render = renderViewRefs[0];

    this._utils.attachViewInContainer(parentView, boundElementIndex, atIndex, view);
    this._utils.hydrateViewInContainer(parentView, boundElementIndex, atIndex, injector);
    this._viewHydrateRecurse(view, renderViewRefs, 1);
    return view;
  }

  destroyViewInContainer(viewContainerLocation:eli.ElementRef, atIndex:number) {
    var parentView = viewContainerLocation.hostView;
    var boundElementIndex:number = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._viewDehydrateRecurse(view);
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.destroyViewInContainer(this._getRenderViewContainerRef(parentView, boundElementIndex), atIndex);
    this._destroyView(view);
  }

  attachViewInContainer(viewContainerLocation:eli.ElementRef, atIndex:number, view:viewModule.AppView):viewModule.AppView {
    var parentView = viewContainerLocation.hostView;
    var boundElementIndex:number = viewContainerLocation.boundElementIndex;
    this._utils.attachViewInContainer(parentView, boundElementIndex, atIndex, view);
    this._renderer.insertViewIntoContainer(this._getRenderViewContainerRef(parentView, boundElementIndex), atIndex, view.render);
    return view;
  }

  detachViewInContainer(viewContainerLocation:eli.ElementRef, atIndex:number):viewModule.AppView {
    var parentView = viewContainerLocation.hostView;
    var boundElementIndex:number = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.detachViewFromContainer(this._getRenderViewContainerRef(parentView, boundElementIndex), atIndex);
    return view;
  }

  _getRenderViewContainerRef(parentView:viewModule.AppView, boundElementIndex:number) {
    return new RenderViewContainerRef(parentView.render, boundElementIndex);
  }

  _createViewRecurse(protoView:viewModule.AppProtoView) {
    var view = this._viewPool.getView(protoView);
    if (isBlank(view)) {
      view = this._utils.createView(protoView, this, this._renderer);
      var binders = protoView.elementBinders;
      for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
        var binder = binders[binderIdx];
        if (binder.hasStaticComponent()) {
          var childView = this._createViewRecurse(binder.nestedProtoView);
          this._utils.attachComponentView(view, binderIdx, childView);
        }
      }
    }
    return view;
  }

  _destroyView(view:viewModule.AppView) {
    this._viewPool.returnView(view);
  }

  _viewHydrateRecurse(
      view:viewModule.AppView,
      renderComponentViewRefs:List<ViewRef>,
      renderComponentIndex:number):number {
    this._renderer.setEventDispatcher(view.render, view);

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i].hasStaticComponent()) {
        var childView = view.componentChildViews[i];
        childView.render = renderComponentViewRefs[renderComponentIndex++];
        this._utils.hydrateComponentView(view, i);
        renderComponentIndex = this._viewHydrateRecurse(
          view.componentChildViews[i],
          renderComponentViewRefs,
          renderComponentIndex
        );
      }
    }
    return renderComponentIndex;
  }

  _viewDehydrateRecurse(view:viewModule.AppView) {
    this._utils.dehydrateView(view);
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; i++) {
      var componentView = view.componentChildViews[i];
      if (isPresent(componentView)) {
        this._viewDehydrateRecurse(componentView);
        if (binders[i].hasDynamicComponent()) {
          this._utils.detachComponentView(view, i);
          this._destroyView(componentView);
        }
      }
      var vc = view.viewContainers[i];
      if (isPresent(vc)) {
        for (var j = vc.views.length - 1; j >= 0; j--) {
          var childView = vc.views[j];
          this._viewDehydrateRecurse(childView);
          this._utils.detachViewInContainer(view, i, j);
          this._destroyView(childView);
        }
      }
    }

    // imperativeHostViews
    for (var i = 0; i < view.imperativeHostViews.length; i++) {
      var hostView = view.imperativeHostViews[i];
      this._viewDehydrateRecurse(hostView);
      this._utils.detachInPlaceHostView(view, hostView);
      this._destroyView(hostView);
    }
    view.render = null;
  }
}