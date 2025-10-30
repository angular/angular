import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {provideZoneChangeDetection} from '@angular/core';

bootstrapApplication(App, {
  providers: [provideZoneChangeDetection({eventCoalescing: true})],
}).catch((err) => console.error(err));
