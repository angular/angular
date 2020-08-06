/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNodeType, TNodeTypeAsString} from '@angular/core/src/render3/interfaces/node';

describe('node interfaces', () => {
  describe('TNodeType', () => {
    it('should agree with TNodeTypeAsString', () => {
      expect(TNodeTypeAsString[TNodeType.Container]).toEqual('Container');
      expect(TNodeTypeAsString[TNodeType.Projection]).toEqual('Projection');
      expect(TNodeTypeAsString[TNodeType.View]).toEqual('View');
      expect(TNodeTypeAsString[TNodeType.Element]).toEqual('Element');
      expect(TNodeTypeAsString[TNodeType.ElementContainer]).toEqual('ElementContainer');
      expect(TNodeTypeAsString[TNodeType.IcuContainer]).toEqual('IcuContainer');
    });
  });
});