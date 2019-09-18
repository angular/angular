/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {registerBinding} from '@angular/core/src/render3/styling/bindings';
import {NodeStylingDebug, attachStylingDebugObject} from '@angular/core/src/render3/styling/styling_debug';
import {allocTStylingContext} from '@angular/core/src/render3/util/styling_utils';

describe('styling debugging tools', () => {
  describe('NodeStylingDebug', () => {
    it('should list out each of the values in the context paired together with the provided data',
       () => {
         const debug = makeContextWithDebug(false);
         const context = debug.context;
         const data: any[] = [];
         const d = new NodeStylingDebug(context, data, false);

         registerBinding(context, 0, 0, 'width', null);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: null,
             bindingIndex: null,
           },
         });

         registerBinding(context, 0, 0, 'width', '100px');
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '100px',
             bindingIndex: null,
           },
         });

         const someBindingIndex1 = 1;
         data[someBindingIndex1] = '200px';

         registerBinding(context, 0, 0, 'width', someBindingIndex1);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '200px',
             bindingIndex: someBindingIndex1,
           },
         });

         const someBindingIndex2 = 2;
         data[someBindingIndex2] = '500px';

         registerBinding(context, 0, 1, 'width', someBindingIndex2);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '200px',
             bindingIndex: someBindingIndex1,
           },
         });
       });
  });
});

function makeContextWithDebug(isClassBased: boolean) {
  const ctx = allocTStylingContext();
  return attachStylingDebugObject(ctx, isClassBased);
}
