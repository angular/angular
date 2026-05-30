/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CookiePopup, STORAGE_KEY} from './cookie-popup.component';
import {LOCAL_STORAGE} from '../../providers/index';
import {MockLocalStorage} from '../../testing/index';

describe('CookiePopup', () => {
  let fixture: ComponentFixture<CookiePopup>;
  let mockLocalStorage = new MockLocalStorage();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CookiePopup],
      providers: [
        {
          provide: LOCAL_STORAGE,
          useValue: mockLocalStorage,
        },
      ],
    });
  });

  it('should make the popup visible by default', async () => {
    await initComponent(false);

    expect(getCookiesPopup()).not.toBeNull();
  });

  it('should hide the cookies popup if the user has already accepted cookies', async () => {
    await initComponent(true);

    expect(getCookiesPopup()).toBeNull();
  });

  it('should hide the cookies popup', async () => {
    await initComponent(false);

    accept();
    await fixture.whenStable();

    expect(getCookiesPopup()).toBeNull();
  });

  it('should store the user confirmation', async () => {
    await initComponent(false);

    expect(mockLocalStorage.getItem(STORAGE_KEY)).toBeNull();

    accept();
    await fixture.whenStable();

    expect(mockLocalStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  // Helpers
  function getCookiesPopup() {
    return (fixture.nativeElement as HTMLElement).querySelector('.docs-cookies-popup');
  }

  function accept() {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[text="Ok, Got it"]')
      ?.click();
  }

  async function initComponent(cookiesAccepted: boolean) {
    mockLocalStorage.setItem(STORAGE_KEY, cookiesAccepted ? 'true' : null);
    fixture = TestBed.createComponent(CookiePopup);

    await fixture.whenStable();
  }
});
