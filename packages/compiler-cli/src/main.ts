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

import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import {isSyntaxError} from '@angular/compiler';

import {CodeGenerator} from './codegen';

function codegen(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program,
    host: ts.CompilerHost) {
  return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
}

export function main(
    args: any, consoleError: (s: string) => void = console.error): Promise<number> {
  const project = args.p || args.project || '.';
  const cliOptions = new tsc.NgcCliOptions(args);

  return tsc.main(project, cliOptions, codegen).then(() => 0).catch(e => {
    if (e instanceof tsc.UserError || isSyntaxError(e)) {
      consoleError(e.message);
      return Promise.resolve(1);
    } else {
      consoleError(e.stack);
      consoleError('Compilation failed');
      return Promise.resolve(1);
    }
  });
}

// CLI entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  main(args).then((exitCode: number) => process.exit(exitCode));
}
