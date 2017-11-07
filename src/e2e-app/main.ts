import {platformBrowser} from '@angular/platform-browser';
import {E2eAppModuleNgFactory} from './e2e-app-module.ngfactory';
import {enableProdMode} from '@angular/core';

enableProdMode();

platformBrowser().bootstrapModuleFactory(E2eAppModuleNgFactory);
