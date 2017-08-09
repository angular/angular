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
import * as api from './transformers/api';
import {performCompilation, readConfiguration, createPerformCompilationHost, PerformCompilationHost} from './perform-compile';

import {isSyntaxError} from '@angular/compiler';

import {CodeGenerator} from './codegen';

// Merge command line parameters
function mergeCommandLine(
    cliArgs: {[k: string]: string}, options: api.CompilerOptions): api.CompilerOptions {
  if (cliArgs.i18nFile) options.i18nInFile = cliArgs.i18nFile;
  if (cliArgs.i18nFormat) options.i18nInFormat = cliArgs.i18nFormat;
  if (cliArgs.locale) options.i18nInLocale = cliArgs.locale;
  const mt = cliArgs.missingTranslation;
  if (mt === 'error' || mt === 'warning' || mt === 'ignore') {
    options.i18nInMissingTranslations = mt;
  }
  return options;
}

// Wrap the PerformCompilationHost to merge in command line arguments into the options
function createPerformCompilationHostWithCommandLineOptions(
    cliArgs: {[k: string]: string}, delegate: PerformCompilationHost) {
  const host = Object.create(delegate);
  host.readConfiguration = () => {
    const config = delegate.readConfiguration();
    config.options = mergeCommandLine(cliArgs, config.options);
    return config;
  };
  return host;
}

function ngcMain(args: any, consoleError: (s: string) => void = console.error):
    {exitCode: number, options?: ts.CompilerOptions} {
  const project = args.p || args.project || '.';
  const projectDir = fs.lstatSync(project).isFile() ? path.dirname(project) : project;

  // file names in tsconfig are resolved relative to this absolute path
  const basePath = path.resolve(process.cwd(), projectDir);
  const performCompilationHost = createPerformCompilationHostWithCommandLineOptions(
      args, createPerformCompilationHost(project, basePath, consoleError));

  const {exitCode, parsedConfig} = performCompilation(project, basePath, performCompilationHost);
  return {exitCode, options: parsedConfig ? parsedConfig.options : undefined};
}

function disabledTransformerPipelineCodegen(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program,
    host: ts.CompilerHost) {
  if (ngOptions.enableSummariesForJit === undefined) {
    // default to false
    ngOptions.enableSummariesForJit = false;
  }
  return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
}

function disabledTransformerPipelineNgcMain(
    args: any, consoleError: (s: string) => void = console.error): Promise<number> {
  const cliOptions = new tsc.NgcCliOptions(args);
  const project = args.p || args.project || '.';
  return tsc.main(project, cliOptions, disabledTransformerPipelineCodegen)
      .then(() => 0)
      .catch(e => {
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

export function mainSync(
    args: string[], consoleError: (s: string) => void = console.error): number {
  const parsedArgs = require('minimist')(args);
  const {exitCode, options} = ngcMain(parsedArgs, consoleError);
  if (options && options.disableTransformerPipeline) {
    consoleError(
        `Error: Option disableTransformerPipeline is not supported when running synchronously.`);
    return 1;
  }
  return exitCode;
}

export function main(
    args: string[], consoleError: (s: string) => void = console.error): Promise<number> {
  const parsedArgs = require('minimist')(args);

  const {exitCode, options} = ngcMain(parsedArgs, consoleError);
  if (exitCode === 0 && options && options.disableTransformerPipeline) {
    return disabledTransformerPipelineNgcMain(parsedArgs);
  }
  return Promise.resolve(exitCode);
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  main(args).then((exitCode: number) => process.exit(exitCode));
}
