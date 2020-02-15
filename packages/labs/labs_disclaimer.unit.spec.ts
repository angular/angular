/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertExperimentalAgreement, iWantToUseExperimentalAPIs} from './labs_disclaimer';

describe('disclaimer', () => {
  it('should reset disclaimer', () => {
    expect(() => iWantToUseExperimentalAPIs(null as any)).toThrowError();
    expect(() => assertExperimentalAgreement()).toThrowError();
  });

  it('should allow API after agreement', () => {
    expect(
        () =>
            iWantToUseExperimentalAPIs({iUnderstand: ['not ready for production', 'unstable API']}))
        .not.toThrowError();
    expect(() => assertExperimentalAgreement()).not.toThrowError();
  });
});
