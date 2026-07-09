/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ngDebugClient} from '../../ng-debug-api/ng-debug-api';

import {NgProfiler} from './native';
import {PatchingProfiler} from './polyfill';
import {Profiler} from './shared';

export {type Hooks, Profiler} from './shared';

// Global reference.
let profiler: Profiler;

/**
 * Factory method for creating profiler object.
 * Gives priority to NgProfiler, falls back on PatchingProfiler if framework APIs are not present.
 */
const selectProfilerStrategy = (): Profiler => {
  if (typeof ngDebugClient().ɵsetProfiler === 'function') {
    return new NgProfiler();
  }
  return new PatchingProfiler();
};

/**
 * Get the Profiler reference.
 * Initializes the Profiler if it wasn't requested before.
 */
export function getProfiler(
  depsForTestOnly: {
    profiler?: new (...args: any[]) => Profiler;
  } = {},
): Profiler {
  // Allow for overriding the Profiler implementation for testing purposes.
  if (depsForTestOnly.profiler) {
    profiler = new depsForTestOnly.profiler();
  }
  if (!profiler) {
    profiler = selectProfilerStrategy();
  }
  return profiler;
}
