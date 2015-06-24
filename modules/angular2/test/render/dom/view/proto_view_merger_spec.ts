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

import {mergeSelectors} from 'angular2/src/render/dom/view/proto_view_merger';

export function main() {
  describe('ProtoViewMerger test', () => {

    describe('mergeSelectors', () => {
      it('should merge empty selectors', () => {
        expect(mergeSelectors('', 'a')).toEqual('a');
        expect(mergeSelectors('a', '')).toEqual('a');
        expect(mergeSelectors('', '')).toEqual('');
      });

      it('should merge wildcard selectors', () => {
        expect(mergeSelectors('*', 'a')).toEqual('a');
        expect(mergeSelectors('a', '*')).toEqual('a');
        expect(mergeSelectors('*', '*')).toEqual('*');
      });

      it('should merge 2 element selectors',
         () => { expect(mergeSelectors('a', 'b')).toEqual('_not-matchable_'); });

      it('should merge elements and non element selector', () => {
        expect(mergeSelectors('a', '.b')).toEqual('a.b');
        expect(mergeSelectors('.b', 'a')).toEqual('a.b');
      });

      it('should merge attributes', () => {
        expect(mergeSelectors('[a]', '[b]')).toEqual('[a][b]');
        expect(mergeSelectors('[a][b]', '[c][d]')).toEqual('[a][b][c][d]');
        expect(mergeSelectors('[a=1]', '[b=2]')).toEqual('[a=1][b=2]');
      });

      it('should merge classes', () => {
        expect(mergeSelectors('.a', '.b')).toEqual('.a.b');
        expect(mergeSelectors('.a.b', '.c.d')).toEqual('.a.b.c.d');
      });
    });

  });
}
