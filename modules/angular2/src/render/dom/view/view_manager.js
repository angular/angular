import {isBlank, isPresent, BaseException} from 'angular2/src/facade/lang';

import {RenderViewRef, RenderProtoViewRef, RenderElementRef} from '../../api';

import {DirectDomRenderViewRef, internalView} from './view_ref';
import {DirectDomRenderProtoViewRef, internalProtoView} from './proto_view_ref';
import {RenderView} from './view';
import {RenderProtoView} from './proto_view';

import {RenderViewPool} from './view_pool';
import {RenderViewManagerUtils} from './view_manager_utils';

// Attention: Keep this class in sync with the AppViewManager!
export class RenderViewManager {
  _viewPool:RenderViewPool;
  _utils:RenderViewManagerUtils;

  constructor(viewPool:RenderViewPool, utils:RenderViewManagerUtils) {
    this._viewPool = viewPool;
    this._utils = utils;
  }

  createDynamicComponentView(hostLocation:RenderElementRef, componentProtoViewRef:RenderProtoViewRef):RenderViewRef {
    var componentProtoView = internalProtoView(componentProtoViewRef);
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    var binder = hostView.proto.elementBinders[boundElementIndex];
    if (!binder.hasDynamicComponent()) {
      throw new BaseException(`There is no dynamic component directive at element ${boundElementIndex}`)
    }

    var componentView = this._createViewRecurse(componentProtoView);
    this._utils.attachComponentView(hostView, boundElementIndex, componentView);
    this._utils.hydrateComponentView(hostView, boundElementIndex);
    this._viewHydrateRecurse(componentView);

    return new DirectDomRenderViewRef(componentView);
  }

  createInPlaceHostView(parentComponentLocation:RenderElementRef, renderLocation:any, hostProtoViewRef:RenderProtoViewRef):RenderViewRef {
    var hostProtoView = internalProtoView(hostProtoViewRef);
    var parentComponentHostView = null;
    var parentComponentBoundElementIndex = null;
    if (isPresent(parentComponentLocation)) {
      parentComponentHostView = internalView(parentComponentLocation.parentView);
      parentComponentBoundElementIndex = parentComponentLocation.boundElementIndex;
    }
    var hostView = this._createViewRecurse(hostProtoView);
    this._utils.attachAndHydrateInPlaceHostView(parentComponentHostView, parentComponentBoundElementIndex, renderLocation, hostView);
    this._viewHydrateRecurse(hostView);
    return new DirectDomRenderViewRef(hostView);
  }

  destroyInPlaceHostView(parentComponentLocation:RenderElementRef, hostViewRef:RenderViewRef) {
    var hostView = internalView(hostViewRef);
    var parentView = null;
    if (isPresent(parentComponentLocation)) {
      parentView = internalView(parentComponentLocation.parentView).componentChildViews[parentComponentLocation.boundElementIndex];
    }
    this._viewDehydrateRecurse(hostView);
    this._utils.detachInPlaceHostView(parentView, hostView);
    this._destroyView(hostView);
  }

  createViewInContainer(viewContainerLocation:RenderElementRef, atIndex:number, protoViewRef:RenderProtoViewRef) {
    var protoView = internalProtoView(protoViewRef);
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;

    var view = this._createViewRecurse(protoView);

    this._utils.attachViewInContainer(parentView, boundElementIndex, atIndex, view);
    this._utils.hydrateViewInContainer(parentView, boundElementIndex, atIndex);
    this._viewHydrateRecurse(view);
    return new DirectDomRenderViewRef(view);
  }

  destroyViewInContainer(viewContainerLocation:RenderElementRef, atIndex:number) {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._viewDehydrateRecurse(view);
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._destroyView(view);
  }

  attachViewInContainer(viewContainerLocation:RenderElementRef, atIndex:number, viewRef:RenderViewRef) {
    var view = internalView(viewRef);
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    this._utils.attachViewInContainer(parentView, boundElementIndex, atIndex, view);
  }

  detachViewInContainer(viewContainerLocation:RenderElementRef, atIndex:number):RenderViewRef {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    return new DirectDomRenderViewRef(view);
  }

  _createViewRecurse(protoView:RenderProtoView) {
    var view = this._viewPool.getView(protoView);
    if (isBlank(view)) {
      view = this._utils.createView(protoView);
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

  _destroyView(view:RenderView) {
    this._viewPool.returnView(view);
  }

  _viewHydrateRecurse(
      view:RenderView) {
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i].hasStaticComponent()) {
        this._utils.hydrateComponentView(view, i);
        this._viewHydrateRecurse(view.componentChildViews[i]);
      }
    }
  }

  _viewDehydrateRecurse(view:RenderView) {
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
  }

}
