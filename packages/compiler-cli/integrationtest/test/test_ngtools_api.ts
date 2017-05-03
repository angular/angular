#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as path from 'path';
import * as ts from 'typescript';
import * as assert from 'assert';
import {tsc} from '@angular/tsc-wrapped/src/tsc';
import {NodeCompilerHostContext, __NGTOOLS_PRIVATE_API_2} from '@angular/compiler-cli';

const glob = require('glob');

/**
 * Main method.
 * Standalone program that executes codegen using the ngtools API and tests that files were
 * properly read and wrote.
 */
function main() {
  console.log(`testing ngtools API...`);

  Promise.resolve()
      .then(() => codeGenTest())
      .then(() => codeGenTest(true))
      .then(() => i18nTest())
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

function codeGenTest(forceError = false) {
  const basePath = path.join(__dirname, '../ngtools_src');
  const srcPath = path.join(__dirname, '../src');
  const project = path.join(basePath, 'tsconfig-build.json');
  const readResources: string[] = [];
  const wroteFiles: string[] = [];

  const config = tsc.readConfiguration(project, basePath);
  const hostContext = new NodeCompilerHostContext();
  const delegateHost = ts.createCompilerHost(config.parsed.options, true);
  const host: ts.CompilerHost = Object.assign(
      {}, delegateHost,
      {writeFile: (fileName: string, ...rest: any[]) => { wroteFiles.push(fileName); }});
  const program = ts.createProgram(config.parsed.fileNames, config.parsed.options, host);

  config.ngOptions.basePath = basePath;

  console.log(`>>> running codegen for ${project}`);
  if (forceError) {
    console.log(`>>> asserting that missingTranslation param with error value throws`);
  }
  return __NGTOOLS_PRIVATE_API_2
      .codeGen({
        basePath,
        compilerOptions: config.parsed.options, program, host,

        angularCompilerOptions: config.ngOptions,

        // i18n options.
        i18nFormat: 'xlf',
        i18nFile: path.join(srcPath, 'messages.fi.xlf'),
        locale: 'fi',
        missingTranslation: forceError ? 'error' : 'ignore',

        readResource: (fileName: string) => {
          readResources.push(fileName);
          return hostContext.readResource(fileName);
        }
      })
      .then(() => {
        console.log(`>>> codegen done, asserting read and wrote files`);

        // Assert for each file that it has been read and each `ts` has a written file associated.
        const allFiles = glob.sync(path.join(basePath, '**/*'), {nodir: true});

        allFiles.forEach((fileName: string) => {
          // Skip tsconfig.
          if (fileName.match(/tsconfig-build.json$/)) {
            return;
          }

          // Assert that file was read.
          if (fileName.match(/\.module\.ts$/)) {
            const factory = fileName.replace(/\.module\.ts$/, '.module.ngfactory.ts');
            assert(wroteFiles.indexOf(factory) != -1, `Expected file "${factory}" to be written.`);
          } else if (fileName.match(/\.css$/) || fileName.match(/\.html$/)) {
            assert(
                readResources.indexOf(fileName) != -1,
                `Expected resource "${fileName}" to be read.`);
          }
        });

        console.log(`done, no errors.`);
      })
      .catch((e: Error) => {
        if (forceError) {
          assert(
              e.message.match(`Missing translation for message`),
              `Expected error message for missing translations`);
          console.log(`done, error catched`);
        } else {
          console.error(e.stack);
          console.error('Compilation failed');
          throw e;
        }
      });
}

function i18nTest() {
  const basePath = path.join(__dirname, '../ngtools_src');
  const project = path.join(basePath, 'tsconfig-build.json');
  const readResources: string[] = [];
  const wroteFiles: string[] = [];

  const config = tsc.readConfiguration(project, basePath);
  const hostContext = new NodeCompilerHostContext();
  const delegateHost = ts.createCompilerHost(config.parsed.options, true);
  const host: ts.CompilerHost = Object.assign(
      {}, delegateHost,
      {writeFile: (fileName: string, ...rest: any[]) => { wroteFiles.push(fileName); }});
  const program = ts.createProgram(config.parsed.fileNames, config.parsed.options, host);

  config.ngOptions.basePath = basePath;

  console.log(`>>> running i18n extraction for ${project}`);
  return __NGTOOLS_PRIVATE_API_2
      .extractI18n({
        basePath,
        compilerOptions: config.parsed.options, program, host,
        angularCompilerOptions: config.ngOptions,
        i18nFormat: 'xlf',
        locale: undefined,
        outFile: undefined,
        readResource: (fileName: string) => {
          readResources.push(fileName);
          return hostContext.readResource(fileName);
        },
      })
      .then(() => {
        console.log(`>>> i18n extraction done, asserting read and wrote files`);

        const allFiles = glob.sync(path.join(basePath, '**/*'), {nodir: true});

        assert(wroteFiles.length == 1, `Expected a single message bundle file.`);

        assert(
            wroteFiles[0].endsWith('/ngtools_src/messages.xlf'),
            `Expected the bundle file to be "message.xlf".`);

        allFiles.forEach((fileName: string) => {
          // Skip tsconfig.
          if (fileName.match(/tsconfig-build.json$/)) {
            return;
          }

          // Assert that file was read.
          if (fileName.match(/\.css$/) || fileName.match(/\.html$/)) {
            assert(
                readResources.indexOf(fileName) != -1,
                `Expected resource "${fileName}" to be read.`);
          }
        });

        console.log(`done, no errors.`);
      })
      .catch((e: Error) => {
        console.error(e.stack);
        console.error('Extraction failed');
        throw e;
      });
}

function lazyRoutesTest() {
  const basePath = path.join(__dirname, '../ngtools_src');
  const project = path.join(basePath, 'tsconfig-build.json');

  const config = tsc.readConfiguration(project, basePath);
  const host = ts.createCompilerHost(config.parsed.options, true);
  const program = ts.createProgram(config.parsed.fileNames, config.parsed.options, host);

  config.ngOptions.basePath = basePath;

  const lazyRoutes = __NGTOOLS_PRIVATE_API_2.listLazyRoutes({
    program,
    host,
    angularCompilerOptions: config.ngOptions,
    entryModule: 'app.module#AppModule'
  });

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
