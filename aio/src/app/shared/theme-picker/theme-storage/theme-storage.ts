import { Injectable } from '@angular/core';

@Injectable()
export class ThemeStorage {
  static storageKey = 'io-theme-storage-current-name';


  storeTheme(theme: 'light' | 'dark') {
    try {
      window.localStorage[ThemeStorage.storageKey] = theme;
    } catch { }

  }

  getStoredThemeName(): 'light' | 'dark' | null {
    try {
      return window.localStorage[ThemeStorage.storageKey] || null;
    } catch {
      return null;
    }
  }

  clearStorage(): void {
    try {
      window.localStorage.removeItem(ThemeStorage.storageKey);
    } catch { }
  }
}
