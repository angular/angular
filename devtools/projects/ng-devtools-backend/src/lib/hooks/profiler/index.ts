import {NgProfiler} from './native';
import {PatchingProfiler} from './polyfill';
import {Profiler} from './shared';

export {Hooks, Profiler} from './shared';

/**
 * Factory method for creating profiler object.
 * Gives priority to NgProfiler, falls back on PatchingProfiler if framework APIs are not present.
 */
export const selectProfilerStrategy = (): Profiler => {
  const ng = (window as any).ng;
  if (typeof ng?.ɵsetProfiler === 'function') {
    return new NgProfiler();
  }
  return new PatchingProfiler();
};
