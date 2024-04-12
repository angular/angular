import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';

import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport(), provideAnimations()],
}).catch((err) => console.error(err));
