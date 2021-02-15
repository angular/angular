import 'zone.js/node';

import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {AppModuleNgFactory} from './app.ngfactory';

enableProdMode();
renderModuleFactory(AppModuleNgFactory, {
  document: '<test-app></test-app>',
  url: '/',
}).then(html => {
  if (/>0:0</.test(html)) {
    process.exit(0);
  } else {
    console.error('html was', html);
    process.exit(1);
  }
}).catch(err => {
  console.error(err);
  process.exit(2);
})