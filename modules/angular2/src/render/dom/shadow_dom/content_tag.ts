import * as ldModule from './light_dom';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
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
    this.nodes = [];
  }

  // Inserts the nodes in between the start and end scripts.
  // Previous content is removed.
  insert(nodes: List</*node*/ any>) {
    this.nodes = nodes;

    if (isBlank(this.endScript)) {
      // On first invocation, we need to create the end marker
      this.endScript = DOM.createScriptTag('type', 'ng/contentEnd');
      DOM.insertAfter(this.beginScript, this.endScript);
    } else {
      // On subsequent invocations, only remove all the nodes between the start end end markers
      this._removeNodes();
    }

    DOM.insertAllBefore(this.endScript, nodes);
  }

  _removeNodes() {
    for (var node = DOM.nextSibling(this.beginScript); node !== this.endScript;
         node = DOM.nextSibling(this.beginScript)) {
      DOM.remove(node);
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
