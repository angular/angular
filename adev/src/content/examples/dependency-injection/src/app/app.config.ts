import {ApplicationConfig} from '@angular/core';
import {Logger} from './logger.service';
import {UserService} from './user.service';
import {APP_CONFIG, HERO_DI_CONFIG} from './injection.config';
import {provideProtractorTestingSupport} from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [
    provideProtractorTestingSupport(),
    Logger,
    UserService,
    {provide: APP_CONFIG, useValue: HERO_DI_CONFIG},
  ],
};

export default appConfig;
