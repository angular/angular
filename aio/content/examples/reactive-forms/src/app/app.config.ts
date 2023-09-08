import { ApplicationConfig } from '@angular/core';

import { provideProtractorTestingSupport } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideProtractorTestingSupport()],
};
