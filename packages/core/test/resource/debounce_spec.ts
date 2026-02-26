/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {timeout} from '@angular/private/testing';
import {Injector} from '../../src/di';
import {EnvironmentInjector} from '../../src/di/r3_injector';
import {createEnvironmentInjector} from '../../src/render3/ng_module_ref';
import {computed} from '../../src/render3/reactivity/computed';
import {signal} from '../../src/render3/reactivity/signal';
import {resource} from '../../src/resource';
import {debounced} from '../../src/resource/debounce';
import {TestBed} from '../../testing';

describe('debounced', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
  });

  it('should start in resolved state', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    TestBed.tick();
    await timeout(10);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');
  });

  it('should debounce updates', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    expect(res.status()).toBe('resolved');

    source.set('updated');
    TestBed.tick();

    // Should be loading, but retain previous value.
    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');

    await timeout(5);

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');

    await timeout(5);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('updated');
  });

  it('should restart debounce on rapid updates', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    source.set('update1');
    TestBed.tick();

    expect(res.status()).toBe('loading');

    await timeout(5);

    source.set('update2');
    TestBed.tick();
    await timeout(5); // Total 10 from start, but only 5 from update2

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');

    await timeout(5); // Total 10 from update2

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update2');
  });

  it('should transition to error state if source throws', async () => {
    const val = signal('initial');
    const source = computed(() => {
      if (val() === 'error') throw new Error('fail');
      return val();
    });
    const res = debounced(source, 10, {injector});
    TestBed.tick();
    await timeout(10);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    val.set('error');
    TestBed.tick();

    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(new Error('fail'));
  });

  it('should cleanup timer when injector is destroyed', async () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const injector = createEnvironmentInjector([], parentInjector);
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    source.set('updated');
    TestBed.tick();

    expect(res.status()).toBe('loading');

    injector.destroy();
    await timeout(10);

    // Verify it didn't update to 'resolved'
    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');
  });

  it('should support a custom wait function returning a promise', async () => {
    const source = signal('initial');
    let release: () => void = () => {};
    let calls = 0;

    const res = debounced(
      source,
      () =>
        new Promise<void>((resolve) => {
          calls++;
          release = resolve;
        }),
      {injector},
    );

    expect(res.status()).toBe('resolved');

    TestBed.tick();
    release();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    source.set('updated');
    TestBed.tick();

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');

    release();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('updated');
  });

  it('should support a custom wait function returning void (synchronous)', async () => {
    const source = signal('initial');
    const res = debounced(source, () => {}, {injector});

    expect(res.status()).toBe('resolved');

    TestBed.tick();

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

    const res = debounced(
      source,
      (val: string) =>
        new Promise<void>((resolve) => {
          if (val === 'initial') releaseInitial = resolve;
          if (val === 'update1') release1 = resolve;
          if (val === 'update2') release2 = resolve;
        }),
      {injector},
    );

    expect(res.status()).toBe('resolved');

    TestBed.tick();

    releaseInitial();
    await timeout();

    expect(res.status()).toBe('resolved');

    source.set('update1');
    TestBed.tick();

    expect(res.status()).toBe('loading');

    source.set('update2');
    TestBed.tick();

    expect(res.status()).toBe('loading');

    // Release first promise - should be ignored
    release1();
    await timeout();

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe('initial');

    // Release second promise - should update
    release2();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update2');
  });

  it('should not reload if value is equal to current resolved value (default equality)', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('initial');

    source.set('initial'); // Same value
    TestBed.tick();

    expect(res.status()).toBe('resolved'); // Should not change status
  });

  it('should not restart debounce if value is equal to current pending value (default equality)', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    expect(res.status()).toBe('resolved');

    source.set('update1');
    TestBed.tick();

    expect(res.status()).toBe('loading');

    await timeout(5);
    source.set('update1'); // Same pending value

    TestBed.tick();
    await timeout(5); // Total 10 from first update1

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('update1');
  });

  it('should use custom equality function', async () => {
    const source = signal({id: 1, val: 'a'});
    const res = debounced(source, 10, {
      injector,
      equal: (a, b) => a.id === b.id,
    });

    TestBed.tick();
    await timeout(10);

    expect(res.value()).toEqual({id: 1, val: 'a'});

    source.set({id: 1, val: 'b'}); // Different object, same ID
    TestBed.tick();

    expect(res.status()).toBe('resolved'); // Should not reload
    expect(res.value()).toEqual({id: 1, val: 'a'});
  });

  it('should remain in error state until successfully recovered', async () => {
    const val = signal('initial');
    const source = computed(() => {
      if (val() === 'error') throw new Error('fail');
      return val();
    });
    const res = debounced(source, 10, {injector});

    TestBed.tick();
    await timeout(10);

    expect(res.value()).toBe('initial');

    val.set('error');
    TestBed.tick();

    expect(res.status()).toBe('error');
    expect(res.error()).toBeDefined();

    val.set('recovered');
    TestBed.tick();

    // Should remain in error state until new value is resolved.
    expect(res.status()).toBe('error');
    expect(res.error()).toBeDefined();

    await timeout(10);

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('recovered');
  });

  it('should throw if used in params of another resource', () => {
    const res = resource({
      params: () => debounced(signal(1), 1),
      loader: async () => {},
      injector,
    });
    expect(() => res.status()).toThrowError(
      /Cannot create a resource inside the `params` of another resource/,
    );
  });
});
