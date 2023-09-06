import {AppComponent} from './app/app.component';
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport()],
});
