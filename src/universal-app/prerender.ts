import 'reflect-metadata';
import 'zone.js';

// We need to mock a few native DOM globals as those are not present on the server, but they
// are required for decorator metadata. The View Engine compiler preserves Angular decorator
// metadata in the JS output. This could mean for example that inputs which are typed to
// `HTMLElement` break on the server, as the `__decorate` call requires the `HTMLElement`
// global to be present. More details: https://github.com/angular/angular/issues/30586.
(global as any).HTMLElement = {};
(global as any).Event = {};
(global as any).TransitionEvent = {};

import {renderModuleFactory} from '@angular/platform-server';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

import {KitchenSinkRootServerModuleNgFactory} from './kitchen-sink-root.ngfactory';

// Do not enable production mode, because otherwise the `MatCommonModule` won't execute
// the browser related checks that could cause NodeJS issues.

// Resolve the path to the "index.html" through Bazel runfile resolution.
const indexHtmlPath = require.resolve('./index.html');

const result = renderModuleFactory(
    KitchenSinkRootServerModuleNgFactory,
    {document: readFileSync(indexHtmlPath, 'utf-8')});

result
  .then(content => {
    const filename = join(__dirname, 'index-prerendered.html');

    console.log('Inspect pre-rendered page here:');
    console.log(`file://${filename}`);
    writeFileSync(filename, content, 'utf-8');
    console.log('Prerender done.');
  })
  // If rendering the module factory fails, print the error and exit the process
  // with a non-zero exit code.
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
