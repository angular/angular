import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {init} from './init';
import {AppModule} from './tree';

export function main() {
  enableProdMode();
  platformBrowserDynamic().bootstrapModule(AppModule).then(init);
}
