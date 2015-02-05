import {Decorator} from '../../annotations/annotations';
import {SourceLightDom, DestinationLightDom, LightDom} from './light_dom';
import {Inject} from 'angular2/di';
import {Element, Node, DOM} from 'angular2/src/facade/dom';
import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {NgElement} from 'angular2/src/core/dom/element';

var _scriptTemplate = DOM.createScriptTag('type', 'ng/content')

class ContentStrategy {
  nodes: List<Node>;
  insert(nodes:List<Nodes>){}
}

/**
 * An implementation of the content tag that is used by transcluding components.
 * It is used when the content tag is not a direct child of another component,
 * and thus does not affect redistribution.
 */
class RenderedContent extends ContentStrategy {
  beginScript:Element;
  endScript:Element;

  constructor(contentEl:Element) {
    this._replaceContentElementWithScriptTags(contentEl);
    this.nodes = [];
  }

  // Inserts the nodes in between the start and end scripts.
  // Previous content is removed.
  insert(nodes:List<Node>) {
    this.nodes = nodes;
    DOM.insertAllBefore(this.endScript, nodes);
    this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
  }

  // Replaces the content tag with a pair of script tags
  _replaceContentElementWithScriptTags(contentEl:Element) {
    this.beginScript = DOM.clone(_scriptTemplate);
    this.endScript = DOM.clone(_scriptTemplate);

    DOM.insertBefore(contentEl, this.beginScript);
    DOM.insertBefore(contentEl, this.endScript);
    DOM.removeChild(DOM.parentElement(contentEl), contentEl);
  }

  _removeNodesUntil(node:Node) {
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

  constructor(destinationLightDom:LightDom) {
    this.destinationLightDom = destinationLightDom;
    this.nodes = [];
  }

  insert(nodes:List<Node>) {
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

  constructor(@Inject(DestinationLightDom) destinationLightDom, contentEl:NgElement) {
    this.select = contentEl.getAttribute('select');
    this._strategy = isPresent(destinationLightDom) ?
      new IntermediateContent(destinationLightDom) :
      new RenderedContent(contentEl.domElement);
  }

  nodes():List<Node> {
    return this._strategy.nodes;
  }

  insert(nodes:List<Node>) {
    this._strategy.insert(nodes);
  }
}
