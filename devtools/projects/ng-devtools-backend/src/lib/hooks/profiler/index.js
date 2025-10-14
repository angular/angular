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
export {Profiler} from './shared';
/**
 * Factory method for creating profiler object.
 * Gives priority to NgProfiler, falls back on PatchingProfiler if framework APIs are not present.
 */
export const selectProfilerStrategy = () => {
  if (typeof ngDebugClient().ɵsetProfiler === 'function') {
    return new NgProfiler();
  }
  return new PatchingProfiler();
};
//# sourceMappingURL=index.js.map
