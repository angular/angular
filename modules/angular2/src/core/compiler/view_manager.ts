import {Injector, Binding, Injectable, ResolvedBinding} from 'angular2/di';
import {isPresent, isBlank, BaseException} from 'angular2/src/core/facade/lang';
import * as viewModule from './view';
import {ElementRef} from './element_ref';
import {ProtoViewRef, ViewRef, HostViewRef, internalView, internalProtoView} from './view_ref';
import {ViewContainerRef} from './view_container_ref';
import {TemplateRef} from './template_ref';
import {
  Renderer,
  RenderViewRef,
  RenderFragmentRef,
  RenderViewWithFragments,
  ViewType
} from 'angular2/src/core/render/api';
import {AppViewManagerUtils} from './view_manager_utils';
import {AppViewPool} from './view_pool';
import {AppViewListener} from './view_listener';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';

/**
 * Entry point for creating, moving views in the view hierarchy and destroying views.
 * This manager contains all recursion and delegates to helper methods
 * in AppViewManagerUtils and the Renderer, so unit tests get simpler.
 */
@Injectable()
export class AppViewManager {
  /**
   * @private
   */
  constructor(private _viewPool: AppViewPool, private _viewListener: AppViewListener,
              private _utils: AppViewManagerUtils, private _renderer: Renderer) {}

  /**
   * Returns a {@link ViewContainerRef} at the {@link ElementRef} location.
   */
  getViewContainer(location: ElementRef): ViewContainerRef {
    var hostView = internalView(location.parentView);
    return hostView.elementInjectors[location.boundElementIndex].getViewContainerRef();
  }

  /**
   * Return the first child element of the host element view.
   */
  getHostElement(hostViewRef: HostViewRef): ElementRef {
    var hostView = internalView(<ViewRef>hostViewRef);
    if (hostView.proto.type !== ViewType.HOST) {
      throw new BaseException('This operation is only allowed on host views');
    }
    return hostView.elementRefs[hostView.elementOffset];
  }

  /**
   * Returns an ElementRef for the element with the given variable name
   * in the current view.
   *
   * - `hostLocation`: {@link ElementRef} of any element in the View which defines the scope of
   *   search.
   * - `variableName`: Name of the variable to locate.
   * - Returns {@link ElementRef} of the found element or null. (Throws if not found.)
   */
  getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef {
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    var componentView = hostView.getNestedView(boundElementIndex);
    if (isBlank(componentView)) {
      throw new BaseException(`There is no component directive at element ${boundElementIndex}`);
    }
    var binderIdx = componentView.proto.variableLocations.get(variableName);
    if (isBlank(binderIdx)) {
      throw new BaseException(`Could not find variable ${variableName}`);
    }
    return componentView.elementRefs[componentView.elementOffset + binderIdx];
  }

  /**
   * Returns the component instance for a given element.
   *
   * The component is the execution context as seen by an expression at that {@link ElementRef}
   * location.
   */
  getComponent(hostLocation: ElementRef): any {
    var hostView = internalView(hostLocation.parentView);
    var boundElementIndex = hostLocation.boundElementIndex;
    return this._utils.getComponentInstance(hostView, boundElementIndex);
  }

  _createRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#createRootHostView()');
  /**
   * Load component view into existing element.
   *
   * Use this if a host element is already in the DOM and it is necessary to upgrade
   * the element into Angular component by attaching a view but reusing the existing element.
   *
   * - `hostProtoViewRef`: {@link ProtoViewRef} Proto view to use in creating a view for this
   *   component.
   * - `overrideSelector`: (optional) selector to use in locating the existing element to load
   *   the view into. If not specified use the selector in the component definition of the
   *   `hostProtoView`.
   * - injector: {@link Injector} to use as parent injector for the view.
   *
   * See {@link AppViewManager#destroyRootHostView}.
   *
   * ## Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   *
   * }
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `
   *     Parent (<some-component></some-component>)
   *   `
   * })
   * class MyApp {
   *   viewRef: ng.ViewRef;
   *
   *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
   *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoViewRef) => {
   *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
   *     })
   *   }
   *
   *   onDestroy() {
   *     this.appViewManager.destroyRootHostView(this.viewRef);
   *     this.viewRef = null;
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
   * ```
   */
  createRootHostView(hostProtoViewRef: ProtoViewRef, overrideSelector: string,
                     injector: Injector): HostViewRef {
    var s = this._createRootHostViewScope();
    var hostProtoView: viewModule.AppProtoView = internalProtoView(hostProtoViewRef);
    var hostElementSelector = overrideSelector;
    if (isBlank(hostElementSelector)) {
      hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
    }
    var renderViewWithFragments = this._renderer.createRootHostView(
        hostProtoView.mergeMapping.renderProtoViewRef,
        hostProtoView.mergeMapping.renderFragmentCount, hostElementSelector);
    var hostView = this._createMainView(hostProtoView, renderViewWithFragments);

    this._renderer.hydrateView(hostView.render);
    this._utils.hydrateRootHostView(hostView, injector);
    return wtfLeave(s, hostView.ref);
  }

