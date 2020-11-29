import { ApplicationRef, Injector } from '@angular/core';
import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLocationService } from 'testing/location.service';
import { MockLogger } from 'testing/logger.service';
import { SwUpdatesService } from './sw-updates.service';


describe('SwUpdatesService', () => {
  let injector: Injector;
  let appRef: MockApplicationRef;
  let location: MockLocationService;
  let service: SwUpdatesService;
  let swu: MockSwUpdate;
  let checkInterval: number;

  // Helpers
  // NOTE:
  //   Because `SwUpdatesService` uses the `interval` operator, it needs to be instantiated and
  //   destroyed inside the `fakeAsync` zone (when `fakeAsync` is used for the test). Thus, we can't
  //   run `setup()`/`tearDown()` in `beforeEach()`/`afterEach()` blocks. We use the `run()` helper
  //   to call them inside each test's zone.
  const setup = (isSwUpdateEnabled: boolean) => {
    injector = Injector.create({providers: [
      { provide: ApplicationRef, useClass: MockApplicationRef, deps: [] },
      { provide: LocationService, useFactory: () => new MockLocationService(''), deps: [] },
      { provide: Logger, useClass: MockLogger, deps: [] },
      { provide: SwUpdate, useFactory: () => new MockSwUpdate(isSwUpdateEnabled), deps: [] },
      { provide: SwUpdatesService, deps: [ApplicationRef, LocationService, Logger, SwUpdate] }
    ]});

    appRef = injector.get(ApplicationRef) as unknown as MockApplicationRef;
    location = injector.get(LocationService) as unknown as MockLocationService;
    service = injector.get(SwUpdatesService);
    swu = injector.get(SwUpdate) as unknown as MockSwUpdate;
    checkInterval = (service as any).checkInterval;
  };
  const tearDown = () => service.ngOnDestroy();
  const run = (specFn: VoidFunction, isSwUpdateEnabled = true) => () => {
    setup(isSwUpdateEnabled);
    specFn();
    tearDown();
  };


  it('should create', run(() => {
    expect(service).toBeTruthy();
  }));

  it('should start checking for updates when instantiated (once the app stabilizes)', run(() => {
    expect(swu.checkForUpdate).not.toHaveBeenCalled();

    appRef.isStable.next(false);
    expect(swu.checkForUpdate).not.toHaveBeenCalled();

    appRef.isStable.next(true);
    expect(swu.checkForUpdate).toHaveBeenCalled();
  }));

  it('should periodically check for updates', fakeAsync(run(() => {
    appRef.isStable.next(true);
    swu.checkForUpdate.calls.reset();

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(1);

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(2);

    appRef.isStable.next(false);

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(3);

    discardPeriodicTasks();
  })));

  it('should activate available updates immediately', fakeAsync(run(() => {
    appRef.isStable.next(true);
    expect(swu.activateUpdate).not.toHaveBeenCalled();

    swu.$$availableSubj.next({available: {hash: 'foo'}});
    expect(swu.activateUpdate).toHaveBeenCalled();
  })));

  it('should keep periodically checking for updates even after one is available/activated', fakeAsync(run(() => {
    appRef.isStable.next(true);
    swu.checkForUpdate.calls.reset();

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(1);

    swu.$$availableSubj.next({available: {hash: 'foo'}});

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(2);

    tick(checkInterval);
    expect(swu.checkForUpdate).toHaveBeenCalledTimes(3);

    discardPeriodicTasks();
  })));

  it('should request a full page navigation when an update has been activated', run(() => {
    swu.$$availableSubj.next({available: {hash: 'foo'}});
    expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(0);

    swu.$$activatedSubj.next({current: {hash: 'bar'}});
    expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

    swu.$$availableSubj.next({available: {hash: 'baz'}});
    expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

    swu.$$activatedSubj.next({current: {hash: 'qux'}});
    expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(2);
  }));

  it('should request a page reload when an unrecoverable state has been detected', run(() => {
    expect(location.reloadPage).toHaveBeenCalledTimes(0);

    swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
    expect(location.reloadPage).toHaveBeenCalledTimes(1);

    swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});
    expect(location.reloadPage).toHaveBeenCalledTimes(2);
  }));

  describe('when `SwUpdate` is not enabled', () => {
    const runDeactivated = (specFn: VoidFunction) => run(specFn, false);

    it('should not check for updates', fakeAsync(runDeactivated(() => {
      appRef.isStable.next(true);

      tick(checkInterval);
      tick(checkInterval);

      swu.$$availableSubj.next({available: {hash: 'foo'}});
      swu.$$activatedSubj.next({current: {hash: 'bar'}});

      tick(checkInterval);
      tick(checkInterval);

      expect(swu.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should not activate available updates', fakeAsync(runDeactivated(() => {
      swu.$$availableSubj.next({available: {hash: 'foo'}});
      expect(swu.activateUpdate).not.toHaveBeenCalled();
    })));

    it('should never request a full page navigation', runDeactivated(() => {
      swu.$$availableSubj.next({available: {hash: 'foo'}});
      swu.$$activatedSubj.next({current: {hash: 'bar'}});
      swu.$$availableSubj.next({available: {hash: 'baz'}});
      swu.$$activatedSubj.next({current: {hash: 'qux'}});

      expect(location.fullPageNavigationNeeded).not.toHaveBeenCalled();
    }));

    it('should never request a page reload', runDeactivated(() => {
      swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
      swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});

      expect(location.reloadPage).not.toHaveBeenCalled();
    }));
  });

  describe('when destroyed', () => {
    it('should not schedule a new check for update (after current check)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      expect(swu.checkForUpdate).toHaveBeenCalled();

      service.ngOnDestroy();
      swu.checkForUpdate.calls.reset();

      tick(checkInterval);
      tick(checkInterval);

      expect(swu.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should not schedule a new check for update (after activating an update)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      expect(swu.checkForUpdate).toHaveBeenCalled();

      service.ngOnDestroy();
      swu.checkForUpdate.calls.reset();

      swu.$$availableSubj.next({available: {hash: 'foo'}});
      swu.$$activatedSubj.next({current: {hash: 'baz'}});

      tick(checkInterval);
      tick(checkInterval);

      expect(swu.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should not activate available updates', fakeAsync(run(() => {
      service.ngOnDestroy();
      swu.$$availableSubj.next({available: {hash: 'foo'}});

      expect(swu.activateUpdate).not.toHaveBeenCalled();
    })));

    it('should stop requesting full page navigations when updates are activated', run(() => {
      swu.$$availableSubj.next({available: {hash: 'foo'}});
      swu.$$activatedSubj.next({current: {hash: 'bar'}});
      expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

      service.ngOnDestroy();
      location.fullPageNavigationNeeded.calls.reset();

      swu.$$availableSubj.next({available: {hash: 'baz'}});
      swu.$$activatedSubj.next({current: {hash: 'qux'}});
      expect(location.fullPageNavigationNeeded).not.toHaveBeenCalled();
    }));

    it('should stop requesting page reloads when unrecoverable states are detected', run(() => {
      swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
      expect(location.reloadPage).toHaveBeenCalledTimes(1);

      service.ngOnDestroy();
      location.reloadPage.calls.reset();

      swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});
      expect(location.reloadPage).not.toHaveBeenCalled();
    }));
  });
});

// Mocks
class MockApplicationRef {
  isStable = new Subject<boolean>();
}

class MockSwUpdate {
  $$availableSubj = new Subject<{available: {hash: string}}>();
  $$activatedSubj = new Subject<{current: {hash: string}}>();
  $$unrecoverableSubj = new Subject<{reason: string}>();

  available = this.$$availableSubj.asObservable();
  activated = this.$$activatedSubj.asObservable();
  unrecoverable = this.$$unrecoverableSubj.asObservable();

  activateUpdate = jasmine.createSpy('MockSwUpdate.activateUpdate')
                          .and.callFake(() => Promise.resolve());

  checkForUpdate = jasmine.createSpy('MockSwUpdate.checkForUpdate')
                          .and.callFake(() => Promise.resolve());

  constructor(public isEnabled: boolean) {}
}
