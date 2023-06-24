/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Watch, WatchCleanupFn} from '@angular/core/src/signals';

let queue = new Set<Watch>();

/**
 * A wrapper around `Watch` that emulates the `effect` API and allows for more streamlined testing.
 */
export function testingEffect(effectFn: (onCleanup: (cleanupFn: WatchCleanupFn) => void) => void):
    void {
  const watch = new Watch(effectFn, queue.add.bind(queue), true);

  // Effects start dirty.
  watch.notify();
}

export function flushEffects(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }
}

export function resetEffects(): void {
  queue.clear();
}
