/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../src/di/injector';
import {EnvironmentInjector} from '../../src/di/r3_injector';
import {createEnvironmentInjector} from '../../src/render3/ng_module_ref';
import {computed} from '../../src/render3/reactivity/computed';
import {signal} from '../../src/render3/reactivity/signal';
import {debounceResource} from '../../src/resource/debounce';
import {TestBed} from '../../testing';

describe('debounceResource', () => {
  it('should start with loading state and resolve after wait', async () => {
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 1, injector: TestBed.inject(Injector)});

    TestBed.tick();

    expect(res.status()).toBe('loading');
    expect(res.value()).toBeUndefined();

    await delay(1);
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');
  });

  it('should debounce updates', async () => {
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 2, injector: TestBed.inject(Injector)});

    TestBed.tick();
    await delay(2);
    expect(res.status()).toBe('resolved');

    source.set('updated');
    TestBed.tick();

    // Should be reloading now
    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('initial'); // Keeps old value while reloading

    await delay(1);
    expect(res.status()).toBe('reloading');

    await delay(1);
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('updated');
  });

  it('should restart debounce on rapid updates', async () => {
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 2, injector: TestBed.inject(Injector)});

    TestBed.tick();
    await delay(2);

    source.set('update1');
    TestBed.tick();
    expect(res.status()).toBe('reloading');

    await delay(1);
    source.set('update2');
    TestBed.tick();

    // Timer should have reset
    await delay(1); // Total 2 from start, but only 1 from update2
    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('initial');

    await delay(1); // Total 2 from update2
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update2');
  });

  it('should transition to error state if source throws', async () => {
    const val = signal('initial');
    const source = computed(() => {
      if (val() === 'error') throw new Error('fail');
      return val();
    });

    const res = debounceResource({params: source, wait: 1, injector: TestBed.inject(Injector)});
    TestBed.tick();
    await delay(1);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    val.set('error');
    TestBed.tick();

    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(new Error('fail'));

    // Recover
    val.set('recovered');
    TestBed.tick();
    // It should start loading (undefined value) because we were in error state
    expect(res.status()).toBe('loading');
    expect(res.value()).toBeUndefined();

    await delay(1);
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('recovered');
  });

  it('should cleanup timer when injector is destroyed', async () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const injector = createEnvironmentInjector([], parentInjector);
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 1, injector});

    TestBed.tick();
    await delay(1);

    source.set('updated');
    TestBed.tick();

    expect(res.status()).toBe('reloading');

    injector.destroy();

    await delay(2);

    // Verify it didn't update to 'resolved'
    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('initial');
  });

  it('should support a custom wait function returning a promise', async () => {
    const source = signal('initial');
    let release: () => void = () => {};
    let calls = 0;
    const waitFn = () =>
      new Promise<void>((resolve) => {
        calls++;
        release = resolve;
      });

    const res = debounceResource({
      params: source,
      wait: waitFn,
      injector: TestBed.inject(Injector),
    });

    // Initial load
    expect(res.status()).toBe('loading');

    TestBed.tick(); // trigger effect (if not already triggered)

    // Release initial
    release();
    // We need to wait for the promise to resolve, which is async
    await Promise.resolve();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    source.set('updated');
    TestBed.tick();

    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('initial');

    release();
    // Promise resolution is microtask
    await Promise.resolve();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('updated');
  });

  it('should support a custom wait function returning void (synchronous)', async () => {
    const source = signal('initial');
    const waitFn = () => {};

    const res = debounceResource({
      params: source,
      wait: waitFn,
      injector: TestBed.inject(Injector),
    });

    // Initially loading before effect runs
    expect(res.status()).toBe('loading');

    TestBed.tick();

    // Should be resolved after effect runs
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    source.set('updated');
    TestBed.tick();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('updated');
  });

  it('should cancel previous promise when new value arrives', async () => {
    const source = signal('initial');
    let releaseInitial: () => void = () => {};
    let release1: () => void = () => {};
    let release2: () => void = () => {};

    const waitFn = (val: string) =>
      new Promise<void>((resolve) => {
        if (val === 'initial') releaseInitial = resolve;
        if (val === 'update1') release1 = resolve;
        if (val === 'update2') release2 = resolve;
      });

    const res = debounceResource({
      params: source,
      wait: waitFn,
      injector: TestBed.inject(Injector),
    });

    // Initial load
    expect(res.status()).toBe('loading');
    TestBed.tick();

    releaseInitial();
    await Promise.resolve();
    expect(res.status()).toBe('resolved');

    source.set('update1');
    TestBed.tick();
    expect(res.status()).toBe('reloading');

    source.set('update2');
    TestBed.tick();
    expect(res.status()).toBe('reloading');

    // Release first promise - should be ignored
    release1();
    await Promise.resolve();
    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('initial');

    // Release second promise - should update
    release2();
    await Promise.resolve();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update2');
  });

  it('should not reload if value is equal to current resolved value (default equality)', async () => {
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 1, injector: TestBed.inject(Injector)});

    TestBed.tick();
    await delay(1);
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    source.set('initial'); // Same value
    TestBed.tick();

    expect(res.status()).toBe('resolved'); // Should not change status
  });

  it('should not restart debounce if value is equal to current pending value (default equality)', async () => {
    const source = signal('initial');
    const res = debounceResource({params: source, wait: 2, injector: TestBed.inject(Injector)});

    TestBed.tick();
    await delay(2);
    expect(res.status()).toBe('resolved');

    source.set('update1');
    TestBed.tick();
    expect(res.status()).toBe('reloading');

    await delay(1);
    source.set('update1'); // Same pending value
    TestBed.tick();

    await delay(1); // Total 2 from first update1
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update1');
  });

  it('should use custom equality function', async () => {
    const source = signal({id: 1, val: 'a'});
    const res = debounceResource({
      params: source,
      wait: 1,
      injector: TestBed.inject(Injector),
      equal: (a, b) => a.id === b.id,
    });

    TestBed.tick();
    await delay(1);
    expect(res.value()).toEqual({id: 1, val: 'a'});

    source.set({id: 1, val: 'b'}); // Different object, same ID
    TestBed.tick();

    expect(res.status()).toBe('resolved'); // Should not reload
    expect(res.value()).toEqual({id: 1, val: 'a'}); // Should keep old value
  });

  it('should use defaultValue for initial value', () => {
    const source = signal('initial');
    const res = debounceResource({
      params: source,
      wait: 1,
      injector: TestBed.inject(Injector),
      defaultValue: 'default',
    });

    TestBed.tick(); // Start effect
    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('default');
  });

  it('should use defaultValue when recovering from error state', async () => {
    const val = signal('initial');
    const source = computed(() => {
      if (val() === 'error') throw new Error('fail');
      return val();
    });

    const res = debounceResource({
      params: source,
      wait: 1,
      injector: TestBed.inject(Injector),
      defaultValue: 'default',
    });

    TestBed.tick();
    await delay(1);
    expect(res.value()).toBe('initial');

    val.set('error');
    TestBed.tick();
    expect(res.status()).toBe('error');

    val.set('recovered');
    TestBed.tick();

    // Should go back to loading with defaultValue
    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('default');

    await delay(1);
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('recovered');
  });
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
