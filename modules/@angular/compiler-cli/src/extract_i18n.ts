#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Extract i18n messages from source code
 */
// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import * as tsc from '@angular/tsc-wrapped';
import * as path from 'path';
import * as ts from 'typescript';

import {Extractor} from './extractor';

function extract(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.I18nExtractionCliOptions,
    program: ts.Program, host: ts.CompilerHost) {
  const resourceLoader: compiler.ResourceLoader = {
    get: (s: string) => {
      if (!host.fileExists(s)) {
        // TODO: We should really have a test for error cases like this!
        throw new Error(`Compilation failed. Resource file not found: ${s}`);
      }
      return Promise.resolve(host.readFile(s));
    }
  };
  const extractor =
      Extractor.create(ngOptions, cliOptions.i18nFormat, program, host, resourceLoader);

  const bundlePromise: Promise<compiler.MessageBundle> = extractor.extract();

  return (bundlePromise).then(messageBundle => {
    let ext: string;
    let serializer: compiler.Serializer;
    const format = (cliOptions.i18nFormat || 'xlf').toLowerCase();

    switch (format) {
      case 'xmb':
        ext = 'xmb';
        serializer = new compiler.Xmb();
        break;
      case 'xliff':
      case 'xlf':
      default:
        const htmlParser = new compiler.I18NHtmlParser(new compiler.HtmlParser());
        ext = 'xlf';
        serializer = new compiler.Xliff(htmlParser, compiler.DEFAULT_INTERPOLATION_CONFIG);
        break;
    }

    const dstPath = path.join(ngOptions.genDir, `messages.${ext}`);
    host.writeFile(dstPath, messageBundle.write(serializer), false);
  });
}

// Entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  const project = args.p || args.project || '.';
  const cliOptions = new tsc.I18nExtractionCliOptions(args);
  tsc.main(project, cliOptions, extract)
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Extraction failed');
        process.exit(1);
      });
}
