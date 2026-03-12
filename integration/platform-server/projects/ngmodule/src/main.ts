import {platformBrowser} from '@angular/platform-browser';

import {AppModule} from './app/app.module';

(window as any)['doBootstrap'] = () => {
  platformBrowser().bootstrapModule(AppModule);
};
