import {ApplicationConfig} from '@angular/core';
import {provideProtractorTestingSupport} from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [
    provideProtractorTestingSupport(), //only needed for docs e2e testing
  ],
};

export default appConfig;
