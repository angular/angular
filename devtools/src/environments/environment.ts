import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export const environment = {
  production: false,
  LATEST_SHA: 'BUILD_SCM_COMMIT_SHA',  // Stamped at build time by bazel
};
