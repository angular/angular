import {Decorator} from '../../annotations/annotations';
import * as ldModule from './light_dom';
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

  constructor(contentEl) {
    super();
    this._replaceContentElementWithScriptTags(contentEl);
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
    this.nodes = nodes;
    DOM.insertAllBefore(this.endScript, nodes);
    this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
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
  destinationLightDom:ldModule.LightDom;

  constructor(destinationLightDom:ldModule.LightDom) {
    super();
    this.destinationLightDom = destinationLightDom;
    this.nodes = [];
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

  constructor(@Inject(ldModule.DestinationLightDom) destinationLightDom, contentEl:NgElement) {
    this.select = contentEl.getAttribute('select');
    this._strategy = isPresent(destinationLightDom) ?
      new IntermediateContent(destinationLightDom) :
      new RenderedContent(contentEl.domElement);
  }

  nodes():List {
    return this._strategy.nodes;
  }

  insert(nodes:List) {
    this._strategy.insert(nodes);
  }
}
