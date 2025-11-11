/**
 * Application Bootstrap
 *
 * Chapter 5 (Compiler) - AOT 컴파일과 부트스트랩
 * Chapter 6 (Zone.js) - Zone.js 통합
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
