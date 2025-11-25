/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isTypeProvider} from '../../di/provider_collection';
import {assertDefined} from '../../util/assert';
import {performanceMarkFeature} from '../../util/performance';
import {setProfiler} from '../profiler';
import {Profiler, ProfilerEvent} from '../../../primitives/devtools';
import {stringifyForError} from '../util/stringify_utils';
import {
  InjectorProfiler,
  InjectorProfilerEvent,
  InjectorProfilerEventType,
  setInjectorProfiler,
} from './injector_profiler';

type TimeStampName = string;
type DevToolsColor =
  | 'primary'
  | 'primary-light'
  | 'primary-dark'
  | 'secondary'
  | 'secondary-light'
  | 'secondary-dark'
  | 'tertiary'
  | 'tertiary-light'
  | 'tertiary-dark'
  | 'error';

declare global {
  // Providing custom console.timeStamp overload as the performance-tracking signature it is not standardized yet
  interface Console {
    timeStamp(
      label: string,
      start: TimeStampName,
      end?: TimeStampName,
      trackName?: string,
      trackGroup?: string,
      color?: DevToolsColor,
    ): void;
  }
}

const hasPerformanceMeasure = 'measure' in performance;

const TRACK_NAME = '\u{1F170}\uFE0F Angular';

function timestampMark(markName: string): void {
  if (hasPerformanceMeasure) {
    performance.mark(markName);
    return;
  }

  console.timeStamp(markName);
}

function timestampMeasure(
  entryName: string,
  startMarkName: string,
  color: DevToolsColor,
  docUrl?: string,
): void {
  if (hasPerformanceMeasure) {
    performance.measure(entryName, {
      start: startMarkName,
      detail: {
        devtools: {
          dataType: 'track-entry',
          track: TRACK_NAME,
          color,
          ...(docUrl && {properties: [['Documentation', docUrl]]}),
        },
      },
    });
    return;
  }

  console.timeStamp(entryName, startMarkName, undefined, TRACK_NAME, undefined, color);
}

let changeDetectionRuns = 0;
let changeDetectionSyncRuns = 0;

let counter = 0;
type stackEntry = [ProfilerEvent | ProfilerDIEvent, number];
const eventsStack: stackEntry[] = [];

const BASE_DOC_URL = 'https://angular.dev';
const DOC_URL_LIFECYCLE_HOOKS = `${BASE_DOC_URL}/guide/components/lifecycle`;

/**
 * Returns documentation URL for lifecycle hooks.
 * Extracts lifecycle hook name from the component method string and maps to Angular docs.
 */
function getLifecycleHookDocUrl(hookName: string): string | undefined {
  // Extract lifecycle hook name (e.g., "MyComponent:ngOnInit" -> "ngOnInit")
  const match = hookName.match(/:(ng\w+)$/);
  if (!match) return undefined;

  const lifecycleHook = match[1].toLowerCase();

  const lifecycleHookUrls: Record<string, string> = {
    ngoninit: `${DOC_URL_LIFECYCLE_HOOKS}#ngoninit`,
    ngonchanges: `${DOC_URL_LIFECYCLE_HOOKS}#ngonchanges`,
    ngdocheck: `${DOC_URL_LIFECYCLE_HOOKS}#ngdocheck`,
    ngaftercontentinit: `${DOC_URL_LIFECYCLE_HOOKS}#ngaftercontentinit`,
    ngaftercontentchecked: `${DOC_URL_LIFECYCLE_HOOKS}#ngaftercontentchecked`,
    ngafterviewinit: `${DOC_URL_LIFECYCLE_HOOKS}#ngafterviewinit`,
    ngafterviewchecked: `${DOC_URL_LIFECYCLE_HOOKS}#ngafterviewchecked`,
    ngondestroy: `${DOC_URL_LIFECYCLE_HOOKS}#ngondestroy`,
  };

  return lifecycleHookUrls[lifecycleHook];
}

/**
 * Returns documentation URL for profiler events.
 */
