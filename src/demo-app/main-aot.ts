/**
 * This is the main entry-point for the AOT compilation. File will be used to test AOT support.
 */

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {DemoAppModuleNgFactory} from './demo-app-module.ngfactory';

platformBrowserDynamic().bootstrapModuleFactory(DemoAppModuleNgFactory);
