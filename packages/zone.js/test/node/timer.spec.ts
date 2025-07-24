/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setTimeout as sleep} from 'node:timers/promises';
import {promisify} from 'node:util';
import {taskSymbol} from '../../lib/common/timers';

describe('node timer', () => {
  it('util.promisify should work with setTimeout', (done: DoneFn) => {
    const setTimeoutPromise = promisify(setTimeout);
    setTimeoutPromise(50, 'value').then(
      (value) => {
        expect(value).toEqual('value');
        done();
      },
      (error) => {
        fail(`should not be here with error: ${error}.`);
      },
    );
  });

  it('util.promisify should work with setImmediate', (done: DoneFn) => {
    const setImmediatePromise = promisify(setImmediate);
    setImmediatePromise('value').then(
      (value) => {
        expect(value).toEqual('value');
        done();
      },
      (error) => {
        fail(`should not be here with error: ${error}.`);
      },
    );
  });

  it(`'Timeout.refresh' should restart the 'setTimeout' when it is not scheduled`, async () => {
    const spy = jasmine.createSpy();
    const timeout = setTimeout(spy, 100) as unknown as NodeJS.Timeout;

    let iterations = 5;
    for (let i = 1; i <= iterations; i++) {
      timeout.refresh();
      await sleep(150);
    }

    expect((timeout as any)[taskSymbol].runCount).toBe(iterations);

    clearTimeout(timeout);

    expect((timeout as any)[taskSymbol]).toBeNull();
    expect(spy).toHaveBeenCalledTimes(iterations);
  });

  it(`'Timeout.refresh' restarts the 'setTimeout' when it is running`, async () => {
    let timeout: NodeJS.Timeout;
    const spy = jasmine.createSpy().and.callFake(() => timeout.refresh());
    timeout = setTimeout(spy, 100) as unknown as NodeJS.Timeout;

    await sleep(250);

    expect((timeout as any)[taskSymbol].runCount).toBe(2);

    clearTimeout(timeout);

    expect((timeout as any)[taskSymbol]).toBeNull();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it(`'Timeout.refresh' should restart the 'setInterval'`, async () => {
    const spy = jasmine.createSpy();
    const interval = setInterval(spy, 200) as unknown as NodeJS.Timeout;

    // Restart the interval multiple times before the elapsed time.
    for (let i = 1; i <= 4; i++) {
      interval.refresh();
      await sleep(100);
    }

    // Time did not elapse
    expect((interval as any)[taskSymbol].runCount).toBe(0);
    expect(spy).toHaveBeenCalledTimes(0);

    await sleep(350);
    expect((interval as any)[taskSymbol].runCount).toBe(2);

    clearInterval(interval);

    expect((interval as any)[taskSymbol]).toBeNull();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
