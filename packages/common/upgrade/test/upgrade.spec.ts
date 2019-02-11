/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationUpgradeModule, LocationUpgradeService} from '@angular/common/upgrade';
import {TestBed, inject} from '@angular/core/testing';
import {UpgradeModule} from '@angular/upgrade/static';

describe('LocationUpgradeService', () => {
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LocationUpgradeModule],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.get(UpgradeModule);
    upgradeModule.$injector = {
      get: jasmine.createSpy('$injector.get').and.returnValue({'$on': () => undefined})
    };
  });

  it('should instantiate LocationUpgradeService',
     inject([LocationUpgradeService], (location: LocationUpgradeService) => {
       expect(location).toBeDefined();
       expect(location instanceof LocationUpgradeService).toBe(true);
     }));
});