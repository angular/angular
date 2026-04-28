/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser} from '@angular/common';
import {InjectionToken, PLATFORM_ID, inject} from '@angular/core';

export const SESSION_STORAGE = new InjectionToken<Storage | null>('SESSION_STORAGE', {
  factory: () => getStorage(inject(PLATFORM_ID)),
});

const getStorage = (platformId: Object): Storage | null => {
  // Prerendering: sessionStorage is undefined for prerender build
  return isPlatformBrowser(platformId) ? new SessionStorage() : null;
};

/**
 * SessionStorage is wrapper class for sessionStorage, operations can fail due to
 * various reasons, such as browser restrictions or storage limits being exceeded.
 * A wrapper is providing error handling.
 */
class SessionStorage implements Storage {
  get length(): number {
    try {
      return sessionStorage.length;
    } catch {
      return 0;
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch {}
  }

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  key(index: number): string | null {
    try {
      return sessionStorage.key(index);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }
}
