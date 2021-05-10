// #docregion
import { enableProdMode } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fetch('/assets/messages.fr.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    return response.json();
  })
  .then((messages) => {
    // Load translation
    loadTranslations(messages.translations);
    $localize.locale = messages.locale;

    // Bootstrap app
    platformBrowserDynamic().bootstrapModule(AppModule);
  })
  .catch(() => {
    // Error
  });
