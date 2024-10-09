/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser} from '@angular/common';
import {InjectionToken, PLATFORM_ID, inject} from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => getStorage(inject(PLATFORM_ID)),
});

const getStorage = (platformId: Object): Storage | null => {
  // Prerendering: localStorage is undefined for prerender build
  return isPlatformBrowser(platformId) ? new LocalStorage() : null;
};

/**
 * LocalStorage is wrapper class for localStorage, operations can fail due to various reasons,
 * such as browser restrictions or storage limits being exceeded. A wrapper is providing error handling.
 */
class LocalStorage implements Storage {
  get length(): number {
    try {
      return localStorage.length;
    } catch {
      return 0;
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {}
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  key(index: number): string | null {
    try {
      return localStorage.key(index);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}
