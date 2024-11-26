/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Console} from '../console';
import {inject, InjectionToken, Provider} from '../di';
import {NgZone} from '../zone';
import {TracingAction, TracingService, TracingSnapshot} from './tracing';

interface CDTracingOptions {
  msThresholdWindow: number;
  cdThreshold: number;
}

const CD_TRACING_OPTIONS = new InjectionToken<CDTracingOptions>('CD_TRACING_OPTIONS');

/**
 * A change detection tracing service that logs a warning if the number of change detections
 * exceeds a threshold. This is useful for debugging performance issues.
 */
class CDTracingService implements TracingService<TracingSnapshot> {
  private ngZone = inject(NgZone);
  private console = inject(Console);
  private options = inject(CD_TRACING_OPTIONS);

  private cds: {timestamp: number}[] = [];

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        if (this.cds.length > this.options.cdThreshold) {
          this.console.warn(
            `You have [${this.cds.length}] change detections in [${this.options.msThresholdWindow / 1000} seconds]!`,
          );
          this.cds = [];
        }
      }, this.options.msThresholdWindow);
    });
  }

  snapshot(linkedSnapshot: TracingSnapshot | null): TracingSnapshot {
    return {
      run: (action: TracingAction, fn: () => any) => {
        if (action === TracingAction.CHANGE_DETECTION) {
          this.cds.push({
            timestamp: Date.now(),
          });
        }
        return fn();
      },
    };
  }
}

/**
 * Configures the change detection tracing service.
 *
 * @usageNotes
 *
 * The following example illustrates how to configure the change detection tracing service.
 * ```
 * bootstrapApplication(App, {
 *   providers: [
 *     provideChangeDetectionTracingService(),
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
export function provideChangeDetectionTracingService(
  options = {
    msThresholdWindow: 1000,
    cdThreshold: 10,
  },
) {
  return [
    {
      provide: CD_TRACING_OPTIONS,
      useValue: {
        msThresholdWindow: options.msThresholdWindow,
        cdThreshold: options.cdThreshold,
      },
    },
    {
      provide: TracingService,
      useClass: CDTracingService,
    },
  ] as Provider[];
}
