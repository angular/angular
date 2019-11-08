/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TStylingNode} from '@angular/core/src/render3/interfaces/styling';
import {registerBinding} from '@angular/core/src/render3/styling/bindings';
import {NodeStylingDebug, attachStylingDebugObject} from '@angular/core/src/render3/styling/styling_debug';
import {allocTStylingContext} from '@angular/core/src/render3/util/styling_utils';

describe('styling debugging tools', () => {
  describe('NodeStylingDebug', () => {
    it('should list out each of the values in the context paired together with the provided data',
       () => {
         if (isIE()) return;

         const values = makeContextWithDebug(false);
         const context = values.context;
         const tNode = values.tNode;

         const data: any[] = [];
         const d = new NodeStylingDebug(context, tNode, data, false);

         registerBinding(context, tNode, 0, 0, 'width', null, false, false);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: null,
           },
         });

         registerBinding(context, tNode, 0, 0, 'width', '100px', false, false);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '100px',
           },
         });

         const someBindingIndex1 = 1;
         data[someBindingIndex1] = '200px';

         registerBinding(context, tNode, 0, 0, 'width', someBindingIndex1, false, false);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '200px',
           },
         });

         const someBindingIndex2 = 2;
         data[someBindingIndex2] = '500px';

         registerBinding(context, tNode, 0, 1, 'width', someBindingIndex2, false, false);
         expect(d.summary).toEqual({
           width: {
             prop: 'width',
             value: '200px',
           },
         });
       });
  });
});

function makeContextWithDebug(isClassBased: boolean) {
  const context = allocTStylingContext(null, false);
  const tNode = createTStylingNode();
  attachStylingDebugObject(context, tNode, isClassBased);
  return {context, tNode};
}

function createTStylingNode(): TStylingNode {
  return {flags: 0};
}

function isIE() {
  // note that this only applies to older IEs (not edge)
  return typeof window !== 'undefined' && (window as any).document['documentMode'] ? true : false;
}
