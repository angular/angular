import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

import {AppComponent} from './app/app.component';
import {appRoutes} from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes), provideProtractorTestingSupport()],
}).catch(console.error);
