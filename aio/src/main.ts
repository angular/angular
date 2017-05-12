import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
  if (environment.production && 'serviceWorker' in (navigator as any)) {
    const appRef: ApplicationRef = ref.injector.get(ApplicationRef);
    appRef.isStable.first().subscribe(() => {
      (navigator as any).serviceWorker.register('/worker-basic.min.js');
    });
  }
});
