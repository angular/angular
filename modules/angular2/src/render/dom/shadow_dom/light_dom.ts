import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import * as viewModule from '../view/view';
import * as elModule from '../view/element';
import {Content} from './content_tag';

export class DestinationLightDom {}

class _Root {
  constructor(public node, public boundElement: elModule.DomElement) {}
}

// TODO: LightDom should implement DestinationLightDom
// once interfaces are supported
export class LightDom {
  // The light DOM of the element is enclosed inside the lightDomView
  lightDomView: viewModule.DomView;
  // The shadow DOM
  shadowDomView: viewModule.DomView = null;
  // The nodes of the light DOM
  nodes: List</*node*/ any>;
  private _roots: List<_Root> = null;

  constructor(lightDomView: viewModule.DomView, element) {
    this.lightDomView = lightDomView;
    this.nodes = DOM.childNodesAsList(element);
  }

  attachShadowDomView(shadowDomView: viewModule.DomView) { this.shadowDomView = shadowDomView; }

  detachShadowDomView() { this.shadowDomView = null; }

  redistribute() { redistributeNodes(this.contentTags(), this.expandedDomNodes()); }

  contentTags(): List<Content> {
    if (isPresent(this.shadowDomView)) {
      return this._collectAllContentTags(this.shadowDomView, []);
    } else {
      return [];
    }
  }

  // Collects the Content directives from the view and all its child views
  private _collectAllContentTags(view: viewModule.DomView, acc: List<Content>): List<Content> {
    // Note: exiting early here is important as we call this function for every view
    // that is added, so we have O(n^2) runtime.
    // TODO(tbosch): fix the root problem, see
    // https://github.com/angular/angular/issues/2298
    if (view.proto.transitiveContentTagCount === 0) {
      return acc;
    }
    var els = view.boundElements;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (isPresent(el.contentTag)) {
        ListWrapper.push(acc, el.contentTag);
      }
      if (isPresent(el.viewContainer)) {
        ListWrapper.forEach(el.viewContainer.contentTagContainers(),
                            (view) => { this._collectAllContentTags(view, acc); });
      }
    }
    return acc;
  }

  // Collects the nodes of the light DOM by merging:
  // - nodes from enclosed ViewContainers,
  // - nodes from enclosed content tags,
  // - plain DOM nodes
  expandedDomNodes(): List</*node*/ any> {
    var res = [];

    var roots = this._findRoots();
    for (var i = 0; i < roots.length; ++i) {
      var root = roots[i];
      if (isPresent(root.boundElement)) {
        var vc = root.boundElement.viewContainer;
        var content = root.boundElement.contentTag;
        if (isPresent(vc)) {
          res = ListWrapper.concat(res, vc.nodes());
        } else if (isPresent(content)) {
          res = ListWrapper.concat(res, content.nodes());
        } else {
          ListWrapper.push(res, root.node);
        }
      } else {
        ListWrapper.push(res, root.node);
      }
    }
    return res;
  }

  // Returns a list of Roots for all the nodes of the light DOM.
  // The Root object contains the DOM node and its corresponding boundElement
  private _findRoots() {
    if (isPresent(this._roots)) return this._roots;

    var boundElements = this.lightDomView.boundElements;

    this._roots = ListWrapper.map(this.nodes, (n) => {
      var boundElement = null;
      for (var i = 0; i < boundElements.length; i++) {
        var boundEl = boundElements[i];
        if (isPresent(boundEl) && boundEl.element === n) {
          boundElement = boundEl;
          break;
        }
      }
      return new _Root(n, boundElement);
    });

    return this._roots;
  }
}

// Projects the light DOM into the shadow DOM
function redistributeNodes(contents: List<Content>, nodes: List</*node*/ any>) {
  for (var i = 0; i < contents.length; ++i) {
    var content = contents[i];
    var select = content.select;

    // Empty selector is identical to <content/>
    if (select.length === 0) {
      content.insert(ListWrapper.clone(nodes));
      ListWrapper.clear(nodes);
    } else {
      var matchSelector = (n) => DOM.elementMatches(n, select);
      var matchingNodes = ListWrapper.filter(nodes, matchSelector);
      content.insert(matchingNodes);
      ListWrapper.removeAll(nodes, matchingNodes);
    }
  }
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (isPresent(node.parentNode)) {
      DOM.remove(nodes[i]);
    }
  }
}
