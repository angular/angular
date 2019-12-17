/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createTNode} from '@angular/core/src/render3/instructions/shared';
import {TNode, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {TStylingKey, TStylingRange, getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate} from '@angular/core/src/render3/interfaces/styling';
import {LView, TData} from '@angular/core/src/render3/interfaces/view';
import {enterView, leaveView} from '@angular/core/src/render3/state';
import {CLASS_MAP_STYLING_KEY, STYLE_MAP_STYLING_KEY, appendStyling, flushStyleBinding, insertTStylingBinding} from '@angular/core/src/render3/styling/style_binding_list';
import {newArray} from '@angular/core/src/util/array_utils';

describe('TNode styling linked list', () => {
  const mockFirstUpdatePassLView: LView = [null, {firstUpdatePass: true}] as any;
  beforeEach(() => enterView(mockFirstUpdatePassLView, null));
  afterEach(() => leaveView());
  describe('insertTStylingBinding', () => {
    it('should append template only', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];

      insertTStylingBinding(tData, tNode, 'tmpl1', 2, false, true);
      expectRange(tNode.classBindings).toEqual([2, 2]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 0, false, 0],  // 2
      ]);

      insertTStylingBinding(tData, tNode, 'tmpl2', 4, false, true);
      expectRange(tNode.classBindings).toEqual([2, 4]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 0, false, 4],  // 2
        'tmpl2', [false, 2, false, 0],  // 4
      ]);

      insertTStylingBinding(tData, tNode, 'host1', 6, true, true);
      expectRange(tNode.classBindings).toEqual([2, 4]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 6, false, 4],  // 2
        'tmpl2', [false, 2, false, 0],  // 4
        'host1', [false, 0, false, 2],  // 6
      ]);

      insertTStylingBinding(tData, tNode, 'host2', 8, true, true);
      expectRange(tNode.classBindings).toEqual([2, 4]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 8, false, 4],  // 2
        'tmpl2', [false, 2, false, 0],  // 4
        'host1', [false, 0, false, 8],  // 6
        'host2', [false, 6, false, 2],  // 8
      ]);
    });

    it('should append host only', () => {
      const tData: TData = [null, null];
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);

      insertTStylingBinding(tData, tNode, 'host1', 2, true, true);
      expectRange(tNode.classBindings).toEqual([2, 0 /* no template binding */]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'host1', [false, 0, false, 0],  // 2
      ]);

      insertTStylingBinding(tData, tNode, 'host2', 4, true, true);
      expectRange(tNode.classBindings).toEqual([4, 0 /* no template binding */]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'host1', [false, 0, false, 4],  // 2
        'host2', [false, 2, false, 0],  // 4
      ]);
    });

    it('should append template and host', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];

      insertTStylingBinding(tData, tNode, 'tmpl1', 2, false, true);
      expectRange(tNode.classBindings).toEqual([2, 2]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 0, false, 0],  // 2
      ]);

      insertTStylingBinding(tData, tNode, 'host1', 4, true, true);
      expectRange(tNode.classBindings).toEqual([2, 2]);
      expectTData(tData).toEqual([
        null, null,                     // 0
        'tmpl1', [false, 4, false, 0],  // 2
        'host1', [false, 0, false, 2],  // 4
      ]);
    });

    it('should support example in \'tnode_linked_list.ts\' documentation', () => {
      // See: `tnode_linked_list.ts` file description for this example.
      // Template: (ExampleComponent)
      //   ɵɵstyleMap({color: '#001'});   // Binding index: 10
      //   ɵɵstyleProp('color', '#002');  // Binding index: 12
      // MyComponent
      //   ɵɵstyleMap({color: '#003'});   // Binding index: 20
      //   ɵɵstyleProp('color', '#004');  // Binding index: 22
      // Style1Directive
      //   ɵɵstyleMap({color: '#005'});   // Binding index: 24
      //   ɵɵstyleProp('color', '#006');  // Binding index: 26
      // Style2Directive
      //   ɵɵstyleMap({color: '#007'});   // Binding index: 28
      //   ɵɵstyleProp('color', '#008');  // Binding index: 30

      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      tNode.styles = '';
      const tData: TData = newArray(32, null);
      const STYLE = STYLE_MAP_STYLING_KEY;

      insertTStylingBinding(tData, tNode, STYLE, 10, false, false);
      expectRange(tNode.styleBindings).toEqual([10, 10]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,         //
        STYLE, [false, 0, false, 0],  // 10 - Template:  ɵɵstyleMap({color: '#001'});
        null, null,                   // 12
        ...empty_14_through_19,       // 14-19
        null, null,                   // 20
        null, null,                   // 22
        null, null,                   // 24
        null, null,                   // 26
        null, null,                   // 28
        null, null,                   // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [10, null, false, false],  // 10 - Template:  ɵɵstyleMap({color: '#001'});
      ]);


      insertTStylingBinding(tData, tNode, 'color', 12, false, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,            //
        STYLE, [false, 0, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,          // 14-19
        null, null,                      // 20
        null, null,                      // 22
        null, null,                      // 24
        null, null,                      // 26
        null, null,                      // 28
        null, null,                      // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [10, null, false, true],     // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);

      insertTStylingBinding(tData, tNode, STYLE, 20, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,            //
        STYLE, [false, 20, false, 12],   // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,          // 14-19
        STYLE, [false, 0, false, 10],    // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        null, null,                      // 22
        null, null,                      // 24
        null, null,                      // 26
        null, null,                      // 28
        null, null,                      // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);

      insertTStylingBinding(tData, tNode, 'color', 22, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,             // 00-09
        STYLE, [false, 22, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],   // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,           // 14-19
        STYLE, [false, 0, false, 22],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        'color', [false, 20, false, 10],  // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        null, null,                       // 24
        null, null,                       // 26
        null, null,                       // 28
        null, null,                       // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [22, 'color', true, true],   // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);

      insertTStylingBinding(tData, tNode, STYLE, 24, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,             //
        STYLE, [false, 24, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],   // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,           // 14-19
        STYLE, [false, 0, false, 22],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        'color', [false, 20, false, 24],  // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        STYLE, [false, 22, false, 10],    // 24 - Style1Directive:  ɵɵstyleMap({color: '#003'});
        null, null,                       // 26
        null, null,                       // 28
        null, null,                       // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [22, 'color', true, true],   // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        [24, null, true, true],      // 24 - Style1Directive:  ɵɵstyleMap({color: '#003'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);

      insertTStylingBinding(tData, tNode, 'color', 26, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,             // 00-09
        STYLE, [false, 26, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],   // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,           // 14-19
        STYLE, [false, 0, false, 22],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        'color', [false, 20, false, 24],  // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        STYLE, [false, 22, false, 26],    // 24 - Style1Directive:  ɵɵstyleMap({color: '#005'});
        'color', [false, 24, false, 10],  // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        null, null,                       // 28
        null, null,                       // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [22, 'color', true, true],   // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        [24, null, true, true],      // 24 - Style1Directive:  ɵɵstyleMap({color: '#003'});
        [26, 'color', true, true],   // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);


      insertTStylingBinding(tData, tNode, STYLE, 28, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,             //
        STYLE, [false, 28, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],   // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,           // 14-19
        STYLE, [false, 0, false, 22],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        'color', [false, 20, false, 24],  // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        STYLE, [false, 22, false, 26],    // 24 - Style1Directive:  ɵɵstyleMap({color: '#005'});
        'color', [false, 24, false, 28],  // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        STYLE, [false, 26, false, 10],    // 28 - Style2Directive:  ɵɵstyleMap({color: '#007'});
        null, null,                       // 30
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [22, 'color', true, true],   // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        [24, null, true, true],      // 24 - Style1Directive:  ɵɵstyleMap({color: '#003'});
        [26, 'color', true, true],   // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        [28, null, true, true],      // 28 - Style2Directive:  ɵɵstyleMap({color: '#007'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);

      insertTStylingBinding(tData, tNode, 'color', 30, true, false);
      expectRange(tNode.styleBindings).toEqual([10, 12]);
      expectTData(tData).toEqual([
        ...empty_0_through_9,             // 00-09
        STYLE, [false, 30, false, 12],    // 10 - Template:  ɵɵstyleMap({color: '#001'});
        'color', [false, 10, false, 0],   // 12 - Template:  ɵɵstyleProp('color', '#002'});
        ...empty_14_through_19,           // 14-19
        STYLE, [false, 0, false, 22],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        'color', [false, 20, false, 24],  // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        STYLE, [false, 22, false, 26],    // 24 - Style1Directive:  ɵɵstyleMap({color: '#005'});
        'color', [false, 24, false, 28],  // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        STYLE, [false, 26, false, 30],    // 28 - Style2Directive:  ɵɵstyleMap({color: '#007'});
        'color', [false, 28, false, 10],  // 30 - Style2Directive:  ɵɵstyleProp('color', '#008'});
      ]);
      expectPriorityOrder(tData, tNode, false).toEqual([
        [20, null, false, true],     // 20 - MyComponent:  ɵɵstyleMap({color: '#003'});
        [22, 'color', true, true],   // 22 - MyComponent:  ɵɵstyleProp('color', '#004'});
        [24, null, true, true],      // 24 - Style1Directive:  ɵɵstyleMap({color: '#005'});
        [26, 'color', true, true],   // 26 - Style1Directive:  ɵɵstyleProp('color', '#006'});
        [28, null, true, true],      // 28 - Style2Directive:  ɵɵstyleMap({color: '#007'});
        [30, 'color', true, true],   // 30 - Style2Directive:  ɵɵstyleProp('color', '#008'});
        [10, null, true, true],      // 10 - Template:  ɵɵstyleMap({color: '#001'});
        [12, 'color', true, false],  // 12 - Template:  ɵɵstyleProp('color', '#002'});
      ]);
    });

  });

  describe('markDuplicates', () => {
    it('should not mark items as duplicate if names don\'t match', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, 'color', 2, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'color', false, false],
      ]);

      insertTStylingBinding(tData, tNode, 'width', 4, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'color', false, false],
        [4, 'width', false, false],
      ]);

      insertTStylingBinding(tData, tNode, 'height', 6, true, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [6, 'height', false, false],
        [2, 'color', false, false],
        [4, 'width', false, false],
      ]);
    });

    it('should mark items as duplicate if names match', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, 'color', 2, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'color', false, false],
      ]);
      insertTStylingBinding(tData, tNode, 'color', 4, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'color', false, true],
        [4, 'color', true, false],
      ]);

      insertTStylingBinding(tData, tNode, 'height', 6, true, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [6, 'height', false, false],
        [2, 'color', false, true],
        [4, 'color', true, false],
      ]);
    });

    it('should treat maps as matching all', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, 'color', 2, false, false);
      insertTStylingBinding(tData, tNode, 'height', 4, true, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [4, 'height', false, false],
        [2, 'color', false, false],
      ]);

      insertTStylingBinding(tData, tNode, STYLE_MAP_STYLING_KEY /*Map*/, 6, true, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [4, 'height', false, true],
        [6, null, true, true],
        [2, 'color', true, false],
      ]);
    });

    it('should mark all things after map as duplicate', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, STYLE_MAP_STYLING_KEY, 2, false, false);
      insertTStylingBinding(tData, tNode, 'height', 4, false, false);
      insertTStylingBinding(tData, tNode, 'color', 6, true, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [6, 'color', false, true],
        [2, null, true, true],
        [4, 'height', true, false],
      ]);
    });

    it('should mark duplicate on complex objects like width.px', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, 'width', 2, false, false);
      insertTStylingBinding(tData, tNode, {key: 'height', extra: 'px'}, 4, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, false],
        [4, 'height', false, false],
      ]);
      insertTStylingBinding(tData, tNode, {key: 'height', extra: 'em'}, 6, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, false],
        [4, 'height', false, true],
        [6, 'height', true, false],
      ]);
      insertTStylingBinding(tData, tNode, 'width', 8, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, true],
        [4, 'height', false, true],
        [6, 'height', true, false],
        [8, 'width', true, false],
      ]);
    });

    it('should mark duplicate on static fields', () => {
      const tNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
      tNode.styles = 'color: blue;';
      const tData: TData = [null, null];
      insertTStylingBinding(tData, tNode, 'width', 2, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, false],
      ]);

      insertTStylingBinding(tData, tNode, 'color', 4, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, false],
        [4, 'color', true, false],
      ]);

      insertTStylingBinding(tData, tNode, STYLE_MAP_STYLING_KEY, 6, false, false);
      expectPriorityOrder(tData, tNode, false).toEqual([
        //            PREV,  NEXT
        [2, 'width', false, true],
        [4, 'color', true, true],
        [6, null, true, false],
      ]);
    });
  });

  describe('styleBindingFlush', () => {
    it('should write basic value', () => {
      const fixture = new StylingFixture([['color']], false);
      fixture.setBinding(0, 'red');
      expect(fixture.flush(0)).toEqual('color: red;');
    });

    it('should chain values and allow update mid list', () => {
      const fixture = new StylingFixture([['color', {key: 'width', extra: 'px'}]], false);
      fixture.setBinding(0, 'red');
      fixture.setBinding(1, '100');
      expect(fixture.flush(0)).toEqual('color: red; width: 100px;');

      fixture.setBinding(0, 'blue');
      fixture.setBinding(1, '200');
      expect(fixture.flush(1)).toEqual('color: red; width: 200px;');
      expect(fixture.flush(0)).toEqual('color: blue; width: 200px;');
    });

    it('should remove duplicates', () => {
      const fixture = new StylingFixture([['color', 'color']], false);
      fixture.setBinding(0, 'red');
      fixture.setBinding(1, 'blue');
      expect(fixture.flush(0)).toEqual('color: blue;');
    });

    it('should remove falsy values', () => {
      const fixture = new StylingFixture([['color', 'color']], false);
      fixture.setBinding(0, 'red');
      fixture.setBinding(1, undefined);
      expect(fixture.flush(0)).toEqual('color: red;');
    });

    it('should ignore falsy values', () => {
      const fixture = new StylingFixture([['color']], false);
      fixture.setBinding(0, null);
      expect(fixture.flush(0)).toEqual('');
    });

  });

  describe('appendStyling', () => {
    it('should append simple style', () => {
      expect(appendStyling('', 'color', 'red', null, false, false)).toEqual('color: red;');
      expect(appendStyling('', 'color', 'red', null, true, false)).toEqual('color: red;');
      expect(appendStyling('', 'color', 'red', null, false, true)).toEqual('color');
      expect(appendStyling('', 'color', 'red', null, true, true)).toEqual('color');
      expect(appendStyling('', 'color', true, null, true, true)).toEqual('color');
      expect(appendStyling('', 'color', false, null, true, true)).toEqual('');
      expect(appendStyling('', 'color', 0, null, true, true)).toEqual('');
      expect(appendStyling('', 'color', '', null, true, true)).toEqual('');
    });

    it('should append simple style with suffix', () => {
      expect(appendStyling('', {key: 'width', extra: 'px'}, 100, null, false, false))
          .toEqual('width: 100px;');
    });

    it('should append simple style with sanitizer', () => {
      expect(
          appendStyling('', {key: 'width', extra: (v: any) => `-${v}-`}, 100, null, false, false))
          .toEqual('width: -100-;');
    });

    it('should append class/style', () => {
      expect(appendStyling('color: white;', 'color', 'red', null, false, false))
          .toEqual('color: white; color: red;');
      expect(appendStyling('MY-CLASS', 'color', true, null, false, true)).toEqual('MY-CLASS color');
      expect(appendStyling('MY-CLASS', 'color', false, null, true, true)).toEqual('MY-CLASS');
    });

    it('should remove existing', () => {
      expect(appendStyling('color: white;', 'color', 'blue', null, true, false))
          .toEqual('color: blue;');
      expect(appendStyling('A YES B', 'YES', false, null, true, true)).toEqual('A B');
    });

    it('should support maps/arrays for classes', () => {
      expect(appendStyling('', CLASS_MAP_STYLING_KEY, {A: true, B: false}, null, true, true))
          .toEqual('A');
      expect(appendStyling('A B C', CLASS_MAP_STYLING_KEY, {A: true, B: false}, null, true, true))
          .toEqual('A C');
      expect(appendStyling('', CLASS_MAP_STYLING_KEY, ['A', 'B'], null, true, true)).toEqual('A B');
      expect(appendStyling('A B C', CLASS_MAP_STYLING_KEY, ['A', 'B'], null, true, true))
          .toEqual('A B C');
    });

    it('should support maps for styles', () => {
      expect(appendStyling('', STYLE_MAP_STYLING_KEY, {A: 'a', B: 'b'}, null, true, false))
          .toEqual('A: a; B: b;');
      expect(appendStyling(
                 'A:_; B:_; C:_;', STYLE_MAP_STYLING_KEY, {A: 'a', B: 'b'}, null, true, false))
          .toEqual('C:_; A: a; B: b;');
    });

    it('should support strings for classes', () => {
      expect(appendStyling('', CLASS_MAP_STYLING_KEY, 'A B', null, true, true)).toEqual('A B');
      expect(appendStyling('A B C', CLASS_MAP_STYLING_KEY, 'A B', null, false, true))
          .toEqual('A B C A B');
      expect(appendStyling('A B C', CLASS_MAP_STYLING_KEY, 'A B', null, true, true))
          .toEqual('A B C');
    });

    it('should support strings for styles', () => {
      expect(appendStyling('A:a;B:b;', STYLE_MAP_STYLING_KEY, 'A : a ; B : b', null, false, false))
          .toEqual('A:a;B:b; A : a ; B : b;');
      expect(appendStyling(
                 'A:_; B:_; C:_;', STYLE_MAP_STYLING_KEY, 'A : a ; B : b', null, true, false))
          .toEqual('C:_; A: a; B: b;');
    });

    it('should throw no arrays for styles', () => {
      expect(() => appendStyling('', STYLE_MAP_STYLING_KEY, ['A', 'a'], null, true, false))
          .toThrow();
    });

    describe('style sanitization', () => {
      it('should sanitize properties', () => {
        // Verify map
        expect(appendStyling(
                   '', STYLE_MAP_STYLING_KEY, {
                     'background-image': 'url(javascript:evil())',
                     'background': 'url(javascript:evil())',
                     'border-image': 'url(javascript:evil())',
                     'filter': 'url(javascript:evil())',
                     'list-style': 'url(javascript:evil())',
                     'list-style-image': 'url(javascript:evil())',
                     'clip-path': 'url(javascript:evil())',
                     'width': 'url(javascript:evil())',  // should not sanitize
                   },
                   null, true, false))
            .toEqual(
                'background-image: unsafe; ' +
                'background: unsafe; ' +
                'border-image: unsafe; ' +
                'filter: unsafe; ' +
                'list-style: unsafe; ' +
                'list-style-image: unsafe; ' +
                'clip-path: unsafe; ' +
                'width: url(javascript:evil());');
        // verify string
        expect(appendStyling(
                   '', STYLE_MAP_STYLING_KEY,
                   'background-image: url(javascript:evil());' +
                       'background: url(javascript:evil());' +
                       'border-image: url(javascript:evil());' +
                       'filter: url(javascript:evil());' +
                       'list-style: url(javascript:evil());' +
                       'list-style-image: url(javascript:evil());' +
                       'clip-path: url(javascript:evil());' +
                       'width: url(javascript:evil());'  // should not sanitize
                   ,
                   null, true, false))
            .toEqual(
                'background-image: unsafe; ' +
                'background: unsafe; ' +
                'border-image: unsafe; ' +
                'filter: unsafe; ' +
                'list-style: unsafe; ' +
                'list-style-image: unsafe; ' +
                'clip-path: unsafe; ' +
                'width: url(javascript:evil());');
      });
    });
  });
});