function getProfilerEventDocUrl(event: ProfilerEvent | ProfilerDIEvent): string | undefined {
  switch (event) {
    case ProfilerEvent.ChangeDetectionStart:
    case ProfilerEvent.ChangeDetectionEnd:
    case ProfilerEvent.ChangeDetectionSyncStart:
    case ProfilerEvent.ChangeDetectionSyncEnd:
      return ` ${BASE_DOC_URL}/best-practices/runtime-performance/overview`;
    case ProfilerEvent.AfterRenderHooksStart:
    case ProfilerEvent.AfterRenderHooksEnd:
      return `${DOC_URL_LIFECYCLE_HOOKS}#aftereveryrender-and-afternextrender`;
    case ProfilerEvent.DeferBlockStateStart:
    case ProfilerEvent.DeferBlockStateEnd:
      return `${BASE_DOC_URL}/guide/defer`;
    case ProfilerEvent.BootstrapApplicationStart:
    case ProfilerEvent.BootstrapApplicationEnd:
    case ProfilerEvent.BootstrapComponentStart:
    case ProfilerEvent.BootstrapComponentEnd:
    default:
      return undefined;
  }
}

/**
 * Enum mimicking ProfilerEvent. The idea is to have unique event identifiers for both DI and other profiling events.
 */
const enum ProfilerDIEvent {
  InjectorToCreateInstanceEvent = 100,
  InstanceCreatedByInjector = 101,
}

function measureStart(startEvent: ProfilerEvent | ProfilerDIEvent) {
  const markName = 'Event_' + startEvent + '_' + counter++;
  eventsStack.push([startEvent, counter - 1]);
  timestampMark(markName);
}

function measureEnd(
  startEvent: ProfilerEvent | ProfilerDIEvent,
  entryName: string,
  color: DevToolsColor,
  docUrl?: string,
) {
  let top: stackEntry | undefined;

  // The stack may be asymmetric when an end event for a prior start event is missing (e.g. when an exception
  // has occurred), unroll the stack until a matching item has been found in that case.
  do {
    top = eventsStack.pop();
    assertDefined(top, 'Profiling error: could not find start event entry ' + startEvent);
  } while (top[0] !== startEvent);

  timestampMeasure(entryName, 'Event_' + top[0] + '_' + top[1], color, docUrl);
}

const chromeDevToolsInjectorProfiler: InjectorProfiler = (event: InjectorProfilerEvent) => {
  const eventType = event.type;
  if (eventType === InjectorProfilerEventType.InjectorToCreateInstanceEvent) {
    measureStart(ProfilerDIEvent.InjectorToCreateInstanceEvent);
  } else if (eventType === InjectorProfilerEventType.InstanceCreatedByInjector) {
    const token = event.context.token;
    measureEnd(
      ProfilerDIEvent.InjectorToCreateInstanceEvent,
      getProviderTokenMeasureName(token),
      'tertiary-dark',
    );
  }
};

