import { ApplicationRef, ReflectiveInjector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { Logger } from 'app/shared/logger.service';
import { SwUpdatesService } from './sw-updates.service';

describe('SwUpdatesService', () => {
  let injector: ReflectiveInjector;
  let appRef: MockApplicationRef;
  let service: SwUpdatesService;
  let sw: MockSwUpdate;
  let checkInterval: number;

  // Helpers
  // NOTE:
  //   Because `SwUpdatesService` uses the `debounceTime` operator, it needs to be instantiated and
  //   destroyed inside the `fakeAsync` zone (when `fakeAsync` is used for the test). Thus, we can't
  //   run `setup()`/`tearDown()` in `beforeEach()`/`afterEach()` blocks. We use the `run()` helper
  //   to call them inside each test's zone.
  const setup = () => {
    injector = ReflectiveInjector.resolveAndCreate([
      { provide: ApplicationRef, useClass: MockApplicationRef },
      { provide: Logger, useClass: MockLogger },
      { provide: SwUpdate, useClass: MockSwUpdate },
      SwUpdatesService
    ]);

    appRef = injector.get(ApplicationRef);
    service = injector.get(SwUpdatesService);
    sw = injector.get(SwUpdate);
    checkInterval = (service as any).checkInterval;
  };
  const tearDown = () => service.ngOnDestroy();
  const run = (specFn: VoidFunction) => () => {
    setup();
    specFn();
    tearDown();
  };


  it('should create', run(() => {
    expect(service).toBeTruthy();
  }));

  it('should start checking for updates when instantiated (once the app stabilizes)', run(() => {
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    appRef.isStable.next(false);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    appRef.isStable.next(true);
    expect(sw.checkForUpdate).toHaveBeenCalled();
  }));

  it('should schedule a new check if there is no update available', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.checkForUpdate.calls.reset();

    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
    expect(sw.activateUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
    expect(sw.activateUpdate).not.toHaveBeenCalled();
  })));

  it('should activate new updates immediately', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.checkForUpdate.calls.reset();
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
    sw.$$availableSubj.next({available: {hash: 'bar'}});
    expect(sw.activateUpdate).toHaveBeenCalled();
  })));

    appRef.isStable.next(true);
  it('should schedule a new check after activating the update', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.checkForUpdate.calls.reset();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();

    sw.checkForUpdate.calls.reset();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
  })));

  it('should emit on `updateActivated` when an update has been activated', run(() => {
    const activatedVersions: (string|undefined)[] = [];
    service.updateActivated.subscribe(v => activatedVersions.push(v));

    sw.$$availableSubj.next({available: {hash: 'foo'}});
    sw.$$activatedSubj.next({current: {hash: 'bar'}});
    sw.$$availableSubj.next({available: {hash: 'baz'}});
    sw.$$activatedSubj.next({current: {hash: 'qux'}});

    expect(activatedVersions).toEqual(['bar', 'qux']);
  }));

  describe('when destroyed', () => {
    it('should not schedule a new check for update (after current check)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      sw.checkForUpdate.calls.reset();

      service.ngOnDestroy();
      tick(checkInterval);

      expect(sw.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should not schedule a new check for update (after activating an update)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      sw.checkForUpdate.calls.reset();

      tick(checkInterval);
      sw.checkForUpdate.calls.reset();

      sw.$$activatedSubj.next({current: {hash: 'baz'}});

      service.ngOnDestroy();
      tick(checkInterval);

      expect(sw.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should stop emitting on `updateActivated`', run(() => {
      const activatedVersions: (string|undefined)[] = [];
      service.updateActivated.subscribe(v => activatedVersions.push(v));

      sw.$$availableSubj.next({available: {hash: 'bar'}});
      sw.$$activatedSubj.next({current: {hash: 'bar'}});
      service.ngOnDestroy();
      sw.$$availableSubj.next({available: {hash: 'baz'}});
      sw.$$activatedSubj.next({current: {hash: 'baz'}});

      expect(activatedVersions).toEqual(['bar']);
    }));
  });
});

// Mocks
class MockApplicationRef {
  isStable = new Subject<boolean>();
}

class MockLogger {
  log = jasmine.createSpy('MockLogger.log');
}

class MockSwUpdate {
  $$availableSubj = new Subject<{available: {hash: string}}>();
  $$activatedSubj = new Subject<{current: {hash: string}}>();

  available = this.$$availableSubj.asObservable();
  activated = this.$$activatedSubj.asObservable();

  get isEnabled(): boolean {
    return true;
  }

  activateUpdate = jasmine.createSpy('MockSwUpdates.activateUpdate')
                          .and.callFake(() => Promise.resolve());

  checkForUpdate = jasmine.createSpy('MockSwUpdates.checkForUpdate')
                          .and.callFake(() => Promise.resolve());
}
