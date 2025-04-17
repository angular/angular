/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '../public_api';
import {TestBed, waitForSignal} from '../testing/public_api';

describe('async', () => {
  it('should resolve directly if the signal value is truthy', async () => {
    const sig = signal(true);
    const result = waitForSignal(sig);
    await expectAsync(result).toBeResolvedTo(true);
    const sig2 = signal('truthy');
    const result2 = waitForSignal(sig2);
    await expectAsync(result2).toBeResolvedTo('truthy');
  });

  it('should be rejected after timeout millisecond', async () => {
    const sig = signal(true);
    const testFn = (value: boolean) => {
      return value === false;
    };
    const result = waitForSignal(sig, testFn, {timeout: 100});
    await expectAsync(result).toBeRejected();
  });

  it('should be resolve correctly when the signal reach the correct value', async () => {
    const sig = signal(true);
    const testFn = (value: boolean) => {
      return value === false;
    };
    const result = waitForSignal(sig, testFn, {timeout: 1000});
    setTimeout(() => {
      sig.set(false);
    }, 500);

    await expectAsync(result).toBeResolvedTo(false);
  });

  it('should be rejected when signal is destroyed', async () => {
    const sig = signal(false);
    let result: Promise<boolean>;

    const inj = Injector.create({
      providers: [],
      parent: TestBed.inject(Injector),
    });
    result = waitForSignal(sig, undefined, {timeout: 1000, injector: inj});
    setTimeout(() => {
      sig.set(true);
    }, 500);
    inj.destroy();
    await expectAsync(result).toBeRejected();
  });
});
