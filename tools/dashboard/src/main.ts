import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {environment} from './environments/environment';
import {DashboardModule} from './app/dashboard-module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(DashboardModule);
