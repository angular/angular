/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../zone.umd.js';
const testClosureFunction = () => {
  const logs: string[] = [];
  // call all Zone exposed functions
  const testZoneSpec: ZoneSpec = {
    name: 'closure',
    properties: {},
    onFork: (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      zoneSpec: ZoneSpec,
    ) => {
      return parentZoneDelegate.fork(targetZone, zoneSpec);
    },

    onIntercept: (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      delegate: Function,
      source: string,
    ) => {
      return parentZoneDelegate.intercept(targetZone, delegate, source);
    },

    onInvoke: function (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      delegate: Function,
      applyThis?: any,
      applyArgs?: any[],
      source?: string,
    ) {
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    },

    onHandleError: function (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      error: any,
    ) {
      return parentZoneDelegate.handleError(targetZone, error);
    },

    onScheduleTask: function (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      task: Task,
    ) {
      return parentZoneDelegate.scheduleTask(targetZone, task);
    },

    onInvokeTask: function (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      task: Task,
      applyThis?: any,
      applyArgs?: any[],
    ) {
      return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
    },

    onCancelTask: function (
      parentZoneDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      task: Task,
    ) {
      return parentZoneDelegate.cancelTask(targetZone, task);
    },

    onHasTask: function (
      delegate: ZoneDelegate,
      current: Zone,
      target: Zone,
      hasTaskState: HasTaskState,
    ) {
      return delegate.hasTask(target, hasTaskState);
    },
  };

  Zone.__load_patch('test_closure_load_patch', function () {});
  Zone.__symbol__('test_symbol');

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
      const zonePrototypeKeys = [
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
      ];
      zonePrototypeKeys.forEach((key) => {
        if ((Zone as any).prototype.hasOwnProperty(key)) {
          logs.push(key);
        }
      });

      const zoneSpecKeys = [
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
      ];
      zoneSpecKeys.forEach((key) => {
        if (testZoneSpec.hasOwnProperty(key)) {
          logs.push(key);
        }
      });

      const zoneTaskKeys = [
        'onHasTask',
        'runCount',
        'type',
        'source',
        'data',
        'scheduleFn',
        'cancelFn',
        'callback',
        'invoke',
      ];

      const task = Zone.current.scheduleMicroTask(
        'testTask',
        () => {},
        undefined,
        () => {},
      );
      zoneTaskKeys.forEach((key) => {
        if (task.hasOwnProperty(key)) {
          logs.push(key);
        }
      });
    });
  });

  const expectedResult = [
    'currentclosure',
    'parent<root>',
    'getZoneWithclosure',
    'getvalue',
    'root<root>',
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
    'runCount',
    'type',
    'source',
    'data',
    'scheduleFn',
    'cancelFn',
    'callback',
    'invoke',
  ];

  let result: boolean = true;
  for (let i = 0; i < expectedResult.length; i++) {
    if (expectedResult[i] !== logs[i]) {
      console.log('Not Equals', expectedResult[i], logs[i]);
      result = false;
    }
  }
  if (result) {
    console.log('All tests passed.');
  } else {
    console.error('Test failed, some public APIs cannot be found after closure compiler.');
  }
  process['exit'](result ? 0 : 1);
};
process['on']('uncaughtException', (err: any) => {
  process['exit'](1);
});

testClosureFunction();
