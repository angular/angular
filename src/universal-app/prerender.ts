import 'reflect-metadata';
import 'zone.js';

import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {join} from 'path';
import {readFileSync} from 'fs-extra';
import {KitchenSinkServerModuleNgFactory} from './kitchen-sink/kitchen-sink.ngfactory';

enableProdMode();

const result = renderModuleFactory(KitchenSinkServerModuleNgFactory, {
  document: readFileSync(join(__dirname, 'index.html'), 'utf-8')
});

result.then(html => console.log(html));
