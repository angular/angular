import { ApplicationRef, ErrorHandler, Injector } from '@angular/core';
import { discardFakeTimePeriodicTasks, fakeTime, tickClock } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subject } from 'rxjs';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLocationService } from 'testing/location.service';
import { MockLogger } from 'testing/logger.service';
import { SwUpdatesService } from './sw-updates.service';


describe('SwUpdatesService', () => {
  let injector: Injector;
  let appRef: MockApplicationRef;
  let errorHandler: ErrorHandler;
  let location: MockLocationService;
  let service: SwUpdatesService;
  let swu: MockSwUpdate;
  let checkInterval: number;

  // Helpers
  // NOTE:
  //   Because `SwUpdatesService` uses the `interval` operator, it needs to be instantiated and
  //   destroyed inside the `fakeTime` zone (when `fakeTime` is used for the test). Thus, we can't
  //   run `setup()`/`tearDown()` in `beforeEach()`/`afterEach()` blocks. We use the `run()` helper
  //   to call them inside each test's zone.
  const setup = (isSwUpdateEnabled: boolean) => {
    injector = Injector.create({providers: [
      { provide: ApplicationRef, useClass: MockApplicationRef, deps: [] },
      { provide: ErrorHandler, useValue: {handleError: jasmine.createSpy('handlerError')} },
      { provide: LocationService, useFactory: () => new MockLocationService(''), deps: [] },
      { provide: Logger, useClass: MockLogger, deps: [] },
      { provide: SwUpdate, useFactory: () => new MockSwUpdate(isSwUpdateEnabled), deps: [] },
      { provide: SwUpdatesService, deps: [ApplicationRef, ErrorHandler, LocationService, Logger, SwUpdate] }
    ]});

    appRef = injector.get(ApplicationRef) as unknown as MockApplicationRef;
    errorHandler = injector.get(ErrorHandler);
    location = injector.get(LocationService) as unknown as MockLocationService;
    service = injector.get(SwUpdatesService);
    swu = injector.get(SwUpdate) as unknown as MockSwUpdate;
    checkInterval = (service as any).checkInterval;

    service.enable();
  };
  const tearDown = () => service.ngOnDestroy();
  const run = (specFn: () => Promise<void>, isSwUpdateEnabled = true) => async () => {
    setup(isSwUpdateEnabled);
    try {
      return await specFn();
    } finally {
      tearDown();
    }
  };


  it('should create', run(async () => {
    expect(service).toBeTruthy();
  }));

  describe('when enabled', () => {
    it('should start checking for updates when instantiated (once the app stabilizes)', run(async () => {
      expect(swu.checkForUpdate).not.toHaveBeenCalled();

      appRef.isStable.next(false);
      expect(swu.checkForUpdate).not.toHaveBeenCalled();

      appRef.isStable.next(true);
      expect(swu.checkForUpdate).toHaveBeenCalled();
    }));

    it('should periodically check for updates', fakeTime(run(async () => {
      appRef.isStable.next(true);
      swu.checkForUpdate.calls.reset();

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(1);

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(2);

      appRef.isStable.next(false);

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(3);

      discardFakeTimePeriodicTasks();
    })));

    it('should activate available updates immediately', fakeTime(run(async () => {
      appRef.isStable.next(true);
      expect(swu.activateUpdate).not.toHaveBeenCalled();

      swu.$$availableSubj.next({available: {hash: 'foo'}});
      expect(swu.activateUpdate).toHaveBeenCalled();
    })));

    it('should keep periodically checking for updates even after one is available/activated', fakeTime(run(async () => {
      appRef.isStable.next(true);
      swu.checkForUpdate.calls.reset();

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(1);

      swu.$$availableSubj.next({available: {hash: 'foo'}});

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(2);

      await tickClock(checkInterval);
      expect(swu.checkForUpdate).toHaveBeenCalledTimes(3);

      discardFakeTimePeriodicTasks();
    })));

    it('should request a full page navigation when an update has been activated', run(async () => {
      swu.$$availableSubj.next({available: {hash: 'foo'}});
      expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(0);

      swu.$$activatedSubj.next({current: {hash: 'bar'}});
      expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

      swu.$$availableSubj.next({available: {hash: 'baz'}});
      expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

      swu.$$activatedSubj.next({current: {hash: 'qux'}});
      expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(2);
    }));

    it('should request a page reload when an unrecoverable state has been detected', run(async () => {
      expect(location.reloadPage).toHaveBeenCalledTimes(0);

      swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
      expect(location.reloadPage).toHaveBeenCalledTimes(1);

      swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});
      expect(location.reloadPage).toHaveBeenCalledTimes(2);
    }));

    it('should notify the `ErrorHandler` when an unrecoverable state has been detected', run(async () => {
      expect(errorHandler.handleError).not.toHaveBeenCalled();

      swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
      expect(errorHandler.handleError).toHaveBeenCalledBefore(location.reloadPage);
      expect(errorHandler.handleError)
          .toHaveBeenCalledWith('Unrecoverable state: Something bad happened');

      (errorHandler.handleError as jasmine.Spy).calls.reset();
      location.reloadPage.calls.reset();

      swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});
      expect(errorHandler.handleError).toHaveBeenCalledBefore(location.reloadPage);
      expect(errorHandler.handleError)
          .toHaveBeenCalledWith('Unrecoverable state: Something worse happened');

    }));

    describe('when `SwUpdate` is not enabled', () => {
      const runDeactivated = (specFn: () => Promise<void>) => run(specFn, false);

      it('should not check for updates', fakeTime(runDeactivated(async () => {
        appRef.isStable.next(true);

        await tickClock(checkInterval);
        await tickClock(checkInterval);

        swu.$$availableSubj.next({available: {hash: 'foo'}});
        swu.$$activatedSubj.next({current: {hash: 'bar'}});

        await tickClock(checkInterval);
        await tickClock(checkInterval);

        expect(swu.checkForUpdate).not.toHaveBeenCalled();
      })));

      it('should not activate available updates', fakeTime(runDeactivated(async () => {
        swu.$$availableSubj.next({available: {hash: 'foo'}});
        expect(swu.activateUpdate).not.toHaveBeenCalled();
      })));

      it('should never request a full page navigation', runDeactivated(async () => {
        swu.$$availableSubj.next({available: {hash: 'foo'}});
        swu.$$activatedSubj.next({current: {hash: 'bar'}});
        swu.$$availableSubj.next({available: {hash: 'baz'}});
        swu.$$activatedSubj.next({current: {hash: 'qux'}});

        expect(location.fullPageNavigationNeeded).not.toHaveBeenCalled();
      }));

      it('should never request a page reload', runDeactivated(async () => {
        swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
        swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});

        expect(errorHandler.handleError).not.toHaveBeenCalled();
        expect(location.reloadPage).not.toHaveBeenCalled();
      }));
    });

    describe('and then disabled', () => {
      it('should not schedule a new check for update (after current check)', fakeTime(run(async () => {
        appRef.isStable.next(true);
        expect(swu.checkForUpdate).toHaveBeenCalled();

        service.disable();
        swu.checkForUpdate.calls.reset();

        await tickClock(checkInterval);
        await tickClock(checkInterval);

        expect(swu.checkForUpdate).not.toHaveBeenCalled();
      })));

      it('should not schedule a new check for update (after activating an update)', fakeTime(run(async () => {
        appRef.isStable.next(true);
        expect(swu.checkForUpdate).toHaveBeenCalled();

        service.disable();
        swu.checkForUpdate.calls.reset();

        swu.$$availableSubj.next({available: {hash: 'foo'}});
        swu.$$activatedSubj.next({current: {hash: 'baz'}});

        await tickClock(checkInterval);
        await tickClock(checkInterval);

        expect(swu.checkForUpdate).not.toHaveBeenCalled();
      })));

      it('should not activate available updates', fakeTime(run(async () => {
        service.disable();
        swu.$$availableSubj.next({available: {hash: 'foo'}});

        expect(swu.activateUpdate).not.toHaveBeenCalled();
      })));

      it('should stop requesting full page navigations when updates are activated', run(async () => {
        swu.$$availableSubj.next({available: {hash: 'foo'}});
        swu.$$activatedSubj.next({current: {hash: 'bar'}});
        expect(location.fullPageNavigationNeeded).toHaveBeenCalledTimes(1);

        service.disable();
        location.fullPageNavigationNeeded.calls.reset();

        swu.$$availableSubj.next({available: {hash: 'baz'}});
        swu.$$activatedSubj.next({current: {hash: 'qux'}});
        expect(location.fullPageNavigationNeeded).not.toHaveBeenCalled();
      }));

      it('should stop requesting page reloads when unrecoverable states are detected', run(async () => {
        swu.$$unrecoverableSubj.next({reason: 'Something bad happened'});
        expect(errorHandler.handleError).toHaveBeenCalledTimes(1);
        expect(location.reloadPage).toHaveBeenCalledTimes(1);

        service.disable();
        (errorHandler.handleError as jasmine.Spy).calls.reset();
        location.reloadPage.calls.reset();

        swu.$$unrecoverableSubj.next({reason: 'Something worse happened'});
        expect(errorHandler.handleError).not.toHaveBeenCalled();
        expect(location.reloadPage).not.toHaveBeenCalled();
      }));

      describe('and then enabled again', () => {
        it('should start scheduling new checks for updates again', fakeTime(run(async () => {
          appRef.isStable.next(true);
          service.disable();
          service.enable();
          swu.checkForUpdate.calls.reset();

          await tickClock(checkInterval);

          expect(swu.checkForUpdate).toHaveBeenCalled();
        })));

        it('should start scheduling new checks for updates (after activating an update) again', fakeTime(run(async () => {
          appRef.isStable.next(true);
          service.disable();
          service.enable();
          swu.checkForUpdate.calls.reset();

          swu.$$availableSubj.next({available: {hash: 'foo'}});
          swu.$$activatedSubj.next({current: {hash: 'baz'}});
          await tickClock(checkInterval);

          expect(swu.checkForUpdate).toHaveBeenCalled();
        })));

        it('should start activating available updates again', fakeTime(run(async () => {
          service.disable();
          service.enable();

          swu.$$availableSubj.next({available: {hash: 'foo'}});

          expect(swu.activateUpdate).toHaveBeenCalled();
        })));
      });
    });
  });

  describe('when destroyed', () => {
    it('should disable itself', run(async () => {
      const disableSpy = spyOn(service, 'disable');

      service.ngOnDestroy();
      expect(disableSpy).toHaveBeenCalledOnceWith();
    }));
  });
});

// Mocks
class MockApplicationRef {
  isStable = new BehaviorSubject(false);
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
