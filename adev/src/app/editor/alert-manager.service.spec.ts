/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {
  LOCAL_STORAGE,
  MockLocalStorage,
  SESSION_STORAGE,
  WINDOW,
  FakeEventTarget,
} from '@angular/docs';
import {MatSnackBar} from '@angular/material/snack-bar';

import {
  AlertManager,
  WEBCONTAINERS_COUNTER_KEY,
  WEBCONTAINER_SESSION_KEY,
} from './alert-manager.service';

describe('AlertManager', () => {
  let localStorage: MockLocalStorage;
  let sessionStorage: MockLocalStorage;
  let windowTarget: FakeEventTarget;

  function createService(): AlertManager {
    return TestBed.runInInjectionContext(() => new AlertManager());
  }

  beforeEach(() => {
    localStorage = new MockLocalStorage();
    sessionStorage = new MockLocalStorage();
    windowTarget = new FakeEventTarget();

    TestBed.configureTestingModule({
      providers: [
        {provide: LOCAL_STORAGE, useValue: localStorage},
        {provide: SESSION_STORAGE, useValue: sessionStorage},
        {provide: WINDOW, useValue: windowTarget as unknown as Window},
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']),
        },
      ],
    });
  });

  it('should register the current tab once', () => {
    const service = createService();

    service.init();

    expect(localStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
    expect(sessionStorage.getItem(WEBCONTAINER_SESSION_KEY)).toBe('true');
  });

  it('should not increase the counter again after a reload in the same tab', () => {
    createService().init();

    createService().init();

    expect(localStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
  });

  it('should clear the tab registration on beforeunload so the next load can increment again', () => {
    createService().init();

    windowTarget.dispatchEvent(new Event('beforeunload'));

    expect(localStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
    expect(sessionStorage.getItem(WEBCONTAINER_SESSION_KEY)).toBeNull();

    createService().init();

    expect(localStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('1');
    expect(sessionStorage.getItem(WEBCONTAINER_SESSION_KEY)).toBe('true');
  });

  it('should not decrement below zero on beforeunload', () => {
    localStorage.setItem(WEBCONTAINERS_COUNTER_KEY, '0');
    sessionStorage.setItem(WEBCONTAINER_SESSION_KEY, 'true');

    createService().init();
    windowTarget.dispatchEvent(new Event('beforeunload'));

    expect(localStorage.getItem(WEBCONTAINERS_COUNTER_KEY)).toBe('0');
  });
});
