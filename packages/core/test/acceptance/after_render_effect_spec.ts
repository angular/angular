/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ApplicationRef,
  computed,
  PLATFORM_ID,
  provideZonelessChangeDetection,
  signal,
} from '../../src/core';
import {
  afterRenderEffect,
  AfterRenderEffectSequence,
} from '../../src/render3/reactivity/after_render_effect';
import {AfterRenderPhase} from '../../src/render3/after_render/api';
import {TestBed} from '../../testing';

describe('afterRenderEffect', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: PLATFORM_ID, useValue: 'browser'}]});
  });

  it('should support a single callback in the mixedReadWrite phase', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    afterNextRender(() => log.push('before'), {injector: appRef.injector});
    afterRenderEffect(() => log.push('mixedReadWrite'), {injector: appRef.injector});
    afterNextRender(() => log.push('after'), {injector: appRef.injector});
    appRef.tick();
    expect(log).toEqual(['before', 'mixedReadWrite', 'after']);
  });

  it('should run once', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    afterRenderEffect(
      {
        earlyRead: () => log.push('earlyRead'),
        write: () => log.push('write'),
        mixedReadWrite: () => log.push('mixedReadWrite'),
        read: () => log.push('read'),
      },
      {injector: appRef.injector},
    );
    appRef.tick();
    expect(log).toEqual(['earlyRead', 'write', 'mixedReadWrite', 'read']);
  });

  it('should not run when not dirty', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);

    afterRenderEffect(
      {
        earlyRead: () => log.push('earlyRead'),
        write: () => log.push('write'),
        mixedReadWrite: () => log.push('mixedReadWrite'),
        read: () => log.push('read'),
      },
      {injector: appRef.injector},
    );

    // We expect an initial run, and clear the log.
    appRef.tick();
    log.length = 0;

    // The second tick() should not re-run the effects as they're not dirty.
    appRef.tick();
    expect(log.length).toBe(0);
  });

  it('should run when made dirty via signal', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        // `earlyRead` depends on `counter`
        earlyRead: () => log.push(`earlyRead: ${counter()}`),
        // `write` does not
        write: () => log.push('write'),
      },
      {injector: appRef.injector},
    );
    appRef.tick();
    log.length = 0;

    counter.set(1);
    appRef.tick();

    expect(log).toEqual(['earlyRead: 1']);
  });

  it('should not run when not actually dirty from signals', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);
    const isEven = computed(() => counter() % 2 === 0);

    afterRenderEffect(
      {
        earlyRead: () => log.push(`earlyRead: ${isEven()}`),
      },
      {injector: appRef.injector},
    );
    appRef.tick();
    log.length = 0;

    counter.set(2);
    appRef.tick();

    // Should not have run since `isEven()` didn't actually change despite becoming dirty.
    expect(log.length).toBe(0);
  });

  it('should pass data from one phase to the next via signal', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        // `earlyRead` calculates `isEven`
        earlyRead: () => counter() % 2 === 0,
        write: (isEven) => log.push(`isEven: ${isEven()}`),
      },
      {injector: appRef.injector},
    );
    appRef.tick();
    log.length = 0;

    // isEven: false
    counter.set(1);
    appRef.tick();

    // isEven: true
    counter.set(2);
    appRef.tick();

    // No change (no log).
    counter.set(4);
    appRef.tick();

    expect(log).toEqual(['isEven: false', 'isEven: true']);
  });

  it('should run cleanup functions before re-running phase effects', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        earlyRead: (onCleanup) => {
          onCleanup(() => log.push('cleanup earlyRead'));
          log.push(`earlyRead: ${counter()}`);
          // Calculate isEven:
          return counter() % 2 === 0;
        },
        write: (isEven, onCleanup) => {
          onCleanup(() => log.push('cleanup write'));
          log.push(`write: ${isEven()}`);
        },
      },
      {injector: appRef.injector},
    );

    // Initial run should run both effects with no cleanup
    appRef.tick();
    expect(log).toEqual(['earlyRead: 0', 'write: true']);
    log.length = 0;

    // A counter of 1 will clean up and rerun both effects.
    counter.set(1);
    appRef.tick();
    expect(log).toEqual(['cleanup earlyRead', 'earlyRead: 1', 'cleanup write', 'write: false']);
    log.length = 0;

    // A counter of 3 will clean up and rerun the earlyRead phase only.
    counter.set(3);
    appRef.tick();
    expect(log).toEqual(['cleanup earlyRead', 'earlyRead: 3']);
    log.length = 0;

    // A counter of 4 will then clean up and rerun both effects.
    counter.set(4);
    appRef.tick();
    expect(log).toEqual(['cleanup earlyRead', 'earlyRead: 4', 'cleanup write', 'write: true']);
  });

  it('should disconnect the consummer from the graph when destroyed', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    const ref = afterRenderEffect(
      {
        earlyRead: () => counter() % 2 === 0,
        write: (isEven) => isEven(),
        mixedReadWrite: (isEven) => isEven(),
        read: (isEven) => isEven(),
      },
      {injector: appRef.injector},
    ) as AfterRenderEffectSequence;

    appRef.tick();

    const phaseNodes = ref['nodes'];
    expect(phaseNodes[AfterRenderPhase.EarlyRead]?.consumers).toBeDefined();
    expect(phaseNodes[AfterRenderPhase.Write]?.consumers).toBeDefined();
    expect(phaseNodes[AfterRenderPhase.MixedReadWrite]?.consumers).toBeDefined();
    expect(phaseNodes[AfterRenderPhase.Read]?.producers).toBeDefined();

    ref.destroy();

    expect(phaseNodes[AfterRenderPhase.EarlyRead]?.consumers).toBeUndefined();
    expect(phaseNodes[AfterRenderPhase.Write]?.consumers).toBeUndefined();
    expect(phaseNodes[AfterRenderPhase.MixedReadWrite]?.consumers).toBeUndefined();
    expect(phaseNodes[AfterRenderPhase.Read]?.producers).toBeUndefined();
  });

  it('should run cleanup functions when destroyed', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);

    const ref = afterRenderEffect(
      {
        earlyRead: (onCleanup) => {
          onCleanup(() => log.push('cleanup earlyRead'));
        },
        write: (_, onCleanup) => {
          onCleanup(() => log.push('cleanup write'));
        },
        mixedReadWrite: (_, onCleanup) => {
          onCleanup(() => log.push('cleanup mixedReadWrite'));
        },
        read: (_, onCleanup) => {
          onCleanup(() => log.push('cleanup read'));
        },
      },
      {injector: appRef.injector},
    );

    appRef.tick();
    expect(log.length).toBe(0);

    ref.destroy();
    expect(log).toEqual([
      'cleanup earlyRead',
      'cleanup write',
      'cleanup mixedReadWrite',
      'cleanup read',
    ]);
  });

  it('should schedule CD when dirty', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), {provide: PLATFORM_ID, useValue: 'browser'}],
    });

    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {earlyRead: () => log.push(`earlyRead: ${counter()}`)},
      {injector: appRef.injector},
    );
    await appRef.whenStable();
    expect(log).toEqual(['earlyRead: 0']);

    counter.set(1);
    await appRef.whenStable();
    expect(log).toEqual(['earlyRead: 0', 'earlyRead: 1']);
  });

  it('should cause a re-run for hooks that re-dirty themselves', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        earlyRead: () => {
          log.push(`counter: ${counter()}`);

          // Cause a re-execution when counter is 1.
          if (counter() === 1) {
            counter.set(0);
          }
        },
      },
      {injector: appRef.injector},
    );

    appRef.tick();
    log.length = 0;

    counter.set(1);
    appRef.tick();
    expect(log).toEqual(['counter: 1', 'counter: 0']);
  });

  it('should cause a re-run for hooks that re-dirty earlier hooks', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        earlyRead: () => {
          log.push(`earlyRead: ${counter()}`);
          return counter();
        },
        write: (value) => {
          log.push(`write: ${value()}`);
          // Cause a re-execution when value from earlyRead is 1.
          if (value() === 1) {
            counter.set(0);
          }
        },
      },
      {injector: appRef.injector},
    );

    appRef.tick();
    log.length = 0;

    counter.set(1);
    appRef.tick();
    expect(log).toEqual(['earlyRead: 1', 'write: 1', 'earlyRead: 0', 'write: 0']);
  });

  it('should not run later hooks when an earlier hook is re-dirtied', () => {
    const log: string[] = [];
    const appRef = TestBed.inject(ApplicationRef);
    const counter = signal(0);

    afterRenderEffect(
      {
        earlyRead: () => {
          const value = counter();
          log.push(`earlyRead: ${value}`);
          if (value === 1) {
            counter.set(0);
          }
          return value;
        },
        write: (value) => log.push(`write: ${value()}`),
      },
      {injector: appRef.injector},
    );

    appRef.tick();
    log.length = 0;

    counter.set(1);
    appRef.tick();
    expect(log).toEqual(['earlyRead: 1', 'earlyRead: 0', 'write: 0']);
  });
});
