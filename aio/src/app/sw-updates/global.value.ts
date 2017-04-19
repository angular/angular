import { InjectionToken } from '@angular/core';


export const Global = new InjectionToken<Window>('global');
export const globalProvider = { provide: Global, useFactory: globalFactory };
export function globalFactory() {
  return window;
}
