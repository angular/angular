import { ApplicationRef, ReflectiveInjector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { NgServiceWorker } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { Logger } from 'app/shared/logger.service';
import { SwUpdatesService } from './sw-updates.service';

describe('SwUpdatesService', () => {
  let injector: ReflectiveInjector;
  let appRef: MockApplicationRef;
  let service: SwUpdatesService;
  let sw: MockNgServiceWorker;
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
      { provide: NgServiceWorker, useClass: MockNgServiceWorker },
      SwUpdatesService
    ]);

    appRef = injector.get(ApplicationRef);
    service = injector.get(SwUpdatesService);
    sw = injector.get(NgServiceWorker);
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

    sw.$$checkForUpdateSubj.next(false);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
    expect(sw.activateUpdate).not.toHaveBeenCalled();
  })));

  it('should activate new updates immediately', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.checkForUpdate.calls.reset();

    sw.$$checkForUpdateSubj.next(true);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();
    expect(sw.activateUpdate).toHaveBeenCalled();
  })));

  it('should not pass a specific version to `NgServiceWorker.activateUpdate()`', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.$$checkForUpdateSubj.next(true);
    tick(checkInterval);

    expect(sw.activateUpdate).toHaveBeenCalledWith(null);
  })));

  it('should schedule a new check after activating the update', fakeAsync(run(() => {
    appRef.isStable.next(true);
    sw.checkForUpdate.calls.reset();
    sw.$$checkForUpdateSubj.next(true);

    tick(checkInterval);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    sw.$$activateUpdateSubj.next();
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
  })));

  it('should emit on `updateActivated` when an update has been activated', run(() => {
    const activatedVersions: (string|undefined)[] = [];
    service.updateActivated.subscribe(v => activatedVersions.push(v));

    sw.$$updatesSubj.next({type: 'pending', version: 'foo'});
    sw.$$updatesSubj.next({type: 'activation', version: 'bar'});
    sw.$$updatesSubj.next({type: 'pending', version: 'baz'});
    sw.$$updatesSubj.next({type: 'activation', version: 'qux'});

    expect(activatedVersions).toEqual(['bar', 'qux']);
  }));

  describe('when destroyed', () => {
    it('should not schedule a new check for update (after current check)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      sw.checkForUpdate.calls.reset();

      service.ngOnDestroy();
      sw.$$checkForUpdateSubj.next(false);
      tick(checkInterval);

      expect(sw.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should not schedule a new check for update (after activating an update)', fakeAsync(run(() => {
      appRef.isStable.next(true);
      sw.checkForUpdate.calls.reset();

      sw.$$checkForUpdateSubj.next(true);
      expect(sw.activateUpdate).toHaveBeenCalled();

      service.ngOnDestroy();
      sw.$$activateUpdateSubj.next();
      tick(checkInterval);

      expect(sw.checkForUpdate).not.toHaveBeenCalled();
    })));

    it('should stop emitting on `updateActivated`', run(() => {
      const activatedVersions: (string|undefined)[] = [];
      service.updateActivated.subscribe(v => activatedVersions.push(v));

      sw.$$updatesSubj.next({type: 'pending', version: 'foo'});
      sw.$$updatesSubj.next({type: 'activation', version: 'bar'});
      service.ngOnDestroy();
      sw.$$updatesSubj.next({type: 'pending', version: 'baz'});
      sw.$$updatesSubj.next({type: 'activation', version: 'qux'});

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

class MockNgServiceWorker {
  $$activateUpdateSubj = new Subject<boolean>();
  $$checkForUpdateSubj = new Subject<boolean>();
  $$updatesSubj = new Subject<{type: string, version: string}>();

  updates = this.$$updatesSubj.asObservable();

  activateUpdate = jasmine.createSpy('MockNgServiceWorker.activateUpdate')
                          .and.callFake(() => this.$$activateUpdateSubj.pipe(take(1)));

  checkForUpdate = jasmine.createSpy('MockNgServiceWorker.checkForUpdate')
                          .and.callFake(() => this.$$checkForUpdateSubj.pipe(take(1)));
}
