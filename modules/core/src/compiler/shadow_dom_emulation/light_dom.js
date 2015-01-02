import {Element, Node, DOM} from 'facade/dom';
import {List, ListWrapper} from 'facade/collection';
import {isBlank, isPresent} from 'facade/lang';

import {View} from '../view';
import {ElementInjector} from '../element_injector';
import {ViewPort} from '../viewport';
import {Content} from './content_tag';

export class SourceLightDom {}
export class DestinationLightDom {}

// TODO: LightDom should implement SourceLightDom and DestinationLightDom
// once interfaces are supported
export class LightDom {
  lightDomView:View;
  shadowDomView:View;
  roots:List<Node>;

  constructor(lightDomView:View, shadowDomView:View, element:Element) {
    this.lightDomView = lightDomView;
    this.shadowDomView = shadowDomView;
    this.roots = DOM.childNodesAsList(element);
    DOM.clearNodes(element);
  }

  redistribute() {
    redistributeNodes(this.contentTags(), this.expandedDomNodes());
  }

  contentTags(): List<Content> {
    return this._collectAllContentTags(this.shadowDomView, []);
  }

  _collectAllContentTags(item, acc:List<Content>):List<Content> {
    ListWrapper.forEach(item.elementInjectors, (ei) => {
      if (ei.hasDirective(Content)) {
        ListWrapper.push(acc, ei.get(Content));

      } else if (ei.hasPreBuiltObject(ViewPort)) {
        var vp = ei.get(ViewPort);
        ListWrapper.forEach(vp.contentTagContainers(), (c) => {
          this._collectAllContentTags(c, acc);
        });
      }
    });
    return acc;
  }

  expandedDomNodes():List {
    var res = [];
    ListWrapper.forEach(this.roots, (root) => {
      // TODO: vsavkin calculcate this info statically when creating light dom
      var viewPort = this.lightDomView.getViewPortByTemplateElement(root);
      if (isPresent(viewPort)) {
        res = ListWrapper.concat(res, viewPort.nodes());
      } else {
        ListWrapper.push(res, root);
      }
    });
    return res;
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
