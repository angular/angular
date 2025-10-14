import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';
export const appConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideProtractorTestingSupport(),
  ],
};
//# sourceMappingURL=app.config.js.map