const devToolsProfiler: Profiler = (
  event: ProfilerEvent,
  instance?: {} | null,
  eventFn?: Function,
) => {
  switch (event) {
    case ProfilerEvent.BootstrapApplicationStart:
    case ProfilerEvent.BootstrapComponentStart:
    case ProfilerEvent.ChangeDetectionStart:
    case ProfilerEvent.ChangeDetectionSyncStart:
    case ProfilerEvent.AfterRenderHooksStart:
    case ProfilerEvent.ComponentStart:
    case ProfilerEvent.DeferBlockStateStart:
    case ProfilerEvent.DynamicComponentStart:
    case ProfilerEvent.TemplateCreateStart:
    case ProfilerEvent.LifecycleHookStart:
    case ProfilerEvent.TemplateUpdateStart:
    case ProfilerEvent.HostBindingsUpdateStart:
    case ProfilerEvent.OutputStart: {
      measureStart(event);
      break;
    }
    case ProfilerEvent.BootstrapApplicationEnd: {
      measureEnd(
        ProfilerEvent.BootstrapApplicationStart,
        'Bootstrap application',
        'primary-dark',
        getProfilerEventDocUrl(ProfilerEvent.BootstrapApplicationStart),
      );
      break;
    }
    case ProfilerEvent.BootstrapComponentEnd: {
      measureEnd(
        ProfilerEvent.BootstrapComponentStart,
        'Bootstrap component',
        'primary-dark',
        getProfilerEventDocUrl(ProfilerEvent.BootstrapComponentStart),
      );
      break;
    }
    case ProfilerEvent.ChangeDetectionEnd: {
      changeDetectionSyncRuns = 0;
      measureEnd(
        ProfilerEvent.ChangeDetectionStart,
        'Change detection ' + changeDetectionRuns++,
        'primary-dark',
        getProfilerEventDocUrl(ProfilerEvent.ChangeDetectionStart),
      );
      break;
    }

    case ProfilerEvent.ChangeDetectionSyncEnd: {
      measureEnd(
        ProfilerEvent.ChangeDetectionSyncStart,
        'Synchronization ' + changeDetectionSyncRuns++,
        'primary',
        getProfilerEventDocUrl(ProfilerEvent.ChangeDetectionSyncStart),
      );
      break;
    }
    case ProfilerEvent.AfterRenderHooksEnd: {
      measureEnd(
        ProfilerEvent.AfterRenderHooksStart,
        'After render hooks',
        'primary',
        getProfilerEventDocUrl(ProfilerEvent.AfterRenderHooksStart),
      );
      break;
    }

    case ProfilerEvent.ComponentEnd: {
      const typeName = getComponentMeasureName(instance!);
      measureEnd(ProfilerEvent.ComponentStart, typeName, 'primary-light');
      break;
    }
    case ProfilerEvent.DeferBlockStateEnd: {
      measureEnd(
        ProfilerEvent.DeferBlockStateStart,
        'Defer block',
        'primary-dark',
        getProfilerEventDocUrl(ProfilerEvent.DeferBlockStateStart),
      );
      break;
    }
    case ProfilerEvent.DynamicComponentEnd: {
      measureEnd(ProfilerEvent.DynamicComponentStart, 'Dynamic component creation', 'primary-dark');
      break;
    }
    case ProfilerEvent.TemplateUpdateEnd: {
      measureEnd(
        ProfilerEvent.TemplateUpdateStart,
        stringifyForError(eventFn) + ' (update)',
        'secondary-dark',
      );
      break;
    }
    case ProfilerEvent.TemplateCreateEnd: {
      measureEnd(
        ProfilerEvent.TemplateCreateStart,
        stringifyForError(eventFn) + ' (create)',
        'secondary',
      );
      break;
    }
    case ProfilerEvent.HostBindingsUpdateEnd: {
      measureEnd(ProfilerEvent.HostBindingsUpdateStart, 'HostBindings', 'secondary-dark');
      break;
    }
    case ProfilerEvent.LifecycleHookEnd: {
      const typeName = getComponentMeasureName(instance!);
      const hookName = `${typeName}:${stringifyForError(eventFn)}`;
      measureEnd(
        ProfilerEvent.LifecycleHookStart,
        hookName,
        'tertiary',
        getLifecycleHookDocUrl(hookName),
      );
      break;
    }
    case ProfilerEvent.OutputEnd: {
      measureEnd(ProfilerEvent.OutputStart, stringifyForError(eventFn), 'tertiary-light');
      break;
    }
    default: {
      throw new Error('Unexpected profiling event type: ' + event);
    }
  }
};

function getComponentMeasureName(instance: {}) {
  return instance.constructor.name;
}

function getProviderTokenMeasureName<T>(token: any) {
  if (isTypeProvider(token)) {
    return token.name;
  } else if (token.provide != null) {
    return getProviderTokenMeasureName(token.provide);
  }
  return token.toString();
}

/**
 * Start listening to the Angular's internal performance-related events and route those to the Chrome DevTools performance panel.
 * This enables Angular-specific data visualization when recording a performance profile directly in the Chrome DevTools.
 *
 * Note: integration is enabled in the development mode only, this operation is noop in the production mode.
 *
 * @publicApi v21.0
 *
 * @returns a function that can be invoked to stop sending profiling data.
 * @see [Profiling with the Chrome DevTools](best-practices/profiling-with-chrome-devtools#recording-a-profile)
 */
export function enableProfiling() {
  performanceMarkFeature('Chrome DevTools profiling');
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const removeInjectorProfiler = setInjectorProfiler(chromeDevToolsInjectorProfiler);
    const removeProfiler = setProfiler(devToolsProfiler);

    return () => {
      removeInjectorProfiler();
      removeProfiler();
    };
  }
  return () => {};
}
