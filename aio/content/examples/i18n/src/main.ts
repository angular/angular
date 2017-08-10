// #docregion
import { platformBrowserDynamic }  from '@angular/platform-browser-dynamic';
import { getTranslationProviders } from './app/i18n-providers';

import { AppModule } from './app/app.module';

getTranslationProviders().then(providers => {
  const options = { providers };
  platformBrowserDynamic().bootstrapModule(AppModule, options);
});
