/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectiveInjector} from '@angular/core';
import {IterableDiffers} from '@angular/core/src/change_detection/differs/iterable_differs';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

import {SpyIterableDifferFactory} from '../../spies';

export function main() {
  describe('IterableDiffers', function() {
    let factory1: any /** TODO #9100 */;
    let factory2: any /** TODO #9100 */;
    let factory3: any /** TODO #9100 */;

    beforeEach(() => {
      factory1 = new SpyIterableDifferFactory();
      factory2 = new SpyIterableDifferFactory();
      factory3 = new SpyIterableDifferFactory();
    });

    it('should throw when no suitable implementation found', () => {
      const differs = new IterableDiffers([]);
      expect(() => differs.find('some object'))
          .toThrowError(/Cannot find a differ supporting object 'some object'/);
    });

    it('should return the first suitable implementation', () => {
      factory1.spy('supports').and.returnValue(false);
      factory2.spy('supports').and.returnValue(true);
      factory3.spy('supports').and.returnValue(true);

      const differs = IterableDiffers.create(<any>[factory1, factory2, factory3]);
      expect(differs.find('some object')).toBe(factory2);
    });

    it('should copy over differs from the parent repo', () => {
      factory1.spy('supports').and.returnValue(true);
      factory2.spy('supports').and.returnValue(false);

      const parent = IterableDiffers.create(<any>[factory1]);
      const child = IterableDiffers.create(<any>[factory2], parent);

      expect(child.factories).toEqual([factory2, factory1]);
    });

    describe('.extend()', () => {
      it('should throw if calling extend when creating root injector', () => {
        const injector = ReflectiveInjector.resolveAndCreate([IterableDiffers.extend([])]);

        expect(() => injector.get(IterableDiffers))
            .toThrowError(/Cannot extend IterableDiffers without a parent injector/);
      });

      it('should extend di-inherited diffesr', () => {
        const parent = new IterableDiffers([factory1]);
        const injector =
            ReflectiveInjector.resolveAndCreate([{provide: IterableDiffers, useValue: parent}]);
        const childInjector = injector.resolveAndCreateChild([IterableDiffers.extend([factory2])]);

        expect(injector.get(IterableDiffers).factories).toEqual([factory1]);
        expect(childInjector.get(IterableDiffers).factories).toEqual([factory2, factory1]);
      });
    });
  });
}
