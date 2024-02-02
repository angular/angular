/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventTask as _EventTask, HasTaskState as _HasTaskState, initZone, MacroTask as _MacroTask, MicroTask as _MicroTask, PatchFn, Task as _Task, TaskData as _TaskData, TaskState as _TaskState, TaskType as _TaskType, UncaughtPromiseError as _UncaughtPromiseError, Zone as _Zone, ZoneDelegate as _ZoneDelegate, ZoneFrame, ZonePrivate, ZoneSpec as _ZoneSpec, ZoneType as _ZoneType} from './zone-impl';

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
}

(globalThis as any)['Zone'] = initZone();
