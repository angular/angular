import 'reflect-metadata';
require('zone.js/dist/zone-node.js');

import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {KitchenSinkServerModuleNgFactory} from './dist/aot/kitchen-sink/kitchen-sink.ngfactory';
import {readFileSync} from 'fs-extra';

enableProdMode();

const result = renderModuleFactory(KitchenSinkServerModuleNgFactory, {
  document: readFileSync('src/universal-app/index.html', 'utf-8')
});

result.then(html => console.log(html));
