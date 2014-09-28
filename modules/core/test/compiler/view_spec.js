import {describe, it, expect} from 'test_lib/test_lib';
import {ProtoView, View} from 'core/compiler/view';
import {DOM} from 'facade/dom';

export function main() {
  describe('view', function() {
    describe('ProtoView', function() {
      it('should create an instance of view', function() {
        var template = DOM.createTemplate('Hello <b>world</b>!');
        var pv = new ProtoView(template, null, null, null);
        var view:View = pv.instantiate();
        expect(view instanceof View).toBe(true);
      });
    });
  });
}
