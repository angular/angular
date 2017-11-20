import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {readFileSync, writeFileSync} from 'fs-extra';
import {log} from 'gulp-util';
import {join} from 'path';
import 'reflect-metadata';
import 'zone.js';
import {KitchenSinkServerModuleNgFactory} from './kitchen-sink/kitchen-sink.ngfactory';

enableProdMode();

const result = renderModuleFactory(KitchenSinkServerModuleNgFactory, {
  document: readFileSync(join(__dirname, 'index.html'), 'utf-8')
});

result
  .then(content => {
    writeFileSync(join(__dirname, 'index-prerendered.html'), content, 'utf-8');
    log('Prerender done.');
  })
  // If rendering the module factory fails, exit the process with an error code because otherwise
  // the CI task will not recognize the failure and will show as "success". The error message
  // will be printed automatically by the `renderModuleFactory` method.
  .catch(() => process.exit(1));
