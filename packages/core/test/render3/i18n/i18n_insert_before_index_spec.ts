/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {addTNodeAndUpdateInsertBeforeIndex} from '@angular/core/src/render3/i18n/i18n_insert_before_index';
import {createTNode} from '@angular/core/src/render3/instructions/shared';
import {TNode, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {matchTNode} from '../matchers';


describe('addTNodeAndUpdateInsertBeforeIndex', () => {
  function tNode(index: number, type: TNodeType, insertBeforeIndex: number|null = null): TNode {
    const tNode = createTNode(null!, null, type, index, null, null);
    tNode.insertBeforeIndex = insertBeforeIndex;
    return tNode;
  }

  function tPlaceholderElementNode(index: number, insertBeforeIndex: number|null = null) {
    return tNode(index, TNodeType.Placeholder, insertBeforeIndex);
  }

  function tI18NTextNode(index: number, insertBeforeIndex: number|null = null) {
    return tNode(index, TNodeType.Element, insertBeforeIndex);
  }

  it('should add first node', () => {
    const previousTNodes: TNode[] = [];
    addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(21));
    expect(previousTNodes).toEqual([
      matchTNode({index: 21, insertBeforeIndex: null}),
    ]);
  });

  describe('when adding a placeholder', () => {
    describe('whose index is greater than those already there', () => {
      it('should not update the `insertBeforeIndex` values', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(21),
          tPlaceholderElementNode(22),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(23));
        expect(previousTNodes).toEqual([
          matchTNode({index: 21, insertBeforeIndex: null}),
          matchTNode({index: 22, insertBeforeIndex: null}),
          matchTNode({index: 23, insertBeforeIndex: null}),
        ]);
      });
    });

    describe('whose index is smaller than current nodes', () => {
      it('should update the previous insertBeforeIndex', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(22),
          tPlaceholderElementNode(23),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(21));
        expect(previousTNodes).toEqual([
          matchTNode({index: 22, insertBeforeIndex: 21}),
          matchTNode({index: 23, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is already set', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(23, 22),
          tPlaceholderElementNode(24, 22),
          tPlaceholderElementNode(22),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(21));
        expect(previousTNodes).toEqual([
          matchTNode({index: 23, insertBeforeIndex: 22}),
          matchTNode({index: 24, insertBeforeIndex: 22}),
          matchTNode({index: 22, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is created after', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(26, 21),
          tPlaceholderElementNode(27, 21),
          tPlaceholderElementNode(21),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(24));
        expect(previousTNodes).toEqual([
          matchTNode({index: 26, insertBeforeIndex: 21}),
          matchTNode({index: 27, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: null}),
          matchTNode({index: 24, insertBeforeIndex: null}),
        ]);
      });
    });
  });

  describe('when adding a i18nText', () => {
    describe('whose index is greater than those already there', () => {
      it('should not update the `insertBeforeIndex` values', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(21),
          tPlaceholderElementNode(22),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(23));
        expect(previousTNodes).toEqual([
          matchTNode({index: 21, insertBeforeIndex: 23}),
          matchTNode({index: 22, insertBeforeIndex: 23}),
          matchTNode({index: 23, insertBeforeIndex: null}),
        ]);
      });
    });

    describe('whose index is smaller than current nodes', () => {
      it('should update the previous insertBeforeIndex', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(22),
          tPlaceholderElementNode(23),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(21));
        expect(previousTNodes).toEqual([
          matchTNode({index: 22, insertBeforeIndex: 21}),
          matchTNode({index: 23, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is already set', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(23, 22),
          tPlaceholderElementNode(24, 22),
          tPlaceholderElementNode(22),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(21));
        expect(previousTNodes).toEqual([
          matchTNode({index: 23, insertBeforeIndex: 22}),
          matchTNode({index: 24, insertBeforeIndex: 22}),
          matchTNode({index: 22, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is created after', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(26, 21),
          tPlaceholderElementNode(27, 21),
          tPlaceholderElementNode(21),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(24));
        expect(previousTNodes).toEqual([
          matchTNode({index: 26, insertBeforeIndex: 21}),
          matchTNode({index: 27, insertBeforeIndex: 21}),
          matchTNode({index: 21, insertBeforeIndex: 24}),
          matchTNode({index: 24, insertBeforeIndex: null}),
        ]);
      });
    });
  });

  describe('scenario', () => {
    it('should rearrange the nodes', () => {
      const previousTNodes: TNode[] = [];
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(23));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(29));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(25));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(26));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(30));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(24));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(28));
      expect(previousTNodes).toEqual([
        matchTNode({index: 23, insertBeforeIndex: 30}),
        matchTNode({index: 29, insertBeforeIndex: 25}),
        matchTNode({index: 25, insertBeforeIndex: 30}),
        matchTNode({index: 26, insertBeforeIndex: 30}),
        matchTNode({index: 30, insertBeforeIndex: null}),
        matchTNode({index: 24, insertBeforeIndex: null}),
        matchTNode({index: 28, insertBeforeIndex: null}),
      ]);
    });
  });
});
