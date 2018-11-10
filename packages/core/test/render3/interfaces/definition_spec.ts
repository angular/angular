/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy as r2_ChangeDetectionStrategy} from '../../../src/change_detection/constants';
import {ViewEncapsulation as r2_ViewEncapsulation} from '../../../src/metadata/view';
import * as r3 from '../../../src/render3/interfaces/definition';

describe('constants have same value: ', () => {
  describe('ChangeDetectionStrategy', () => {
    it('should be same as Render2', () => {
      expect(r3.ChangeDetectionStrategy.Default).toEqual(r2_ChangeDetectionStrategy.Default as any);
      expect(r3.ChangeDetectionStrategy.OnPush).toEqual(r2_ChangeDetectionStrategy.OnPush as any);
    });
  });

  describe('ViewEncapsulation', () => {
    it('should be same as Render2', () => {
      expect(r3.ViewEncapsulation.Emulated).toEqual(r2_ViewEncapsulation.Emulated as any);
      expect(r3.ViewEncapsulation.Native).toEqual(r2_ViewEncapsulation.Native as any);
      expect(r3.ViewEncapsulation.None).toEqual(r2_ViewEncapsulation.None as any);
      expect(r3.ViewEncapsulation.ShadowDom).toEqual(r2_ViewEncapsulation.ShadowDom as any);
    });
  });

});
