/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone} from '@angular/core';
// Import zero symbols from zone.js. This causes the zone ambient type to be
// added to the type-checker, without emitting any runtime module load statement
import {} from 'zone.js';

import {DOCUMENT} from '../dom_tokens';

import {EventManagerPlugin} from './event_manager';

interface TaskData {
  zone: any;
  handler: Function;
}

/**
 * Detect if Zone is present. If it is then use simple zone aware 'addEventListener'
 * since Angular can do much more
 * efficient bookkeeping than Zone can, because we have additional information. This speeds up
 * addEventListener by 3x.
 */
@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  private static __symbol__: <T>(v: T) => T;
  private static ADD_EVENT_LISTENER: string;
  private static REMOVE_EVENT_LISTENER: string;
  private static symbolNames: {[key: string]: string};
  private static FALSE: string;
  private static ANGULAR: string;
  private static NATIVE_ADD_LISTENER: string;
  private static NATIVE_REMOVE_LISTENER: string;
  private static blackListedMap: {[eventName: string]: string};

  private static isBlackListedEvent(eventName: string) {
    if (!DomEventsPlugin.blackListedMap) {
      return false;
    }
    return DomEventsPlugin.blackListedMap.hasOwnProperty(eventName);
  };

  // a global listener to handle all dom event,
  // so we do not need to create a closure everytime
  private static globalListener = function(event: Event) {
    const symbolName = DomEventsPlugin.symbolNames[event.type];
    if (!symbolName) {
      return;
    }
    const taskDatas: TaskData[] = this[symbolName];
    if (!taskDatas) {
      return;
    }
    const args: any = [event];
    if (taskDatas.length === 1) {
      // if taskDatas only have one element, just invoke it
      const taskData = taskDatas[0];
      if (taskData.zone !== Zone.current) {
        // only use Zone.run when Zone.current not equals to stored zone
        return taskData.zone.run(taskData.handler, this, args);
      } else {
        return taskData.handler.apply(this, args);
      }
    } else {
      // copy tasks as a snapshot to avoid event handlers remove
      // itself or others
      const copiedTasks = taskDatas.slice();
      for (let i = 0; i < copiedTasks.length; i++) {
        const taskData = copiedTasks[i];
        if (taskData.zone !== Zone.current) {
          // only use Zone.run when Zone.current not equals to stored zone
          taskData.zone.run(taskData.handler, this, args);
        } else {
          taskData.handler.apply(this, args);
        }
      }
    }
  };

  constructor(@Inject(DOCUMENT) doc: any, private ngZone: NgZone) {
    super(doc);

    if (!DomEventsPlugin.__symbol__) {
      DomEventsPlugin.__symbol__ =
          (typeof Zone !== 'undefined') && (Zone as any)['__symbol__'] || function<T>(v: T): T {
        return v;
      };
      DomEventsPlugin.ADD_EVENT_LISTENER = DomEventsPlugin.__symbol__('addEventListener');
      DomEventsPlugin.REMOVE_EVENT_LISTENER = DomEventsPlugin.__symbol__('removeEventListener');

      DomEventsPlugin.symbolNames = {};

      DomEventsPlugin.FALSE = 'FALSE';
      DomEventsPlugin.ANGULAR = 'ANGULAR';
      DomEventsPlugin.NATIVE_ADD_LISTENER = 'addEventListener';
      DomEventsPlugin.NATIVE_REMOVE_LISTENER = 'removeEventListener';

      const blackListedEvents: string[] = (typeof Zone !== 'undefined') &&
          (Zone as any)[DomEventsPlugin.__symbol__('BLACK_LISTED_EVENTS')];
      if (blackListedEvents) {
        DomEventsPlugin.blackListedMap = {};
        blackListedEvents.forEach(
            eventName => { DomEventsPlugin.blackListedMap[eventName] = eventName; });
      }
    }
  }

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    /**
     * This code is about to add a listener to the DOM. If Zone.js is present, than
     * `addEventListener` has been patched. The patched code adds overhead in both
     * memory and speed (3x slower) than native. For this reason if we detect that
     * Zone.js is present we use a simple version of zone aware addEventListener instead.
     * The result is faster registration and the zone will be restored.
     * But ZoneSpec.onScheduleTask, ZoneSpec.onInvokeTask, ZoneSpec.onCancelTask
     * will not be invoked
     * We also do manual zone restoration in element.ts renderEventHandlerClosure method.
     *
     * NOTE: it is possible that the element is from different iframe, and so we
     * have to check before we execute the method.
     */
    const zoneJsLoaded = (element as any)[DomEventsPlugin.ADD_EVENT_LISTENER];
    let callback: EventListener = handler as EventListener;
    // if zonejs is loaded and current zone is not ngZone
    // we keep Zone.current on target for later restoration.
    if (zoneJsLoaded &&
        (!NgZone.isInAngularZone() || DomEventsPlugin.isBlackListedEvent(eventName))) {
      let symbolName = DomEventsPlugin.symbolNames[eventName];
      if (!symbolName) {
        symbolName = DomEventsPlugin.symbolNames[eventName] =
            DomEventsPlugin.__symbol__(DomEventsPlugin.ANGULAR + eventName + DomEventsPlugin.FALSE);
      }
      let taskDatas: TaskData[] = (element as any)[symbolName];
      const globalListenerRegistered = taskDatas && taskDatas.length > 0;
      if (!taskDatas) {
        taskDatas = (element as any)[symbolName] = [];
      }

      const zone = DomEventsPlugin.isBlackListedEvent(eventName) ? Zone.root : Zone.current;
      if (taskDatas.length === 0) {
        taskDatas.push({zone: zone, handler: callback});
      } else {
        let callbackRegistered = false;
        for (let i = 0; i < taskDatas.length; i++) {
          if (taskDatas[i].handler === callback) {
            callbackRegistered = true;
            break;
          }
        }
        if (!callbackRegistered) {
          taskDatas.push({zone: zone, handler: callback});
        }
      }

      if (!globalListenerRegistered) {
        (element as any)[DomEventsPlugin.ADD_EVENT_LISTENER](
            eventName, DomEventsPlugin.globalListener, false);
      }
    } else {
      (element as any)[DomEventsPlugin.NATIVE_ADD_LISTENER](eventName, callback, false);
    }
    return () => this.removeEventListener(element, eventName, callback);
  }

  removeEventListener(target: any, eventName: string, callback: Function): void {
    let underlyingRemove = target[DomEventsPlugin.REMOVE_EVENT_LISTENER];
    // zone.js not loaded, use native removeEventListener
    if (!underlyingRemove) {
      return target[DomEventsPlugin.NATIVE_REMOVE_LISTENER].apply(
          target, [eventName, callback, false]);
    }
    let symbolName = DomEventsPlugin.symbolNames[eventName];
    let taskDatas: TaskData[] = symbolName && target[symbolName];
    if (!taskDatas) {
      // addEventListener not using patched version
      // just call native removeEventListener
      return target[DomEventsPlugin.NATIVE_REMOVE_LISTENER].apply(
          target, [eventName, callback, false]);
    }
    for (let i = 0; i < taskDatas.length; i++) {
      // remove listener from taskDatas if the callback equals
      if (taskDatas[i].handler === callback) {
        taskDatas.splice(i, 1);
        break;
      }
    }
    if (taskDatas.length === 0) {
      // all listeners are removed, we can remove the globalListener from target
      underlyingRemove.apply(target, [eventName, DomEventsPlugin.globalListener, false]);
    }
  }
}
