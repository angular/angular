/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isPlatformBrowser} from '@angular/common';
import {InjectionToken, PLATFORM_ID, inject} from '@angular/core';
export const LOCAL_STORAGE = new InjectionToken('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => getStorage(inject(PLATFORM_ID)),
});
const getStorage = (platformId) => {
  // Prerendering: localStorage is undefined for prerender build
  return isPlatformBrowser(platformId) ? new LocalStorage() : null;
};
/**
 * LocalStorage is wrapper class for localStorage, operations can fail due to various reasons,
 * such as browser restrictions or storage limits being exceeded. A wrapper is providing error handling.
 */
class LocalStorage {
  get length() {
    try {
      return localStorage.length;
    } catch {
      return 0;
    }
  }
  clear() {
    try {
      localStorage.clear();
    } catch {}
  }
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  key(index) {
    try {
      return localStorage.key(index);
    } catch {
      return null;
    }
  }
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}
//# sourceMappingURL=local-storage.js.map
