/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

function wrap(fn: () => Promise<void>): (done: DoneFn) => void {
  return (done: DoneFn) => { fn().then(() => done()).catch(err => done.fail(err)); };
}

export function async_beforeAll(fn: () => Promise<void>): void {
  beforeAll(wrap(fn));
}

export function async_beforeEach(fn: () => Promise<void>): void {
  beforeEach(wrap(fn));
}

export function async_it(desc: string, fn: () => Promise<void>): void {
  it(desc, wrap(fn));
}

export function async_fit(desc: string, fn: () => Promise<void>): void {
  // tslint:disable-next-line:no-jasmine-focus
  fit(desc, wrap(fn));
}
