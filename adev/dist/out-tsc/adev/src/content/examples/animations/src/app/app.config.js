import {routes} from './app.routes';
import {provideRouter} from '@angular/router';
import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
export const appConfig = {
  providers: [
    // needed for supporting e2e tests
    provideProtractorTestingSupport(),
    provideRouter(routes),
    provideAnimations(),
  ],
};
//# sourceMappingURL=app.config.js.map
