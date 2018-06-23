/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {jasmineAwait} from '../../testing';


describe('await', () => {
  let pass: boolean;
  beforeEach(() => pass = false);
  afterEach(() => expect(pass).toBe(true));

  it('should convert passes', jasmineAwait(async() => { pass = await Promise.resolve(true); }));

  it('should convert failures', (done) => {
    const error = new Error();
    const fakeDone: DoneFn = function() { fail('passed, but should have failed'); } as any;
    fakeDone.fail = function(value: any) {
      expect(value).toBe(error);
      done();
    };
    jasmineAwait(async() => {
      pass = await Promise.resolve(true);
      throw error;
    })(fakeDone);
  });
});