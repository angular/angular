import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {init} from './init';
import {AppModuleNgFactory} from './tree.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory).then(init);
