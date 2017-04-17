import './polyfills.ts';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import {environment} from './environments/environment';
import {PixactoDashboardModule} from './app/pixacto.dashboard.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(PixactoDashboardModule);
