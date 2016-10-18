import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app';
import {init} from './init';

export function main() {
  enableProdMode();
  platformBrowserDynamic().bootstrapModule(AppModule).then(init);
}
