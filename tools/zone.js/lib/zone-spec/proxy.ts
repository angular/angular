/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ProxyZoneSpec implements ZoneSpec {
  name: string = 'ProxyZone';

  private _delegateSpec: ZoneSpec|null = null;

  properties: {[k: string]: any} = {'ProxyZoneSpec': this};
  propertyKeys: string[]|null = null;

  lastTaskState: HasTaskState|null = null;
  isNeedToTriggerHasTask = false;

  private tasks: Task[] = [];

  static get(): ProxyZoneSpec {
    return Zone.current.get('ProxyZoneSpec');
  }

  static isLoaded(): boolean {
    return ProxyZoneSpec.get() instanceof ProxyZoneSpec;
  }

  static assertPresent(): ProxyZoneSpec {
    if (!ProxyZoneSpec.isLoaded()) {
      throw new Error(`Expected to be running in 'ProxyZone', but it was not found.`);
    }
    return ProxyZoneSpec.get();
  }

  constructor(private defaultSpecDelegate: ZoneSpec|null = null) {
    this.setDelegate(defaultSpecDelegate);
  }

  setDelegate(delegateSpec: ZoneSpec|null) {
    const isNewDelegate = this._delegateSpec !== delegateSpec;
    this._delegateSpec = delegateSpec;
    this.propertyKeys && this.propertyKeys.forEach((key) => delete this.properties[key]);
    this.propertyKeys = null;
    if (delegateSpec && delegateSpec.properties) {
      this.propertyKeys = Object.keys(delegateSpec.properties);
      this.propertyKeys.forEach((k) => this.properties[k] = delegateSpec.properties![k]);
    }
    // if set a new delegateSpec, shoulde check whether need to
    // trigger hasTask or not
    if (isNewDelegate && this.lastTaskState &&
        (this.lastTaskState.macroTask || this.lastTaskState.microTask)) {
      this.isNeedToTriggerHasTask = true;
    }
  }

  getDelegate() {
    return this._delegateSpec;
  }


  resetDelegate() {
    const delegateSpec = this.getDelegate();
    this.setDelegate(this.defaultSpecDelegate);
  }

  tryTriggerHasTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone) {
    if (this.isNeedToTriggerHasTask && this.lastTaskState) {
      // last delegateSpec has microTask or macroTask
      // should call onHasTask in current delegateSpec
      this.isNeedToTriggerHasTask = false;
      this.onHasTask(parentZoneDelegate, currentZone, targetZone, this.lastTaskState);
    }
  }

  removeFromTasks(task: Task) {
    if (!this.tasks) {
      return;
    }
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i] === task) {
        this.tasks.splice(i, 1);
        return;
      }
    }
  }

  getAndClearPendingTasksInfo() {
    if (this.tasks.length === 0) {
      return '';
    }
    const taskInfo = this.tasks.map((task: Task) => {
      const dataInfo = task.data &&
          Object.keys(task.data)
              .map((key: string) => {
                return key + ':' + (task.data as any)[key];
              })
              .join(',');
      return `type: ${task.type}, source: ${task.source}, args: {${dataInfo}}`;
    });
    const pendingTasksInfo = '--Pendng async tasks are: [' + taskInfo + ']';
    // clear tasks
    this.tasks = [];

    return pendingTasksInfo;
  }

  onFork(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, zoneSpec: ZoneSpec):
      Zone {
    if (this._delegateSpec && this._delegateSpec.onFork) {
      return this._delegateSpec.onFork(parentZoneDelegate, currentZone, targetZone, zoneSpec);
    } else {
      return parentZoneDelegate.fork(targetZone, zoneSpec);
    }
  }


  onIntercept(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
      source: string): Function {
    if (this._delegateSpec && this._delegateSpec.onIntercept) {
      return this._delegateSpec.onIntercept(
          parentZoneDelegate, currentZone, targetZone, delegate, source);
    } else {
      return parentZoneDelegate.intercept(targetZone, delegate, source);
    }
  }


  onInvoke(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
      applyThis: any, applyArgs?: any[], source?: string): any {
    this.tryTriggerHasTask(parentZoneDelegate, currentZone, targetZone);
    if (this._delegateSpec && this._delegateSpec.onInvoke) {
      return this._delegateSpec.onInvoke(
          parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source);
    } else {
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    }
  }

  onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any):
      boolean {
    if (this._delegateSpec && this._delegateSpec.onHandleError) {
      return this._delegateSpec.onHandleError(parentZoneDelegate, currentZone, targetZone, error);
    } else {
      return parentZoneDelegate.handleError(targetZone, error);
    }
  }

  onScheduleTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
      Task {
    if (task.type !== 'eventTask') {
      this.tasks.push(task);
    }
    if (this._delegateSpec && this._delegateSpec.onScheduleTask) {
      return this._delegateSpec.onScheduleTask(parentZoneDelegate, currentZone, targetZone, task);
    } else {
      return parentZoneDelegate.scheduleTask(targetZone, task);
    }
  }

  onInvokeTask(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
      applyThis: any, applyArgs: any): any {
    if (task.type !== 'eventTask') {
      this.removeFromTasks(task);
    }
    this.tryTriggerHasTask(parentZoneDelegate, currentZone, targetZone);
    if (this._delegateSpec && this._delegateSpec.onInvokeTask) {
      return this._delegateSpec.onInvokeTask(
          parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs);
    } else {
      return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
    }
  }

  onCancelTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
      any {
    if (task.type !== 'eventTask') {
      this.removeFromTasks(task);
    }
    this.tryTriggerHasTask(parentZoneDelegate, currentZone, targetZone);
    if (this._delegateSpec && this._delegateSpec.onCancelTask) {
      return this._delegateSpec.onCancelTask(parentZoneDelegate, currentZone, targetZone, task);
    } else {
      return parentZoneDelegate.cancelTask(targetZone, task);
    }
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState): void {
    this.lastTaskState = hasTaskState;
    if (this._delegateSpec && this._delegateSpec.onHasTask) {
      this._delegateSpec.onHasTask(delegate, current, target, hasTaskState);
    } else {
      delegate.hasTask(target, hasTaskState);
    }
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['ProxyZoneSpec'] = ProxyZoneSpec;
