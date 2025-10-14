import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
export const appConfig = {
  providers: [provideRouter(routes), provideProtractorTestingSupport()],
};
//# sourceMappingURL=app.config.js.map
