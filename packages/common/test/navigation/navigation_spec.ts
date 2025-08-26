/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵFakeNavigation as FakeNavigation} from '../../testing';
import {PlatformNavigation} from '../../index';
import {TestBed} from '@angular/core/testing';

describe('Navigation', () => {
  it('provides fake navigation by default', () => {
    const nav = TestBed.inject(PlatformNavigation);
    expect(nav).toBeInstanceOf(FakeNavigation);
  });

  it('can inject and use the navigation API by default', async () => {
    const nav = TestBed.inject(PlatformNavigation);
    expect(nav.entries().length).toBe(1);
    await nav.navigate('/someUrl').finished;
    expect(nav.entries().length).toBe(2);
  });
});
