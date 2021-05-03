/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InternalInjectFlags} from '../../src/di/interface/injector';

describe('InjectFlags', () => {
  it('should always match InternalInjectFlags', () => {
    expect(InjectFlags.Default).toEqual(InternalInjectFlags.Default as number);
    expect(InjectFlags.Host).toEqual(InternalInjectFlags.Host as number);
    expect(InjectFlags.Self).toEqual(InternalInjectFlags.Self as number);
    expect(InjectFlags.SkipSelf).toEqual(InternalInjectFlags.SkipSelf as number);
    expect(InjectFlags.Optional).toEqual(InternalInjectFlags.Optional as number);
  });
});