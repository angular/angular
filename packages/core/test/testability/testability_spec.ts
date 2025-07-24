/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '../../src/core';
import {Injectable} from '../../src/di';
import {
  GetTestability,
  PendingMacrotask,
  Testability,
  TestabilityRegistry,
  setTestabilityGetter,
} from '../../src/testability/testability';
import {NgZone} from '../../src/zone/ng_zone';
import {fakeAsync, tick, waitForAsync} from '../../testing';

// Schedules a microtasks (using queueMicrotask)
function microTask(fn: Function): void {
  queueMicrotask(() => {
    // We do double dispatch so that we can wait for queueMicrotask in the Testability when
    // NgZone becomes stable.
    queueMicrotask(() => fn());
  });
}

class NoopGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {}
  findTestabilityInTree(
    registry: TestabilityRegistry,
    elem: any,
    findInAncestors: boolean,
  ): Testability | null {
    return null;
  }
}

@Injectable()
class MockNgZone extends NgZone {
  /** @internal */
  override onUnstable: EventEmitter<any>;

  /** @internal */
  override onStable: EventEmitter<any>;

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

describe('Testability', () => {
  let testability: Testability;
  let execute: any;
  let execute2: any;
  let updateCallback: any;
  let ngZone: MockNgZone;

  beforeEach(waitForAsync(() => {
    ngZone = new MockNgZone();
    testability = new Testability(ngZone, new TestabilityRegistry(), new NoopGetTestability());
    execute = jasmine.createSpy('execute');
    execute2 = jasmine.createSpy('execute');
    updateCallback = jasmine.createSpy('execute');
  }));
  afterEach(() => {
    // Instantiating the Testability (via `new Testability` above) has a side
    // effect of defining the testability getter globally to a specified value.
    // This call resets that reference after each test to make sure it does not
    // get leaked between tests. In real scenarios this is not a problem, since
    // the `Testability` is created via DI and uses the same testability getter
    // (injected into a constructor) across all instances.
    setTestabilityGetter(null! as GetTestability);
  });

  describe('NgZone callback logic', () => {
    describe('whenStable with timeout', () => {
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
        ngZone.run(() => setTimeout(() => (timeout1Done = true), 500));
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
        ngZone.run(() => setTimeout(() => (timeout1Done = true), 500));
        tick();
        testability.whenStable(execute, 1000, updateCallback);

        tick(100);
        ngZone.run(() => setTimeout(() => (timeout2Done = true), 300));
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
        ngZone.run(() => setTimeout(() => (timeoutDone = true), 500));
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

    it('should fire whenstable callback with didWork if event is already finished', fakeAsync(() => {
      ngZone.unstable();
      ngZone.stable();
      testability.whenStable(execute);

      tick();
      expect(execute).toHaveBeenCalled();
      testability.whenStable(execute2);

      tick();
      expect(execute2).toHaveBeenCalled();
    }));

    it('should fire whenstable callback with didwork when event finishes', fakeAsync(() => {
      ngZone.unstable();
      testability.whenStable(execute);

      tick();
      ngZone.stable();

      tick();
      expect(execute).toHaveBeenCalled();
      testability.whenStable(execute2);

      tick();
      expect(execute2).toHaveBeenCalled();
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
    registry = new TestabilityRegistry();
    testability1 = new Testability(ngZone, registry, new NoopGetTestability());
    testability2 = new Testability(ngZone, registry, new NoopGetTestability());
  }));
  afterEach(() => {
    // Instantiating the Testability (via `new Testability` above) has a side
    // effect of defining the testability getter globally to a specified value.
    // This call resets that reference after each test to make sure it does not
    // get leaked between tests. In real scenarios this is not a problem, since
    // the `Testability` is created via DI and uses the same testability getter
    // (injected into a constructor) across all instances.
    setTestabilityGetter(null! as GetTestability);
  });
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
