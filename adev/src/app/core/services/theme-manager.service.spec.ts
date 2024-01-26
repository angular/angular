/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ThemeManager} from './theme-manager.service';
import {LOCAL_STORAGE} from '@angular/docs';

describe('ThemeManager', () => {
  let service: ThemeManager;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj<Storage>('localStorage', ['getItem', 'setItem']);
    localStorageSpy.getItem.and.returnValue(null);
    localStorageSpy.setItem.and.returnValue();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: LOCAL_STORAGE,
          useValue: localStorageSpy,
        },
      ],
    });
  });

  it('should set theme based on device preferences (auto) when user did not set theme manually', () => {
    localStorageSpy.getItem.and.returnValue(null);

    service = TestBed.inject(ThemeManager);

    expect(service.theme()).toBe('auto');
  });

  it('should set theme based on stored user preferences (dark) when user already set theme manually', () => {
    localStorageSpy.getItem.and.returnValue('dark');

    service = TestBed.inject(ThemeManager);

    expect(service.theme()).toBe('dark');
  });

  it('should set theme based on stored user preferences (light) when user already set theme manually', () => {
    localStorageSpy.getItem.and.returnValue('light');

    service = TestBed.inject(ThemeManager);

    expect(service.theme()).toBe('light');
  });

  it('should set theme based on stored user preferences (auto) when user already set theme manually', () => {
    localStorageSpy.getItem.and.returnValue('auto');

    service = TestBed.inject(ThemeManager);

    expect(service.theme()).toBe('auto');
  });
});
