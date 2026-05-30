/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Debouncer} from './debouncer';

/** Runs the provided callback with an `ng` string argument. */
function run(cb: (arg: string) => void) {
  cb('ng');
}

describe('Debouncer', () => {
  let debouncer: Debouncer;

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
    debouncer = new Debouncer();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should exist', () => {
    expect(debouncer).toBeTruthy();
  });

  it('should debounce the callback', () => {
    const callback = jasmine.createSpy();
    run(debouncer.debounce(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    jasmine.clock().tick(990);
    expect(callback).not.toHaveBeenCalled();

    jasmine.clock().tick(1010);
    expect(callback).toHaveBeenCalledOnceWith('ng');
  });

  it('should cancel the debounce', () => {
    const callback = jasmine.createSpy();
    run(debouncer.debounce(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    jasmine.clock().tick(990);
    expect(callback).not.toHaveBeenCalled();

    debouncer.cancel();

    jasmine.clock().tick(1010);
    expect(callback).not.toHaveBeenCalled();
  });
});
