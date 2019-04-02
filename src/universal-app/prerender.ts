import 'reflect-metadata';
import 'zone.js';

import {renderModuleFactory} from '@angular/platform-server';
import {readFileSync, writeFileSync} from 'fs-extra';
import {log} from 'gulp-util';
import {join} from 'path';

import {KitchenSinkRootServerModuleNgFactory} from './kitchen-sink-root.ngfactory';

// Do not enable production mode, because otherwise the `MatCommonModule` won't execute
// the browser related checks that could cause NodeJS issues.

const result = renderModuleFactory(
    KitchenSinkRootServerModuleNgFactory,
    {document: readFileSync(join(__dirname, 'index.html'), 'utf-8')});

result
  .then(content => {
    const filename = join(__dirname, 'index-prerendered.html');

    console.log('Inspect pre-rendered page here:');
    console.log(`file://${filename}`);
    writeFileSync(filename, content, 'utf-8');
    log('Prerender done.');
  })
  // If rendering the module factory fails, exit the process with an error code because otherwise
  // the CI task will not recognize the failure and will show as "success". The error message
  // will be printed automatically by the `renderModuleFactory` method.
  .catch(() => process.exit(1));
