import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject,
  stringifyElement
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe('dom adapter', () => {
    it('should not coalesque text nodes', () => {
      var el1 = el('<div>a</div>');
      var el2 = el('<div>b</div>');
      DOM.appendChild(el2, DOM.firstChild(el1));
      expect(DOM.childNodes(el2).length).toBe(2);

      var el2Clone = DOM.clone(el2);
      expect(DOM.childNodes(el2Clone).length).toBe(2);
    });

    it('should clone correctly', () => {
      var el1 = el('<div x="y">a<span>b</span></div>');
      var clone = DOM.clone(el1);

      expect(clone).not.toBe(el1);
      DOM.setAttribute(clone, 'test', '1');
      expect(stringifyElement(clone)).toEqual('<div test="1" x="y">a<span>b</span></div>');
      expect(DOM.getAttribute(el1, 'test')).toBeFalsy();

      var cNodes = DOM.childNodes(clone);
      var firstChild = cNodes[0];
      var secondChild = cNodes[1];
      expect(DOM.parentElement(firstChild)).toBe(clone);
      expect(DOM.nextSibling(firstChild)).toBe(secondChild);
      expect(DOM.isTextNode(firstChild)).toBe(true);

      expect(DOM.parentElement(secondChild)).toBe(clone);
      expect(DOM.nextSibling(secondChild)).toBeFalsy();
      expect(DOM.isElementNode(secondChild)).toBe(true);

    });
  });
}