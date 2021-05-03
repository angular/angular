/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';
import {Injectable} from '@angular/core/src/di';
import {PendingMacrotask, Testability, TestabilityRegistry} from '@angular/core/src/testability/testability';
import {NgZone} from '@angular/core/src/zone/ng_zone';
import {fakeAsync, flush, tick, waitForAsync} from '@angular/core/testing';
import {beforeEach, describe, expect, it, SpyObject} from '@angular/core/testing/src/testing_internal';

import {scheduleMicroTask} from '../../src/util/microtask';

// Schedules a microtasks (using a resolved promise .then())
function microTask(fn: Function): void {
  scheduleMicroTask(() => {
    // We do double dispatch so that we  can wait for scheduleMicrotask in the Testability when
    // NgZone becomes stable.
    scheduleMicroTask(fn);
  });
}

@Injectable()
class MockNgZone extends NgZone {
  /** @internal */
  onUnstable: EventEmitter<any>;

  /** @internal */
  onStable: EventEmitter<any>;

  constructor() {
    super({enableLongStackTrace: false});
    this.onUnstable = new EventEmitter(false);
    this.onStable = new EventEmitter(false);
  }

  unstable(): void {
    this.onUnstable.emit(null);
  }

  stable(): void {
    this.onStable.emit(null);
  }
}

