import { InjectionToken } from '@angular/core';


export const Global = new InjectionToken<Window>('global');
export const globalProvider = { provide: Global, useValue: window };
