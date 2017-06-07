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

import {Migrator} from './migrator';
import {normalizeI18nFormat, normalizeMapping, normalizeI18nVersion, resolveFiles, normalizeResolve} from './codegen';

/**
 * Migrate i18n messages from an old version to the last one
 */
function migrate(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.I18nMigrationCliOptions,
    program: ts.Program, host: ts.CompilerHost): Promise<string[]> {
  return Migrator.create(ngOptions, program, host, resolveFiles(cliOptions.files))
      .migrate(
          normalizeI18nFormat(cliOptions.i18nFormat), normalizeI18nVersion(cliOptions.i18nVersion),
          normalizeMapping(cliOptions.mapping), normalizeResolve(cliOptions.resolve));
}

// Entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  const project = args.p || args.project || '.';
  const cliOptions = new tsc.I18nMigrationCliOptions(args);
  tsc.main(project, cliOptions, migrate, {noEmit: true})
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Migration failed');
        process.exit(1);
      });
}
