import {DOM} from 'angular2/src/dom/dom_adapter';

// TODO(pk): can't use a class here due to https://github.com/Microsoft/TypeScript/issues/574
export var TestCustomElement = {
  // should be Object.create(HTMLElement.prototype, { but HTMLElement is an interface in TS :-/
  prototype: Object.create(Object.getPrototypeOf(DOM.createElement('div')),
                           {knownProperty: {value: function() { return 'known value';}}})
};
