import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';

import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  // HttpClientModule is only used in deprecated HeroListComponent
  providers: [
    provideHttpClient(),
    provideProtractorTestingSupport(), // essential for e2e testing
  ],
});
