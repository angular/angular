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
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';
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
    addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 0));
    expect(previousTNodes).toEqual([
      matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
    ]);
  });

  describe('when adding a placeholder', () => {
    describe('whose index is greater than those already there', () => {
      it('should not update the `insertBeforeIndex` values', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 1),
        ];
        addTNodeAndUpdateInsertBeforeIndex(
            previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 2));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: null}),
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: null}),
        ]);
      });
    });

    describe('whose index is smaller than current nodes', () => {
      it('should update the previous insertBeforeIndex', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 2),
        ];
        addTNodeAndUpdateInsertBeforeIndex(
            previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 0));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is already set', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 2, HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 3, HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 1),
        ];
        addTNodeAndUpdateInsertBeforeIndex(
            previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 0));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: HEADER_OFFSET + 1}),
          matchTNode({index: HEADER_OFFSET + 3, insertBeforeIndex: HEADER_OFFSET + 1}),
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is created after', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 5, HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 6, HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 0),
        ];
        addTNodeAndUpdateInsertBeforeIndex(
            previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 3));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 5, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 6, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
          matchTNode({index: HEADER_OFFSET + 3, insertBeforeIndex: null}),
        ]);
      });
    });
  });

  describe('when adding a i18nText', () => {
    describe('whose index is greater than those already there', () => {
      it('should not update the `insertBeforeIndex` values', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 1),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(HEADER_OFFSET + 2));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: HEADER_OFFSET + 2}),
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: HEADER_OFFSET + 2}),
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: null}),
        ]);
      });
    });

    describe('whose index is smaller than current nodes', () => {
      it('should update the previous insertBeforeIndex', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 2),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(HEADER_OFFSET + 0));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is already set', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 2, HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 3, HEADER_OFFSET + 1),
          tPlaceholderElementNode(HEADER_OFFSET + 1),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(HEADER_OFFSET + 0));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: HEADER_OFFSET + 1}),
          matchTNode({index: HEADER_OFFSET + 3, insertBeforeIndex: HEADER_OFFSET + 1}),
          matchTNode({index: HEADER_OFFSET + 1, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: null}),
        ]);
      });

      it('should not update the previous insertBeforeIndex if it is created after', () => {
        const previousTNodes: TNode[] = [
          tPlaceholderElementNode(HEADER_OFFSET + 5, HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 6, HEADER_OFFSET + 0),
          tPlaceholderElementNode(HEADER_OFFSET + 0),
        ];
        addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(HEADER_OFFSET + 3));
        expect(previousTNodes).toEqual([
          matchTNode({index: HEADER_OFFSET + 5, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 6, insertBeforeIndex: HEADER_OFFSET + 0}),
          matchTNode({index: HEADER_OFFSET + 0, insertBeforeIndex: HEADER_OFFSET + 3}),
          matchTNode({index: HEADER_OFFSET + 3, insertBeforeIndex: null}),
        ]);
      });
    });
  });

  describe('scenario', () => {
    it('should rearrange the nodes', () => {
      const previousTNodes: TNode[] = [];
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 2));
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 8));
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 4));
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 5));
      addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tI18NTextNode(HEADER_OFFSET + 9));
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 3));
      addTNodeAndUpdateInsertBeforeIndex(
          previousTNodes, tPlaceholderElementNode(HEADER_OFFSET + 7));
      expect(previousTNodes).toEqual([
        matchTNode({index: HEADER_OFFSET + 2, insertBeforeIndex: HEADER_OFFSET + 9}),
        matchTNode({index: HEADER_OFFSET + 8, insertBeforeIndex: HEADER_OFFSET + 4}),
        matchTNode({index: HEADER_OFFSET + 4, insertBeforeIndex: HEADER_OFFSET + 9}),
        matchTNode({index: HEADER_OFFSET + 5, insertBeforeIndex: HEADER_OFFSET + 9}),
        matchTNode({index: HEADER_OFFSET + 9, insertBeforeIndex: null}),
        matchTNode({index: HEADER_OFFSET + 3, insertBeforeIndex: null}),
        matchTNode({index: HEADER_OFFSET + 7, insertBeforeIndex: null}),
      ]);
    });
  });
});
