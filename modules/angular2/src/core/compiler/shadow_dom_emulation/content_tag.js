import {Decorator} from '../../annotations/annotations';
import {SourceLightDom, DestinationLightDom, LightDom} from './light_dom';
import {DomOpQueue} from 'angular2/src/core/dom/op_queue';
import {Inject} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {NgElement} from 'angular2/src/core/dom/element';

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
  static _lazyScriptTemplate;
  beginScript;
  endScript;
  _domQueue: DomOpQueue;

  constructor(contentEl, domQueue: DomOpQueue) {
    super();
    this._domQueue = domQueue;
    this._domQueue.push(() => {
      this._replaceContentElementWithScriptTags(contentEl);
    });
    this.nodes = [];
  }

  _scriptTemplate() {
    if (!isPresent(RenderedContent._lazyScriptTemplate)) {
      RenderedContent._lazyScriptTemplate = DOM.createScriptTag('type', 'ng/content');
    }
    return RenderedContent._lazyScriptTemplate;
  }

  // Inserts the nodes in between the start and end scripts.
  // Previous content is removed.
  insert(nodes:List) {
    this.nodes = ListWrapper.clone(nodes);
    this._domQueue.push(() => {
      DOM.insertAllBefore(this.endScript, this.nodes);
      this._removeNodesUntil(ListWrapper.isEmpty(this.nodes) ? this.endScript : this.nodes[0]);
    });
  }

  // Replaces the content tag with a pair of script tags
  _replaceContentElementWithScriptTags(contentEl) {
    this.beginScript = DOM.clone(this._scriptTemplate());
    this.endScript = DOM.clone(this._scriptTemplate());

    DOM.insertBefore(contentEl, this.beginScript);
    DOM.insertBefore(contentEl, this.endScript);
    DOM.removeChild(DOM.parentElement(contentEl), contentEl);
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
  destinationLightDom:LightDom;
  _domQueue: DomOpQueue;
  constructor(destinationLightDom:LightDom, domQueue: DomOpQueue) {
    super();
    this.destinationLightDom = destinationLightDom;
    this.nodes = [];
    this._domQueue = domQueue;
  }

  insert(nodes:List) {
    this.nodes = nodes;
    this.destinationLightDom.redistribute();
  }
}


@Decorator({
  selector: 'content'
})
export class Content {
  select:string;
  _strategy:ContentStrategy;

  constructor(@Inject(DestinationLightDom) destinationLightDom, contentEl:NgElement, domQueue: DomOpQueue) {
    this.select = contentEl.getAttribute('select');
    this._strategy = isPresent(destinationLightDom) ?
      new IntermediateContent(destinationLightDom, domQueue) :
      new RenderedContent(contentEl.domElement, domQueue);
  }

  nodes():List {
    return this._strategy.nodes;
  }

  insert(nodes:List) {
    this._strategy.insert(nodes);
  }
}
