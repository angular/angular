/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Console} from '../console';
import {inject, InjectionToken, Provider} from '../di';
import {TracingAction, TracingService, TracingSnapshot} from './tracing';

interface CDTracingOptions {
  msThresholdWindow: number;
  cdThreshold: number;
}

const CD_TRACING_OPTIONS = new InjectionToken<CDTracingOptions>(
  ngDevMode ? 'CD_TRACING_OPTIONS' : '',
);

/**
 * A change detection tracing service that logs a warning if the number of change detections
 * exceeds a threshold. This is useful for debugging performance issues.
 */
class CDTracingService implements TracingService<TracingSnapshot> {
  private console = inject(Console);
  private options = inject(CD_TRACING_OPTIONS);

  private cdList: {timestamp: number}[] = [];
  private readonly listMaxSize = this.options.cdThreshold * 3;
  private warningTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!ngDevMode) {
      this.console.warn(
        `Warning: You're running the change detection tracing service in production mode!`,
      );
    }
  }

  snapshot(linkedSnapshot: TracingSnapshot | null): TracingSnapshot {
    return {
      run: (action: TracingAction, fn: () => any) => {
        if (action === TracingAction.CHANGE_DETECTION) {
          this.addTimestamp();
        }
        return fn();
      },
    };
  }

  private addTimestamp() {
    const now = Date.now();

    // removing timestamps that are older than the threshold window
    while (this.cdList[0] && this.cdList[0].timestamp + this.options.msThresholdWindow < now) {
      this.cdList.shift();
    }

    this.cdList.push({timestamp: now});

    // We're over the threshold but still within the window. Schedule a warning if not already
    if (this.cdList.length > this.options.cdThreshold && this.warningTimeout === null) {
      const timeRemaining = this.options.msThresholdWindow - (now - this.cdList[0].timestamp);
      this.warningTimeout = setTimeout(() => this.checkCdCount(), timeRemaining);
    }
  }

  private checkCdCount() {
    this.warningTimeout = null;

    const count =
      this.cdList.length === this.listMaxSize ? `${this.listMaxSize}+` : `${this.cdList.length}`;
    this.console.warn(
      `You had [${count}] change detections in [${this.options.msThresholdWindow / 1000} seconds]!`,
    );

    // Reset the list to start tracking a new window.
    this.cdList.length = 0;
  }
}

/**
 * Configures the change detection tracing service.
 *
 * The change detection tracing service logs a warning if the number of change detections
 * exceeds a threshold. This is useful for debugging performance issues.
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
): Provider[] {
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
  ];
}
