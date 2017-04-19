import { ReflectiveInjector } from '@angular/core';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { MockSwUpdatesService } from 'testing/sw-updates.service';
import { Global } from './global.value';
import { SwUpdateNotificationsService } from './sw-update-notifications.service';
import { SwUpdatesService } from './sw-updates.service';


describe('SwUpdateNotificationsService', () => {
  const UPDATE_AVAILABLE_MESSAGE = 'New update for angular.io is available.';
  const UPDATE_FAILED_MESSAGE = 'Update activation failed :(';
  let injector: ReflectiveInjector;
  let service: SwUpdateNotificationsService;
  let swUpdates: MockSwUpdatesService;
  let snackBar: MockMdSnackBar;

  // Helpers
  const activateUpdate = success => {
    swUpdates.$$isUpdateAvailableSubj.next(true);
    snackBar.$$lastRef.$$onActionSubj.next();
    swUpdates.$$activateUpdateSubj.next(success);

    flushMicrotasks();
  };

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      { provide: Global, useClass: MockGlobal },
      { provide: MdSnackBar, useClass: MockMdSnackBar },
      { provide: SwUpdatesService, useClass: MockSwUpdatesService },
      SwUpdateNotificationsService
    ]);
    service = injector.get(SwUpdateNotificationsService);
    swUpdates = injector.get(SwUpdatesService);
    snackBar = injector.get(MdSnackBar);
  });


  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should not notify about available updates before being enabled', () => {
    swUpdates.$$isUpdateAvailableSubj.next(true);
    expect(snackBar.$$lastRef).toBeUndefined();
  });

  describe('when enabled', () => {
    beforeEach(() => service.enable());


    it('should not re-subscribe to updates if already enabled', () => {
      spyOn(snackBar, 'open').and.callThrough();

      service.enable();
      swUpdates.$$isUpdateAvailableSubj.next(true);

      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });

    it('should notify when updates are available', () => {
      expect(snackBar.$$lastRef).toBeUndefined();

      swUpdates.$$isUpdateAvailableSubj.next(true);

      expect(snackBar.$$lastRef.$$message).toBe(UPDATE_AVAILABLE_MESSAGE);
      expect(snackBar.$$lastRef.$$action).toBe('Update now');
      expect(snackBar.$$lastRef.$$config.duration).toBeUndefined();
    });

    it('should not notify when updates are not available', () => {
      swUpdates.$$isUpdateAvailableSubj.next(false);
      expect(snackBar.$$lastRef).toBeUndefined();
    });

    it('should activate the update when clicking on `Update now`', () => {
      spyOn(swUpdates, 'activateUpdate').and.callThrough();

      swUpdates.$$isUpdateAvailableSubj.next(true);
      expect(swUpdates.activateUpdate).not.toHaveBeenCalled();

      snackBar.$$lastRef.$$onActionSubj.next();
      expect(swUpdates.activateUpdate).toHaveBeenCalled();
    });

    it('should reload the page after a successful activation', fakeAsync(() => {
      const global = injector.get(Global);

      expect(global.location.reload).not.toHaveBeenCalled();

      activateUpdate(true);
      expect(global.location.reload).toHaveBeenCalled();
    }));

    it('should report a failed activation', fakeAsync(() => {
      activateUpdate(false);

      expect(snackBar.$$lastRef.$$message).toBe(UPDATE_FAILED_MESSAGE);
      expect(snackBar.$$lastRef.$$action).toBe('Dismiss');
      expect(snackBar.$$lastRef.$$config.duration).toBeGreaterThan(0);
    }));

    it('should dismiss the failed activation snack-bar when clicking on `Dismiss`', fakeAsync(() => {
      activateUpdate(false);
      expect(snackBar.$$lastRef.$$dismissed).toBe(false);

      snackBar.$$lastRef.$$onActionSubj.next();
      expect(snackBar.$$lastRef.$$dismissed).toBe(true);
    }));
  });

  describe('#disable()', () => {
    beforeEach(() => service.enable());


    it('should dismiss open update notification', () => {
      swUpdates.$$isUpdateAvailableSubj.next(true);
      expect(snackBar.$$lastRef.$$message).toBe(UPDATE_AVAILABLE_MESSAGE);
      expect(snackBar.$$lastRef.$$dismissed).toBe(false);

      service.disable();
      expect(snackBar.$$lastRef.$$dismissed).toBe(true);
    });

    it('should ignore further updates', () => {
      service.disable();
      swUpdates.$$isUpdateAvailableSubj.next(true);

      expect(snackBar.$$lastRef).toBeUndefined();
    });

    it('should not ignore further updates if re-enabled', () => {
      service.disable();
      service.enable();
      expect(snackBar.$$lastRef).toBeUndefined();

      swUpdates.$$isUpdateAvailableSubj.next(true);
      expect(snackBar.$$lastRef.$$message).toBe(UPDATE_AVAILABLE_MESSAGE);
    });

    it('should not ignore pending updates if re-enabled', () => {
      service.disable();
      swUpdates.isUpdateAvailable = Observable.of(true);
      expect(snackBar.$$lastRef).toBeUndefined();

      service.enable();
      expect(snackBar.$$lastRef.$$message).toBe(UPDATE_AVAILABLE_MESSAGE);
    });
  });
});

// Mocks
class MockGlobal {
  location = {
    reload: jasmine.createSpy('MockGlobal.location.reload')
  };
}

class MockMdSnackBarRef {
  $$afterDismissedSubj = new Subject();
  $$onActionSubj = new Subject();
  $$dismissed = false;

  constructor(public $$message: string,
              public $$action: string,
              public $$config: MdSnackBarConfig) {}

  afterDismissed() {
    return this.$$afterDismissedSubj;
  }

  dismiss() {
    this.$$dismissed = true;
  }

  onAction() {
    return this.$$onActionSubj;
  }
}

class MockMdSnackBar {
  $$lastRef: MockMdSnackBarRef;

  open(message: string, action: string = null, config: MdSnackBarConfig = {}): MockMdSnackBarRef {
    if (this.$$lastRef && !this.$$lastRef.$$dismissed) {
      this.$$lastRef.dismiss();
    }

    return this.$$lastRef = new MockMdSnackBarRef(message, action, config);
  }
}
