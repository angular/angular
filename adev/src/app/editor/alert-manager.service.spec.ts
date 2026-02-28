/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {LOCAL_STORAGE, MockLocalStorage, WINDOW} from '@angular/docs';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';

import {AlertManager, AlertReason, WEBCONTAINERS_COUNTER_KEY} from './alert-manager.service';

describe('AlertManager', () => {
  let service: AlertManager;
  let action$ = new Subject<void>();
  let mockWindow: jasmine.SpyObj<Window>;
  let mockLocalStorage: MockLocalStorage;
  let snackBarRef: Pick<MatSnackBarRef<unknown>, 'onAction'>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    action$ = new Subject<void>();
    mockWindow = jasmine.createSpyObj<Window>('Window', ['addEventListener']);
    mockLocalStorage = new MockLocalStorage();

    snackBarRef = {
      onAction: () => action$.asObservable(),
    };

    mockSnackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
    mockSnackBar.openFromComponent.and.returnValue(snackBarRef as MatSnackBarRef<unknown>);

    TestBed.configureTestingModule({
      providers: [
        AlertManager,
        {provide: WINDOW, useValue: mockWindow},
        {provide: LOCAL_STORAGE, useValue: mockLocalStorage},
        {provide: MatSnackBar, useValue: mockSnackBar},
      ],
    });

    service = TestBed.inject(AlertManager);
  });

  it('should reset webcontainers counter when out-of-memory warning is acknowledged', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '5');

    service['openSnackBar'](AlertReason.OUT_OF_MEMORY);
    action$.next();
    action$.complete();

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
  });

  it('should not reset webcontainers counter when mobile warning is acknowledged', () => {
    mockLocalStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '5');

    service['openSnackBar'](AlertReason.MOBILE);
    action$.next();
    action$.complete();

    expect(mockLocalStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('5');
  });
});
