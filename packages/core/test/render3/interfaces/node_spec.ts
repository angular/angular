/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNodeType, toTNodeTypeAsString} from '@angular/core/src/render3/interfaces/node';

describe('node interfaces', () => {
  describe('TNodeType', () => {
    it('should agree with toTNodeTypeAsString', () => {
      expect(toTNodeTypeAsString(TNodeType.Element)).toEqual('Element');
      expect(toTNodeTypeAsString(TNodeType.Text)).toEqual('Text');
      expect(toTNodeTypeAsString(TNodeType.Container)).toEqual('Container');
      expect(toTNodeTypeAsString(TNodeType.Projection)).toEqual('Projection');
      expect(toTNodeTypeAsString(TNodeType.ElementContainer)).toEqual('ElementContainer');
      expect(toTNodeTypeAsString(TNodeType.Icu)).toEqual('IcuContainer');
      expect(toTNodeTypeAsString(TNodeType.Placeholder)).toEqual('Placeholder');

      expect(toTNodeTypeAsString(
                 TNodeType.Container | TNodeType.Projection | TNodeType.Element |
                 TNodeType.ElementContainer | TNodeType.Icu))
          .toEqual('Element|Container|ElementContainer|Projection|IcuContainer');
    });
  });
});
