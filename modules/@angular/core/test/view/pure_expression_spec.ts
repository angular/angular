/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, PipeTransform, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, WrappedValue} from '@angular/core';
import {ArgumentType, NodeDef, NodeFlags, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asProviderData, asPureExpressionData, directiveDef, elementDef, pureArrayDef, pureObjectDef, purePipeDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';

import {ARG_TYPE_VALUES, checkNodeInlineOrDynamic, createRootView} from './helper';

export function main() {
  describe(`View Pure Expressions`, () => {
    function compViewDef(
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn,
        viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
      return viewDef(viewFlags, nodes, update, handleEvent);
    }

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    class Service {
      data: any;
    }

    describe('pure arrays', () => {

      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should support ${ArgumentType[inlineDynamic]} bindings`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 2, 'span'), pureArrayDef(2),
                directiveDef(NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
              ],
              (check, view) => {
                const pureValue = checkNodeInlineOrDynamic(check, view, 1, inlineDynamic, values);
                checkNodeInlineOrDynamic(check, view, 2, inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 2).instance;

          values = [1, 2];
          Services.checkAndUpdateView(view);
          const arr0 = service.data;
          expect(arr0).toEqual([1, 2]);

          // instance should not change
          // if the values don't change
          Services.checkAndUpdateView(view);
          expect(service.data).toBe(arr0);

          values = [3, 2];
          Services.checkAndUpdateView(view);
          const arr1 = service.data;
          expect(arr1).not.toBe(arr0);
          expect(arr1).toEqual([3, 2]);
        });

        it(`should unwrap values with ${ArgumentType[inlineDynamic]}`, () => {
          let bindingValue: any;
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                pureArrayDef(1),
              ],
              (check, view) => {
                checkNodeInlineOrDynamic(check, view, 1, inlineDynamic, [bindingValue]);
              }));

          const exprData = asPureExpressionData(view, 1);

          bindingValue = 'v1';
          Services.checkAndUpdateView(view);
          const v1Arr = exprData.value;
          expect(v1Arr).toEqual(['v1']);

          Services.checkAndUpdateView(view);
          expect(exprData.value).toBe(v1Arr);

          bindingValue = WrappedValue.wrap('v1');
          Services.checkAndUpdateView(view);
          expect(exprData.value).not.toBe(v1Arr);
          expect(exprData.value).toEqual(['v1']);
        });
      });

    });

    describe('pure objects', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should support ${ArgumentType[inlineDynamic]} bindings`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 2, 'span'), pureObjectDef(['a', 'b']),
                directiveDef(NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
              ],
              (check, view) => {
                const pureValue = checkNodeInlineOrDynamic(check, view, 1, inlineDynamic, values);
                checkNodeInlineOrDynamic(check, view, 2, inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 2).instance;

          values = [1, 2];
          Services.checkAndUpdateView(view);
          const obj0 = service.data;
          expect(obj0).toEqual({a: 1, b: 2});

          // instance should not change
          // if the values don't change
          Services.checkAndUpdateView(view);
          expect(service.data).toBe(obj0);

          values = [3, 2];
          Services.checkAndUpdateView(view);
          const obj1 = service.data;
          expect(obj1).not.toBe(obj0);
          expect(obj1).toEqual({a: 3, b: 2});
        });

        it(`should unwrap values with ${ArgumentType[inlineDynamic]}`, () => {
          let bindingValue: any;
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                pureObjectDef(['a']),
              ],
              (check, view) => {
                checkNodeInlineOrDynamic(check, view, 1, inlineDynamic, [bindingValue]);
              }));

          const exprData = asPureExpressionData(view, 1);

          bindingValue = 'v1';
          Services.checkAndUpdateView(view);
          const v1Obj = exprData.value;
          expect(v1Obj).toEqual({'a': 'v1'});

          Services.checkAndUpdateView(view);
          expect(exprData.value).toBe(v1Obj);

          bindingValue = WrappedValue.wrap('v1');
          Services.checkAndUpdateView(view);
          expect(exprData.value).not.toBe(v1Obj);
          expect(exprData.value).toEqual({'a': 'v1'});
        });
      });
    });

    describe('pure pipes', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should support ${ArgumentType[inlineDynamic]} bindings`, () => {
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
              (check, view) => {
                const pureValue = checkNodeInlineOrDynamic(check, view, 2, inlineDynamic, values);
                checkNodeInlineOrDynamic(check, view, 3, inlineDynamic, [pureValue]);
              }));
          const service = asProviderData(view, 3).instance;

          values = [1, 2];
          Services.checkAndUpdateView(view);
          const obj0 = service.data;
          expect(obj0).toEqual([11, 22]);

          // instance should not change
          // if the values don't change
          Services.checkAndUpdateView(view);
          expect(service.data).toBe(obj0);

          values = [3, 2];
          Services.checkAndUpdateView(view);
          const obj1 = service.data;
          expect(obj1).not.toBe(obj0);
          expect(obj1).toEqual([13, 22]);
        });

        it(`should unwrap values with ${ArgumentType[inlineDynamic]}`, () => {
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
              (check, view) => {
                checkNodeInlineOrDynamic(check, view, 2, inlineDynamic, [bindingValue]);
              }));

          bindingValue = 'v1';
          Services.checkAndUpdateView(view);
          expect(transformSpy).toHaveBeenCalledWith('v1');

          transformSpy.calls.reset();
          Services.checkAndUpdateView(view);
          expect(transformSpy).not.toHaveBeenCalled();

          bindingValue = WrappedValue.wrap('v1');
          Services.checkAndUpdateView(view);
          expect(transformSpy).toHaveBeenCalledWith('v1');
        });
      });
    });
  });
}
