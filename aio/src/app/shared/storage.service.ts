import { InjectionToken, StaticProvider } from '@angular/core';
import { WindowToken } from './window';

export const LocalStorage = new InjectionToken<Storage>('LocalStorage');
export const SessionStorage = new InjectionToken<Storage>('SessionStorage');

export const STORAGE_PROVIDERS: StaticProvider[] = [
  { provide: LocalStorage, useFactory: (win: Window) => getStorage(win, 'localStorage'), deps: [WindowToken] },
  { provide: SessionStorage, useFactory: (win: Window) => getStorage(win, 'sessionStorage'), deps: [WindowToken] },
];

export class NoopStorage implements Storage {
  length = 0;
  clear() {}
  getItem() { return null; }
  key() { return null; }
  removeItem() {}
  setItem() {}
}

function getStorage(win: Window, storageType: 'localStorage' | 'sessionStorage'): Storage {
  // When cookies are disabled in the browser, even trying to access `window[storageType]` throws an
  // error. If so, return a no-op storage.
  try {
    return win[storageType];
  } catch {
    return new NoopStorage();
  }
}
