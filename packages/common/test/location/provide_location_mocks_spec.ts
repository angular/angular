/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, provideLocationMocks, SpyLocation} from '@angular/common/testing';
import {TestBed} from '@angular/core/testing';


describe('provideLocationMocks() function', () => {
  it('should mock Location and LocationStrategy classes', () => {
    TestBed.configureTestingModule({providers: [provideLocationMocks()]});
    const location = TestBed.inject(Location);
    const locationStrategy = TestBed.inject(LocationStrategy);

    expect(location).toBeInstanceOf(SpyLocation);
    expect(locationStrategy).toBeInstanceOf(MockLocationStrategy);
  });
});
