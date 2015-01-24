import {Element, Node, DOM} from 'facade/dom';
import {List, ListWrapper} from 'facade/collection';
import {isBlank, isPresent} from 'facade/lang';

import {View} from '../view';
import {ElementInjector} from '../element_injector';
import {ViewPort} from '../viewport';
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
  lightDomView:View;
  shadowDomView:View;
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

  _collectAllContentTags(view: View, acc:List<Content>):List<Content> {
    var eis = view.elementInjectors;
    for (var i = 0; i < eis.length; ++i) {
      var ei = eis[i];
      if (isBlank(ei)) continue;

      if (ei.hasDirective(Content)) {
        ListWrapper.push(acc, ei.get(Content));

      } else if (ei.hasPreBuiltObject(ViewPort)) {
        var vp = ei.get(ViewPort);
        ListWrapper.forEach(vp.contentTagContainers(), (view) => {
          this._collectAllContentTags(view, acc);
        });
      }
    }
    return acc;
  }

  expandedDomNodes():List {
    var res = [];

    var roots = this._roots();
    for (var i = 0; i < roots.length; ++i) {

      var root = roots[i];
      var ei = root.injector;

      if (isPresent(ei) && ei.hasPreBuiltObject(ViewPort)) {
        var vp = root.injector.get(ViewPort);
        res = ListWrapper.concat(res, vp.nodes());

      } else if (isPresent(ei) && ei.hasDirective(Content)) {
        var content = root.injector.get(Content);
        res = ListWrapper.concat(res, content.nodes());

      } else {
        ListWrapper.push(res, root.node);
      }
    }
    return res;
  }

  _roots() {
    if (isPresent(this.roots)) return this.roots;

    var viewInj = this.lightDomView.elementInjectors;
    this.roots = ListWrapper.map(this.nodes, (n) =>
      new _Root(n, ListWrapper.find(viewInj, (inj) => inj.forElement(n))));

    return this.roots;
  }
}

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
