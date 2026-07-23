/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {fakeAsync} from '@angular/core/testing';

import {flushMicrotasks} from '../../core/testing/src/fake_async';
import {NoopAnimationPlayer} from '../src/players/animation_player';

describe('NoopAnimationPlayer', () => {
  it('should finish after the next microtask once started', fakeAsync(() => {
    const log: string[] = [];

    const player = new NoopAnimationPlayer();
    player.onStart(() => log.push('started'));
    player.onDone(() => log.push('done'));
    flushMicrotasks();

    expect(log).toEqual([]);
    player.play();
    expect(log).toEqual(['started']);

    flushMicrotasks();
    expect(log).toEqual(['started', 'done']);
  }));

  it('should fire all callbacks when destroyed', () => {
    const log: string[] = [];

    const player = new NoopAnimationPlayer();
    player.onStart(() => log.push('started'));
    player.onDone(() => log.push('done'));
    player.onDestroy(() => log.push('destroy'));
    expect(log).toEqual([]);

    player.destroy();
    expect(log).toEqual(['started', 'done', 'destroy']);
  });

  it('should fire start/done callbacks manually when called directly', fakeAsync(() => {
    const log: string[] = [];

    const player = new NoopAnimationPlayer();
    player.onStart(() => log.push('started'));
    player.onDone(() => log.push('done'));
    flushMicrotasks();

    (player as any).triggerCallback('start');
    expect(log).toEqual(['started']);

    player.play();
    expect(log).toEqual(['started']);

    (player as any).triggerCallback('done');
    expect(log).toEqual(['started', 'done']);

    player.finish();
    expect(log).toEqual(['started', 'done']);

    flushMicrotasks();
    expect(log).toEqual(['started', 'done']);
  }));

  it('should fire off start callbacks before triggering the finish callback', fakeAsync(() => {
    const log: string[] = [];

    const player = new NoopAnimationPlayer();
    player.onStart(() => {
      queueMicrotask(() => log.push('started'));
    });
    player.onDone(() => log.push('done'));
    expect(log).toEqual([]);

    player.play();
    expect(log).toEqual([]);

    flushMicrotasks();
    expect(log).toEqual(['started', 'done']);
  }));
});
