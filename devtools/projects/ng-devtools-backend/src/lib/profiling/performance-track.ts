/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LifecycleProfile} from '../../../../protocol';
import {getProfiler} from './profiler';
import {getDirectiveName} from '../component-tree/component-tree';
import type {ComponentInstance, DirectiveInstance} from '../interfaces';

type Method = keyof LifecycleProfile | 'changeDetection' | string;

// Performance track global flag.
let chromeDevToolsPerformanceTrackEnabled = false;

/** Enable Angular's performance track in the Chrome DevTools profiler. */
export const enablePerformanceTrack = () => (chromeDevToolsPerformanceTrackEnabled = true);

/** Disable Angular's performance track in the Chrome DevTools profiler. */
export const disablePerformanceTrack = () => (chromeDevToolsPerformanceTrackEnabled = false);

const performanceTrackEnabled = () => chromeDevToolsPerformanceTrackEnabled;

const markName = (s: string, method: Method) => `🅰️ ${s}#${method}`;

const supportsPerformance =
  globalThis.performance && typeof globalThis.performance.getEntriesByName === 'function';

const recordMark = (s: string, method: Method) => {
  if (supportsPerformance) {
    // tslint:disable-next-line:ban
    performance.mark(`${markName(s, method)}_start`);
  }
};

const endMark = (nodeName: string, method: Method) => {
  if (supportsPerformance) {
    const name = markName(nodeName, method);
    const start = `${name}_start`;
    const end = `${name}_end`;
    if (performance.getEntriesByName(start).length > 0) {
      // tslint:disable-next-line:ban
      performance.mark(end);

      const measureOptions = {
        start,
        end,
        detail: {
          devtools: {
            dataType: 'track-entry',
            color: 'primary',
            track: '🅰️ Angular DevTools',
          },
        },
      };
      performance.measure(name, measureOptions);
    }
    performance.clearMarks(start);
    performance.clearMarks(end);
    performance.clearMeasures(name);
  }
};

getProfiler().subscribe({
  onChangeDetectionStart(component: ComponentInstance): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    recordMark(getDirectiveName(component), 'changeDetection');
  },
  onChangeDetectionEnd(component: ComponentInstance): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    endMark(getDirectiveName(component), 'changeDetection');
  },
  onLifecycleHookStart(component: DirectiveInstance, lifecyle: keyof LifecycleProfile): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    recordMark(getDirectiveName(component), lifecyle);
  },
  onLifecycleHookEnd(component: DirectiveInstance, lifecyle: keyof LifecycleProfile): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    endMark(getDirectiveName(component), lifecyle);
  },
  onOutputStart(component: DirectiveInstance, output: string): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    recordMark(getDirectiveName(component), output);
  },
  onOutputEnd(component: DirectiveInstance, output: string): void {
    if (!performanceTrackEnabled()) {
      return;
    }
    endMark(getDirectiveName(component), output);
  },
});
