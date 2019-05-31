/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchEventTarget} from '../common/events';

Zone.__load_patch('EventEmitter', (global: any) => {
  // For EventEmitter
  const EE_ADD_LISTENER = 'addListener';
  const EE_PREPEND_LISTENER = 'prependListener';
  const EE_REMOVE_LISTENER = 'removeListener';
  const EE_REMOVE_ALL_LISTENER = 'removeAllListeners';
  const EE_LISTENERS = 'listeners';
  const EE_ON = 'on';

  const compareTaskCallbackVsDelegate = function(task: any, delegate: any) {
    // same callback, same capture, same event name, just return
    return task.callback === delegate || task.callback.listener === delegate;
  };

  const eventNameToString = function(eventName: string|Symbol) {
    if (typeof eventName === 'string') {
      return eventName as string;
    }
    if (!eventName) {
      return '';
    }
    return eventName.toString().replace('(', '_').replace(')', '_');
  };

  function patchEventEmitterMethods(obj: any) {
    const result = patchEventTarget(global, [obj], {
      useG: false,
      add: EE_ADD_LISTENER,
      rm: EE_REMOVE_LISTENER,
      prepend: EE_PREPEND_LISTENER,
      rmAll: EE_REMOVE_ALL_LISTENER,
      listeners: EE_LISTENERS,
      chkDup: false,
      rt: true,
      diff: compareTaskCallbackVsDelegate,
      eventNameToString: eventNameToString
    });
    if (result && result[0]) {
      obj[EE_ON] = obj[EE_ADD_LISTENER];
    }
  }

  // EventEmitter
  let events;
  try {
    events = require('events');
  } catch (err) {
  }

  if (events && events.EventEmitter) {
    patchEventEmitterMethods(events.EventEmitter.prototype);
  }
});
