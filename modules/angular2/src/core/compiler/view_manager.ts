import {Injector, Binding, Injectable} from 'angular2/di';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import {ElementRef} from './element_ref';
import {ProtoViewRef, ViewRef, internalView, internalProtoView} from './view_ref';
import {ViewContainerRef} from './view_container_ref';
import {Renderer, RenderViewRef} from 'angular2/src/render/api';
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
  constructor(public _viewPool: AppViewPool, public _viewListener: AppViewListener,
              public _utils: AppViewManagerUtils, public _renderer: Renderer) {}

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
    var componentView = this._createPooledView(componentProtoView);
    this._renderer.attachComponentView(hostView.render, boundElementIndex, componentView.render);
    this._utils.attachComponentView(hostView, boundElementIndex, componentView);
    this._utils.hydrateDynamicComponentInElementInjector(hostView, boundElementIndex,
                                                         componentBinding, injector);
    this._utils.hydrateComponentView(hostView, boundElementIndex);
    this._viewHydrateRecurse(componentView);

    return new ViewRef(componentView);
  }

  createRootHostView(hostProtoViewRef: ProtoViewRef, overrideSelector: string,
                     injector: Injector): ViewRef {
    var hostProtoView = internalProtoView(hostProtoViewRef);
    var hostElementSelector = overrideSelector;
    if (isBlank(hostElementSelector)) {
      hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
    }
    var renderView = this._renderer.createRootHostView(hostProtoView.render, hostElementSelector);
    var hostView = this._utils.createView(hostProtoView, renderView, this, this._renderer);
    this._renderer.setEventDispatcher(hostView.render, hostView);
    this._createViewRecurse(hostView);
    this._viewListener.viewCreated(hostView);

    this._utils.hydrateRootHostView(hostView, injector);
    this._viewHydrateRecurse(hostView);
    return new ViewRef(hostView);
  }

  destroyRootHostView(hostViewRef: ViewRef) {
    // Note: Don't detach the hostView as we want to leave the
    // root element in place. Also don't put the hostView into the view pool
    // as it is depending on the element for which it was created.
    var hostView = internalView(hostViewRef);
    // We do want to destroy the component view though.
    this._viewDehydrateRecurse(hostView, true);
    this._renderer.destroyView(hostView.render);
    this._viewListener.viewDestroyed(hostView);
  }

  createFreeHostView(parentComponentLocation: ElementRef, hostProtoViewRef: ProtoViewRef,
                     injector: Injector): ViewRef {
    var hostProtoView = internalProtoView(hostProtoViewRef);
    var hostView = this._createPooledView(hostProtoView);
    var parentComponentHostView = internalView(parentComponentLocation.parentView);
    var parentComponentBoundElementIndex = parentComponentLocation.boundElementIndex;
    this._utils.attachAndHydrateFreeHostView(parentComponentHostView,
                                             parentComponentBoundElementIndex, hostView, injector);
    this._viewHydrateRecurse(hostView);
    return new ViewRef(hostView);
  }

  destroyFreeHostView(parentComponentLocation: ElementRef, hostViewRef: ViewRef) {
    var hostView = internalView(hostViewRef);
    var parentView = internalView(parentComponentLocation.parentView)
                         .componentChildViews[parentComponentLocation.boundElementIndex];
    this._destroyFreeHostView(parentView, hostView);
  }

  createFreeEmbeddedView(location: ElementRef, protoViewRef: ProtoViewRef,
                         injector: Injector = null): ViewRef {
    var protoView = internalProtoView(protoViewRef);
    var parentView = internalView(location.parentView);
    var boundElementIndex = location.boundElementIndex;

    var view = this._createPooledView(protoView);
    this._utils.attachAndHydrateFreeEmbeddedView(parentView, boundElementIndex, view, injector);
    this._viewHydrateRecurse(view);
    return new ViewRef(view);
  }

  destroyFreeEmbeddedView(location: ElementRef, viewRef: ViewRef) {
    var parentView = internalView(location.parentView);
    var boundElementIndex = location.boundElementIndex;
    this._destroyFreeEmbeddedView(parentView, boundElementIndex, internalView(viewRef));
  }

  destroyDynamicComponent(location: ElementRef) {
    var hostView = internalView(location.parentView);
    var ei = hostView.elementInjectors[location.boundElementIndex];
    var componentView = hostView.componentChildViews[location.boundElementIndex];
    ei.destroyDynamicComponent();
    this._destroyComponentView(hostView, location.boundElementIndex, componentView);
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

    var view = this._createPooledView(protoView);

    this._renderer.attachViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    this._utils.attachViewInContainer(parentView, boundElementIndex, contextView,
                                      contextBoundElementIndex, atIndex, view);
    this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView,
                                       contextBoundElementIndex, atIndex, injector);
    this._viewHydrateRecurse(view);
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
    this._renderer.attachViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    return viewRef;
  }

  detachViewInContainer(viewContainerLocation: ElementRef, atIndex: number): ViewRef {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.detachViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    return new ViewRef(view);
  }

  _createPooledView(protoView: viewModule.AppProtoView): viewModule.AppView {
    var view = this._viewPool.getView(protoView);
    if (isBlank(view)) {
      view = this._utils.createView(protoView, this._renderer.createView(protoView.render), this,
                                    this._renderer);
      this._renderer.setEventDispatcher(view.render, view);
      this._createViewRecurse(view);
      this._viewListener.viewCreated(view);
    }
    return view;
  }

  _createViewRecurse(view: viewModule.AppView) {
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (binder.hasStaticComponent()) {
        var childView = this._createPooledView(binder.nestedProtoView);
        this._renderer.attachComponentView(view.render, binderIdx, childView.render);
        this._utils.attachComponentView(view, binderIdx, childView);
      }
    }
  }

  _destroyPooledView(view: viewModule.AppView) {
    var wasReturned = this._viewPool.returnView(view);
    if (!wasReturned) {
      this._renderer.destroyView(view.render);
      this._viewListener.viewDestroyed(view);
    }
  }

  _destroyViewInContainer(parentView, boundElementIndex, atIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._viewDehydrateRecurse(view, false);
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.detachViewInContainer(parentView.render, boundElementIndex, atIndex,
                                         view.render);
    this._destroyPooledView(view);
  }

  _destroyComponentView(hostView, boundElementIndex, componentView) {
    this._viewDehydrateRecurse(componentView, false);
    this._renderer.detachComponentView(hostView.render, boundElementIndex, componentView.render);
    this._utils.detachComponentView(hostView, boundElementIndex);
    this._destroyPooledView(componentView);
  }

  _destroyFreeHostView(parentView, hostView) {
    this._viewDehydrateRecurse(hostView, true);
    this._renderer.detachFreeView(hostView.render);
    this._utils.detachFreeHostView(parentView, hostView);
    this._destroyPooledView(hostView);
  }

  _destroyFreeEmbeddedView(parentView, boundElementIndex, view) {
    this._viewDehydrateRecurse(view, false);
    this._renderer.detachFreeView(view.render);
    this._utils.detachFreeEmbeddedView(parentView, boundElementIndex, view);
    this._destroyPooledView(view);
  }

  _viewHydrateRecurse(view: viewModule.AppView) {
    this._renderer.hydrateView(view.render);

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i].hasStaticComponent()) {
        this._utils.hydrateComponentView(view, i);
        this._viewHydrateRecurse(view.componentChildViews[i]);
      }
    }
  }

  _viewDehydrateRecurse(view: viewModule.AppView, forceDestroyComponents) {
    this._utils.dehydrateView(view);
    this._renderer.dehydrateView(view.render);
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; i++) {
      var componentView = view.componentChildViews[i];
      if (isPresent(componentView)) {
        if (binders[i].hasDynamicComponent() || forceDestroyComponents) {
          this._destroyComponentView(view, i, componentView);
        } else {
          this._viewDehydrateRecurse(componentView, false);
        }
      }
      var vc = view.viewContainers[i];
      if (isPresent(vc)) {
        for (var j = vc.views.length - 1; j >= 0; j--) {
          this._destroyViewInContainer(view, i, j);
        }
        for (var j = vc.freeViews.length - 1; j >= 0; j--) {
          this._destroyFreeEmbeddedView(view, i, j);
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
