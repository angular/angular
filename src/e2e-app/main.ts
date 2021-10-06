import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {MainModule} from './main-module';

enableProdMode();

platformBrowser().bootstrapModule(MainModule);
