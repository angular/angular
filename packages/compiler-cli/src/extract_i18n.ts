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

import * as tsc from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {normalizeI18nVersion, normalizeI18nFormat} from './i18n_options';

import {Extractor} from './extractor';

/**
 * Extract i18n messages from the Angular templates
 */
function extract(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.I18nExtractionCliOptions,
    program: ts.Program, host: ts.CompilerHost) {
  const version = normalizeI18nVersion(cliOptions.i18nVersion);
  const format = normalizeI18nFormat(cliOptions.i18nFormat);

  return Extractor.create(version, ngOptions, program, host, cliOptions.locale)
      .extract(format, cliOptions.outFile);
}

// Entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  const project = args.p || args.project || '.';
  const cliOptions = new tsc.I18nExtractionCliOptions(args);
  tsc.main(project, cliOptions, extract, {noEmit: true})
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Extraction failed');
        process.exit(1);
      });
}
