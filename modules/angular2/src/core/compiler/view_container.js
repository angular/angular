import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import * as eiModule from 'angular2/src/core/compiler/element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import * as renderApi from 'angular2/src/render/api';
import * as viewModule from './view';
import * as vfModule from './view_factory';
import * as vhModule from './view_hydrator';
import {Renderer} from 'angular2/src/render/api';

/**
 * @exportedAs angular2/view
 */
export class ViewContainer {
  viewFactory: vfModule.ViewFactory;
  viewHydrator: vhModule.AppViewHydrator;
  renderer: Renderer;

  render:renderApi.ViewContainerRef;
  parentView: viewModule.AppView;
  defaultProtoView: viewModule.AppProtoView;
  _views: List<viewModule.AppView>;
  elementInjector: eiModule.ElementInjector;
  appInjector: Injector;
  hostElementInjector: eiModule.ElementInjector;

  constructor(viewFactory:vfModule.ViewFactory,
              renderer: Renderer,
              parentView: viewModule.AppView,
              defaultProtoView: viewModule.AppProtoView,
              elementInjector: eiModule.ElementInjector) {
    this.viewFactory = viewFactory;
    this.viewHydrator = null;
    this.renderer = renderer;
    this.render = null;
    this.parentView = parentView;
    this.defaultProtoView = defaultProtoView;
    this.elementInjector = elementInjector;

    // The order in this list matches the DOM order.
    this._views = [];
    this.appInjector = null;
    this.hostElementInjector = null;
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
    return isPresent(this.appInjector);
  }

  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  create(atIndex=-1, protoView:viewModule.AppProtoView = null): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length;
    if (!this.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated ViewContainer');
    if (isBlank(protoView)) {
      protoView = this.defaultProtoView;
    }
    var newView = this.viewFactory.getView(protoView);
    // insertion must come before hydration so that element injector trees are attached.
    this._insertInjectors(newView, atIndex);
    this.viewHydrator.hydrateViewInViewContainer(this, atIndex, newView);

    return newView;
  }

  insert(view, atIndex=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length;
    this._insertInjectors(view, atIndex);
    this.parentView.changeDetector.addChild(view.changeDetector);
    this.renderer.insertViewIntoContainer(this.render, atIndex, view.render);
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
    this.viewHydrator.dehydrateViewInViewContainer(this, atIndex, view);
    this._detachInjectors(atIndex);
    this.viewFactory.returnView(view);
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
    this.renderer.detachViewFromContainer(this.render, atIndex);
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
