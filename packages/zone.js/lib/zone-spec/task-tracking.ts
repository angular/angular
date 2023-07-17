/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A `TaskTrackingZoneSpec` allows one to track all outstanding Tasks.
 *
 * This is useful in tests. For example to see which tasks are preventing a test from completing
 * or an automated way of releasing all of the event listeners at the end of the test.
 */
class TaskTrackingZoneSpec implements ZoneSpec {
  name = 'TaskTrackingZone';
  microTasks: Task[] = [];
  macroTasks: Task[] = [];
  eventTasks: Task[] = [];
  properties: {[key: string]: any} = {'TaskTrackingZone': this};

  static get() {
    return Zone.current.get('TaskTrackingZone');
  }

  private getTasksFor(type: string): Task[] {
    switch (type) {
      case 'microTask':
        return this.microTasks;
      case 'macroTask':
        return this.macroTasks;
      case 'eventTask':
        return this.eventTasks;
    }
    throw new Error('Unknown task format: ' + type);
  }

  onScheduleTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
      Task {
    (task as any)['creationLocation'] = new Error(`Task '${task.type}' from '${task.source}'.`);
    const tasks = this.getTasksFor(task.type);
    tasks.push(task);
    return parentZoneDelegate.scheduleTask(targetZone, task);
  }

  onCancelTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
      any {
    const tasks = this.getTasksFor(task.type);
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i] == task) {
        tasks.splice(i, 1);
        break;
      }
    }
    return parentZoneDelegate.cancelTask(targetZone, task);
  }

  onInvokeTask(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
      applyThis: any, applyArgs: any): any {
    if (task.type === 'eventTask' || task.data?.isPeriodic)
      return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
    const tasks = this.getTasksFor(task.type);
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i] == task) {
        tasks.splice(i, 1);
        break;
      }
    }
    return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
  }

  clearEvents() {
    while (this.eventTasks.length) {
      Zone.current.cancelTask(this.eventTasks[0]);
    }
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['TaskTrackingZoneSpec'] = TaskTrackingZoneSpec;
