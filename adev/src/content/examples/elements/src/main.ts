import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {App} from './app/app';

bootstrapApplication(App, {
  providers: [provideProtractorTestingSupport()],
}).catch((err) => console.error(err));
