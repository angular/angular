/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {PendingTasksInternal} from '../../pending_tasks';
import {inject} from '../../di/injector_compatibility';

/**
 * Abstraction that encompasses any kind of effect that can be scheduled.
 */
export interface SchedulableEffect {
  run(): void;
  zone: {
    run<T>(fn: () => T): T;
  } | null;
}

/**
 * A scheduler which manages the execution of effects.
 */
export abstract class EffectScheduler {
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

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
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
  private queuedEffectCount = 0;
  private queues = new Map<Zone | null, Set<SchedulableEffect>>();

  schedule(handle: SchedulableEffect): void {
    this.enqueue(handle);
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
    this.queuedEffectCount++;
    queue.add(handle);
  }

  /**
   * Run all scheduled effects.
   *
   * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
   * ordering guarantee between effects scheduled in different zones.
   */
  flush(): void {
    while (this.queuedEffectCount > 0) {
      for (const [zone, queue] of this.queues) {
        // `zone` here must be defined.
        if (zone === null) {
          this.flushQueue(queue);
        } else {
          zone.run(() => this.flushQueue(queue));
        }
      }
    }
  }

  private flushQueue(queue: Set<SchedulableEffect>): void {
    for (const handle of queue) {
      queue.delete(handle);
      this.queuedEffectCount--;

      // TODO: what happens if this throws an error?
      handle.run();
    }
  }
}
