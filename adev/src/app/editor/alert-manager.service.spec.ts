/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {LOCAL_STORAGE, WINDOW} from '@angular/docs';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';

import {AlertManager, WEBCONTAINERS_COUNTER_KEY} from './alert-manager.service';

describe('AlertManager', () => {
  let service: AlertManager;
  let localStorage: Map<string, string>;
  let action$: Subject<void>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let windowMock: Pick<Window, 'addEventListener'>;

  beforeEach(() => {
    localStorage = new Map([[WEBCONTAINERS_COUNTER_KEY, '3']]);
    action$ = new Subject<void>();
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
    snackBar.openFromComponent.and.returnValue({
      onAction: () => action$,
    } as unknown as MatSnackBarRef<unknown>);
    windowMock = {
      addEventListener: jasmine.createSpy('addEventListener'),
    };

    TestBed.configureTestingModule({
      providers: [
        AlertManager,
        {provide: MatSnackBar, useValue: snackBar},
        {
          provide: LOCAL_STORAGE,
          useValue: {
            getItem: (key: string) => localStorage.get(key) ?? null,
            setItem: (key: string, value: string) => localStorage.set(key, value),
          },
        },
        {provide: WINDOW, useValue: windowMock},
      ],
    });

    service = TestBed.inject(AlertManager);
  });

  it('resets the stale webcontainer count when the out of memory warning action is clicked', () => {
    service.init();

    expect(localStorage.get(WEBCONTAINERS_COUNTER_KEY)).toBe('4');
    expect(snackBar.openFromComponent).toHaveBeenCalled();

    action$.next();

    expect(localStorage.get(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });
});
