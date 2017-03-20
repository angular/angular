// #docregion
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// #docregion enableProdMode
import { enableProdMode } from '@angular/core';

// Enable production mode unless running locally
if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}
// #enddocregion enableProdMode

platformBrowserDynamic().bootstrapModule(AppModule);
