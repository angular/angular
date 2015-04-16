import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import * as viewModule from './view';
import * as ldModule from '../shadow_dom/light_dom';

export class ViewContainer {
  templateElement;
  views: List<viewModule.RenderView>;
  lightDom: ldModule.LightDom;
  hostLightDom: ldModule.LightDom;
  hydrated: boolean;

  constructor(templateElement) {
    this.templateElement = templateElement;

    // The order in this list matches the DOM order.
    this.views = [];
    this.hostLightDom = null;
    this.hydrated = false;
  }

  get(index: number): viewModule.RenderView {
    return this.views[index];
  }

  size() {
    return this.views.length;
  }

  _siblingToInsertAfter(index: number) {
    if (index == 0) return this.templateElement;
    return ListWrapper.last(this.views[index - 1].rootNodes);
  }

  _checkHydrated() {
    if (!this.hydrated) throw new BaseException(
        'Cannot change dehydrated ViewContainer');
  }

  clear() {
    this._checkHydrated();
    for (var i=this.views.length-1; i>=0; i--) {
      this.detach(i);
    }
    if (isPresent(this.lightDom)) {
      this.lightDom.redistribute();
    }
  }

  insert(view, atIndex=-1): viewModule.RenderView {
    this._checkHydrated();
    if (atIndex == -1) atIndex = this.views.length;
    ListWrapper.insert(this.views, atIndex, view);

    if (isBlank(this.lightDom)) {
      ViewContainer.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
    } else {
      this.lightDom.redistribute();
    }
    // new content tags might have appeared, we need to redistribute.
    if (isPresent(this.hostLightDom)) {
      this.hostLightDom.redistribute();
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
    ListWrapper.removeAt(this.views, atIndex);
    if (isBlank(this.lightDom)) {
      ViewContainer.removeViewNodes(detachedView);
    } else {
      this.lightDom.redistribute();
    }
    // content tags might have disappeared we need to do redistribution.
    if (isPresent(this.hostLightDom)) {
      this.hostLightDom.redistribute();
    }
    return detachedView;
  }

  contentTagContainers() {
    return this.views;
  }

  nodes():List {
    var r = [];
    for (var i = 0; i < this.views.length; ++i) {
      r = ListWrapper.concat(r, this.views[i].rootNodes);
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
