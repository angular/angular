/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const noop = function() {};
let log: {zone: string, taskZone: undefined|string, toState: TaskState, fromState: TaskState}[] =
    [];
const detectTask = Zone.current.scheduleMacroTask('detectTask', noop, undefined, noop, noop);
const originalTransitionTo = detectTask.constructor.prototype._transitionTo;
// patch _transitionTo of ZoneTask to add log for test
const logTransitionTo: Function = function(
    this: Task&{_state: TaskState}, toState: TaskState, fromState1: TaskState,
    fromState2?: TaskState) {
  log.push({
    zone: Zone.current.name,
    taskZone: this.zone && this.zone.name,
    toState: toState,
    fromState: this._state
  });
  originalTransitionTo.apply(this, arguments);
};

function testFnWithLoggedTransitionTo(testFn: Function) {
  return function(this: unknown) {
    detectTask.constructor.prototype._transitionTo = logTransitionTo;
    testFn.apply(this, arguments);
    detectTask.constructor.prototype._transitionTo = originalTransitionTo;
  };
}

describe('task lifecycle', () => {
  describe('event task lifecycle', () => {
    beforeEach(() => {
      log = [];
    });

    it('task should transit from notScheduled to scheduling then to scheduled state when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduling to unknown when zoneSpec onScheduleTask callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testEventTaskZone',
               onScheduleTask: (delegate, currZone, targetZone, task) => {
                 throw Error('error in onScheduleTask');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'unknown', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduled to running when task is invoked then from running to scheduled after invoke',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'scheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from scheduled to canceling then from canceling to notScheduled when task is canceled before running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
           Zone.current.cancelTask(task);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to canceling then from canceling to notScheduled when task is canceled in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task = Zone.current.scheduleEventTask('testEventTask', () => {
             Zone.current.cancelTask(task);
           }, undefined, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'canceling', fromState: 'running'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to scheduled when task.callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task = Zone.current.scheduleEventTask('testEventTask', () => {
             throw Error('invoke error');
           }, undefined, noop, noop);
           try {
             task.invoke();
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'scheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error before task running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testEventTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from notScheduled to scheduled if zoneSpec.onHasTask throw error when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testEventTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 throw Error('hasTask Error');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit to notScheduled state if zoneSpec.onHasTask throw error when task is canceled',
       testFnWithLoggedTransitionTo(() => {
         let task: Task;
         Zone.current
             .fork({
               name: 'testEventTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 if (task && task.state === 'canceling') {
                   throw Error('hasTask Error');
                 }
               }
             })
             .run(() => {
               try {
                 task =
                     Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
                 Zone.current.cancelTask(task);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));
  });

  describe('non periodical macroTask lifecycle', () => {
    beforeEach(() => {
      log = [];
    });

    it('task should transit from notScheduled to scheduling then to scheduled state when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduling to unknown when zoneSpec onScheduleTask callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testMacroTaskZone',
               onScheduleTask: (delegate, currZone, targetZone, task) => {
                 throw Error('error in onScheduleTask');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'unknown', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduled to running when task is invoked then from running to noScheduled after invoke',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from scheduled to canceling then from canceling to notScheduled when task is canceled before running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleMacroTask('testMacrotask', noop, undefined, noop, noop);
           Zone.current.cancelTask(task);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to canceling then from canceling to notScheduled when task is canceled in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task = Zone.current.scheduleMacroTask('testMacroTask', () => {
             Zone.current.cancelTask(task);
           }, undefined, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'canceling', fromState: 'running'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to noScheduled when task.callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task = Zone.current.scheduleMacroTask('testMacroTask', () => {
             throw Error('invoke error');
           }, undefined, noop, noop);
           try {
             task.invoke();
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error before task running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMacroTaskZone'}).run(() => {
           const task =
               Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from notScheduled to scheduling then to scheduled if zoneSpec.onHasTask throw error when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testMacroTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 throw Error('hasTask Error');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit to notScheduled state if zoneSpec.onHasTask throw error after task.callback being invoked',
       testFnWithLoggedTransitionTo(() => {
         let task: Task;
         Zone.current
             .fork({
               name: 'testMacroTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 if (task && task.state === 'running') {
                   throw Error('hasTask Error');
                 }
               }
             })
             .run(() => {
               try {
                 task =
                     Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
                 task.invoke();
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit to notScheduled state if zoneSpec.onHasTask throw error when task is canceled before running',
       testFnWithLoggedTransitionTo(() => {
         let task: Task;
         Zone.current
             .fork({
               name: 'testMacroTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 if (task && task.state === 'canceling') {
                   throw Error('hasTask Error');
                 }
               }
             })
             .run(() => {
               try {
                 task =
                     Zone.current.scheduleMacroTask('testMacroTask', noop, undefined, noop, noop);
                 Zone.current.cancelTask(task);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));
  });

  describe('periodical macroTask lifecycle', () => {
    let task: Task|null;
    beforeEach(() => {
      log = [];
      task = null;
    });
    afterEach(() => {
      task && task.state !== 'notScheduled' && task.state !== 'canceling' &&
          task.state !== 'unknown' && task.zone.cancelTask(task);
    });

    it('task should transit from notScheduled to scheduling then to scheduled state when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask(
               'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduling to unknown when zoneSpec onScheduleTask callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testPeriodicalTaskZone',
               onScheduleTask: (delegate, currZone, targetZone, task) => {
                 throw Error('error in onScheduleTask');
               }
             })
             .run(() => {
               try {
                 task = Zone.current.scheduleMacroTask(
                     'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'unknown', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduled to running when task is invoked then from running to scheduled after invoke',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask(
               'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'scheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from scheduled to canceling then from canceling to notScheduled when task is canceled before running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask(
               'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
           Zone.current.cancelTask(task);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to canceling then from canceling to notScheduled when task is canceled in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask('testPeriodicalTask', () => {
             Zone.current.cancelTask(task!);
           }, {isPeriodic: true}, noop, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'canceling', fromState: 'running'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from running to scheduled when task.callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask('testPeriodicalTask', () => {
             throw Error('invoke error');
           }, {isPeriodic: true}, noop, noop);
           try {
             task.invoke();
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'scheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error before task running',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask(
               'testPeriodicalTask', noop, {isPeriodic: true}, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from canceling to unknown when zoneSpec.onCancelTask throw error in running state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testPeriodicalTaskZone'}).run(() => {
           task = Zone.current.scheduleMacroTask(
               'testPeriodicalTask', noop, {isPeriodic: true}, noop, () => {
                 throw Error('cancel task');
               });
           try {
             Zone.current.cancelTask(task);
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'unknown', fromState: 'canceling'}
             ]);
       }));

    it('task should transit from notScheduled to scheduled if zoneSpec.onHasTask throw error when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testPeriodicalTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 throw Error('hasTask Error');
               }
             })
             .run(() => {
               try {
                 task = Zone.current.scheduleMacroTask(
                     'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit to notScheduled state if zoneSpec.onHasTask throw error when task is canceled',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testPeriodicalTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 if (task && task.state === 'canceling') {
                   throw Error('hasTask Error');
                 }
               }
             })
             .run(() => {
               try {
                 task = Zone.current.scheduleMacroTask(
                     'testPeriodicalTask', noop, {isPeriodic: true}, noop, noop);
                 Zone.current.cancelTask(task);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));
  });

  describe('microTask lifecycle', () => {
    beforeEach(() => {
      log = [];
    });

    it('task should transit from notScheduled to scheduling then to scheduled state when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMicroTaskZone'}).run(() => {
           Zone.current.scheduleMicroTask('testMicroTask', noop, undefined, noop);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduling to unknown when zoneSpec onScheduleTask callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testMicroTaskZone',
               onScheduleTask: (delegate, currZone, targetZone, task) => {
                 throw Error('error in onScheduleTask');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleMicroTask('testMicroTask', noop, undefined, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'unknown', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit from scheduled to running when task is invoked then from running to noScheduled after invoke',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMicroTaskZone'}).run(() => {
           const task = Zone.current.scheduleMicroTask('testMicroTask', noop, undefined, noop);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('should throw error when try to cancel a microTask', testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMicroTaskZone'}).run(() => {
           const task = Zone.current.scheduleMicroTask('testMicroTask', () => {}, undefined, noop);
           expect(() => {
             Zone.current.cancelTask(task);
           }).toThrowError('Task is not cancelable');
         });
       }));

    it('task should transit from running to notScheduled when task.callback throw error',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testMicroTaskZone'}).run(() => {
           const task = Zone.current.scheduleMicroTask('testMicroTask', () => {
             throw Error('invoke error');
           }, undefined, noop);
           try {
             task.invoke();
           } catch (err) {
           }
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('task should transit from notScheduled to scheduling then to scheduled if zoneSpec.onHasTask throw error when scheduleTask',
       testFnWithLoggedTransitionTo(() => {
         Zone.current
             .fork({
               name: 'testMicroTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 throw Error('hasTask Error');
               }
             })
             .run(() => {
               try {
                 Zone.current.scheduleMicroTask('testMicroTask', noop, undefined, noop);
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'}
             ]);
       }));

    it('task should transit to notScheduled state if zoneSpec.onHasTask throw error after task.callback being invoked',
       testFnWithLoggedTransitionTo(() => {
         let task: Task;
         Zone.current
             .fork({
               name: 'testMicroTaskZone',
               onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
                 if (task && task.state === 'running') {
                   throw Error('hasTask Error');
                 }
               }
             })
             .run(() => {
               try {
                 task = Zone.current.scheduleMicroTask('testMicroTask', noop, undefined, noop);
                 task.invoke();
               } catch (err) {
               }
             });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'running', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'running'}
             ]);
       }));

    it('task should not run if task transite to notScheduled state which was canceled',
       testFnWithLoggedTransitionTo(() => {
         let task: Task;
         Zone.current.fork({name: 'testCancelZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
           Zone.current.cancelTask(task);
           task.invoke();
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       }));
  });

  // Test specific to https://github.com/angular/angular/issues/45711
  it('should not throw an error when the task has been canceled previously and is attemped to be canceled again',
     () => {
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'testCancelZone'}).run(() => {
           const task =
               Zone.current.scheduleEventTask('testEventTask', noop, undefined, noop, noop);
           Zone.current.cancelTask(task);
           Zone.current.cancelTask(task);
         });
         expect(log.map(item => {
           return {toState: item.toState, fromState: item.fromState};
         }))
             .toEqual([
               {toState: 'scheduling', fromState: 'notScheduled'},
               {toState: 'scheduled', fromState: 'scheduling'},
               {toState: 'canceling', fromState: 'scheduled'},
               {toState: 'notScheduled', fromState: 'canceling'}
             ]);
       });
     });

  describe('reschedule zone', () => {
    let callbackLogs: ({pos: string, method: string, zone: string, task: string}|HasTaskState)[];
    const newZone = Zone.root.fork({
      name: 'new',
      onScheduleTask: (delegate, currZone, targetZone, task) => {
        callbackLogs.push(
            {pos: 'before', method: 'onScheduleTask', zone: currZone.name, task: task.zone.name});
        return delegate.scheduleTask(targetZone, task);
      },
      onInvokeTask: (delegate, currZone, targetZone, task, applyThis, applyArgs) => {
        callbackLogs.push(
            {pos: 'before', method: 'onInvokeTask', zone: currZone.name, task: task.zone.name});
        return delegate.invokeTask(targetZone, task, applyThis, applyArgs);
      },
      onCancelTask: (delegate, currZone, targetZone, task) => {
        callbackLogs.push(
            {pos: 'before', method: 'onCancelTask', zone: currZone.name, task: task.zone.name});
        return delegate.cancelTask(targetZone, task);
      },
      onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
        (hasTaskState as any)['zone'] = targetZone.name;
        callbackLogs.push(hasTaskState);
        return delegate.hasTask(targetZone, hasTaskState);
      }
    });
    const zone = Zone.root.fork({
      name: 'original',
      onScheduleTask: (delegate, currZone, targetZone, task) => {
        callbackLogs.push(
            {pos: 'before', method: 'onScheduleTask', zone: currZone.name, task: task.zone.name});
        task.cancelScheduleRequest();
        task = newZone.scheduleTask(task);
        callbackLogs.push(
            {pos: 'after', method: 'onScheduleTask', zone: currZone.name, task: task.zone.name});
        return task;
      },
      onInvokeTask: (delegate, currZone, targetZone, task, applyThis, applyArgs) => {
        callbackLogs.push(
            {pos: 'before', method: 'onInvokeTask', zone: currZone.name, task: task.zone.name});
        return delegate.invokeTask(targetZone, task, applyThis, applyArgs);
      },
      onCancelTask: (delegate, currZone, targetZone, task) => {
        callbackLogs.push(
            {pos: 'before', method: 'onCancelTask', zone: currZone.name, task: task.zone.name});
        return delegate.cancelTask(targetZone, task);
      },
      onHasTask: (delegate, currZone, targetZone, hasTaskState) => {
        (<any>hasTaskState)['zone'] = targetZone.name;
        callbackLogs.push(hasTaskState);
        return delegate.hasTask(targetZone, hasTaskState);
      }
    });

    beforeEach(() => {
      callbackLogs = [];
    });

    it('should be able to reschedule zone when in scheduling state, after that, task will completely go to new zone, has nothing to do with original one',
       testFnWithLoggedTransitionTo(() => {
         zone.run(() => {
           const t = Zone.current.scheduleMacroTask(
               'testRescheduleZoneTask', noop, undefined, noop, noop);
           t.invoke();
         });

         expect(callbackLogs).toEqual([
           {pos: 'before', method: 'onScheduleTask', zone: 'original', task: 'original'},
           {pos: 'before', method: 'onScheduleTask', zone: 'new', task: 'new'},
           {microTask: false, macroTask: true, eventTask: false, change: 'macroTask', zone: 'new'},
           {pos: 'after', method: 'onScheduleTask', zone: 'original', task: 'new'},
           {pos: 'before', method: 'onInvokeTask', zone: 'new', task: 'new'},
           {microTask: false, macroTask: false, eventTask: false, change: 'macroTask', zone: 'new'}
         ]);
       }));

    it('should not be able to reschedule task in notScheduled / running / canceling state',
       testFnWithLoggedTransitionTo(() => {
         Zone.current.fork({name: 'rescheduleNotScheduled'}).run(() => {
           const t = Zone.current.scheduleMacroTask(
               'testRescheduleZoneTask', noop, undefined, noop, noop);
           Zone.current.cancelTask(t);
           expect(() => {
             t.cancelScheduleRequest();
           })
               .toThrow(Error(
                   `macroTask 'testRescheduleZoneTask': can not transition to ` +
                   `'notScheduled', expecting state 'scheduling', was 'notScheduled'.`));
         });

         Zone.current
             .fork({
               name: 'rescheduleRunning',
               onInvokeTask: (delegate, currZone, targetZone, task, applyThis, applyArgs) => {
                 expect(() => {
                   task.cancelScheduleRequest();
                 })
                     .toThrow(Error(
                         `macroTask 'testRescheduleZoneTask': can not transition to ` +
                         `'notScheduled', expecting state 'scheduling', was 'running'.`));
               }
             })
             .run(() => {
               const t = Zone.current.scheduleMacroTask(
                   'testRescheduleZoneTask', noop, undefined, noop, noop);
               t.invoke();
             });

         Zone.current
             .fork({
               name: 'rescheduleCanceling',
               onCancelTask: (delegate, currZone, targetZone, task) => {
                 expect(() => {
                   task.cancelScheduleRequest();
                 })
                     .toThrow(Error(
                         `macroTask 'testRescheduleZoneTask': can not transition to ` +
                         `'notScheduled', expecting state 'scheduling', was 'canceling'.`));
               }
             })
             .run(() => {
               const t = Zone.current.scheduleMacroTask(
                   'testRescheduleZoneTask', noop, undefined, noop, noop);
               Zone.current.cancelTask(t);
             });
       }));

    it('can not reschedule a task to a zone which is the descendants of the original zone',
       testFnWithLoggedTransitionTo(() => {
         const originalZone = Zone.root.fork({
           name: 'originalZone',
           onScheduleTask: (delegate, currZone, targetZone, task) => {
             callbackLogs.push({
               pos: 'before',
               method: 'onScheduleTask',
               zone: currZone.name,
               task: task.zone.name
             });
             task.cancelScheduleRequest();
             task = rescheduleZone.scheduleTask(task);
             callbackLogs.push({
               pos: 'after',
               method: 'onScheduleTask',
               zone: currZone.name,
               task: task.zone.name
             });
             return task;
           }
         });
         const rescheduleZone = originalZone.fork({name: 'rescheduleZone'});
         expect(() => {
           originalZone.run(() => {
             Zone.current.scheduleMacroTask('testRescheduleZoneTask', noop, undefined, noop, noop);
           });
         })
             .toThrowError(
                 'can not reschedule task to rescheduleZone which is descendants of the original zone originalZone');
       }));
  });
});
