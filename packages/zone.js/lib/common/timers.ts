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

import {patchMethod, scheduleMacroTaskWithCurrentZone, zoneSymbol} from './utils';

const taskSymbol = zoneSymbol('zoneTask');

interface TimerOptions extends TaskData {
  handleId?: number;
  args: any[];
}

export function patchTimer(window: any, setName: string, cancelName: string, nameSuffix: string) {
  let setNative: Function|null = null;
  let clearNative: Function|null = null;
  setName += nameSuffix;
  cancelName += nameSuffix;

  const tasksByHandleId: {[id: number]: Task} = {};

  function scheduleTask(task: Task) {
    const data = <TimerOptions>task.data;
    data.args[0] = function() {
      return task.invoke.apply(this, arguments);
    };
    data.handleId = setNative!.apply(window, data.args);
    return task;
  }

  function clearTask(task: Task) {
    return clearNative!.call(window, (<TimerOptions>task.data).handleId);
  }

  setNative =
      patchMethod(window, setName, (delegate: Function) => function(self: any, args: any[]) {
        if (typeof args[0] === 'function') {
          const options: TimerOptions = {
            isPeriodic: nameSuffix === 'Interval',
            delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 :
                                                                             undefined,
            args: args
          };
          const callback = args[0];
          args[0] = function timer(this: unknown) {
            try {
              return callback.apply(this, arguments);
            } finally {
              // issue-934, task will be cancelled
              // even it is a periodic task such as
              // setInterval

              // https://github.com/angular/angular/issues/40387
              // Cleanup tasksByHandleId should be handled before scheduleTask
              // Since some zoneSpec may intercept and doesn't trigger
              // scheduleFn(scheduleTask) provided here.
              if (!(options.isPeriodic)) {
                if (typeof options.handleId === 'number') {
                  // in non-nodejs env, we remove timerId
                  // from local cache
                  delete tasksByHandleId[options.handleId];
                } else if (options.handleId) {
                  // Node returns complex objects as handleIds
                  // we remove task reference from timer object
                  (options.handleId as any)[taskSymbol] = null;
                }
              }
            }
          };
          const task =
              scheduleMacroTaskWithCurrentZone(setName, args[0], options, scheduleTask, clearTask);
          if (!task) {
            return task;
          }
          // Node.js must additionally support the ref and unref functions.
          const handle: any = (<TimerOptions>task.data).handleId;
          if (typeof handle === 'number') {
            // for non nodejs env, we save handleId: task
            // mapping in local cache for clearTimeout
            tasksByHandleId[handle] = task;
          } else if (handle) {
            // for nodejs env, we save task
            // reference in timerId Object for clearTimeout
            handle[taskSymbol] = task;
          }

          // check whether handle is null, because some polyfill or browser
          // may return undefined from setTimeout/setInterval/setImmediate/requestAnimationFrame
          if (handle && handle.ref && handle.unref && typeof handle.ref === 'function' &&
              typeof handle.unref === 'function') {
            (<any>task).ref = (<any>handle).ref.bind(handle);
            (<any>task).unref = (<any>handle).unref.bind(handle);
          }
          if (typeof handle === 'number' || handle) {
            return handle;
          }
          return task;
        } else {
          // cause an error by calling it directly.
          return delegate.apply(window, args);
        }
      });

  clearNative =
      patchMethod(window, cancelName, (delegate: Function) => function(self: any, args: any[]) {
        const id = args[0];
        let task: Task;
        if (typeof id === 'number') {
          // non nodejs env.
          task = tasksByHandleId[id];
        } else {
          // nodejs env.
          task = id && id[taskSymbol];
          // other environments.
          if (!task) {
            task = id;
          }
        }
        if (task && typeof task.type === 'string') {
          if (task.state !== 'notScheduled' &&
              (task.cancelFn && task.data!.isPeriodic || task.runCount === 0)) {
            if (typeof id === 'number') {
              delete tasksByHandleId[id];
            } else if (id) {
              id[taskSymbol] = null;
            }
            // Do not cancel already canceled functions
            task.zone.cancelTask(task);
          }
        } else {
          // cause an error by calling it directly.
          delegate.apply(window, args);
        }
      });
}
