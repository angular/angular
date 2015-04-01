import * as ldModule from './light_dom';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';

class ContentStrategy {
  nodes:List;
  insert(nodes:List){}
}

/**
 * An implementation of the content tag that is used by transcluding components.
 * It is used when the content tag is not a direct child of another component,
 * and thus does not affect redistribution.
 */
class RenderedContent extends ContentStrategy {
  beginScript;
  endScript;

  constructor(contentEl) {
    super();
    this.beginScript = contentEl;
    this.endScript = DOM.nextSibling(this.beginScript);
    this.nodes = [];
  }

  // Inserts the nodes in between the start and end scripts.
  // Previous content is removed.
  insert(nodes:List) {
    this.nodes = nodes;
    DOM.insertAllBefore(this.endScript, nodes);
    this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
  }

  _removeNodesUntil(node) {
    var p = DOM.parentElement(this.beginScript);
    for (var next = DOM.nextSibling(this.beginScript);
         next !== node;
         next = DOM.nextSibling(this.beginScript)) {
      DOM.removeChild(p, next);
    }
  }
}

/**
 * An implementation of the content tag that is used by transcluding components.
 * It is used when the content tag is a direct child of another component,
 * and thus does not get rendered but only affect the distribution of its parent component.
 */
class IntermediateContent extends ContentStrategy {
  destinationLightDom:ldModule.LightDom;

  constructor(destinationLightDom:ldModule.LightDom) {
    super();
    this.nodes = [];
    this.destinationLightDom = destinationLightDom;
  }

  insert(nodes:List) {
    this.nodes = nodes;
    this.destinationLightDom.redistribute();
  }
}


export class Content {
  select:string;
  _strategy:ContentStrategy;
  contentStartElement;

  constructor(contentStartEl, selector:string) {
    this.select = selector;
    this.contentStartElement = contentStartEl;
    this._strategy = null;
  }

  hydrate(destinationLightDom:ldModule.LightDom) {
    this._strategy = isPresent(destinationLightDom) ?
      new IntermediateContent(destinationLightDom) :
      new RenderedContent(this.contentStartElement);
  }

  dehydrate() {
    this._strategy = null;
  }

  nodes():List {
    return this._strategy.nodes;
  }

  insert(nodes:List) {
    this._strategy.insert(nodes);
  }
}
