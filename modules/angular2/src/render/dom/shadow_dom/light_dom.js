import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import * as viewModule from '../view/view';
import {Content} from './content_tag';

export class DestinationLightDom {}

class _Root {
  node;
  boundElementIndex:number;

  constructor(node, boundElementIndex) {
    this.node = node;
    this.boundElementIndex = boundElementIndex;
  }
}

// TODO: LightDom should implement DestinationLightDom
// once interfaces are supported
export class LightDom {
  // The light DOM of the element is enclosed inside the lightDomView
  lightDomView:viewModule.RenderView;
  // The shadow DOM
  shadowDomView:viewModule.RenderView;
  // The nodes of the light DOM
  nodes:List;
  roots:List<_Root>;

  constructor(lightDomView:viewModule.RenderView, shadowDomView:viewModule.RenderView, element) {
    this.lightDomView = lightDomView;
    this.shadowDomView = shadowDomView;
    this.nodes = DOM.childNodesAsList(element);

    this.roots = null;
  }

  redistribute() {
    redistributeNodes(this.contentTags(), this.expandedDomNodes());
  }

  contentTags(): List<Content> {
    return this._collectAllContentTags(this.shadowDomView, []);
  }

  // Collects the Content directives from the view and all its child views
  _collectAllContentTags(view: viewModule.RenderView, acc:List<Content>):List<Content> {
    var contentTags = view.contentTags;
    var vcs = view.viewContainers;
    for (var i=0; i<vcs.length; i++) {
      var vc = vcs[i];
      var contentTag = contentTags[i];
      if (isPresent(contentTag)) {
        ListWrapper.push(acc, contentTag);
      }
      if (isPresent(vc)) {
        ListWrapper.forEach(vc.contentTagContainers(), (view) => {
          this._collectAllContentTags(view, acc);
        });
      }
    }
    return acc;
  }

  // Collects the nodes of the light DOM by merging:
  // - nodes from enclosed ViewContainers,
  // - nodes from enclosed content tags,
  // - plain DOM nodes
  expandedDomNodes():List {
    var res = [];

    var roots = this._roots();
    for (var i = 0; i < roots.length; ++i) {

      var root = roots[i];
      if (isPresent(root.boundElementIndex)) {
        var vc = this.lightDomView.viewContainers[root.boundElementIndex];
        var content = this.lightDomView.contentTags[root.boundElementIndex];
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
  // The Root object contains the DOM node and its corresponding boundElementIndex
  _roots() {
    if (isPresent(this.roots)) return this.roots;

    var boundElements = this.lightDomView.boundElements;

    this.roots = ListWrapper.map(this.nodes, (n) => {
      var boundElementIndex = null;
      for (var i=0; i<boundElements.length; i++) {
        var boundEl = boundElements[i];
        if (isPresent(boundEl) && boundEl === n) {
          boundElementIndex = i;
          break;
        }
      }
      return new _Root(n, boundElementIndex);
    });

    return this.roots;
  }
}

// Projects the light DOM into the shadow DOM
function redistributeNodes(contents:List<Content>, nodes:List) {
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
