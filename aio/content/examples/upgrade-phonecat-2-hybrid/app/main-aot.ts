// #docregion
import { platformBrowser } from '@angular/platform-browser';

import { AppModuleNgFactory } from './app.module.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
