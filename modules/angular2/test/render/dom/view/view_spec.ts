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
      return new DomProtoView(
          {element: rootEl, elementBinders: binders, transitiveContentTagCount: 0});
    }

    function createView(pv = null, boundElementCount = 0) {
      if (isBlank(pv)) {
        pv = createProtoView();
      }
      var root = el('<div><div></div></div>');
      var boundElements = [];
      for (var i = 0; i < boundElementCount; i++) {
        ListWrapper.push(boundElements,
                         new DomElement(pv.elementBinders[i], el('<span></span'), null));
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

  });
}
