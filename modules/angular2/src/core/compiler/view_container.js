import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import * as eiModule from 'angular2/src/core/compiler/element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import * as viewModule from './view';
import {ViewContainerRef} from 'angular2/src/render/api';

/**
 * @exportedAs angular2/view
 */
export class ViewContainer {
  parentView: viewModule.AppView;
  defaultProtoView: viewModule.AppProtoView;
  _views: List<viewModule.AppView>;
  elementInjector: eiModule.ElementInjector;

  constructor(parentView: viewModule.AppView,
              defaultProtoView: viewModule.AppProtoView,
              elementInjector: eiModule.ElementInjector) {
    this.parentView = parentView;
    this.defaultProtoView = defaultProtoView;
    this.elementInjector = elementInjector;

    // The order in this list matches the DOM order.
    this._views = [];
  }

  getRender() {
    return new ViewContainerRef(this.parentView.render, this.elementInjector.getBoundElementIndex());
  }

  internalClearWithoutRender() {
    for (var i = this._views.length - 1; i >= 0; i--) {
      this._detachInjectors(i);
    }
  }

  clear() {
    for (var i = this._views.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  get(index: number): viewModule.AppView {
    return this._views[index];
  }

  get length() {
    return this._views.length;
  }

  _siblingInjectorToLinkAfter(index: number) {
    if (index == 0) return null;
    return ListWrapper.last(this._views[index - 1].rootElementInjectors)
  }

  hydrated() {
    return this.parentView.hydrated();
  }

  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  create(atIndex=-1, protoView:viewModule.AppProtoView = null, injector:Injector = null): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length;
    if (!this.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated ViewContainer');
    if (isBlank(protoView)) {
      protoView = this.defaultProtoView;
    }
    var newView = this.parentView.viewFactory.getView(protoView);
    // insertion must come before hydration so that element injector trees are attached.
    this._insertInjectors(newView, atIndex);
    this.parentView.viewHydrator.hydrateViewInViewContainer(this, atIndex, newView, injector);

    return newView;
  }

  insert(view, atIndex=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length;
    this._insertInjectors(view, atIndex);
    this.parentView.changeDetector.addChild(view.changeDetector);
    this.parentView.renderer.insertViewIntoContainer(this.getRender(), atIndex, view.render);
    return view;
  }

  _insertInjectors(view, atIndex): viewModule.AppView {
    ListWrapper.insert(this._views, atIndex, view);
    this._linkElementInjectors(this._siblingInjectorToLinkAfter(atIndex), view);

    return view;
  }

  remove(atIndex=-1) {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var view = this._views[atIndex];
    // opposite order as in create
    this.parentView.viewHydrator.dehydrateViewInViewContainer(this, atIndex, view);
    this._detachInjectors(atIndex);
    this.parentView.viewFactory.returnView(view);
    // view is intentionally not returned to the client.
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var detachedView = this._detachInjectors(atIndex);
    detachedView.changeDetector.remove();
    this.parentView.renderer.detachViewFromContainer(this.getRender(), atIndex);
    return detachedView;
  }

  _detachInjectors(atIndex): viewModule.AppView {
    var detachedView = this.get(atIndex);
    ListWrapper.removeAt(this._views, atIndex);
    this._unlinkElementInjectors(detachedView);
    return detachedView;
  }

  _linkElementInjectors(sibling, view) {
    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      view.rootElementInjectors[i].linkAfter(this.elementInjector, sibling);
    }
  }

  _unlinkElementInjectors(view) {
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].unlink();
    }
  }
}
