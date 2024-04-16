import { ApplicationConfig } from '@angular/core';
import { provideProtractorTestingSupport } from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [provideProtractorTestingSupport()],
};

export default appConfig;
