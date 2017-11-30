#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as path from 'path';
import * as ts from 'typescript';
import * as assert from 'assert';
import {__NGTOOLS_PRIVATE_API_2, readConfiguration} from '@angular/compiler-cli';

/* tslint:disable:no-console  */
/**
 * Main method.
 * Standalone program that executes codegen using the ngtools API and tests that files were
 * properly read and wrote.
 */
function main() {
  console.log(`testing ngtools API...`);

  Promise.resolve()
      .then(() => lazyRoutesTest())
      .then(() => {
        console.log('All done!');
        process.exit(0);
      })
      .catch((err) => {
        console.error(err.stack);
        console.error('Test failed');
        process.exit(1);
      });
}

function lazyRoutesTest() {
  const basePath = path.join(__dirname, '../ngtools_src');
  const project = path.join(basePath, 'tsconfig-build.json');

  const config = readConfiguration(project);
  const host = ts.createCompilerHost(config.options, true);
  const program = ts.createProgram(config.rootNames, config.options, host);

  config.options.basePath = basePath;

  const lazyRoutes = __NGTOOLS_PRIVATE_API_2.listLazyRoutes(
      {program, host, angularCompilerOptions: config.options, entryModule: 'app.module#AppModule'});

  const expectations: {[route: string]: string} = {
    './lazy.module#LazyModule': 'lazy.module.ts',
    './feature/feature.module#FeatureModule': 'feature/feature.module.ts',
    './feature/lazy-feature.module#LazyFeatureModule': 'feature/lazy-feature.module.ts',
    './feature.module#FeatureModule': 'feature/feature.module.ts',
    './lazy-feature-nested.module#LazyFeatureNestedModule': 'feature/lazy-feature-nested.module.ts',
    'feature2/feature2.module#Feature2Module': 'feature2/feature2.module.ts',
    './default.module': 'feature2/default.module.ts',
    'feature/feature.module#FeatureModule': 'feature/feature.module.ts'
  };

  Object.keys(lazyRoutes).forEach((route: string) => {
    assert(route in expectations, `Found a route that was not expected: "${route}".`);
    assert(
        lazyRoutes[route] == path.join(basePath, expectations[route]),
        `Route "${route}" does not point to the expected absolute path ` +
            `"${path.join(basePath, expectations[route])}". It points to "${lazyRoutes[route]}"`);
  });

  // Verify that all expectations were met.
  assert.deepEqual(
      Object.keys(lazyRoutes), Object.keys(expectations), `Expected routes listed to be: \n` +
          `  ${JSON.stringify(Object.keys(expectations))}\n` +
          `Actual:\n` +
          `  ${JSON.stringify(Object.keys(lazyRoutes))}\n`);
}

main();
