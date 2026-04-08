/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '../../src/application/application_ref';
import {TestBed} from '../../testing/src/test_bed';

describe('isHydrationComplete Signal', () => {
  it('should default to false and flip to true when manually set internally', () => {
    const appRef = TestBed.inject(ApplicationRef);
    expect(appRef.isHydrationComplete()).toBeFalse();

    (
      appRef as unknown as {_isHydrationComplete: {set: (v: boolean) => void}}
    )._isHydrationComplete.set(true);
    expect(appRef.isHydrationComplete()).toBeTrue();
  });
});
