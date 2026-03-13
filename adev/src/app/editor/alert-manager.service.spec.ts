/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {LOCAL_STORAGE, WINDOW} from '@angular/docs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import {
  AlertManager,
  MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES,
  WEBCONTAINERS_COUNTER_KEY,
} from './alert-manager.service';

describe('AlertManager', () => {
  let service: AlertManager;
  let storageMap: Map<string, string>;
  let localStorageMock: Pick<Storage, 'getItem' | 'setItem'>;
  let beforeUnloadHandler: (() => void) | undefined;
  let snackBarAction$: Subject<void>;
  let snackBarMock: {openFromComponent: jasmine.Spy};

  beforeEach(() => {
    storageMap = new Map<string, string>();
    localStorageMock = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storageMap.set(key, value);
      },
    };

    const fakeWindow = {
      addEventListener: (eventName: string, callback: () => void) => {
        if (eventName === 'beforeunload') {
          beforeUnloadHandler = callback;
        }
      },
    };

    snackBarAction$ = new Subject<void>();
    snackBarMock = {
      openFromComponent: jasmine.createSpy().and.returnValue({
        onAction: () => snackBarAction$.asObservable(),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        AlertManager,
        {provide: LOCAL_STORAGE, useValue: localStorageMock},
        {provide: WINDOW, useValue: fakeWindow},
        {provide: MatSnackBar, useValue: snackBarMock},
      ],
    });

    service = TestBed.inject(AlertManager);
  });

  it('should increment running webcontainer instances on init', () => {
    service.init();

    expect(storageMap.get(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should decrement running webcontainer instances on beforeunload', () => {
    service.init();

    beforeUnloadHandler?.();

    expect(storageMap.get(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
  });

  it('should reset instances counter after dismissing out-of-memory warning', () => {
    storageMap.set(
      WEBCONTAINERS_COUNTER_KEY,
      MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES.toString(),
    );

    service.init();
    snackBarAction$.next();

    expect(storageMap.get(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
  });
});
