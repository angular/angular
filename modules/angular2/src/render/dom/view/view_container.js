import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import * as viewModule from './view';
import * as ldModule from '../shadow_dom/light_dom';
import * as vfModule from './view_factory';

export class ViewContainer {
  _viewFactory: vfModule.ViewFactory;
  templateElement;
  _views: List<viewModule.View>;
  _lightDom: ldModule.LightDom;
  _hostLightDom: ldModule.LightDom;
  _hydrated: boolean;

  constructor(viewFactory: vfModule.ViewFactory,
              templateElement) {
    this._viewFactory = viewFactory;
    this.templateElement = templateElement;

    // The order in this list matches the DOM order.
    this._views = [];
    this._hostLightDom = null;
    this._hydrated = false;
  }

  hydrate(destLightDom: ldModule.LightDom, hostLightDom: ldModule.LightDom) {
    this._hydrated = true;
    this._hostLightDom = hostLightDom;
    this._lightDom = destLightDom;
  }

  dehydrate() {
    if (isBlank(this._lightDom)) {
      for (var i = this._views.length - 1; i >= 0; i--) {
        var view = this._views[i];
        ViewContainer.removeViewNodes(view);
        this._viewFactory.returnView(view);
      }
      this._views = [];
    } else {
      for (var i=0; i<this._views.length; i++) {
        var view = this._views[i];
        this._viewFactory.returnView(view);
      }
      this._views = [];
      this._lightDom.redistribute();
    }

    this._hostLightDom = null;
    this._lightDom = null;
    this._hydrated = false;
  }

  get(index: number): viewModule.View {
    return this._views[index];
  }

  size() {
    return this._views.length;
  }

  _siblingToInsertAfter(index: number) {
    if (index == 0) return this.templateElement;
    return ListWrapper.last(this._views[index - 1].rootNodes);
  }

  _checkHydrated() {
    if (!this._hydrated) throw new BaseException(
        'Cannot change dehydrated ViewContainer');
  }

  insert(view, atIndex=-1): viewModule.View {
    if (!view.hydrated()) {
      view.hydrate(this._hostLightDom);
    }
    if (atIndex == -1) atIndex = this._views.length;
    ListWrapper.insert(this._views, atIndex, view);

    if (isBlank(this._lightDom)) {
      ViewContainer.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
    } else {
      this._lightDom.redistribute();
    }
    // new content tags might have appeared, we need to redistribute.
    if (isPresent(this._hostLightDom)) {
      this._hostLightDom.redistribute();
    }
    return view;
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex:number) {
    this._checkHydrated();
    var detachedView = this.get(atIndex);
    ListWrapper.removeAt(this._views, atIndex);
    if (isBlank(this._lightDom)) {
      ViewContainer.removeViewNodes(detachedView);
    } else {
      this._lightDom.redistribute();
    }
    // content tags might have disappeared we need to do redistribution.
    if (isPresent(this._hostLightDom)) {
      this._hostLightDom.redistribute();
    }
    return detachedView;
  }

  contentTagContainers() {
    return this._views;
  }

  nodes():List {
    var r = [];
    for (var i = 0; i < this._views.length; ++i) {
      r = ListWrapper.concat(r, this._views[i].rootNodes);
    }
    return r;
  }

  static moveViewNodesAfterSibling(sibling, view) {
    for (var i = view.rootNodes.length - 1; i >= 0; --i) {
      DOM.insertAfter(sibling, view.rootNodes[i]);
    }
  }

  static removeViewNodes(view) {
    var len = view.rootNodes.length;
    if (len == 0) return;
    var parent = view.rootNodes[0].parentNode;
    for (var i = len - 1; i >= 0; --i) {
      DOM.removeChild(parent, view.rootNodes[i]);
    }
  }
}
