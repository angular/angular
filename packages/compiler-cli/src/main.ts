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
import * as fs from 'fs';
import * as path from 'path';
import * as ngc from './ngc';

import {isSyntaxError} from '@angular/compiler';

import {readConfiguration} from './perform-compile';

import {CodeGenerator} from './codegen';

function codegen(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program,
    host: ts.CompilerHost) {
  if (ngOptions.enableSummariesForJit === undefined) {
    // default to false
    ngOptions.enableSummariesForJit = false;
  }
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
  const args = process.argv.slice(2);
  const parsedArgs = require('minimist')(args);
  const project = parsedArgs.p || parsedArgs.project || '.';

  const projectDir = fs.lstatSync(project).isFile() ? path.dirname(project) : project;

  // file names in tsconfig are resolved relative to this absolute path
  const basePath = path.resolve(process.cwd(), projectDir);
  const {ngOptions} = readConfiguration(project, basePath);

  if (ngOptions.disableTransformerPipeline) {
    main(parsedArgs).then((exitCode: number) => process.exit(exitCode));
  } else {
    process.exit(ngc.main(args, s => console.error(s)));
  }
}
