/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {DebugLogger} from './api';

export interface IdleTask {
  run: () => Promise<void>;
  desc: string;
}

interface ScheduledRun {
  cancel: boolean;
}

export class IdleScheduler {
  private queue: IdleTask[] = [];
  private scheduled: ScheduledRun|null = null;
  empty: Promise<void> = Promise.resolve();
  private emptyResolve: Function|null = null;
  lastTrigger: number|null = null;
  lastRun: number|null = null;

  constructor(private adapter: Adapter, private threshold: number, private debug: DebugLogger) {}

  async trigger(): Promise<void> {
    this.lastTrigger = this.adapter.time;
    if (this.queue.length === 0) {
      return;
    }

    if (this.scheduled !== null) {
      this.scheduled.cancel = true;
    }

    const scheduled = {
      cancel: false,
    };
    this.scheduled = scheduled;

    await this.adapter.timeout(this.threshold);

    if (scheduled.cancel) {
      return;
    }

    this.scheduled = null;

    await this.execute();
  }

  async execute(): Promise<void> {
    this.lastRun = this.adapter.time;
    while (this.queue.length > 0) {
      const queue = this.queue;
      this.queue = [];

      await queue.reduce(async(previous, task) => {
        await previous;
        try {
          await task.run();
        } catch (err) {
          this.debug.log(err, `while running idle task ${task.desc}`);
        }
      }, Promise.resolve());
    }

    if (this.emptyResolve !== null) {
      this.emptyResolve();
      this.emptyResolve = null;
    }
    this.empty = Promise.resolve();
  }

  schedule(desc: string, run: () => Promise<void>): void {
    this.queue.push({desc, run});
    if (this.emptyResolve === null) {
      this.empty = new Promise(resolve => { this.emptyResolve = resolve; });
    }
  }

  get size(): number { return this.queue.length; }

  get taskDescriptions(): string[] { return this.queue.map(task => task.desc); }
}