/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, Self} from '../../src/core';
import {NodeInjectorOffset} from '../../src/render3/interfaces/injector';
import {TestBed} from '../../testing';

import {
  bloomAdd,
  bloomHashBitOrFactory as bloomHash,
  bloomHasToken,
  getOrCreateNodeInjectorForNode,
} from '../../src/render3/di';
import {TNodeType} from '../../src/render3/interfaces/node';
import {HEADER_OFFSET, LViewFlags, TVIEW, TViewType} from '../../src/render3/interfaces/view';
import {enterView, leaveView} from '../../src/render3/state';
import {getOrCreateTNode} from '../../src/render3/tnode_manipulation';
import {createLView, createTView} from '../../src/render3/view/construction';

describe('di', () => {
  describe('directive injection', () => {
    describe('flags', () => {
      it('should check only the current node with @Self even with false positive', () => {
        @Directive({selector: '[notOnSelf]'})
        class DirNotOnSelf {}

        @Directive({selector: '[tryInjectFromSelf]'})
        class DirTryInjectFromSelf {
          constructor(@Self() private dir: DirNotOnSelf) {}
        }

        @Component({
          template: `
            <div notOnSelf>
              <div tryInjectFromSelf></div>
            </div>
          `,
          imports: [DirNotOnSelf, DirTryInjectFromSelf],
        })
        class App {}
        expect(() => {
          TestBed.createComponent(App).detectChanges();
        }).toThrowError(
          'NG0201: No provider for DirNotOnSelf found in NodeInjector. Find more at https://angular.dev/errors/NG0201',
        );
      });
    });
  });

  describe('ɵɵinject', () => {
    describe('bloom filter', () => {
      let mockTView: any;
      beforeEach(() => {
        mockTView = {data: [0, 0, 0, 0, 0, 0, 0, 0, null], firstCreatePass: true};
      });

      function bloomState() {
        return mockTView.data.slice(0, NodeInjectorOffset.TNODE).reverse();
      }

      class Dir0 {
        /** @internal */ static __NG_ELEMENT_ID__ = 0;
      }
      class Dir1 {
        /** @internal */ static __NG_ELEMENT_ID__ = 1;
      }
      class Dir33 {
        /** @internal */ static __NG_ELEMENT_ID__ = 33;
      }
      class Dir66 {
        /** @internal */ static __NG_ELEMENT_ID__ = 66;
      }
      class Dir99 {
        /** @internal */ static __NG_ELEMENT_ID__ = 99;
      }
      class Dir132 {
        /** @internal */ static __NG_ELEMENT_ID__ = 132;
      }
      class Dir165 {
        /** @internal */ static __NG_ELEMENT_ID__ = 165;
      }
      class Dir198 {
        /** @internal */ static __NG_ELEMENT_ID__ = 198;
      }
      class Dir231 {
        /** @internal */ static __NG_ELEMENT_ID__ = 231;
      }
      class Dir260 {
        /** @internal */ static __NG_ELEMENT_ID__ = 260;
      }

      it('should add values', () => {
        bloomAdd(0, mockTView, Dir0);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
        bloomAdd(0, mockTView, Dir33);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 2, 1]);
        bloomAdd(0, mockTView, Dir66);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir99);
        expect(bloomState()).toEqual([0, 0, 0, 0, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir132);
        expect(bloomState()).toEqual([0, 0, 0, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir165);
        expect(bloomState()).toEqual([0, 0, 32, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir198);
        expect(bloomState()).toEqual([0, 64, 32, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir231);
        expect(bloomState()).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir260);
        expect(bloomState()).toEqual([128, 64, 32, 16, 8, 4, 2, 17 /* 1 + 2^(260-256) */]);
      });

      it('should query values', () => {
        bloomAdd(0, mockTView, Dir0);
        bloomAdd(0, mockTView, Dir33);
        bloomAdd(0, mockTView, Dir66);
        bloomAdd(0, mockTView, Dir99);
        bloomAdd(0, mockTView, Dir132);
        bloomAdd(0, mockTView, Dir165);
        bloomAdd(0, mockTView, Dir198);
        bloomAdd(0, mockTView, Dir231);
        bloomAdd(0, mockTView, Dir260);

        expect(bloomHasToken(bloomHash(Dir0) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir1) as number, 0, mockTView.data)).toEqual(false);
        expect(bloomHasToken(bloomHash(Dir33) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir66) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir99) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir132) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir165) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir198) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir231) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir260) as number, 0, mockTView.data)).toEqual(true);
      });
    });
  });

  describe('getOrCreateNodeInjector', () => {
    it('should handle initial undefined state', () => {
      const contentView = createLView(
        null,
        createTView(TViewType.Component, null, null, 1, 0, null, null, null, null, null, null),
        {},
        LViewFlags.CheckAlways,
        null,
        null,
        {
          rendererFactory: {} as any,
          sanitizer: null,
          changeDetectionScheduler: null,
          ngReflect: false,
        },
        {} as any,
        null,
        null,
        null,
      );
      enterView(contentView);
      try {
        const parentTNode = getOrCreateTNode(
          contentView[TVIEW],
          HEADER_OFFSET,
          TNodeType.Element,
          null,
          null,
        );
        // Simulate the situation where the previous parent is not initialized.
        // This happens on first bootstrap because we don't init existing values
        // so that we have smaller HelloWorld.
        (parentTNode as {parent: any}).parent = undefined;

        const injector = getOrCreateNodeInjectorForNode(parentTNode, contentView);
        expect(injector).not.toEqual(-1);
      } finally {
        leaveView();
      }
    });
  });
});
