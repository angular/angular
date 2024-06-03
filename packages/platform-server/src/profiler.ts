/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * This is an internal performance profiler for SSR apps
 *
 * It should not be imported in application code
 */
@Injectable({providedIn: 'root'})
export class SsrPerformanceProfiler {
  metrics = new Map<string, number>();
  pending = new Map<string, number>();

  start(key: string) {
    this.pending.set(key, Date.now());
  }

  end(key: string) {
    const start = this.pending.get(key)!;
    const diff = Date.now() - start;
    this.pending.delete(key);
    const duration = (this.metrics.get(key) || 0) + diff;
    this.metrics.set(key, duration);
  }

  getServerTimingHeaderValue() {
    const entries = Array.from(this.metrics.entries());
    const serverTiming = entries
      .map(([name, duration]) => {
        return `${name};dur=${duration}`;
      })
      .join(', ');
    return serverTiming;
  }
}
