/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isTypeProvider} from '../../di/provider_collection';
import {assertDefined, assertEqual} from '../../util/assert';
import {performanceMarkFeature} from '../../util/performance';
import {setProfiler} from '../profiler';
import {Profiler, ProfilerEvent} from '../profiler_types';
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

let changeDetectionRuns = 0;
let changeDetectionSyncRuns = 0;

let counter = 0;
type stackEntry = [ProfilerEvent | ProfilerDIEvent, number];
const eventsStack: stackEntry[] = [];

/**
 * Enum mimicking ProfilerEvent. The idea is to have unique event identifiers for both DI and other profiling events.
 */
const enum ProfilerDIEvent {
  InjectorToCreateInstanceEvent = 100,
  InstanceCreatedByInjector = 101,
}

function measureStart(startEvent: ProfilerEvent | ProfilerDIEvent) {
  eventsStack.push([startEvent, counter]);
  console.timeStamp('Event_' + startEvent + '_' + counter++);
}

function measureEnd(
  startEvent: ProfilerEvent | ProfilerDIEvent,
  entryName: string,
  color: DevToolsColor,
) {
  let top: stackEntry | undefined;

  // The stack may be asymmetric when an end event for a prior start event is missing (e.g. when an exception
  // has occurred), unroll the stack until a matching item has been found in that case.
  do {
    top = eventsStack.pop();
    assertDefined(top, 'Profiling error: could not find start event entry ' + startEvent);
  } while (top[0] !== startEvent);

  console.timeStamp(
    entryName,
    'Event_' + top[0] + '_' + top[1],
    undefined,
    '\u{1F170}\uFE0F Angular',
    undefined,
    color,
  );
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
      measureEnd(ProfilerEvent.BootstrapApplicationStart, 'Bootstrap application', 'primary-dark');
      break;
    }
    case ProfilerEvent.BootstrapComponentEnd: {
      measureEnd(ProfilerEvent.BootstrapComponentStart, 'Bootstrap component', 'primary-dark');
      break;
    }
    case ProfilerEvent.ChangeDetectionEnd: {
      changeDetectionSyncRuns = 0;
      measureEnd(
        ProfilerEvent.ChangeDetectionStart,
        'Change detection ' + changeDetectionRuns++,
        'primary-dark',
      );
      break;
    }

    case ProfilerEvent.ChangeDetectionSyncEnd: {
      measureEnd(
        ProfilerEvent.ChangeDetectionSyncStart,
        'Synchronization ' + changeDetectionSyncRuns++,
        'primary',
      );
      break;
    }
    case ProfilerEvent.AfterRenderHooksEnd: {
      measureEnd(ProfilerEvent.AfterRenderHooksStart, 'After render hooks', 'primary');
      break;
    }

    case ProfilerEvent.ComponentEnd: {
      const typeName = getComponentMeasureName(instance!);
      measureEnd(ProfilerEvent.ComponentStart, typeName, 'primary-light');
      break;
    }
    case ProfilerEvent.DeferBlockStateEnd: {
      measureEnd(ProfilerEvent.DeferBlockStateStart, 'Defer block', 'primary-dark');
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
      measureEnd(
        ProfilerEvent.LifecycleHookStart,
        `${typeName}:${stringifyForError(eventFn)}`,
        'tertiary',
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
 * @experimental
 *
 * @returns a function that can be invoked to stop sending profiling data.
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
