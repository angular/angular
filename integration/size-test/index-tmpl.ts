import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './$TEST_FILE.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
