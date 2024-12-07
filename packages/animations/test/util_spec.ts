/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('util', () => {
  it('should schedule a microtask and not call an async timeout', (done) => {
    let count = 0;
    queueMicrotask(() => count++);

    expect(count).toEqual(0);
    queueMicrotask(() => {
      expect(count).toEqual(1);
      done();
    });
    expect(count).toEqual(0);
  });
});
