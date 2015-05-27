import {
  AsyncTestCompleter,
  inject,
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {DOM, DomAdapter} from 'angular2/src/dom/dom_adapter';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';

import {Ruler, Rectangle} from 'angular2/src/services/ruler';
import {createRectangle} from './rectangle_mock';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

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

    it('should allow measuring ElementRefs', inject([AsyncTestCompleter], (async) => {
         var ruler = new Ruler(SpyObject.stub(
             new SpyDomAdapter(), {'getBoundingClientRect': createRectangle(10, 20, 200, 100)}));

         var elRef = <any>new SpyElementRef();
         ruler.measure(elRef).then((rect) => {
           assertDimensions(rect, 10, 210, 20, 120, 200, 100);
           async.done();
         });
       }));


    it('should return 0 for all rectangle values while measuring elements in a document fragment',
       inject([AsyncTestCompleter], (async) => {
         var ruler = new Ruler(DOM);
         var elRef = <any>new SpyElementRef();
         elRef.domElement = DOM.createElement('div');
         ruler.measure(elRef).then((rect) => {
           // here we are using an element created in a doc fragment so all the measures will come
           // back as 0
           assertDimensions(rect, 0, 0, 0, 0, 0, 0);
           async.done();
         });
       }));

  });
}

@proxy
@IMPLEMENTS(ElementRef)
class SpyElementRef extends SpyObject {
  domElement;
  constructor() { super(ElementRef); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy
@IMPLEMENTS(DomAdapter)
class SpyDomAdapter extends SpyObject {
  constructor() { super(DomAdapter); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
