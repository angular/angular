/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {INJECTOR_KEY} from '@angular/upgrade/src/common/constants';
import {downgradeInjectable} from '@angular/upgrade/src/common/downgrade_injectable';

export function main() {
  describe('downgradeInjectable', () => {
    it('should return an AngularJS annotated factory for the token', () => {
      const factory = downgradeInjectable('someToken');
      expect(factory).toEqual(jasmine.any(Function));
      expect((factory as any).$inject).toEqual([INJECTOR_KEY]);

      const injector = {get: jasmine.createSpy('get').and.returnValue('service value')};
      const value = factory(injector);
      expect(injector.get).toHaveBeenCalledWith('someToken');
      expect(value).toEqual('service value');
    });
  });
}
