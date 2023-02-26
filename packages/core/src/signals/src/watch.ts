/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Consumer, consumerPollValueStatus, Edge, nextReactiveId, Producer, ProducerId, setActiveConsumer} from './graph';
import {WeakRef} from './weak_ref';

/**
 * Watches a reactive expression and allows it to be scheduled to re-run
 * when any dependencies notify of a change.
 *
 * `Watch` doesn't run reactive expressions itself, but relies on a consumer-
 * provided scheduling operation to coordinate calling `Watch.run()`.
 */
export class Watch implements Consumer {
  readonly id = nextReactiveId();
  readonly ref = new WeakRef(this);
  readonly producers = new Map<ProducerId, Edge>();
  trackingVersion = 0;

  private dirty: Producer|boolean = false;

  constructor(private watch: () => void, public schedule: (watch: Watch) => void) {}

  notify(notifier?: Producer): void {
    if (this.dirty === false) {
      this.schedule(this);
    }
    this.dirty = notifier ?? true;
  }

  /**
   * Execute the reactive expression in the context of this `Watch` consumer.
   *
   * Should be called by the user scheduling algorithm when the provided
   * `schedule` hook is called by `Watch`.
   */
  run(): void {
    const dirty = this.dirty;
    this.dirty = false;
    if (this.trackingVersion !== 0 && !consumerPollValueStatus(this, dirty)) {
      return;
    }

    const prevConsumer = setActiveConsumer(this);
    this.trackingVersion++;
    try {
      this.watch();
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
