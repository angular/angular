/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {LOCAL_STORAGE, WINDOW, FakeEventTarget, MockLocalStorage} from '@angular/docs';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';

import {
  AlertManager,
  MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES,
  WEBCONTAINERS_COUNTER_KEY,
} from './alert-manager.service';

describe('AlertManager', () => {
  let service: AlertManager;
  let fakeWindow: FakeEventTarget & {history: unknown};
  let mockLocalStorage: MockLocalStorage;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let snackBarAction$: Subject<void>;

  beforeEach(() => {
    fakeWindow = Object.assign(new FakeEventTarget(), {
      history: {},
    });

    mockLocalStorage = new MockLocalStorage();

    snackBarAction$ = new Subject<void>();

    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
    snackBarSpy.openFromComponent.and.returnValue({
      onAction: () => snackBarAction$.asObservable(),
    } as MatSnackBarRef<unknown>);

    TestBed.configureTestingModule({
      providers: [
        AlertManager,
        {provide: WINDOW, useValue: fakeWindow},
        {provide: LOCAL_STORAGE, useValue: mockLocalStorage},
        {provide: MatSnackBar, useValue: snackBarSpy},
      ],
    });

    service = TestBed.inject(AlertManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should increment the webcontainer counter on init', () => {
    service.init();

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should increment the counter from existing value', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '2');

    service.init();

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('3');
  });

  it('should decrement the counter on beforeunload', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '2');

    service.init();

    // Counter is now 3 after init increment
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('3');

    // Simulate page close
    fakeWindow.dispatchEvent(new Event('beforeunload'));

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('2');
  });

  it('should not decrement the counter below zero', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '0');

    service.init();

    // Counter is now 1 after init increment
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');

    // Simulate page close
    fakeWindow.dispatchEvent(new Event('beforeunload'));

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');

    // Dispatch beforeunload again to try to go negative
    fakeWindow.dispatchEvent(new Event('beforeunload'));

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
  });

  it('should re-increment the counter on pageshow with persisted=true', () => {
    service.init();

    // Counter is 1 after init
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');

    // Simulate beforeunload (page entering bfcache)
    fakeWindow.dispatchEvent(new Event('beforeunload'));
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');

    // Simulate pageshow with persisted=true (page restored from bfcache)
    const pageshowEvent = new PageTransitionEvent('pageshow', {persisted: true});
    fakeWindow.dispatchEvent(pageshowEvent);

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should not re-increment the counter on pageshow with persisted=false', () => {
    service.init();

    // Counter is 1 after init
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');

    // Simulate a normal pageshow (not from bfcache)
    const pageshowEvent = new PageTransitionEvent('pageshow', {persisted: false});
    fakeWindow.dispatchEvent(pageshowEvent);

    // Counter should remain 1 (not re-incremented)
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should show the OOM snackbar when counter exceeds the maximum', () => {
    mockLocalStorage.setItem(
      WEBCONTAINERS_COUNTER_KEY,
      MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES.toString(),
    );

    service.init();

    expect(snackBarSpy.openFromComponent).toHaveBeenCalled();
  });

  it('should reset the counter to 1 when user dismisses the OOM warning', () => {
    mockLocalStorage.setItem(
      WEBCONTAINERS_COUNTER_KEY,
      MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES.toString(),
    );

    service.init();

    // Counter is now MAX + 1
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe(
      (MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES + 1).toString(),
    );

    // User clicks "I understand"
    snackBarAction$.next();

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should treat negative stored values as zero', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '-5');

    service.init();

    // getStoredCountOfWebcontainerInstances returns max(stored, 0) = 0, then +1 = 1
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should treat NaN stored values as zero', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, 'not-a-number');

    service.init();

    // NaN check returns 0, then +1 = 1
    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });
});
