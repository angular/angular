/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

import {findEventTasks} from '../common/events';
import {patchTimer} from '../common/timers';
import {patchClass, patchMethod, patchPrototype, scheduleMacroTaskWithCurrentZone, ZONE_SYMBOL_ADD_EVENT_LISTENER, ZONE_SYMBOL_REMOVE_EVENT_LISTENER, zoneSymbol,} from '../common/utils';

import {patchCustomElements} from './custom-elements';
import {eventTargetPatch, patchEvent} from './event-target';
import {propertyDescriptorPatch} from './property-descriptor';

Zone.__load_patch('legacy', (global: any) => {
  const legacyPatch = global[Zone.__symbol__('legacyPatch')];
  if (legacyPatch) {
    legacyPatch();
  }
});

Zone.__load_patch('queueMicrotask', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  api.patchMethod(global, 'queueMicrotask', delegate => {
    return function(self: any, args: any[]) {
      Zone.current.scheduleMicroTask('queueMicrotask', args[0]);
    }
  });
});


Zone.__load_patch('timers', (global: any) => {
  const set = 'set';
  const clear = 'clear';
  patchTimer(global, set, clear, 'Timeout');
  patchTimer(global, set, clear, 'Interval');
  patchTimer(global, set, clear, 'Immediate');
});

Zone.__load_patch('requestAnimationFrame', (global: any) => {
  patchTimer(global, 'request', 'cancel', 'AnimationFrame');
  patchTimer(global, 'mozRequest', 'mozCancel', 'AnimationFrame');
  patchTimer(global, 'webkitRequest', 'webkitCancel', 'AnimationFrame');
});

Zone.__load_patch('blocking', (global: any, Zone: ZoneType) => {
  const blockingMethods = ['alert', 'prompt', 'confirm'];
  for (let i = 0; i < blockingMethods.length; i++) {
    const name = blockingMethods[i];
    patchMethod(global, name, (delegate, symbol, name) => {
      return function(s: any, args: any[]) {
        return Zone.current.run(delegate, global, args, name);
      };
    });
  }
});

Zone.__load_patch('EventTarget', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  patchEvent(global, api);
  eventTargetPatch(global, api);
  // patch XMLHttpRequestEventTarget's addEventListener/removeEventListener
  const XMLHttpRequestEventTarget = (global as any)['XMLHttpRequestEventTarget'];
  if (XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype) {
    api.patchEventTarget(global, [XMLHttpRequestEventTarget.prototype]);
  }
});

Zone.__load_patch('MutationObserver', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  patchClass('MutationObserver');
  patchClass('WebKitMutationObserver');
});

Zone.__load_patch('IntersectionObserver', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  patchClass('IntersectionObserver');
});

Zone.__load_patch('FileReader', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  patchClass('FileReader');
});

Zone.__load_patch('on_property', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  propertyDescriptorPatch(api, global);
});

Zone.__load_patch('customElements', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  patchCustomElements(global, api);
});

