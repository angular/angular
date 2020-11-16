/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵProvidersFeature} from '@angular/core/src/core';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart} from '@angular/core/src/render3/instructions/element';
import {TNodeDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {createTNode, createTView} from '@angular/core/src/render3/instructions/shared';
import {TNodeType} from '@angular/core/src/render3/interfaces/node';
import {LView, TView, TViewType} from '@angular/core/src/render3/interfaces/view';
import {enterView, leaveView} from '@angular/core/src/render3/state';
import {insertTStylingBinding} from '@angular/core/src/render3/styling/style_binding_list';
import {KeyValueArray} from '@angular/core/src/util/array_utils';
import {TemplateFixture} from '../render_util';

describe('lView_debug', () => {
  const mockFirstUpdatePassLView: LView = [null, {firstUpdatePass: true}] as any;
  beforeEach(() => enterView(mockFirstUpdatePassLView));
  afterEach(() => leaveView());

  describe('TNode', () => {
    let tNode!: TNodeDebug;
    let tView!: TView;
    beforeEach(() => {
      tView = createTView(TViewType.Component, null, null, 0, 0, null, null, null, null, null);
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

  describe('di', () => {
    it('should show basic information', () => {
      class DepA {
        static ɵfac = () => new DepA();
      }
      class DepB {
        static ɵfac = () => new DepB();
      }

      const instances: any[] = [];
      class MyComponent {
        constructor(public depA: DepA, public depB: DepB) {
          instances.push(this);
        }
        static ɵfac = () => new MyComponent(ɵɵdirectiveInject(DepA), ɵɵdirectiveInject(DepB));
        static ɵcmp = ɵɵdefineComponent({
          type: MyComponent,
          selectors: [['my-comp']],
          decls: 1,
          vars: 0,
          template: function() {},
          features: [ɵɵProvidersFeature(
              [DepA, {provide: String, useValue: 'String'}],
              [DepB, {provide: Number, useValue: 123}])]
        });
      }

      let myChild!: MyChild;
      class MyChild {
        constructor() {
          myChild = this;
        }
        static ɵfac = () => new MyChild();
        static ɵdir = ɵɵdefineDirective({
          type: MyChild,
          selectors: [['my-child']],
        });
      }


      class MyDirective {
        constructor(public myComp: MyComponent) {
          instances.push(this);
        }
        static ɵfac = () => new MyDirective(ɵɵdirectiveInject(MyComponent));
        static ɵdir = ɵɵdefineDirective({
          type: MyDirective,
          selectors: [['', 'my-dir', '']],
        });
      }

      const fixture = new TemplateFixture({
        create: () => {
          ɵɵelementStart(0, 'my-comp', 0);
          ɵɵelement(1, 'my-child');
          ɵɵelementEnd();
        },
        decls: 2,
        directives: [MyComponent, MyDirective, MyChild],
        consts: [['my-dir', '']]
      });
      const lView = fixture.hostView;
      const lViewDebug = lView.debug!;
      const myCompNode = lViewDebug.nodes[0];
      expect(myCompNode.factories).toEqual([MyComponent, MyDirective]);
      expect(myCompNode.instances).toEqual(instances);
      expect(myCompNode.injector).toEqual({
        bloom: jasmine.anything(),
        cumulativeBloom: jasmine.anything(),
        providers: [DepA, String, MyComponent.ɵcmp, MyDirective.ɵdir],
        viewProviders: [DepB, Number],
        parentInjectorIndex: -1,
      });
      const myChildNode = myCompNode.children[0];
      expect(myChildNode.factories).toEqual([MyChild]);
      expect(myChildNode.instances).toEqual([myChild]);
      expect(myChildNode.injector).toEqual({
        bloom: jasmine.anything(),
        cumulativeBloom: jasmine.anything(),
        providers: [MyChild.ɵdir],
        viewProviders: [],
        parentInjectorIndex: 22,
      });
    });
  });
});
