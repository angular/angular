/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Profiler, selectProfilerStrategy} from '../profiling/profiler';
import {DevtoolsInjector, type SelectArgs} from './injector';

/** Contains all root-level dependencies. */
export const rootInjector = new DevtoolsInjector([
  {
    provide: Profiler,
    factory: selectProfilerStrategy,
  },
]);

/**
 * A shorthand for getting/injecting a dependency from the `rootInjector`
 * (i.e. `rootInjector.get()`).
 */
export function inject<T>(...args: SelectArgs<T>): T {
  return rootInjector.get(...args);
}
