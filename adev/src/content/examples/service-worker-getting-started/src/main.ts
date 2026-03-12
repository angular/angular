import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideProtractorTestingSupport(), // essential for e2e testing
  ],
});
