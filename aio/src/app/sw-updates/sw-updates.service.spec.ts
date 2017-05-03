import { ReflectiveInjector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { NgServiceWorker } from '@angular/service-worker';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';

import { SwUpdatesService } from './sw-updates.service';

describe('SwUpdatesService', () => {
  let injector: ReflectiveInjector;
  let service: SwUpdatesService;
  let sw: MockNgServiceWorker;
  let checkInterval: number;

  // Helpers
  // NOTE:
  //  Because `SwUpdatesService` uses the `debounceTime` operator, it needs to be instantiated
  //  inside the `fakeAsync` zone (when `fakeAsync` is used for the test). Thus, we can't run
  //  `setup()` in a `beforeEach()` block. We use the `run()` helper to call it inside each test' zone.
  const setup = () => {
    injector = ReflectiveInjector.resolveAndCreate([
      { provide: NgServiceWorker, useClass: MockNgServiceWorker },
      SwUpdatesService
    ]);

    service = injector.get(SwUpdatesService);
    sw = injector.get(NgServiceWorker);
    checkInterval = (service as any).checkInterval;
  };
  const tearDown = () => service.ngOnDestroy();
  const run = specFn => () => {
    setup();
    specFn();
    tearDown();
  };


  it('should create', run(() => {
    expect(service).toBeTruthy();
  }));

  it('should immediatelly check for updates when instantiated', run(() => {
    expect(sw.checkForUpdate).toHaveBeenCalled();
  }));

  it('should schedule a new check if there is no update available', fakeAsync(run(() => {
    sw.checkForUpdate.calls.reset();

    sw.$$checkForUpdateSubj.next(false);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).toHaveBeenCalled();
  })));

  it('should not schedule a new check if there is an update available', fakeAsync(run(() => {
    sw.checkForUpdate.calls.reset();

    sw.$$checkForUpdateSubj.next(true);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();

    tick(checkInterval);
    expect(sw.checkForUpdate).not.toHaveBeenCalled();
  })));

  describe('#activateUpdate()', () => {
    it('should return a promise', run(() => {
      expect(service.activateUpdate()).toEqual(jasmine.any(Promise));
    }));

    it('should call `NgServiceWorker.activateUpdate()`', run(() => {
      expect(sw.activateUpdate).not.toHaveBeenCalled();

      service.activateUpdate();
      expect(sw.activateUpdate).toHaveBeenCalled();
    }));

    it('should not pass a specific version to `NgServiceWorker.activateUpdate()`', run(() => {
      (service.activateUpdate as Function)('foo');
      expect(sw.activateUpdate).toHaveBeenCalledWith(null);
    }));

    it('should resolve the promise with the activation outcome', fakeAsync(run(() => {
      let outcome;

      service.activateUpdate().then(v => outcome = v);
      sw.$$activateUpdateSubj.next(true);
      tick();
      expect(outcome).toBe(true);

      service.activateUpdate().then(v => outcome = v);
      sw.$$activateUpdateSubj.next(false);
      tick();
      expect(outcome).toBe(false);
    })));

    it('should schedule a new check (if the activation succeeded)', fakeAsync(run(() => {
      sw.checkForUpdate.calls.reset();

      service.activateUpdate();

      tick(checkInterval);
      expect(sw.checkForUpdate).not.toHaveBeenCalled();

      sw.$$activateUpdateSubj.next(true);
      expect(sw.checkForUpdate).not.toHaveBeenCalled();

      tick(checkInterval);
      expect(sw.checkForUpdate).toHaveBeenCalled();
    })));

    it('should schedule a new check (if the activation failed)', fakeAsync(run(() => {
      sw.checkForUpdate.calls.reset();

      service.activateUpdate();

      tick(checkInterval);
      expect(sw.checkForUpdate).not.toHaveBeenCalled();

      sw.$$activateUpdateSubj.next(false);
      expect(sw.checkForUpdate).not.toHaveBeenCalled();

      tick(checkInterval);
      expect(sw.checkForUpdate).toHaveBeenCalled();
    })));
  });

  describe('#isUpdateAvailable', () => {
    let emittedValues: boolean[];

    // Helpers
    const withSubscription = specFn => () => {
      emittedValues = [];
      service.isUpdateAvailable.subscribe(v => emittedValues.push(v));
      specFn();
    };


    it('should emit `false/true` when there is/isn\'t an update available',
      fakeAsync(run(withSubscription(() => {
        expect(emittedValues).toEqual([]);

        sw.$$checkForUpdateSubj.next(false);
        expect(emittedValues).toEqual([false]);

        tick(checkInterval);
        sw.$$checkForUpdateSubj.next(true);
        expect(emittedValues).toEqual([false, true]);
      })))
    );

    it('should emit only when the value has changed',
      fakeAsync(run(withSubscription(() => {
        expect(emittedValues).toEqual([]);

        sw.$$checkForUpdateSubj.next(false);
        expect(emittedValues).toEqual([false]);

        tick(checkInterval);
        sw.$$checkForUpdateSubj.next(false);
        expect(emittedValues).toEqual([false]);

        tick(checkInterval);
        sw.$$checkForUpdateSubj.next(false);
        expect(emittedValues).toEqual([false]);
      })))
    );

    it('should emit `false` after a successful activation',
      fakeAsync(run(withSubscription(() => {
        sw.$$checkForUpdateSubj.next(true);
        expect(emittedValues).toEqual([true]);

        service.activateUpdate();
        sw.$$activateUpdateSubj.next(true);

        expect(emittedValues).toEqual([true, false]);
      })))
    );

    it('should emit `false` after a failed activation',
      fakeAsync(run(withSubscription(() => {
        sw.$$checkForUpdateSubj.next(true);
        expect(emittedValues).toEqual([true]);

        service.activateUpdate();
        sw.$$activateUpdateSubj.next(false);

        expect(emittedValues).toEqual([true, false]);
      })))
    );

    it('should not emit a new value after activation if already `false`',
      fakeAsync(run(withSubscription(() => {
        sw.$$checkForUpdateSubj.next(false);
        expect(emittedValues).toEqual([false]);

        service.activateUpdate();
        sw.$$activateUpdateSubj.next(true);

        expect(emittedValues).toEqual([false]);
      })))
    );
  });
});

// Mocks
class MockNgServiceWorker {
  $$activateUpdateSubj = new Subject<boolean>();
  $$checkForUpdateSubj = new Subject<boolean>();

  activateUpdate = jasmine.createSpy('MockNgServiceWorker.activateUpdate')
                          .and.callFake(() => this.$$activateUpdateSubj.take(1));

  checkForUpdate = jasmine.createSpy('MockNgServiceWorker.checkForUpdate')
                          .and.callFake(() => this.$$checkForUpdateSubj.take(1));
}
