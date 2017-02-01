/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, WrappedValue} from '@angular/core';
import {DefaultServices, NodeDef, NodeFlags, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asProviderData, asPureExpressionData, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createRootView, directiveDef, elementDef, pureArrayDef, pureObjectDef, purePipeDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';

import {INLINE_DYNAMIC_VALUES, InlineDynamic, checkNodeInlineOrDynamic} from './helper';

export function main() {
  describe(`View Pure Expressions`, () => {
    let services: Services;
    let renderComponentType: RenderComponentType;

    beforeEach(
        inject([RootRenderer, Sanitizer], (rootRenderer: RootRenderer, sanitizer: Sanitizer) => {
          services = new DefaultServices(rootRenderer, sanitizer);
          renderComponentType =
              new RenderComponentType('1', 'someUrl', 0, ViewEncapsulation.None, [], {});
        }));

    function compViewDef(
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn): ViewDefinition {
      return viewDef(ViewFlags.None, nodes, update, handleEvent, renderComponentType);
    }

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, () => viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    class Service {
      data: any;
    }

    describe('pure arrays', () => {

      INLINE_DYNAMIC_VALUES.forEach((inlineDynamic) => {
        it(`should support ${InlineDynamic[inlineDynamic]} bindings`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 2, 'span'), pureArrayDef(2),
                directiveDef(NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
              ],
              (view) => {
                setCurrentNode(view, 1);
                const pureValue = checkNodeInlineOrDynamic(inlineDynamic, values);
                setCurrentNode(view, 2);
                checkNodeInlineOrDynamic(inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 2).instance;

          values = [1, 2];
          checkAndUpdateView(view);
          const arr0 = service.data;
          expect(arr0).toEqual([1, 2]);

          // instance should not change
          // if the values don't change
          checkAndUpdateView(view);
          expect(service.data).toBe(arr0);

          values = [3, 2];
          checkAndUpdateView(view);
          const arr1 = service.data;
          expect(arr1).not.toBe(arr0);
          expect(arr1).toEqual([3, 2]);
        });

        it(`should unwrap values with ${InlineDynamic[inlineDynamic]}`, () => {
          let bindingValue: any;
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                pureArrayDef(1),
              ],
              (view) => {
                setCurrentNode(view, 1);
                checkNodeInlineOrDynamic(inlineDynamic, [bindingValue]);
              }));

          const exprData = asPureExpressionData(view, 1);

          bindingValue = 'v1';
          checkAndUpdateView(view);
          const v1Arr = exprData.value;
          expect(v1Arr).toEqual(['v1']);

          checkAndUpdateView(view);
          expect(exprData.value).toBe(v1Arr);

          bindingValue = WrappedValue.wrap('v1');
          checkAndUpdateView(view);
          expect(exprData.value).not.toBe(v1Arr);
          expect(exprData.value).toEqual(['v1']);
        });
      });

    });

    describe('pure objects', () => {
      INLINE_DYNAMIC_VALUES.forEach((inlineDynamic) => {
        it(`should support ${InlineDynamic[inlineDynamic]} bindings`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 2, 'span'), pureObjectDef(['a', 'b']),
                directiveDef(NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
              ],
              (view) => {
                setCurrentNode(view, 1);
                const pureValue = checkNodeInlineOrDynamic(inlineDynamic, values);
                setCurrentNode(view, 2);
                checkNodeInlineOrDynamic(inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 2).instance;

          values = [1, 2];
          checkAndUpdateView(view);
          const obj0 = service.data;
          expect(obj0).toEqual({a: 1, b: 2});

          // instance should not change
          // if the values don't change
          checkAndUpdateView(view);
          expect(service.data).toBe(obj0);

          values = [3, 2];
          checkAndUpdateView(view);
          const obj1 = service.data;
          expect(obj1).not.toBe(obj0);
          expect(obj1).toEqual({a: 3, b: 2});
        });

        it(`should unwrap values with ${InlineDynamic[inlineDynamic]}`, () => {
          let bindingValue: any;
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                pureObjectDef(['a']),
              ],
              (view) => {
                setCurrentNode(view, 1);
                checkNodeInlineOrDynamic(inlineDynamic, [bindingValue]);
              }));

          const exprData = asPureExpressionData(view, 1);

          bindingValue = 'v1';
          checkAndUpdateView(view);
          const v1Obj = exprData.value;
          expect(v1Obj).toEqual({'a': 'v1'});

          checkAndUpdateView(view);
          expect(exprData.value).toBe(v1Obj);

          bindingValue = WrappedValue.wrap('v1');
          checkAndUpdateView(view);
          expect(exprData.value).not.toBe(v1Obj);
          expect(exprData.value).toEqual({'a': 'v1'});
        });
      });
    });

    describe('pure pipes', () => {
      INLINE_DYNAMIC_VALUES.forEach((inlineDynamic) => {
        it(`should support ${InlineDynamic[inlineDynamic]} bindings`, () => {
          class SomePipe implements PipeTransform {
            transform(v1: any, v2: any) { return [v1 + 10, v2 + 20]; }
          }

          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 3, 'span'),
                directiveDef(NodeFlags.None, null, 0, SomePipe, []), purePipeDef(SomePipe, 2),
                directiveDef(NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
              ],
              (view) => {
                setCurrentNode(view, 2);
                const pureValue = checkNodeInlineOrDynamic(inlineDynamic, values);
                setCurrentNode(view, 3);
                checkNodeInlineOrDynamic(inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 3).instance;

          values = [1, 2];
          checkAndUpdateView(view);
          const obj0 = service.data;
          expect(obj0).toEqual([11, 22]);

          // instance should not change
          // if the values don't change
          checkAndUpdateView(view);
          expect(service.data).toBe(obj0);

          values = [3, 2];
          checkAndUpdateView(view);
          const obj1 = service.data;
          expect(obj1).not.toBe(obj0);
          expect(obj1).toEqual([13, 22]);
        });

        it(`should unwrap values with ${InlineDynamic[inlineDynamic]}`, () => {
          let bindingValue: any;
          let transformSpy = jasmine.createSpy('transform');

          class SomePipe implements PipeTransform {
            transform = transformSpy;
          }

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 2, 'span'),
                directiveDef(NodeFlags.None, null, 0, SomePipe, []),
                purePipeDef(SomePipe, 1),
              ],
              (view) => {
                setCurrentNode(view, 2);
                checkNodeInlineOrDynamic(inlineDynamic, [bindingValue]);
              }));

          bindingValue = 'v1';
          checkAndUpdateView(view);
          expect(transformSpy).toHaveBeenCalledWith('v1');

          transformSpy.calls.reset();
          checkAndUpdateView(view);
          expect(transformSpy).not.toHaveBeenCalled();

          bindingValue = WrappedValue.wrap('v1');
          checkAndUpdateView(view);
          expect(transformSpy).toHaveBeenCalledWith('v1');
        });
      });
    });
  });
}
