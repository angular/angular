import * as ldModule from './light_dom';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';

class ContentStrategy {
  nodes: List</*node*/ any>;
  insert(nodes: List</*node*/ any>) {}
}

/**
 * An implementation of the content tag that is used by transcluding components.
 * It is used when the content tag is not a direct child of another component,
 * and thus does not affect redistribution.
 */
class RenderedContent extends ContentStrategy {
  beginScript: any;
  endScript;

  constructor(contentEl) {
    super();
    this.beginScript = contentEl;
    this.endScript = DOM.nextSibling(this.beginScript);
    this.nodes = [];
  }

  // Inserts the nodes in between the start and end scripts.
  // Previous content is removed.
  insert(nodes: List</*node*/ any>) {
    this.nodes = nodes;
    DOM.insertAllBefore(this.endScript, nodes);
    this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
  }

  _removeNodesUntil(node) {
    var p = DOM.parentElement(this.beginScript);
    for (var next = DOM.nextSibling(this.beginScript); next !== node;
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
  constructor(public destinationLightDom: ldModule.LightDom) {
    super();
    this.nodes = [];
  }

  insert(nodes: List</*node*/ any>) {
    this.nodes = nodes;
    this.destinationLightDom.redistribute();
  }
}


export class Content {
  private _strategy: ContentStrategy = null;

  constructor(public contentStartElement, public select: string) {}

  init(destinationLightDom: ldModule.LightDom) {
    this._strategy = isPresent(destinationLightDom) ? new IntermediateContent(destinationLightDom) :
                                                      new RenderedContent(this.contentStartElement);
  }

  nodes(): List</*node*/ any> { return this._strategy.nodes; }

  insert(nodes: List</*node*/ any>) { this._strategy.insert(nodes); }
}
