/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../../dist/zone-node';
const testClosureFunction = () => {
  const logs: string[] = [];
  // call all Zone exposed functions
  const testZoneSpec: ZoneSpec = {
    name: 'closure',
    properties: {},
    onFork:
        (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
         zoneSpec: ZoneSpec) => {
          return parentZoneDelegate.fork(targetZone, zoneSpec);
        },

    onIntercept:
        (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
         source: string) => {
          return parentZoneDelegate.intercept(targetZone, delegate, source);
        },

    onInvoke: function(
        parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
        applyThis?: any, applyArgs?: any[], source?: string) {
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    },

    onHandleError: function(
        parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any) {
      return parentZoneDelegate.handleError(targetZone, error);
    },

    onScheduleTask: function(
        parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) {
      return parentZoneDelegate.scheduleTask(targetZone, task);
    },

    onInvokeTask: function(
        parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
        applyThis?: any, applyArgs?: any[]) {
      return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
    },

    onCancelTask: function(
        parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) {
      return parentZoneDelegate.cancelTask(targetZone, task);
    },

    onHasTask: function(
        delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
      return delegate.hasTask(target, hasTaskState);
    }
  };

  const testZone: Zone = Zone.current.fork(testZoneSpec);
  testZone.runGuarded(() => {
    testZone.run(() => {
      const properties = testZoneSpec.properties;
      properties!['key'] = 'value';
      const keyZone = Zone.current.getZoneWith('key');

      logs.push('current' + Zone.current.name);
      logs.push('parent' + Zone.current.parent!.name);
      logs.push('getZoneWith' + keyZone!.name);
      logs.push('get' + keyZone!.get('key'));
      logs.push('root' + Zone.root.name);
      Object.keys((Zone as any).prototype).forEach(key => {
        logs.push(key);
      });
      Object.keys(testZoneSpec).forEach(key => {
        logs.push(key);
      });

      const task = Zone.current.scheduleMicroTask('testTask', () => {}, undefined, () => {});
      Object.keys(task).forEach(key => {
        logs.push(key);
      });
    });
  });

  const expectedResult = [
    'currentclosure',
    'parent<root>',
    'getZoneWithclosure',
    'getvalue',
    'root<root>',
    'parent',
    'name',
    'get',
    'getZoneWith',
    'fork',
    'wrap',
    'run',
    'runGuarded',
    'runTask',
    'scheduleTask',
    'scheduleMicroTask',
    'scheduleMacroTask',
    'scheduleEventTask',
    'cancelTask',
    '_updateTaskCount',
    'name',
    'properties',
    'onFork',
    'onIntercept',
    'onInvoke',
    'onHandleError',
    'onScheduleTask',
    'onInvokeTask',
    'onCancelTask',
    'onHasTask',
    '_zone',
    'runCount',
    '_zoneDelegates',
    '_state',
    'type',
    'source',
    'data',
    'scheduleFn',
    'cancelFn',
    'callback',
    'invoke'
  ];

  let result: boolean = true;
  for (let i = 0; i < expectedResult.length; i++) {
    if (expectedResult[i] !== logs[i]) {
      console.log('Not Equals', expectedResult[i], logs[i]);
      result = false;
    }
  }
  process['exit'](result ? 0 : 1);
};
process['on']('uncaughtException', (err: any) => {
  process['exit'](1);
});

testClosureFunction();
