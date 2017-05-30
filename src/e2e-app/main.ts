import {platformBrowser} from '@angular/platform-browser';
import {E2eAppModuleNgFactory} from './e2e-app-module.ngfactory';

platformBrowser().bootstrapModuleFactory(E2eAppModuleNgFactory);
