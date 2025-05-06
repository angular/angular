import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';

const useZoneless = new URL(location.href).searchParams.get('zoneless') === 'true';
export const appConfig: ApplicationConfig = {
  providers: [
    useZoneless
      ? provideZonelessChangeDetection()
      : provideZoneChangeDetection({eventCoalescing: true}),
  ],
};
