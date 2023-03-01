// #docregion
import { MissingTranslationStrategy } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// ...

platformBrowserDynamic().bootstrapModule(AppModule, {
  missingTranslation: MissingTranslationStrategy.Error,
  providers: [
    // ...
  ]
});
