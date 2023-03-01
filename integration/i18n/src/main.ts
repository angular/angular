import '@angular/localize/init'

import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app';

platformBrowser().bootstrapModule(AppModule);
