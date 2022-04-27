import '@angular/localize/init'

import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app.js';

platformBrowser().bootstrapModule(AppModule);
