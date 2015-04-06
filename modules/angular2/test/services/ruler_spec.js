import {AsyncTestCompleter, inject, ddescribe, describe, it, iit, xit, expect, SpyObject} from 'angular2/test_lib';

import {DOM, DomAdapter} from 'angular2/src/dom/dom_adapter';
import {NgElement} from 'angular2/src/core/dom/element';

import {Ruler, Rectangle} from 'angular2/src/services/ruler';
import {createRectangle} from './rectangle_mock';

class DomAdapterMock extends DomAdapter {
  rect;
  constructor(rect) {
    super();
    this.rect = rect;
  }

  getBoundingClientRect(elm) {
    return this.rect;
  }
}

function assertDimensions(rect: Rectangle, left, right, top, bottom, width, height) {
  expect(rect.left).toEqual(left);
  expect(rect.right).toEqual(right);
  expect(rect.top).toEqual(top);
  expect(rect.bottom).toEqual(bottom);
  expect(rect.width).toEqual(width);
  expect(rect.height).toEqual(height);
}

export function main() {

  describe('ruler service', () => {

    it('should allow measuring NgElements',
      inject([AsyncTestCompleter], (async) => {
        var ruler = new Ruler(new DomAdapterMock(createRectangle(10, 20, 200, 100)));

        ruler.measure(new NgElement(null)).then((rect) => {
          assertDimensions(rect, 10, 210, 20, 120, 200, 100);
          async.done();
        });
      }));


    it('should return 0 for all rectangle values while measuring elements in a document fragment',
      inject([AsyncTestCompleter], (async) => {
        var ruler = new Ruler(DOM);

        ruler.measure(new NgElement(DOM.createElement('div'))).then((rect) => {
          //here we are using an element created in a doc fragment so all the measures will come back as 0
          assertDimensions(rect, 0, 0, 0, 0, 0, 0);
          async.done();
        });
    }));

  });
}
