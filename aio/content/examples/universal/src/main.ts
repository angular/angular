import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// #docregion bootstrap
bootstrapApplication(AppComponent, appConfig)
// #enddocregion bootstrap
    .catch(err => console.error(err));
