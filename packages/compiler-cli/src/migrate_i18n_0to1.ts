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

import {normalizeFiles, normalizeI18nFormat, normalizeResolve} from './i18n_options';
import {V0ToV1Migration} from './migration/v0_to_v1';

export class CliOptions extends tsc.CliOptions {
  public i18nFormat: string|null;
  public files: string|null;
  public resolve: string|null;

  constructor({i18nFormat = null, files = null, resolve = null}: {
    i18nFormat?: string,
    files?: string,
    resolve?: string,
  }) {
    super({});
    this.i18nFormat = i18nFormat;
    this.files = files;
    this.resolve = resolve;
  }
}

/**
 * Extract i18n messages from the Angular templates
 */
function extract(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: CliOptions, program: ts.Program,
    host: ts.CompilerHost) {
  const files = normalizeFiles(cliOptions.files);
  const format = normalizeI18nFormat(cliOptions.i18nFormat);
  const autoResolve = normalizeResolve(cliOptions.resolve);

  const migration = V0ToV1Migration.create(ngOptions, program, host, files, format, autoResolve);

  return migration.execute();
}

// Entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  const project = args.p || args.project || '.';
  const cliOptions = new CliOptions(args);

  tsc.main(project, cliOptions, extract, {noEmit: true})
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Migration failed');
        process.exit(1);
      });
}