const empty_0_through_9 = [null, null, null, null, null, null, null, null, null, null];
const empty_14_through_19 = [null, null, null, null, null, null];

function expectRange(tStylingRange: TStylingRange) {
  return expect([
    getTStylingRangePrev(tStylingRange),  //
    getTStylingRangeNext(tStylingRange),  //
  ]);
}

function expectTData(tData: TData) {
  return expect(tData.map((tStylingRange: any) => {
    return typeof tStylingRange === 'number' ?
        [
          false,
          getTStylingRangePrev(tStylingRange as any),  //
          false,
          getTStylingRangeNext(tStylingRange as any),  //
        ] :
        tStylingRange;
  }));
}

function expectPriorityOrder(tData: TData, tNode: TNode, isClassBinding: boolean) {
  // first find head.
  let index = getStylingBindingHead(tData, tNode, isClassBinding);
  const indexes: [number, string | null, boolean, boolean][] = [];
  while (index !== 0) {
    let key = tData[index] as TStylingKey | null;
    if (key !== null && typeof key === 'object') {
      key = key.key;
    }
    const tStylingRange = tData[index + 1] as TStylingRange;
    indexes.push([
      index,                                         //
      key as string,                                 //
      getTStylingRangePrevDuplicate(tStylingRange),  //
      getTStylingRangeNextDuplicate(tStylingRange),  //
    ]);
    index = getTStylingRangeNext(tStylingRange);
  }
  return expect(indexes);
}


