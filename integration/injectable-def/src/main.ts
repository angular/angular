// ZoneJS does not add any package exports right now, so we need to directly
// reference the ESM entry-point for ZoneJS in NodeJS.
// TODO: Replace this with a package import if ZoneJS sets the `exports` field.
import 'zone.js/fesm2015/zone-node.js';

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
