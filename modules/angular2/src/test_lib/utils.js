import {List, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';

export class Log {
  _result:List;

  constructor() {
    this._result = [];
  }

  add(value) {
    ListWrapper.push(this._result, value);
  }

  fn(value) {
    return () => {
      ListWrapper.push(this._result, value);
    }
  }

  result() {
    return ListWrapper.join(this._result, "; ");
  }
}

export function viewRootNodes(view) {
  return view.render.delegate.rootNodes;
}

export function queryView(view, selector) {
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

export function el(html) {
  return DOM.firstChild(DOM.content(DOM.createTemplate(html)));
}
