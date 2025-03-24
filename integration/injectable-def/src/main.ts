import 'zone.js/node';

// Load the Angular compiler as we will rely on JIT compilation for this test.
// This test does not use the CLI and we are not processing the framework packages
// with the linker here.
import '@angular/compiler';

import {enableProdMode} from '@angular/core';
import {renderModule} from '@angular/platform-server';
import {AppModule} from './app.js';

enableProdMode();
renderModule(AppModule, {
  document: '<test-app></test-app>',
  url: '/',
})
  .then((html) => {
    if (/>0:0</.test(html)) {
      process.exit(0);
    } else {
      console.error('html was', html);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(2);
  });
