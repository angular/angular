import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import * as eiModule from 'angular2/src/core/compiler/element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import * as renderApi from 'angular2/src/render/api';
import * as viewModule from './view';
import * as vfModule from './view_factory';

/**
 * @publicModule angular2/template
 */
export class ViewContainer {
  render:renderApi.ViewContainerRef;
  viewFactory: vfModule.ViewFactory;
  parentView: viewModule.AppView;
  defaultProtoView: viewModule.AppProtoView;
  _views: List<viewModule.AppView>;
  elementInjector: eiModule.ElementInjector;
  appInjector: Injector;
  hostElementInjector: eiModule.ElementInjector;

  constructor(viewFactory:vfModule.ViewFactory,
              parentView: viewModule.AppView,
              defaultProtoView: viewModule.AppProtoView,
              elementInjector: eiModule.ElementInjector) {
    this.viewFactory = viewFactory;
    this.render = null;
    this.parentView = parentView;
    this.defaultProtoView = defaultProtoView;
    this.elementInjector = elementInjector;

    // The order in this list matches the DOM order.
    this._views = [];
    this.appInjector = null;
    this.hostElementInjector = null;
  }

  internalHydrateRecurse(render:renderApi.ViewContainerRef, appInjector: Injector, hostElementInjector: eiModule.ElementInjector) {
    this.render = render;
    this.appInjector = appInjector;
    this.hostElementInjector = hostElementInjector;
  }

  internalDehydrateRecurse() {
    this.appInjector = null;
    this.hostElementInjector = null;
    this.render = null;
    // Note: We don't call clear here,
    // as we don't want to change the render side
    // (i.e. don't deattach views on the render side),
    // as the render side does its own recursion.
    for (var i = this._views.length - 1; i >= 0; i--) {
      var view = this._views[i];
      view.changeDetector.remove();
      this._unlinkElementInjectors(view);
      view.internalDehydrateRecurse();
      this.viewFactory.returnView(view);
    }
    this._views = [];
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
  create(atIndex=-1): viewModule.AppView {
    if (!this.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated ViewContainer');
    var newView = this.viewFactory.getView(this.defaultProtoView);
    // insertion must come before hydration so that element injector trees are attached.
    this._insertWithoutRender(newView, atIndex);
    // hydration must come before changing the render side,
    // as it acquires the render views.
    newView.hydrate(this.appInjector, this.hostElementInjector,
      this.parentView.context, this.parentView.locals);
    this.defaultProtoView.renderer.insertViewIntoContainer(this.render, newView.render, atIndex);

    return newView;
  }

  insert(view, atIndex=-1): viewModule.AppView {
    this._insertWithoutRender(view, atIndex);
    this.defaultProtoView.renderer.insertViewIntoContainer(this.render, view.render, atIndex);
    return view;
  }

  _insertWithoutRender(view, atIndex=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length;
    ListWrapper.insert(this._views, atIndex, view);
    this.parentView.changeDetector.addChild(view.changeDetector);
    this._linkElementInjectors(this._siblingInjectorToLinkAfter(atIndex), view);

    return view;
  }

  remove(atIndex=-1) {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var view = this.detach(atIndex);
    view.dehydrate();
    this.viewFactory.returnView(view);
    // view is intentionally not returned to the client.
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var detachedView = this.get(atIndex);
    ListWrapper.removeAt(this._views, atIndex);
    this.defaultProtoView.renderer.detachViewFromContainer(this.render, atIndex);
    detachedView.changeDetector.remove();
    this._unlinkElementInjectors(detachedView);
    return detachedView;
  }

  contentTagContainers() {
    return this._views;
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
