import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// #docregion promise
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => console.log('The app was bootstrapped.'));
// #enddocregion promise
