/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform} from '@angular/core';
import {asProviderData, directiveDef, elementDef, NodeFlags, nodeValue, pipeDef, pureArrayDef, pureObjectDef, purePipeDef, Services} from '@angular/core/src/view/index';

import {ARG_TYPE_VALUES, checkNodeInlineOrDynamic, compViewDef, createAndGetRootNodes} from './helper';

{
  describe(`View Pure Expressions`, () => {
    class Service {
      data: any;
    }

    describe('pure arrays', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(0, NodeFlags.None, null, null, 2, 'span'),
                pureArrayDef(1, 2),
                directiveDef(2, NodeFlags.None, null, 0, Service, [], {data: [0, 'data']}),
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
      });
    });

    describe('pure objects', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(0, NodeFlags.None, null, null, 2, 'span'),
                pureObjectDef(1, {a: 0, b: 1}),
                directiveDef(2, NodeFlags.None, null, 0, Service, [], {data: [0, 'data']})
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
      });
    });

    describe('pure pipes', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          class SomePipe implements PipeTransform {
            transform(v1: any, v2: any) {
              return [v1 + 10, v2 + 20];
            }
          }

          let values: any[];

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(0, NodeFlags.None, null!, null!, 3, 'span'),
                pipeDef(NodeFlags.None, SomePipe, []),
                purePipeDef(2, 2),
                directiveDef(3, NodeFlags.None, null, 0, Service, [], {data: [0, 'data']}),
              ],
              (check, view) => {
                const pureValue = checkNodeInlineOrDynamic(
                    check, view, 2, inlineDynamic, [nodeValue(view, 1)].concat(values));
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
      });
    });
  });
}
