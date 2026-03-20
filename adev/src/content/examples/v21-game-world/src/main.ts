import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {App} from './app/app';

bootstrapApplication(App, {
  providers: [
    provideProtractorTestingSupport(), // essential for e2e testing
  ],
});
