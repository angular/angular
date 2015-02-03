import {List, ListWrapper} from 'facade/src/collection';
import {DOM} from 'facade/src/dom';
import {isPresent} from 'facade/src/lang';

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

export function queryView(view, selector) {
  for (var i = 0; i < view.nodes.length; ++i) {
    var res = DOM.querySelector(view.nodes[i], selector);
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
  return DOM.firstChild(DOM.createTemplate(html).content);
}
