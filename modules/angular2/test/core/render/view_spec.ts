import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';

import {DefaultRenderView} from 'angular2/src/core/render/view';

export function main() {
  describe('DefaultRenderView', () => {
    describe('hydrate', () => {
      it('should register global event listeners', () => {
        var addCount = 0;
        var adder = () => { addCount++ };
        var view = new DefaultRenderView<Node>([], [], [], [], [adder]);
        view.hydrate();
        expect(addCount).toBe(1);
      });
    });

    describe('dehydrate', () => {
      it('should deregister global event listeners', () => {
        var removeCount = 0;
        var adder = () => () => { removeCount++ };
        var view = new DefaultRenderView<Node>([], [], [], [], [adder]);
        view.hydrate();
        view.dehydrate();
        expect(removeCount).toBe(1);
      });
    });
  });
}
