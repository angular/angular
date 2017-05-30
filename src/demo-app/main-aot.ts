/**
 * This is the main entry-point for the AOT compilation. File will be used to test AOT support.
 */

import {platformBrowser} from '@angular/platform-browser';
import {DemoAppModuleNgFactory} from './demo-app-module.ngfactory';

platformBrowser().bootstrapModuleFactory(DemoAppModuleNgFactory);
