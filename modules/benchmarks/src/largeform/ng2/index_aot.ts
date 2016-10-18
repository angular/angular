import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {AppModuleNgFactory} from './app.ngfactory';
import {init} from './init';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory).then(init);
