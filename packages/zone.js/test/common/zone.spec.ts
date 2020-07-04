/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {zoneSymbol} from '../../lib/common/utils';

describe('Zone', function() {
  const rootZone = Zone.current;

  it('should have a name', function() {
    expect(Zone.current.name).toBeDefined();
  });

  describe('hooks', function() {
    it('should throw if onError is not defined', function() {
      expect(function() {
        Zone.current.run(throwError);
      }).toThrow();
    });


    it('should fire onError if a function run by a zone throws', function() {
      const errorSpy = jasmine.createSpy('error');
      const myZone = Zone.current.fork({name: 'spy', onHandleError: errorSpy});

      expect(errorSpy).not.toHaveBeenCalled();

      expect(function() {
        myZone.runGuarded(throwError);
      }).not.toThrow();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should send correct currentZone in hook method when in nested zone', function() {
      const zone = Zone.current;
      const zoneA = zone.fork({
        name: 'A',
        onInvoke: function(
            parentDelegate, currentZone, targetZone, callback, applyThis, applyArgs, source) {
          expect(currentZone.name).toEqual('A');
          return parentDelegate.invoke(targetZone, callback, applyThis, applyArgs, source);
        }
      });
      const zoneB = zoneA.fork({
        name: 'B',
        onInvoke: function(
            parentDelegate, currentZone, targetZone, callback, applyThis, applyArgs, source) {
          expect(currentZone.name).toEqual('B');
          return parentDelegate.invoke(targetZone, callback, applyThis, applyArgs, source);
        }
      });
      const zoneC = zoneB.fork({name: 'C'});
      zoneC.run(function() {});
    });

    it('should send correct currentZone in hook method when in nested zone with empty implementation',
       function() {
         const zone = Zone.current;
         const zoneA = zone.fork({
           name: 'A',
           onInvoke: function(
               parentDelegate, currentZone, targetZone, callback, applyThis, applyArgs, source) {
             expect(currentZone.name).toEqual('A');
             return parentDelegate.invoke(targetZone, callback, applyThis, applyArgs, source);
           }
         });
         const zoneB = zoneA.fork({name: 'B'});
         const zoneC = zoneB.fork({name: 'C'});
         zoneC.run(function() {});
       });
  });

  it('should allow zones to be run from within another zone', function() {
    const zone = Zone.current;
    const zoneA = zone.fork({name: 'A'});
    const zoneB = zone.fork({name: 'B'});

    zoneA.run(function() {
      zoneB.run(function() {
        expect(Zone.current).toBe(zoneB);
      });
      expect(Zone.current).toBe(zoneA);
    });
    expect(Zone.current).toBe(zone);
  });


  describe('wrap', function() {
    it('should throw if argument is not a function', function() {
      expect(function() {
        (<Function>Zone.current.wrap)(11);
      }).toThrowError('Expecting function got: 11');
    });
  });

  describe('run out side of current zone', function() {
    it('should be able to get root zone', function() {
      Zone.current.fork({name: 'testZone'}).run(function() {
        expect(Zone.root.name).toEqual('<root>');
      });
    });

    it('should be able to get run under rootZone', function() {
      Zone.current.fork({name: 'testZone'}).run(function() {
        Zone.root.run(() => {
          expect(Zone.current.name).toEqual('<root>');
        });
      });
    });

    it('should be able to get run outside of current zone', function() {
      Zone.current.fork({name: 'testZone'}).run(function() {
        Zone.root.fork({name: 'newTestZone'}).run(() => {
          expect(Zone.current.name).toEqual('newTestZone');
          expect(Zone.current.parent!.name).toEqual('<root>');
        });
      });
    });
  });

  describe('get', function() {
    it('should store properties', function() {
      const testZone = Zone.current.fork({name: 'A', properties: {key: 'value'}});
      expect(testZone.get('key')).toEqual('value');
      expect(testZone.getZoneWith('key')).toEqual(testZone);
      const childZone = testZone.fork({name: 'B', properties: {key: 'override'}});
      expect(testZone.get('key')).toEqual('value');
      expect(testZone.getZoneWith('key')).toEqual(testZone);
      expect(childZone.get('key')).toEqual('override');
      expect(childZone.getZoneWith('key')).toEqual(childZone);
    });
  });

  describe('task', () => {
    function noop() {}
    let log: any[];
    const zone: Zone = Zone.current.fork({
      name: 'parent',
      onHasTask: (delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState):
          void => {
            (hasTaskState as any)['zone'] = target.name;
            log.push(hasTaskState);
          },
      onScheduleTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task) => {
        // Do nothing to prevent tasks from being run on VM turn;
        // Tests run task explicitly.
        return task;
      }
    });

    beforeEach(() => {
      log = [];
    });

    it('task can only run in the zone of creation', () => {
      const task =
          zone.fork({name: 'createZone'}).scheduleMacroTask('test', noop, undefined, noop, noop);
      expect(() => {
        Zone.current.fork({name: 'anotherZone'}).runTask(task);
      })
          .toThrowError(
              'A task can only be run in the zone of creation! (Creation: createZone; Execution: anotherZone)');
      task.zone.cancelTask(task);
    });

    it('task can only cancel in the zone of creation', () => {
      const task =
          zone.fork({name: 'createZone'}).scheduleMacroTask('test', noop, undefined, noop, noop);
      expect(() => {
        Zone.current.fork({name: 'anotherZone'}).cancelTask(task);
      })
          .toThrowError(
              'A task can only be cancelled in the zone of creation! (Creation: createZone; Execution: anotherZone)');
      task.zone.cancelTask(task);
    });

    it('should prevent double cancellation', () => {
      const task =
          zone.scheduleMacroTask('test', () => log.push('macroTask'), undefined, noop, noop);
      zone.cancelTask(task);
      try {
        zone.cancelTask(task);
      } catch (e) {
        expect(e.message).toContain(
            'macroTask \'test\': can not transition to \'canceling\', expecting state \'scheduled\' or \'running\', was \'notScheduled\'.');
      }
    });

    it('should not decrement counters on periodic tasks', () => {
      zone.run(() => {
        const task = zone.scheduleMacroTask(
            'test', () => log.push('macroTask'), {isPeriodic: true}, noop, noop);
        zone.runTask(task);
        zone.runTask(task);
        zone.cancelTask(task);
      });
      expect(log).toEqual([
        {microTask: false, macroTask: true, eventTask: false, change: 'macroTask', zone: 'parent'},
        'macroTask', 'macroTask',
        {microTask: false, macroTask: false, eventTask: false, change: 'macroTask', zone: 'parent'}
      ]);
    });

    it('should notify of queue status change', () => {
      zone.run(() => {
        const z = Zone.current;
        z.runTask(z.scheduleMicroTask('test', () => log.push('microTask')));
        z.cancelTask(
            z.scheduleMacroTask('test', () => log.push('macroTask'), undefined, noop, noop));
        z.cancelTask(
            z.scheduleEventTask('test', () => log.push('eventTask'), undefined, noop, noop));
      });
      expect(log).toEqual([
        {microTask: true, macroTask: false, eventTask: false, change: 'microTask', zone: 'parent'},
        'microTask',
        {microTask: false, macroTask: false, eventTask: false, change: 'microTask', zone: 'parent'},
        {microTask: false, macroTask: true, eventTask: false, change: 'macroTask', zone: 'parent'},
        {microTask: false, macroTask: false, eventTask: false, change: 'macroTask', zone: 'parent'},
        {microTask: false, macroTask: false, eventTask: true, change: 'eventTask', zone: 'parent'},
        {microTask: false, macroTask: false, eventTask: false, change: 'eventTask', zone: 'parent'}
      ]);
    });

    it('should notify of queue status change on parent task', () => {
      zone.fork({name: 'child'}).run(() => {
        const z = Zone.current;
        z.runTask(z.scheduleMicroTask('test', () => log.push('microTask')));
      });
      expect(log).toEqual([
        {microTask: true, macroTask: false, eventTask: false, change: 'microTask', zone: 'child'},
        {microTask: true, macroTask: false, eventTask: false, change: 'microTask', zone: 'parent'},
        'microTask',
        {microTask: false, macroTask: false, eventTask: false, change: 'microTask', zone: 'child'},
        {microTask: false, macroTask: false, eventTask: false, change: 'microTask', zone: 'parent'},
      ]);
    });

    it('should allow rescheduling a task on a separate zone', () => {
      const log: any[] = [];
      const zone = Zone.current.fork({
        name: 'test-root',
        onHasTask:
            (delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) => {
              (hasTaskState as any)['zone'] = target.name;
              log.push(hasTaskState);
            }
      });
      const left = zone.fork({name: 'left'});
      const right = zone.fork({
        name: 'right',
        onScheduleTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task => {
          log.push(
              {pos: 'before', method: 'onScheduleTask', zone: current.name, task: task.zone.name});
          // Cancel the current scheduling of the task
          task.cancelScheduleRequest();
          // reschedule on a different zone.
          task = left.scheduleTask(task);
          log.push(
              {pos: 'after', method: 'onScheduleTask', zone: current.name, task: task.zone.name});
          return task;
        }
      });
      const rchild = right.fork({
        name: 'rchild',
        onScheduleTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task => {
          log.push(
              {pos: 'before', method: 'onScheduleTask', zone: current.name, task: task.zone.name});
          task = delegate.scheduleTask(target, task);
          log.push(
              {pos: 'after', method: 'onScheduleTask', zone: current.name, task: task.zone.name});
          expect((task as any)._zoneDelegates.map((zd: ZoneDelegate) => zd.zone.name)).toEqual([
            'left', 'test-root', 'ProxyZone'
          ]);
          return task;
        }
      });

      const task = rchild.scheduleMacroTask('testTask', () => log.push('WORK'), {}, noop, noop);
      expect(task.zone).toEqual(left);
      log.push(task.zone.name);
      task.invoke();
      expect(log).toEqual([
        {pos: 'before', method: 'onScheduleTask', zone: 'rchild', task: 'rchild'},
        {pos: 'before', method: 'onScheduleTask', zone: 'right', task: 'rchild'},
        {microTask: false, macroTask: true, eventTask: false, change: 'macroTask', zone: 'left'}, {
          microTask: false,
          macroTask: true,
          eventTask: false,
          change: 'macroTask',
          zone: 'test-root'
        },
        {pos: 'after', method: 'onScheduleTask', zone: 'right', task: 'left'},
        {pos: 'after', method: 'onScheduleTask', zone: 'rchild', task: 'left'}, 'left', 'WORK',
        {microTask: false, macroTask: false, eventTask: false, change: 'macroTask', zone: 'left'}, {
          microTask: false,
          macroTask: false,
          eventTask: false,
          change: 'macroTask',
          zone: 'test-root'
        }
      ]);
    });

    it('period task should not transit to scheduled state after being cancelled in running state',
       () => {
         const zone = Zone.current.fork({name: 'testZone'});

         const task = zone.scheduleMacroTask('testPeriodTask', () => {
           zone.cancelTask(task);
         }, {isPeriodic: true}, () => {}, () => {});

         task.invoke();
         expect(task.state).toBe('notScheduled');
       });

    it('event task should not transit to scheduled state after being cancelled in running state',
       () => {
         const zone = Zone.current.fork({name: 'testZone'});

         const task = zone.scheduleEventTask('testEventTask', () => {
           zone.cancelTask(task);
         }, undefined, () => {}, () => {});

         task.invoke();
         expect(task.state).toBe('notScheduled');
       });

    describe('assert ZoneAwarePromise', () => {
      it('should not throw when all is OK', () => {
        Zone.assertZonePatched();
      });

      xit('should throw error if ZoneAwarePromise has been overwritten', () => {
        class WrongPromise {
          static resolve(value: any) {}

          then() {}
        }

        const ZoneAwarePromise = global.Promise;
        try {
          global.Promise = WrongPromise;
          expect(Zone.assertZonePatched()).toThrow();
        } finally {
          // restore it.
          global.Promise = ZoneAwarePromise;
        }
        Zone.assertZonePatched();
      });
    });
  });

  describe('invoking tasks', () => {
    let log: string[];
    function noop() {}


    beforeEach(() => {
      log = [];
    });

    it('should not drain the microtask queue too early', () => {
      const z = Zone.current;
      const event = z.scheduleEventTask('test', () => log.push('eventTask'), undefined, noop, noop);

      z.scheduleMicroTask('test', () => log.push('microTask'));

      const macro = z.scheduleMacroTask('test', () => {
        event.invoke();
        // At this point, we should not have invoked the microtask.
        expect(log).toEqual(['eventTask']);
      }, undefined, noop, noop);

      macro.invoke();
    });

    it('should convert task to json without cyclic error', () => {
      const z = Zone.current;
      const event = z.scheduleEventTask('test', () => {}, undefined, noop, noop);
      const micro = z.scheduleMicroTask('test', () => {});
      const macro = z.scheduleMacroTask('test', () => {}, undefined, noop, noop);
      expect(function() {
        JSON.stringify(event);
      }).not.toThrow();
      expect(function() {
        JSON.stringify(micro);
      }).not.toThrow();
      expect(function() {
        JSON.stringify(macro);
      }).not.toThrow();
    });

    it('should call onHandleError callback when zoneSpec onHasTask throw error', () => {
      const spy = jasmine.createSpy('error');
      const hasTaskZone = Zone.current.fork({
        name: 'hasTask',
        onHasTask:
            (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
             hasTasState: HasTaskState) => {
              throw new Error('onHasTask Error');
            },
        onHandleError:
            (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: Error) => {
              spy(error.message);
              return delegate.handleError(targetZone, error);
            }
      });

      const microTask = hasTaskZone.scheduleMicroTask('test', () => {}, undefined, () => {});
      expect(spy).toHaveBeenCalledWith('onHasTask Error');
    });
  });
});

function throwError() {
  throw new Error();
}
