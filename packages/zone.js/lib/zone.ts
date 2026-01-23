/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  __symbol__,
  EventTask as _EventTask,
  HasTaskState as _HasTaskState,
  initZone,
  MacroTask as _MacroTask,
  MicroTask as _MicroTask,
  PatchFn,
  Task as _Task,
  TaskData as _TaskData,
  TaskState as _TaskState,
  TaskType as _TaskType,
  UncaughtPromiseError as _UncaughtPromiseError,
  Zone as _Zone,
  ZoneDelegate as _ZoneDelegate,
  ZoneFrame,
  ZonePrivate,
  ZoneSpec as _ZoneSpec,
  ZoneType as _ZoneType,
} from './zone-impl';

declare global {
  const Zone: ZoneType;
  type Zone = _Zone;
  type ZoneType = _ZoneType;
  type _PatchFn = PatchFn;
  type _ZonePrivate = ZonePrivate;
  type _ZoneFrame = ZoneFrame;
  type UncaughtPromiseError = _UncaughtPromiseError;
  type ZoneSpec = _ZoneSpec;
  type ZoneDelegate = _ZoneDelegate;
  type HasTaskState = _HasTaskState;
  type TaskType = _TaskType;
  type TaskState = _TaskState;
  type TaskData = _TaskData;
  type Task = _Task;
  type MicroTask = _MicroTask;
  type MacroTask = _MacroTask;
  type EventTask = _EventTask;

  /**
   * Extend the Error with additional fields for rewritten stack frames
   */
  interface Error {
    /**
     * Stack trace where extra frames have been removed and zone names added.
     */
    zoneAwareStack?: string;

    /**
     * Original stack trace with no modifications
     */
    originalStack?: string;
  }
}

export function loadZone(): ZoneType {
  // if global['Zone'] already exists (maybe zone.js was already loaded or
  // some other lib also registered a global object named Zone), we may need
  // to throw an error, but sometimes user may not want this error.
  // For example,
  // we have two web pages, page1 includes zone.js, page2 doesn't.
  // and the 1st time user load page1 and page2, everything work fine,
  // but when user load page2 again, error occurs because global['Zone'] already exists.
  // so we add a flag to let user choose whether to throw this error or not.
  // By default, if existing Zone is from zone.js, we will not throw the error.
  const global = globalThis as any;
  const checkDuplicate = global[__symbol__('forceDuplicateZoneCheck')] === true;
  if (global['Zone'] && (checkDuplicate || typeof global['Zone'].__symbol__ !== 'function')) {
    throw new Error('Zone already loaded.');
  }

  // Initialize global `Zone` constant.
  global['Zone'] ??= initZone();
  return global['Zone'];
}
