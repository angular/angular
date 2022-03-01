/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, Optional, Renderer2, Self} from '@angular/core';
import {createLView, createTView, getOrCreateTNode} from '@angular/core/src/render3/instructions/shared';
import {RenderFlags} from '@angular/core/src/render3/interfaces/definition';
import {NodeInjectorOffset} from '@angular/core/src/render3/interfaces/injector';

import {ɵɵdefineComponent} from '../../src/render3/definition';
import {bloomAdd, bloomHashBitOrFactory as bloomHash, bloomHasToken, getOrCreateNodeInjectorForNode} from '../../src/render3/di';
import {ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵtext} from '../../src/render3/index';
import {TNodeType} from '../../src/render3/interfaces/node';
import {isProceduralRenderer} from '../../src/render3/interfaces/renderer';
import {LViewFlags, TVIEW, TViewType} from '../../src/render3/interfaces/view';
import {enterView, leaveView} from '../../src/render3/state';

import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, createComponent, createDirective} from './render_util';

describe('di', () => {
  describe('directive injection', () => {
    class DirB {
      value = 'DirB';

      static ɵfac = () => new DirB();
      static ɵdir =
          ɵɵdefineDirective({selectors: [['', 'dirB', '']], type: DirB, inputs: {value: 'value'}});
    }

    describe('flags', () => {
      class DirB {
        // TODO(issue/24571): remove '!'.
        value!: string;

        static ɵfac = () => new DirB();
        static ɵdir =
            ɵɵdefineDirective({type: DirB, selectors: [['', 'dirB', '']], inputs: {value: 'dirB'}});
      }

      describe('Optional', () => {
        let dirA: DirA|null = null;

        class DirA {
          constructor(@Optional() public dirB: DirB|null) {}

          static ɵfac =
              () => {
                dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Optional));
                return dirA;
              }

          static ɵdir = ɵɵdefineDirective({type: DirA, selectors: [['', 'dirA', '']]});
        }

        beforeEach(() => dirA = null);

        it('should not throw if dependency is @Optional (limp mode)', () => {
          /** <div dirA></div> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', 0);
            }
          }, 1, 0, [DirA, DirB], [], undefined, [], [], undefined, [['dirA', '']]);

          expect(() => {
            new ComponentFixture(App);
          }).not.toThrow();
          expect(dirA!.dirB).toEqual(null);
        });
      });

      it('should check only the current node with @Self even with false positive', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Self() public dirB: DirB) {}

          static ɵfac = () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Self));
          static ɵdir = ɵɵdefineDirective({type: DirA, selectors: [['', 'dirA', '']]});
        }

        const DirC = createDirective('dirC');

        /**
         * <div dirB>
         *   <div dirA dirC></div>
         * </div>
         */
        const App = createComponent(
            'app',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'div', 0);
                ɵɵelement(1, 'div', 1);
                ɵɵelementEnd();
              }
            },
            2, 0, [DirA, DirB, DirC], [], undefined, [], [], undefined,
            [['dirB', ''], ['dirA', '', 'dirC', '']]);

        expect(() => {
          (DirA as any)['__NG_ELEMENT_ID__'] = 1;
          (DirC as any)['__NG_ELEMENT_ID__'] = 257;
          new ComponentFixture(App);
        })
            .toThrowError(
                'NG0201: No provider for DirB found in NodeInjector. Find more at https://angular.io/errors/NG0201');
      });
    });
  });

  describe('Renderer2', () => {
    class MyComp {
      constructor(public renderer: Renderer2) {}

      static ɵfac = () => new MyComp(ɵɵdirectiveInject(Renderer2 as any));
      static ɵcmp = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['my-comp']],
        decls: 1,
        vars: 0,
        template:
            function(rf: RenderFlags, ctx: MyComp) {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0, 'Foo');
              }
            }
      });
    }

    it('should inject the Renderer2 used by the application', () => {
      const rendererFactory = getRendererFactory2(document);
      const fixture = new ComponentFixture(MyComp, {rendererFactory: rendererFactory});
      expect(isProceduralRenderer(fixture.component.renderer)).toBeTruthy();
    });

    it('should throw when injecting Renderer2 but the application is using Renderer3', () => {
      expect(() => new ComponentFixture(MyComp)).toThrow();
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
          null, createTView(TViewType.Component, null, null, 1, 0, null, null, null, null, null),
          {}, LViewFlags.CheckAlways, null, null, {} as any, {} as any, null, null);
      enterView(contentView);
      try {
        const parentTNode = getOrCreateTNode(contentView[TVIEW], 0, TNodeType.Element, null, null);
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