Zone.__load_patch('XHR', (global: any, Zone: ZoneType) => {
  // Treat XMLHttpRequest as a macrotask.
  patchXHR(global);

  const XHR_TASK = zoneSymbol('xhrTask');
  const XHR_SYNC = zoneSymbol('xhrSync');
  const XHR_LISTENER = zoneSymbol('xhrListener');
  const XHR_SCHEDULED = zoneSymbol('xhrScheduled');
  const XHR_URL = zoneSymbol('xhrURL');
  const XHR_ERROR_BEFORE_SCHEDULED = zoneSymbol('xhrErrorBeforeScheduled');

  interface XHROptions extends TaskData {
    target: any;
    url: string;
    args: any[];
    aborted: boolean;
  }

  function patchXHR(window: any) {
    const XMLHttpRequest = window['XMLHttpRequest'];
    if (!XMLHttpRequest) {
      // XMLHttpRequest is not available in service worker
      return;
    }
    const XMLHttpRequestPrototype: any = XMLHttpRequest.prototype;

    function findPendingTask(target: any) {
      return target[XHR_TASK];
    }

    let oriAddListener = XMLHttpRequestPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
    let oriRemoveListener = XMLHttpRequestPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
    if (!oriAddListener) {
      const XMLHttpRequestEventTarget = window['XMLHttpRequestEventTarget'];
      if (XMLHttpRequestEventTarget) {
        const XMLHttpRequestEventTargetPrototype = XMLHttpRequestEventTarget.prototype;
        oriAddListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
        oriRemoveListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
      }
    }

    const READY_STATE_CHANGE = 'readystatechange';
    const SCHEDULED = 'scheduled';

    function scheduleTask(task: Task) {
      const data = <XHROptions>task.data;
      const target = data.target;
      target[XHR_SCHEDULED] = false;
      target[XHR_ERROR_BEFORE_SCHEDULED] = false;
      // remove existing event listener
      const listener = target[XHR_LISTENER];
      if (!oriAddListener) {
        oriAddListener = target[ZONE_SYMBOL_ADD_EVENT_LISTENER];
        oriRemoveListener = target[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
      }

      if (listener) {
        oriRemoveListener.call(target, READY_STATE_CHANGE, listener);
      }
      const newListener = target[XHR_LISTENER] = () => {
        if (target.readyState === target.DONE) {
          // sometimes on some browsers XMLHttpRequest will fire onreadystatechange with
          // readyState=4 multiple times, so we need to check task state here
          if (!data.aborted && target[XHR_SCHEDULED] && task.state === SCHEDULED) {
            // check whether the xhr has registered onload listener
            // if that is the case, the task should invoke after all
            // onload listeners finish.
            // Also if the request failed without response (status = 0), the load event handler
            // will not be triggered, in that case, we should also invoke the placeholder callback
            // to close the XMLHttpRequest::send macroTask.
            // https://github.com/angular/angular/issues/38795
            const loadTasks = target[Zone.__symbol__('loadfalse')];
            if (target.status !== 0 && loadTasks && loadTasks.length > 0) {
              const oriInvoke = task.invoke;
              task.invoke = function() {
                // need to load the tasks again, because in other
                // load listener, they may remove themselves
                const loadTasks = target[Zone.__symbol__('loadfalse')];
                for (let i = 0; i < loadTasks.length; i++) {
                  if (loadTasks[i] === task) {
                    loadTasks.splice(i, 1);
                  }
                }
                if (!data.aborted && task.state === SCHEDULED) {
                  oriInvoke.call(task);
                }
              };
              loadTasks.push(task);
            } else {
              task.invoke();
            }
          } else if (!data.aborted && target[XHR_SCHEDULED] === false) {
            // error occurs when xhr.send()
            target[XHR_ERROR_BEFORE_SCHEDULED] = true;
          }
        }
      };
      oriAddListener.call(target, READY_STATE_CHANGE, newListener);

      const storedTask: Task = target[XHR_TASK];
      if (!storedTask) {
        target[XHR_TASK] = task;
      }
      sendNative!.apply(target, data.args);
      target[XHR_SCHEDULED] = true;
      return task;
    }

    function placeholderCallback() {}

    function clearTask(task: Task) {
      const data = <XHROptions>task.data;
      // Note - ideally, we would call data.target.removeEventListener here, but it's too late
      // to prevent it from firing. So instead, we store info for the event listener.
      data.aborted = true;
      return abortNative!.apply(data.target, data.args);
    }

    const openNative =
        patchMethod(XMLHttpRequestPrototype, 'open', () => function(self: any, args: any[]) {
          self[XHR_SYNC] = args[2] == false;
          self[XHR_URL] = args[1];
          return openNative!.apply(self, args);
        });

    const XMLHTTPREQUEST_SOURCE = 'XMLHttpRequest.send';
    const fetchTaskAborting = zoneSymbol('fetchTaskAborting');
    const fetchTaskScheduling = zoneSymbol('fetchTaskScheduling');
    const sendNative: Function|null =
        patchMethod(XMLHttpRequestPrototype, 'send', () => function(self: any, args: any[]) {
          if ((Zone.current as any)[fetchTaskScheduling] === true) {
            // a fetch is scheduling, so we are using xhr to polyfill fetch
            // and because we already schedule macroTask for fetch, we should
            // not schedule a macroTask for xhr again
            return sendNative!.apply(self, args);
          }
          if (self[XHR_SYNC]) {
            // if the XHR is sync there is no task to schedule, just execute the code.
            return sendNative!.apply(self, args);
          } else {
            const options: XHROptions =
                {target: self, url: self[XHR_URL], isPeriodic: false, args: args, aborted: false};
            const task = scheduleMacroTaskWithCurrentZone(
                XMLHTTPREQUEST_SOURCE, placeholderCallback, options, scheduleTask, clearTask);
            if (self && self[XHR_ERROR_BEFORE_SCHEDULED] === true && !options.aborted &&
                task.state === SCHEDULED) {
              // xhr request throw error when send
              // we should invoke task instead of leaving a scheduled
              // pending macroTask
              task.invoke();
            }
          }
        });

    const abortNative =
        patchMethod(XMLHttpRequestPrototype, 'abort', () => function(self: any, args: any[]) {
          const task: Task = findPendingTask(self);
          if (task && typeof task.type == 'string') {
            // If the XHR has already completed, do nothing.
            // If the XHR has already been aborted, do nothing.
            // Fix #569, call abort multiple times before done will cause
            // macroTask task count be negative number
            if (task.cancelFn == null || (task.data && (<XHROptions>task.data).aborted)) {
              return;
            }
            task.zone.cancelTask(task);
          } else if ((Zone.current as any)[fetchTaskAborting] === true) {
            // the abort is called from fetch polyfill, we need to call native abort of XHR.
            return abortNative!.apply(self, args);
          }
          // Otherwise, we are trying to abort an XHR which has not yet been sent, so there is no
          // task
          // to cancel. Do nothing.
        });
  }
});

Zone.__load_patch('geolocation', (global: any) => {
  /// GEO_LOCATION
  if (global['navigator'] && global['navigator'].geolocation) {
    patchPrototype(global['navigator'].geolocation, ['getCurrentPosition', 'watchPosition']);
  }
});

Zone.__load_patch('PromiseRejectionEvent', (global: any, Zone: ZoneType) => {
  // handle unhandled promise rejection
  function findPromiseRejectionHandler(evtName: string) {
    return function(e: any) {
      const eventTasks = findEventTasks(global, evtName);
      eventTasks.forEach(eventTask => {
        // windows has added unhandledrejection event listener
        // trigger the event listener
        const PromiseRejectionEvent = global['PromiseRejectionEvent'];
        if (PromiseRejectionEvent) {
          const evt = new PromiseRejectionEvent(evtName, {promise: e.promise, reason: e.rejection});
          eventTask.invoke(evt);
        }
      });
    };
  }

  if (global['PromiseRejectionEvent']) {
    (Zone as any)[zoneSymbol('unhandledPromiseRejectionHandler')] =
        findPromiseRejectionHandler('unhandledrejection');

    (Zone as any)[zoneSymbol('rejectionHandledHandler')] =
        findPromiseRejectionHandler('rejectionhandled');
  }
});
