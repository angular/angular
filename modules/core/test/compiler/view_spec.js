import {describe, id} from 'test_lib/test_lib';
import {ProtoView, View} from './view';
import {DOM} from 'facade/dom';

export function main() {
  describe('view', () => {
    describe('ProtoView', () => {
      it('should create an instance of view', () => {
        var template = DOM.createTemplate('Hello <b>world</b>!');
        var pv = new ProtoView(template, null, null, null);
        var view:View = pv.instantiate();
        expect(view instanceof View).toBe(true);
      });
    });
  });
}
