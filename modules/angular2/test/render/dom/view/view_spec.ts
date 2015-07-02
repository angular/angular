import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  SpyObject,
  proxy
} from 'angular2/test_lib';
import {isBlank} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

import {DomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {ElementBinder} from 'angular2/src/render/dom/view/element_binder';
import {DomView} from 'angular2/src/render/dom/view/view';
import {DomElement} from 'angular2/src/render/dom/view/element';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe('DomView', () => {
    function createProtoView(binders = null) {
      if (isBlank(binders)) {
        binders = [];
      }
      var rootEl = el('<div></div>');
      return new DomProtoView({
        element: rootEl,
        elementBinders: binders,
        transitiveContentTagCount: 0,
        boundTextNodeCount: 0
      });
    }

    function createView(pv = null, boundElementCount = 0) {
      if (isBlank(pv)) {
        pv = createProtoView(ListWrapper.createFixedSize(boundElementCount));
      }
      var root = el('<div><div></div></div>');
      var boundElements = [];
      for (var i = 0; i < boundElementCount; i++) {
        boundElements.push(new DomElement(pv.elementBinders[i], el('<span></span'), null));
      }
      return new DomView(pv, [DOM.childNodes(root)[0]], [], boundElements);
    }

    function createElementBinder(parentIndex: number = 0, distanceToParent: number = 1) {
      return new ElementBinder(
          {parentIndex: parentIndex, distanceToParent: distanceToParent, textNodeIndices: []});
    }

    describe('getDirectParentElement', () => {

      it('should return the DomElement of the direct parent', () => {
        var pv = createProtoView([createElementBinder(), createElementBinder(0, 1)]);
        var view = createView(pv, 2);
        expect(view.getDirectParentElement(1)).toBe(view.boundElements[0]);
      });

      it('should return null if the direct parent is not bound', () => {
        var pv = createProtoView(
            [createElementBinder(), createElementBinder(), createElementBinder(0, 2)]);
        var view = createView(pv, 3);
        expect(view.getDirectParentElement(2)).toBe(null);
      });

    });

    describe('setElementProperty', () => {
      var el, view;
      beforeEach(() => {
        view = createView(null, 1);
        el = view.boundElements[0].element;
      });

      it('should update the property value', () => {
        view.setElementProperty(0, 'title', 'Hello');
        expect(el.title).toEqual('Hello');
      });

    });

    describe('setElementAttribute', () => {
      var el, view;
      beforeEach(() => {
        view = createView(null, 1);
        el = view.boundElements[0].element;
      });

      it('should update and remove an attribute', () => {
        view.setElementAttribute(0, 'role', 'button');
        expect(DOM.getAttribute(el, 'role')).toEqual('button');
        view.setElementAttribute(0, 'role', null);
        expect(DOM.getAttribute(el, 'role')).toEqual(null);
      });

      it('should de-normalize attribute names', () => {
        view.setElementAttribute(0, 'ariaLabel', 'fancy button');
        expect(DOM.getAttribute(el, 'aria-label')).toEqual('fancy button');
      });
    });

    describe('setElementClass', () => {
      var el, view;
      beforeEach(() => {
        view = createView(null, 1);
        el = view.boundElements[0].element;
      });

      it('should set and remove a class', () => {
        view.setElementClass(0, 'active', true);
        expect(DOM.hasClass(el, 'active')).toEqual(true);

        view.setElementClass(0, 'active', false);
        expect(DOM.hasClass(el, 'active')).toEqual(false);
      });

      it('should de-normalize class names', () => {
        view.setElementClass(0, 'veryActive', true);
        expect(DOM.hasClass(el, 'very-active')).toEqual(true);

        view.setElementClass(0, 'veryActive', false);
        expect(DOM.hasClass(el, 'very-active')).toEqual(false);
      });
    });

    describe('setElementStyle', () => {
      var el, view;
      beforeEach(() => {
        view = createView(null, 1);
        el = view.boundElements[0].element;
      });

      it('should set and remove styles', () => {
        view.setElementStyle(0, 'width', '40px');
        expect(DOM.getStyle(el, 'width')).toEqual('40px');

        view.setElementStyle(0, 'width', null);
        expect(DOM.getStyle(el, 'width')).toEqual('');
      });

      it('should de-normalize style names', () => {
        view.setElementStyle(0, 'textAlign', 'right');
        expect(DOM.getStyle(el, 'text-align')).toEqual('right');
        view.setElementStyle(0, 'textAlign', null);
        expect(DOM.getStyle(el, 'text-align')).toEqual('');
      });

    });

  });
}
