import {Decorator} from '../../annotations/annotations';
import {SourceLightDom, DestinationLightDom, LightDom} from './light_dom';
import {Inject} from 'di/di';
import {Element, Node, DOM} from 'facade/dom';
import {List, ListWrapper} from 'facade/collection';
import {NgElement} from 'core/dom/element';

var _scriptTemplate = DOM.createScriptTag('type', 'ng/content')

@Decorator({
  selector: 'content'
})
export class Content {
  _destinationLightDom:LightDom;

  _beginScript:Element;
  _endScript:Element;

  select:string;

  constructor(@Inject(DestinationLightDom) destinationLightDom, contentEl:NgElement) {
    this._destinationLightDom = destinationLightDom;

    this.select = contentEl.getAttribute('select');

    this._replaceContentElementWithScriptTags(contentEl.domElement);
  }

  insert(nodes:List<Node>) {
    DOM.insertAllBefore(this._endScript, nodes);
    this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this._endScript : nodes[0]);
  }

  _replaceContentElementWithScriptTags(contentEl:Element) {
    this._beginScript = DOM.clone(_scriptTemplate);
    this._endScript = DOM.clone(_scriptTemplate);

    DOM.insertBefore(contentEl, this._beginScript);
    DOM.insertBefore(contentEl, this._endScript);
    DOM.removeChild(DOM.parentElement(contentEl), contentEl);
  }

  _removeNodesUntil(node:Node) {
    var p = DOM.parentElement(this._beginScript);
    for (var next = DOM.nextSibling(this._beginScript);
         next !== node;
         next = DOM.nextSibling(this._beginScript)) {
      DOM.removeChild(p, next);
    }
  }
}