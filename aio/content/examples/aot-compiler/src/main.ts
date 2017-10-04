// #docregion
import { platformBrowser }    from '@angular/platform-browser';
import { AppModuleNgFactory } from './app/app.module.ngfactory';

console.log('Running AOT compiled');
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