/**
 * Find the head of the styling binding linked list.
 */
export function getStylingBindingHead(tData: TData, tNode: TNode, isClassBinding: boolean): number {
  let index = getTStylingRangePrev(isClassBinding ? tNode.classBindings : tNode.styleBindings);
  while (true) {
    const tStylingRange = tData[index + 1] as TStylingRange;
    const prev = getTStylingRangePrev(tStylingRange);
    if (prev === 0) {
      // found head exit.
      return index;
    } else {
      index = prev;
    }
  }
}

class StylingFixture {
  tData: TData = [null, null];
  lView: LView = [null, null !] as any;
  tNode: TNode = createTNode(null !, null !, TNodeType.Element, 0, '', null);
  constructor(bindingSources: TStylingKey[][], public isClassBinding: boolean) {
    this.tNode.classes = '';
    this.tNode.styles = '';
    let bindingIndex = this.tData.length;
    for (let i = 0; i < bindingSources.length; i++) {
      const bindings = bindingSources[i];
      for (let j = 0; j < bindings.length; j++) {
        const binding = bindings[j];
        insertTStylingBinding(
            this.tData, this.tNode, binding, bindingIndex, i === 0, isClassBinding);
        this.lView.push(null, null);
        bindingIndex += 2;
      }
    }
  }

  setBinding(index: number, value: any) { this.lView[index * 2 + 2] = value; }

  flush(index: number): string {
    return flushStyleBinding(
        this.tData, this.tNode, this.lView, index * 2 + 2, this.isClassBinding);
  }
}