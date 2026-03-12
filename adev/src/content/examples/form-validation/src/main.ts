// #docregion
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideZoneChangeDetection} from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection({eventCoalescing: true})],
}).catch((err) => console.error(err));