{
  describe('Testability', () => {
    let testability: Testability;
    let execute: any;
    let execute2: any;
    let updateCallback: any;
    let ngZone: MockNgZone;

    beforeEach(waitForAsync(() => {
      ngZone = new MockNgZone();
      testability = new Testability(ngZone);
      execute = new SpyObject().spy('execute');
      execute2 = new SpyObject().spy('execute');
      updateCallback = new SpyObject().spy('execute');
    }));

    describe('Pending count logic', () => {
      it('should start with a pending count of 0', () => {
        expect(testability.getPendingRequestCount()).toEqual(0);
      });

      it('should fire whenstable callbacks if pending count is 0', waitForAsync(() => {
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).toHaveBeenCalled();
           });
         }));

      it('should not fire whenstable callbacks synchronously if pending count is 0', () => {
        testability.whenStable(execute);
        expect(execute).not.toHaveBeenCalled();
      });

      it('should not call whenstable callbacks when there are pending counts', waitForAsync(() => {
           testability.increasePendingRequestCount();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             testability.decreasePendingRequestCount();

             microTask(() => {
               expect(execute).not.toHaveBeenCalled();
             });
           });
         }));

      it('should fire whenstable callbacks when pending drops to 0', waitForAsync(() => {
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             testability.decreasePendingRequestCount();

             microTask(() => {
               expect(execute).toHaveBeenCalled();
             });
           });
         }));

      it('should not fire whenstable callbacks synchronously when pending drops to 0',
         waitForAsync(() => {
           testability.increasePendingRequestCount();
           testability.whenStable(execute);
           testability.decreasePendingRequestCount();

           expect(execute).not.toHaveBeenCalled();
         }));

      it('should fire whenstable callbacks with didWork if pending count is 0', waitForAsync(() => {
           microTask(() => {
             testability.whenStable(execute);

             microTask(() => {
               expect(execute).toHaveBeenCalledWith(false);
             });
           });
         }));

      it('should fire whenstable callbacks with didWork when pending drops to 0',
         waitForAsync(() => {
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           testability.decreasePendingRequestCount();

           microTask(() => {
             expect(execute).toHaveBeenCalledWith(true);
             testability.whenStable(execute2);

             microTask(() => {
               expect(execute2).toHaveBeenCalledWith(false);
             });
           });
         }));
    });

    describe('NgZone callback logic', () => {
      describe('whenStable with timeout', () => {
        it('should list pending tasks when the timeout is hit', fakeAsync(() => {
             const id = ngZone.run(() => setTimeout(() => {}, 1000));
             testability.whenStable(execute, 200);

             expect(execute).not.toHaveBeenCalled();
             tick(200);
             expect(execute).toHaveBeenCalled();
             const tasks = execute.calls.mostRecent().args[1] as PendingMacrotask[];

             expect(tasks.length).toEqual(1);
             expect(tasks[0].data).toBeTruthy();
             expect(tasks[0].data!.delay).toEqual(1000);
             expect(tasks[0].source).toEqual('setTimeout');
             expect(tasks[0].data!.isPeriodic).toEqual(false);

             clearTimeout(id);
           }));

        it('should fire if Angular is already stable', waitForAsync(() => {
             testability.whenStable(execute, 200);

             microTask(() => {
               expect(execute).toHaveBeenCalled();
             });
           }));

        it('should fire when macroTasks are cancelled', fakeAsync(() => {
             const id = ngZone.run(() => setTimeout(() => {}, 1000));
             testability.whenStable(execute, 500);

             tick(200);
             ngZone.run(() => clearTimeout(id));
             // fakeAsync doesn't trigger NgZones whenStable
             ngZone.stable();

             tick(1);
             expect(execute).toHaveBeenCalled();
           }));

        it('calls the done callback when angular is stable', fakeAsync(() => {
             let timeout1Done = false;
             ngZone.run(() => setTimeout(() => timeout1Done = true, 500));
             testability.whenStable(execute, 1000);

             tick(600);
             ngZone.stable();
             tick();

             expect(timeout1Done).toEqual(true);
             expect(execute).toHaveBeenCalled();

             // Should cancel the done timeout.
             tick(500);
             ngZone.stable();
             tick();
             expect(execute.calls.count()).toEqual(1);
           }));


        it('calls update when macro tasks change', fakeAsync(() => {
             let timeout1Done = false;
             let timeout2Done = false;
             ngZone.run(() => setTimeout(() => timeout1Done = true, 500));
             tick();
             testability.whenStable(execute, 1000, updateCallback);

             tick(100);
             ngZone.run(() => setTimeout(() => timeout2Done = true, 300));
             expect(updateCallback.calls.count()).toEqual(1);
             tick(600);

             expect(timeout1Done).toEqual(true);
             expect(timeout2Done).toEqual(true);
             expect(updateCallback.calls.count()).toEqual(3);
             expect(execute).toHaveBeenCalled();

             const update1 = updateCallback.calls.all()[0].args[0] as PendingMacrotask[];
             expect(update1[0].data!.delay).toEqual(500);

             const update2 = updateCallback.calls.all()[1].args[0] as PendingMacrotask[];
             expect(update2[0].data!.delay).toEqual(500);
             expect(update2[1].data!.delay).toEqual(300);
           }));

        it('cancels the done callback if the update callback returns true', fakeAsync(() => {
             let timeoutDone = false;
             ngZone.unstable();
             execute2.and.returnValue(true);
             testability.whenStable(execute, 1000, execute2);

             tick(100);
             ngZone.run(() => setTimeout(() => timeoutDone = true, 500));
             ngZone.stable();
             expect(execute2).toHaveBeenCalled();

             tick(500);
             ngZone.stable();
             tick();

             expect(execute).not.toHaveBeenCalled();
           }));
      });

      it('should fire whenstable callback if event is already finished', fakeAsync(() => {
           ngZone.unstable();
           ngZone.stable();
           testability.whenStable(execute);

           tick();
           expect(execute).toHaveBeenCalled();
         }));

      it('should not fire whenstable callbacks synchronously if event is already finished', () => {
        ngZone.unstable();
        ngZone.stable();
        testability.whenStable(execute);

        expect(execute).not.toHaveBeenCalled();
      });

      it('should fire whenstable callback when event finishes', fakeAsync(() => {
           ngZone.unstable();
           testability.whenStable(execute);

           tick();
           expect(execute).not.toHaveBeenCalled();
           ngZone.stable();

           tick();
           expect(execute).toHaveBeenCalled();
         }));

      it('should not fire whenstable callbacks synchronously when event finishes', () => {
        ngZone.unstable();
        testability.whenStable(execute);
        ngZone.stable();

        expect(execute).not.toHaveBeenCalled();
      });

      it('should not fire whenstable callback when event did not finish', fakeAsync(() => {
           ngZone.unstable();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           tick();
           expect(execute).not.toHaveBeenCalled();
           testability.decreasePendingRequestCount();

           tick();
           expect(execute).not.toHaveBeenCalled();
           ngZone.stable();

           tick();
           expect(execute).toHaveBeenCalled();
         }));

      it('should not fire whenstable callback when there are pending counts', fakeAsync(() => {
           ngZone.unstable();
           testability.increasePendingRequestCount();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           tick();
           expect(execute).not.toHaveBeenCalled();
           ngZone.stable();

           tick();
           expect(execute).not.toHaveBeenCalled();
           testability.decreasePendingRequestCount();

           tick();
           expect(execute).not.toHaveBeenCalled();
           testability.decreasePendingRequestCount();

           tick();
           expect(execute).toHaveBeenCalled();
         }));

      it('should fire whenstable callback with didWork if event is already finished',
         fakeAsync(() => {
           ngZone.unstable();
           ngZone.stable();
           testability.whenStable(execute);

           tick();
           expect(execute).toHaveBeenCalledWith(true);
           testability.whenStable(execute2);

           tick();
           expect(execute2).toHaveBeenCalledWith(false);
         }));

      it('should fire whenstable callback with didwork when event finishes', fakeAsync(() => {
           ngZone.unstable();
           testability.whenStable(execute);

           tick();
           ngZone.stable();

           tick();
           expect(execute).toHaveBeenCalledWith(true);
           testability.whenStable(execute2);

           tick();
           expect(execute2).toHaveBeenCalledWith(false);
         }));
    });
  });

  describe('TestabilityRegistry', () => {
    let testability1: Testability;
    let testability2: Testability;
    let registry: TestabilityRegistry;
    let ngZone: MockNgZone;

    beforeEach(waitForAsync(() => {
      ngZone = new MockNgZone();
      testability1 = new Testability(ngZone);
      testability2 = new Testability(ngZone);
      registry = new TestabilityRegistry();
    }));
    describe('unregister testability', () => {
      it('should remove the testability when unregistering an existing testability', () => {
        registry.registerApplication('testability1', testability1);
        registry.registerApplication('testability2', testability2);
        registry.unregisterApplication('testability2');
        expect(registry.getAllTestabilities().length).toEqual(1);
        expect(registry.getTestability('testability1')).toEqual(testability1);
      });

      it('should remain the same when unregistering a non-existing testability', () => {
        expect(registry.getAllTestabilities().length).toEqual(0);
        registry.registerApplication('testability1', testability1);
        registry.registerApplication('testability2', testability2);
        registry.unregisterApplication('testability3');
        expect(registry.getAllTestabilities().length).toEqual(2);
        expect(registry.getTestability('testability1')).toEqual(testability1);
        expect(registry.getTestability('testability2')).toEqual(testability2);
      });

      it('should remove all the testability when unregistering all testabilities', () => {
        registry.registerApplication('testability1', testability1);
        registry.registerApplication('testability2', testability2);
        registry.unregisterAllApplications();
        expect(registry.getAllTestabilities().length).toEqual(0);
      });
    });
  });
}
