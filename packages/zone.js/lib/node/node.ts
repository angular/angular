/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './node_util';
import './events';
import './fs';

import {findEventTasks} from '../common/events';
import {patchTimer} from '../common/timers';
import {ArraySlice, isMix, patchMacroTask, patchMicroTask} from '../common/utils';

const set = 'set';
const clear = 'clear';

Zone.__load_patch('node_timers', (global: any, Zone: ZoneType) => {
  // Timers
  let globalUseTimeoutFromTimer = false;
  try {
    const timers = require('timers');
    let globalEqualTimersTimeout = global.setTimeout === timers.setTimeout;
    if (!globalEqualTimersTimeout && !isMix) {
      // 1. if isMix, then we are in mix environment such as Electron
      // we should only patch timers.setTimeout because global.setTimeout
      // have been patched
      // 2. if global.setTimeout not equal timers.setTimeout, check
      // whether global.setTimeout use timers.setTimeout or not
      const originSetTimeout = timers.setTimeout;
      timers.setTimeout = function() {
        globalUseTimeoutFromTimer = true;
        return originSetTimeout.apply(this, arguments);
      };
      const detectTimeout = global.setTimeout(() => {}, 100);
      clearTimeout(detectTimeout);
      timers.setTimeout = originSetTimeout;
    }
    patchTimer(timers, set, clear, 'Timeout');
    patchTimer(timers, set, clear, 'Interval');
    patchTimer(timers, set, clear, 'Immediate');
  } catch (error) {
    // timers module not exists, for example, when we using nativeScript
    // timers is not available
  }
  if (isMix) {
    // if we are in mix environment, such as Electron,
    // the global.setTimeout has already been patched,
    // so we just patch timers.setTimeout
    return;
  }
  if (!globalUseTimeoutFromTimer) {
    // 1. global setTimeout equals timers setTimeout
    // 2. or global don't use timers setTimeout(maybe some other library patch setTimeout)
    // 3. or load timers module error happens, we should patch global setTimeout
    patchTimer(global, set, clear, 'Timeout');
    patchTimer(global, set, clear, 'Interval');
    patchTimer(global, set, clear, 'Immediate');
  } else {
    // global use timers setTimeout, but not equals
    // this happens when use nodejs v0.10.x, global setTimeout will
    // use a lazy load version of timers setTimeout
    // we should not double patch timer's setTimeout
    // so we only store the __symbol__ for consistency
    global[Zone.__symbol__('setTimeout')] = global.setTimeout;
    global[Zone.__symbol__('setInterval')] = global.setInterval;
    global[Zone.__symbol__('setImmediate')] = global.setImmediate;
  }
});

// patch process related methods
Zone.__load_patch('nextTick', () => {
  // patch nextTick as microTask
  patchMicroTask(process, 'nextTick', (self: any, args: any[]) => {
    return {
      name: 'process.nextTick',
      args: args,
      cbIdx: (args.length > 0 && typeof args[0] === 'function') ? 0 : -1,
      target: process
    };
  });
});

Zone.__load_patch(
    'handleUnhandledPromiseRejection', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
      (Zone as any)[api.symbol('unhandledPromiseRejectionHandler')] =
          findProcessPromiseRejectionHandler('unhandledRejection');

      (Zone as any)[api.symbol('rejectionHandledHandler')] =
          findProcessPromiseRejectionHandler('rejectionHandled');

      // handle unhandled promise rejection
      function findProcessPromiseRejectionHandler(evtName: string) {
        return function(e: any) {
          const eventTasks = findEventTasks(process, evtName);
          eventTasks.forEach(eventTask => {
            // process has added unhandledrejection event listener
            // trigger the event listener
            if (evtName === 'unhandledRejection') {
              eventTask.invoke(e.rejection, e.promise);
            } else if (evtName === 'rejectionHandled') {
              eventTask.invoke(e.promise);
            }
          });
        };
      }
    });


// Crypto
Zone.__load_patch('crypto', () => {
  let crypto: any;
  try {
    crypto = require('crypto');
  } catch (err) {
  }

  // use the generic patchMacroTask to patch crypto
  if (crypto) {
    const methodNames = ['randomBytes', 'pbkdf2'];
    methodNames.forEach(name => {
      patchMacroTask(crypto, name, (self: any, args: any[]) => {
        return {
          name: 'crypto.' + name,
          args: args,
          cbIdx: (args.length > 0 && typeof args[args.length - 1] === 'function') ?
              args.length - 1 :
              -1,
          target: crypto
        };
      });
    });
  }
});

Zone.__load_patch('console', (global: any, Zone: ZoneType) => {
  const consoleMethods =
      ['dir', 'log', 'info', 'error', 'warn', 'assert', 'debug', 'timeEnd', 'trace'];
  consoleMethods.forEach((m: string) => {
    const originalMethod = (console as any)[Zone.__symbol__(m)] = (console as any)[m];
    if (originalMethod) {
      (console as any)[m] = function() {
        const args = ArraySlice.call(arguments);
        if (Zone.current === Zone.root) {
          return originalMethod.apply(this, args);
        } else {
          return Zone.root.run(originalMethod, this, args);
        }
      };
    }
  });
});
