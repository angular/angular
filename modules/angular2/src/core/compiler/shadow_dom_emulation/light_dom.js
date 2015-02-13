import {Element, Node, DOM} from 'angular2/src/facade/dom';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {View} from '../view';
import {ElementInjector} from '../element_injector';
import {ViewContainer} from '../view_container';
import {Content} from './content_tag';

export class SourceLightDom {}
export class DestinationLightDom {}


class _Root {
  node:Node;
  injector:ElementInjector;

  constructor(node, injector) {
    this.node = node;
    this.injector = injector;
  }
}

// TODO: LightDom should implement SourceLightDom and DestinationLightDom
// once interfaces are supported
export class LightDom {
  // The light DOM of the element is enclosed inside the lightDomView
  lightDomView:View;
  // The shadow DOM
  shadowDomView:View;
  // The nodes of the light DOM
  nodes:List<Node>;
  roots:List<_Root>;

  constructor(lightDomView:View, shadowDomView:View, element:Element) {
    this.lightDomView = lightDomView;
    this.shadowDomView = shadowDomView;
    this.nodes = DOM.childNodesAsList(element);
    this.roots = null;
  }

  redistribute() {
    var tags = this.contentTags();
    if (tags.length > 0) {
      redistributeNodes(tags, this.expandedDomNodes());
    }
  }

  contentTags(): List<Content> {
    return this._collectAllContentTags(this.shadowDomView, []);
  }

  // Collects the Content directives from the view and all its child views
  _collectAllContentTags(view: View, acc:List<Content>):List<Content> {
    var eis = view.elementInjectors;
    for (var i = 0; i < eis.length; ++i) {
      var ei = eis[i];
      if (isBlank(ei)) continue;

      if (ei.hasDirective(Content)) {
        ListWrapper.push(acc, ei.get(Content));

      } else if (ei.hasPreBuiltObject(ViewContainer)) {
        var vc = ei.get(ViewContainer);
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
      var ei = root.injector;

      if (isPresent(ei) && ei.hasPreBuiltObject(ViewContainer)) {
        var vc = root.injector.get(ViewContainer);
        res = ListWrapper.concat(res, vc.nodes());

      } else if (isPresent(ei) && ei.hasDirective(Content)) {
        var content = root.injector.get(Content);
        res = ListWrapper.concat(res, content.nodes());

      } else {
        ListWrapper.push(res, root.node);
      }
    }
    return res;
  }

  // Returns a list of Roots for all the nodes of the light DOM.
  // The Root object contains the DOM node and its corresponding injector (could be null).
  _roots() {
    if (isPresent(this.roots)) return this.roots;

    var viewInj = this.lightDomView.elementInjectors;
    this.roots = ListWrapper.map(this.nodes, (n) =>
      new _Root(n, ListWrapper.find(viewInj, (inj) => inj.forElement(n))));

    return this.roots;
  }
}

// Projects the light DOM into the shadow DOM
function redistributeNodes(contents:List<Content>, nodes:List<Node>) {
  for (var i = 0; i < contents.length; ++i) {
    var content = contents[i];
    var select = content.select;
    var matchSelector = (n) => DOM.elementMatches(n, select);

    if (isBlank(select)) {
      content.insert(nodes);
      ListWrapper.clear(nodes);

    } else {
      var matchingNodes = ListWrapper.filter(nodes, matchSelector);
      content.insert(matchingNodes);
      ListWrapper.removeAll(nodes, matchingNodes);
    }
  }
}
