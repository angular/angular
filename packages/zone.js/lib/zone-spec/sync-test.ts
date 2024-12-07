/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchSyncTest(Zone: ZoneType): void {
  class SyncTestZoneSpec implements ZoneSpec {
    runZone = Zone.current;

    constructor(namePrefix: string) {
      this.name = 'syncTestZone for ' + namePrefix;
    }

    // ZoneSpec implementation below.

    name: string;

    onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
      switch (task.type) {
        case 'microTask':
        case 'macroTask':
          throw new Error(`Cannot call ${task.source} from within a sync test (${this.name}).`);
        case 'eventTask':
          task = delegate.scheduleTask(target, task);
          break;
      }
      return task;
    }
  }

  // Export the class so that new instances can be created with proper
  // constructor params.
  (Zone as any)['SyncTestZoneSpec'] = SyncTestZoneSpec;
}
