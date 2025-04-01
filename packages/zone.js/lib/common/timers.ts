/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

import {
  isFunction,
  isNumber,
  patchMethod,
  scheduleMacroTaskWithCurrentZone,
  zoneSymbol,
} from './utils';

export const taskSymbol = zoneSymbol('zoneTask');

interface TimerOptions extends TaskData {
  handleId?: number;
  args: any[];
}

export function patchTimer(window: any, setName: string, cancelName: string, nameSuffix: string) {
  let setNative: Function | null = null;
  let clearNative: Function | null = null;
  setName += nameSuffix;
  cancelName += nameSuffix;

  const tasksByHandleId: {[id: number]: Task} = {};

  function scheduleTask(task: Task) {
    const data = <TimerOptions>task.data;
    data.args[0] = function () {
      return task.invoke.apply(this, arguments);
    };

    const handleOrId = setNative!.apply(window, data.args);

    // Whlist on Node.js when get can the ID by using `[Symbol.toPrimitive]()` we do
    // to this so that we do not cause potentally leaks when using `setTimeout`
    // since this can be periodic when using `.refresh`.
    if (isNumber(handleOrId)) {
      data.handleId = handleOrId;
    } else {
      data.handle = handleOrId;
      // On Node.js a timeout and interval can be restarted over and over again by using the `.refresh` method.
      data.isRefreshable = isFunction(handleOrId.refresh);
    }

    return task;
  }

  function clearTask(task: Task) {
    const {handle, handleId} = task.data!;

    return clearNative!.call(window, handle ?? handleId);
  }

  setNative = patchMethod(
    window,
    setName,
    (delegate: Function) =>
      function (self: any, args: any[]) {
        if (isFunction(args[0])) {
          const options: TimerOptions = {
            isRefreshable: false,
            isPeriodic: nameSuffix === 'Interval',
            delay: nameSuffix === 'Timeout' || nameSuffix === 'Interval' ? args[1] || 0 : undefined,
            args: args,
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
              const {handle, handleId, isPeriodic, isRefreshable} = options;

              if (!isPeriodic && !isRefreshable) {
                if (handleId) {
                  // in non-nodejs env, we remove timerId
                  // from local cache
                  delete tasksByHandleId[handleId];
                } else if (handle) {
                  // Node returns complex objects as handleIds
                  // we remove task reference from timer object
                  handle[taskSymbol] = null;
                }
              }
            }
          };
          const task = scheduleMacroTaskWithCurrentZone(
            setName,
            args[0],
            options,
            scheduleTask,
            clearTask,
          );

          if (!task) {
            return task;
          }

          // Node.js must additionally support the ref and unref functions.
          const {handleId, handle, isRefreshable, isPeriodic} = <TimerOptions>task.data;
          if (handleId) {
            // for non nodejs env, we save handleId: task
            // mapping in local cache for clearTimeout
            tasksByHandleId[handleId] = task;
          } else if (handle) {
            // for nodejs env, we save task
            // reference in timerId Object for clearTimeout
            handle[taskSymbol] = task;

            if (isRefreshable && !isPeriodic) {
              const originalRefresh = handle.refresh;
              handle.refresh = function () {
                const {zone, state} = task as any;
                if (state === 'notScheduled') {
                  (task as any)._state = 'scheduled';
                  zone._updateTaskCount(task, 1);
                } else if (state === 'running') {
                  (task as any)._state = 'scheduling';
                }

                return originalRefresh.call(this);
              };
            }
          }

          return handle ?? handleId ?? task;
        } else {
          // cause an error by calling it directly.
          return delegate.apply(window, args);
        }
      },
  );

  clearNative = patchMethod(
    window,
    cancelName,
    (delegate: Function) =>
      function (self: any, args: any[]) {
        const id = args[0];
        let task: Task;

        if (isNumber(id)) {
          // non nodejs env.
          task = tasksByHandleId[id];
          delete tasksByHandleId[id];
        } else {
          // nodejs env ?? other environments.
          task = id?.[taskSymbol];
          if (task) {
            id[taskSymbol] = null;
          } else {
            task = id;
          }
        }

        if (task?.type) {
          if (task.cancelFn) {
            // Do not cancel already canceled functions
            task.zone.cancelTask(task);
          }
        } else {
          // cause an error by calling it directly.
          delegate.apply(window, args);
        }
      },
  );
}
