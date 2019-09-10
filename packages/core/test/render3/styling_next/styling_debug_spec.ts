/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {registerBinding} from '@angular/core/src/render3/styling_next/bindings';
import {NodeStylingDebug, attachStylingDebugObject} from '@angular/core/src/render3/styling_next/styling_debug';
import {allocTStylingContext} from '@angular/core/src/render3/styling_next/util';

describe('styling debugging tools', () => {
  describe('NodeStylingDebug', () => {
    it('should list out each of the values in the context paired together with the provided data',
       () => {
         const debug = makeContextWithDebug();
         const context = debug.context;
         const data: any[] = [];
         const d = new NodeStylingDebug(context, data);

         registerBinding(context, 0, 'width', null);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: null,
             bindingIndex: null,
           },
         });

         registerBinding(context, 0, 'width', '100px');
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '100px',
             bindingIndex: null,
           },
         });

         const someBindingIndex1 = 1;
         data[someBindingIndex1] = '200px';

         registerBinding(context, 0, 'width', someBindingIndex1);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '200px',
             bindingIndex: someBindingIndex1,
           },
         });

         const someBindingIndex2 = 2;
         data[someBindingIndex2] = '500px';

         registerBinding(context, 0, 'width', someBindingIndex2);
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

function makeContextWithDebug() {
  const ctx = allocTStylingContext();
  return attachStylingDebugObject(ctx);
}