  _destroyRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#destroyRootHostView()');
  /**
   * Remove the View created with {@link AppViewManager#createRootHostView}.
   */
  destroyRootHostView(hostViewRef: HostViewRef) {
    // Note: Don't put the hostView into the view pool
    // as it is depending on the element for which it was created.
    var s = this._destroyRootHostViewScope();
    var hostView = internalView(<ViewRef>hostViewRef);
    this._renderer.detachFragment(hostView.renderFragment);
    this._renderer.dehydrateView(hostView.render);
    this._viewDehydrateRecurse(hostView);
    this._viewListener.viewDestroyed(hostView);
    this._renderer.destroyView(hostView.render);
    wtfLeave(s);
  }

  _createEmbeddedViewInContainerScope: WtfScopeFn =
      wtfCreateScope('AppViewManager#createEmbeddedViewInContainer()');
  /**
   *
   * See {@link AppViewManager#destroyViewInContainer}.
   */
  createEmbeddedViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                                templateRef: TemplateRef): ViewRef {
    var s = this._createEmbeddedViewInContainerScope();
    var protoView = internalProtoView(templateRef.protoViewRef);
    if (protoView.type !== ViewType.EMBEDDED) {
      throw new BaseException('This method can only be called with embedded ProtoViews!');
    }
    return wtfLeave(s, this._createViewInContainer(viewContainerLocation, atIndex, protoView,
                                                   templateRef.elementRef, null));
  }

  _createHostViewInContainerScope: WtfScopeFn =
      wtfCreateScope('AppViewManager#createHostViewInContainer()');
  /**
   *
   * See {@link AppViewManager#destroyViewInContainer}.
   */
  createHostViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                            protoViewRef: ProtoViewRef,
                            imperativelyCreatedInjector: ResolvedBinding[]): HostViewRef {
    var s = this._createHostViewInContainerScope();
    var protoView = internalProtoView(protoViewRef);
    if (protoView.type !== ViewType.HOST) {
      throw new BaseException('This method can only be called with host ProtoViews!');
    }
    return wtfLeave(
        s, this._createViewInContainer(viewContainerLocation, atIndex, protoView,
                                       viewContainerLocation, imperativelyCreatedInjector));
  }

  /**
   *
   * See {@link AppViewManager#destroyViewInContainer}.
   */
  _createViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                         protoView: viewModule.AppProtoView, context: ElementRef,
                         imperativelyCreatedInjector: ResolvedBinding[]): ViewRef {
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var contextView = internalView(context.parentView);
    var contextBoundElementIndex = context.boundElementIndex;
    var embeddedFragmentView = contextView.getNestedView(contextBoundElementIndex);
    var view;
    if (protoView.type === ViewType.EMBEDDED && isPresent(embeddedFragmentView) &&
        !embeddedFragmentView.hydrated()) {
      // Case 1: instantiate the first view of a template that has been merged into a parent
      view = embeddedFragmentView;
      this._attachRenderView(parentView, boundElementIndex, atIndex, view);
    } else {
      // Case 2: instantiate another copy of the template or a host ProtoView.
      // This is a separate case
      // as we only inline one copy of the template into the parent view.
      view = this._createPooledView(protoView);
      this._attachRenderView(parentView, boundElementIndex, atIndex, view);
      this._renderer.hydrateView(view.render);
    }
    this._utils.attachViewInContainer(parentView, boundElementIndex, contextView,
                                      contextBoundElementIndex, atIndex, view);
    this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView,
                                       contextBoundElementIndex, atIndex,
                                       imperativelyCreatedInjector);
    return view.ref;
  }

  _attachRenderView(parentView: viewModule.AppView, boundElementIndex: number, atIndex: number,
                    view: viewModule.AppView) {
    var elementRef = parentView.elementRefs[boundElementIndex];
    if (atIndex === 0) {
      this._renderer.attachFragmentAfterElement(elementRef, view.renderFragment);
    } else {
      var prevView = parentView.viewContainers[boundElementIndex].views[atIndex - 1];
      this._renderer.attachFragmentAfterFragment(prevView.renderFragment, view.renderFragment);
    }
  }

  _destroyViewInContainerScope = wtfCreateScope('AppViewMananger#destroyViewInContainer()');
  /**
   *
   * See {@link AppViewManager#createViewInContainer}.
   */
  destroyViewInContainer(viewContainerLocation: ElementRef, atIndex: number) {
    var s = this._destroyViewInContainerScope();
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    this._destroyViewInContainer(parentView, boundElementIndex, atIndex);
    wtfLeave(s);
  }

  _attachViewInContainerScope = wtfCreateScope('AppViewMananger#attachViewInContainer()');
  /**
   *
   * See {@link AppViewManager#detachViewInContainer}.
   */
  attachViewInContainer(viewContainerLocation: ElementRef, atIndex: number,
                        viewRef: ViewRef): ViewRef {
    var s = this._attachViewInContainerScope();
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
    this._attachRenderView(parentView, boundElementIndex, atIndex, view);
    return wtfLeave(s, viewRef);
  }

  _detachViewInContainerScope = wtfCreateScope('AppViewMananger#detachViewInContainer()');
  /**
   *
   * See {@link AppViewManager#attachViewInContainer}.
   */
  detachViewInContainer(viewContainerLocation: ElementRef, atIndex: number): ViewRef {
    var s = this._detachViewInContainerScope();
    var parentView = internalView(viewContainerLocation.parentView);
    var boundElementIndex = viewContainerLocation.boundElementIndex;
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    this._renderer.detachFragment(view.renderFragment);
    return wtfLeave(s, view.ref);
  }

  _createMainView(protoView: viewModule.AppProtoView,
                  renderViewWithFragments: RenderViewWithFragments): viewModule.AppView {
    var mergedParentView =
        this._utils.createView(protoView, renderViewWithFragments, this, this._renderer);
    this._renderer.setEventDispatcher(mergedParentView.render, mergedParentView);
    this._viewListener.viewCreated(mergedParentView);
    return mergedParentView;
  }

  _createPooledView(protoView: viewModule.AppProtoView): viewModule.AppView {
    var view = this._viewPool.getView(protoView);
    if (isBlank(view)) {
      view = this._createMainView(
          protoView, this._renderer.createView(protoView.mergeMapping.renderProtoViewRef,
                                               protoView.mergeMapping.renderFragmentCount));
    }
    return view;
  }

  _destroyPooledView(view: viewModule.AppView) {
    var wasReturned = this._viewPool.returnView(view);
    if (!wasReturned) {
      this._viewListener.viewDestroyed(view);
      this._renderer.destroyView(view.render);
    }
  }

  _destroyViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                          atIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];

    this._viewDehydrateRecurse(view);
    this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
    if (view.viewOffset > 0) {
      // Case 1: a view that is part of another view.
      // Just detach the fragment
      this._renderer.detachFragment(view.renderFragment);
    } else {
      // Case 2: a view that is not part of another view.
      // dehydrate and destroy it.
      this._renderer.dehydrateView(view.render);
      this._renderer.detachFragment(view.renderFragment);
      this._destroyPooledView(view);
    }
  }

  _viewDehydrateRecurse(view: viewModule.AppView) {
    if (view.hydrated()) {
      this._utils.dehydrateView(view);
    }
    var viewContainers = view.viewContainers;
    var startViewOffset = view.viewOffset;
    var endViewOffset =
        view.viewOffset + view.mainMergeMapping.nestedViewCountByViewIndex[view.viewOffset];
    var elementOffset = view.elementOffset;
    for (var viewIdx = startViewOffset; viewIdx <= endViewOffset; viewIdx++) {
      var currView = view.views[viewIdx];
      for (var binderIdx = 0; binderIdx < currView.proto.elementBinders.length;
           binderIdx++, elementOffset++) {
        var vc = viewContainers[elementOffset];
        if (isPresent(vc)) {
          for (var j = vc.views.length - 1; j >= 0; j--) {
            this._destroyViewInContainer(currView, elementOffset, j);
          }
        }
      }
    }
  }
}
