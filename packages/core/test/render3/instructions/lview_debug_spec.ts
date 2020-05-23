/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNodeDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {createTNode, createTView} from '@angular/core/src/render3/instructions/shared';
import {TNodeType} from '@angular/core/src/render3/interfaces/node';
import {LView, TView, TViewType} from '@angular/core/src/render3/interfaces/view';
import {enterView, leaveView} from '@angular/core/src/render3/state';
import {insertTStylingBinding} from '@angular/core/src/render3/styling/style_binding_list';
import {KeyValueArray} from '@angular/core/src/util/array_utils';


describe('lView_debug', () => {
  const mockFirstUpdatePassLView: LView = [null, {firstUpdatePass: true}] as any;
  beforeEach(() => enterView(mockFirstUpdatePassLView, null));
  afterEach(() => leaveView());

  describe('TNode', () => {
    let tNode!: TNodeDebug;
    let tView!: TView;
    beforeEach(() => {
      tView = createTView(TViewType.Component, 0, null, 0, 0, null, null, null, null, null);
      tNode = createTNode(tView, null!, TNodeType.Element, 0, '', null) as TNodeDebug;
    });
    afterEach(() => tNode = tView = null!);

    describe('styling', () => {
      it('should decode no styling', () => {
        expect(tNode.styleBindings_).toEqual([null]);
        expect(tNode.classBindings_).toEqual([null]);
      });

      it('should decode static styling', () => {
        tNode.residualStyles = ['color', 'blue'] as KeyValueArray<any>;
        tNode.residualClasses = ['STATIC', true] as KeyValueArray<any>;
        expect(tNode.styleBindings_).toEqual([['color', 'blue'] as KeyValueArray<any>]);
        expect(tNode.classBindings_).toEqual([['STATIC', true] as KeyValueArray<any>]);
      });

      it('should decode no-template property binding', () => {
        tNode.residualClasses = ['STATIC', true] as KeyValueArray<any>;
        insertTStylingBinding(tView.data, tNode, 'CLASS', 2, true, true);
        insertTStylingBinding(tView.data, tNode, 'color', 4, true, false);

        expect(tNode.styleBindings_).toEqual([
          {
            index: 4,
            key: 'color',
            isTemplate: false,
            prevDuplicate: false,
            nextDuplicate: false,
            prevIndex: 0,
            nextIndex: 0,
          },
          null
        ]);
        expect(tNode.classBindings_).toEqual([
          {
            index: 2,
            key: 'CLASS',
            isTemplate: false,
            prevDuplicate: false,
            nextDuplicate: false,
            prevIndex: 0,
            nextIndex: 0,
          },
          ['STATIC', true] as KeyValueArray<any>
        ]);
      });

      it('should decode template and directive property binding', () => {
        tNode.residualClasses = ['STATIC', true] as KeyValueArray<any>;
        insertTStylingBinding(tView.data, tNode, 'CLASS', 2, false, true);
        insertTStylingBinding(tView.data, tNode, 'color', 4, false, false);

        expect(tNode.styleBindings_).toEqual([
          {
            index: 4,
            key: 'color',
            isTemplate: true,
            prevDuplicate: false,
            nextDuplicate: false,
            prevIndex: 0,
            nextIndex: 0,
          },
          null
        ]);
        expect(tNode.classBindings_).toEqual([
          {
            index: 2,
            key: 'CLASS',
            isTemplate: true,
            prevDuplicate: false,
            nextDuplicate: false,
            prevIndex: 0,
            nextIndex: 0,
          },
          ['STATIC', true] as KeyValueArray<any>
        ]);

        insertTStylingBinding(tView.data, tNode, null, 6, true, true);
        insertTStylingBinding(tView.data, tNode, null, 8, true, false);

        expect(tNode.styleBindings_).toEqual([
          {
            index: 8,
            key: null,
            isTemplate: false,
            prevDuplicate: false,
            nextDuplicate: true,
            prevIndex: 0,
            nextIndex: 4,
          },
          {
            index: 4,
            key: 'color',
            isTemplate: true,
            prevDuplicate: true,
            nextDuplicate: false,
            prevIndex: 8,
            nextIndex: 0,
          },
          null
        ]);
        expect(tNode.classBindings_).toEqual([
          {
            index: 6,
            key: null,
            isTemplate: false,
            prevDuplicate: false,
            nextDuplicate: true,
            prevIndex: 0,
            nextIndex: 2,
          },
          {
            index: 2,
            key: 'CLASS',
            isTemplate: true,
            prevDuplicate: true,
            nextDuplicate: false,
            prevIndex: 6,
            nextIndex: 0,
          },
          ['STATIC', true] as KeyValueArray<any>
        ]);
      });
    });
  });
});