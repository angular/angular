import {List, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';

export class Log {
  _result: List<any>;

  constructor() { this._result = []; }

  add(value): void { ListWrapper.push(this._result, value); }

  fn(value) {
    return (a1 = null, a2 = null, a3 = null, a4 = null, a5 = null) => {
      ListWrapper.push(this._result, value);
    }
  }

  result(): string { return ListWrapper.join(this._result, "; "); }
}

export function viewRootNodes(view): List</*node*/ any> {
  return resolveInternalDomView(view.render).rootNodes;
}

export function queryView(view, selector: string) {
  var rootNodes = viewRootNodes(view);
  for (var i = 0; i < rootNodes.length; ++i) {
    var res = DOM.querySelector(rootNodes[i], selector);
    if (isPresent(res)) {
      return res;
    }
  }
  return null;
}

export function dispatchEvent(element, eventType) {
  DOM.dispatchEvent(element, DOM.createEvent(eventType));
}

export function el(html: string) {
  return DOM.firstChild(DOM.content(DOM.createTemplate(html)));
}
