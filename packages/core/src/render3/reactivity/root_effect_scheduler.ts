/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵdefineInjectable} from '../../di/interface/defs';

/**
 * Abstraction that encompasses any kind of effect that can be scheduled.
 */
export interface SchedulableEffect {
  run(): void;
  zone: {
    run<T>(fn: () => T): T;
  } | null;
  dirty: boolean;
}

/**
 * A scheduler which manages the execution of effects.
 */
export abstract class EffectScheduler {
  abstract add(e: SchedulableEffect): void;

  /**
   * Schedule the given effect to be executed at a later time.
   *
   * It is an error to attempt to execute any effects synchronously during a scheduling operation.
   */
  abstract schedule(e: SchedulableEffect): void;

  /**
   * Run any scheduled effects.
   */
  abstract flush(): void;

  /** Remove a scheduled effect */
  abstract remove(e: SchedulableEffect): void;

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: EffectScheduler,
    providedIn: 'root',
    factory: () => new ZoneAwareEffectScheduler(),
  });
}

/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
export class ZoneAwareEffectScheduler implements EffectScheduler {
  private dirtyEffectCount = 0;
  private queues = new Map<Zone | null, Set<SchedulableEffect>>();

  add(handle: SchedulableEffect): void {
    this.enqueue(handle);
    this.schedule(handle);
  }

  schedule(handle: SchedulableEffect): void {
    if (!handle.dirty) {
      return;
    }
    this.dirtyEffectCount++;
  }

  remove(handle: SchedulableEffect): void {
    const zone = handle.zone as Zone | null;
    const queue = this.queues.get(zone)!;
    if (!queue.has(handle)) {
      return;
    }

    queue.delete(handle);
    if (handle.dirty) {
      this.dirtyEffectCount--;
    }
  }

  private enqueue(handle: SchedulableEffect): void {
    const zone = handle.zone as Zone | null;
    if (!this.queues.has(zone)) {
      this.queues.set(zone, new Set());
    }

    const queue = this.queues.get(zone)!;
    if (queue.has(handle)) {
      return;
    }
    queue.add(handle);
  }

  /**
   * Run all scheduled effects.
   *
   * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
   * ordering guarantee between effects scheduled in different zones.
   */
  flush(): void {
    while (this.dirtyEffectCount > 0) {
      let ranOneEffect = false;
      for (const [zone, queue] of this.queues) {
        // `zone` here must be defined.
        if (zone === null) {
          ranOneEffect ||= this.flushQueue(queue);
        } else {
          ranOneEffect ||= zone.run(() => this.flushQueue(queue));
        }
      }

      // Safeguard against infinite looping if somehow our dirty effect count gets out of sync with
      // the dirty flag across all the effects.
      if (!ranOneEffect) {
        this.dirtyEffectCount = 0;
      }
    }
  }

  private flushQueue(queue: Set<SchedulableEffect>): boolean {
    let ranOneEffect = false;
    for (const handle of queue) {
      if (!handle.dirty) {
        continue;
      }
      this.dirtyEffectCount--;
      ranOneEffect = true;

      // TODO: what happens if this throws an error?
      handle.run();
    }
    return ranOneEffect;
  }
}
