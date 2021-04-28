import { ɵProfilerEvent } from '@angular/core';
import { NgProfiler } from './native';
import { PatchingProfiler } from './polyfill';
import { Profiler, ngProfilerCallbacks } from './shared';

export { Profiler, Hooks } from './shared';

/**
 * Factory method for creating profiler object.
 * Gives priority to NgProfiler, falls back on PatchingProfiler if framework APIs are not present.
 */
export const selectProfilerStrategy = (): Profiler => {
  const ng = (window as any).ng;
  if (typeof ng?.ɵsetProfiler === 'function') {
    ng.ɵsetProfiler((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) =>
      ngProfilerCallbacks.forEach((cb) => cb(event, instanceOrLView, hookOrListener))
    );
    return new NgProfiler();
  }

  return new PatchingProfiler();
};
