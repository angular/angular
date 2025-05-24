import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  provideZoneChangeDetection,
} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

const useZoneless = new URL(location.href).searchParams.get('zoneless') === 'true';
export const appConfig: ApplicationConfig = {
  providers: [
    provideNoopAnimations(), // animations cause element removal delay
    useZoneless
      ? provideZonelessChangeDetection()
      : provideZoneChangeDetection({eventCoalescing: true}),
  ],
};
