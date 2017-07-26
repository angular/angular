/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import {isSyntaxError, syntaxError} from '@angular/compiler';
import {MetadataBundler, createBundleIndexHost} from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as api from './transformers/api';
import * as ng from './transformers/entry_points';

const TS_EXT = /\.ts$/;

type Diagnostics = ts.Diagnostic[] | api.Diagnostic[];

function isTsDiagnostics(diagnostics: any): diagnostics is ts.Diagnostic[] {
  return diagnostics && diagnostics[0] && (diagnostics[0].file || diagnostics[0].messageText);
}

function formatDiagnostics(cwd: string, diags: Diagnostics): string {
  if (diags && diags.length) {
    if (isTsDiagnostics(diags)) {
      return ts.formatDiagnostics(diags, {
        getCurrentDirectory: () => cwd,
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => ts.sys.newLine
      });
    } else {
      return diags
          .map(d => {
            let res = api.DiagnosticCategory[d.category];
            if (d.span) {
              res +=
                  ` at ${d.span.start.file.url}(${d.span.start.line + 1},${d.span.start.col + 1})`;
            }
            if (d.span && d.span.details) {
              res += `: ${d.span.details}, ${d.message}\n`;
            } else {
              res += `: ${d.message}\n`;
            }
            return res;
          })
          .join();
    }
  } else
    return '';
}

function check(cwd: string, ...args: Diagnostics[]) {
  if (args.some(diags => !!(diags && diags[0]))) {
    throw syntaxError(args.map(diags => {
                            if (diags && diags[0]) {
                              return formatDiagnostics(cwd, diags);
                            }
                          })
                          .filter(message => !!message)
                          .join(''));
  }
}

function syntheticError(message: string): ts.Diagnostic {
  return {
    file: null as any as ts.SourceFile,
    start: 0,
    length: 0,
    messageText: message,
    category: ts.DiagnosticCategory.Error,
    code: 0
  };
}

export function readConfiguration(
    project: string, basePath: string, checkFunc: (cwd: string, ...args: any[]) => void = check,
    existingOptions?: ts.CompilerOptions) {
  // Allow a directory containing tsconfig.json as the project value
  // Note, TS@next returns an empty array, while earlier versions throw
  const projectFile =
      fs.lstatSync(project).isDirectory() ? path.join(project, 'tsconfig.json') : project;
  let {config, error} = ts.readConfigFile(projectFile, ts.sys.readFile);

  if (error) checkFunc(basePath, [error]);
  const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);

  checkFunc(basePath, parsed.errors);

  // Default codegen goes to the current directory
  // Parsed options are already converted to absolute paths
  const ngOptions = config.angularCompilerOptions || {};
  // Ignore the genDir option
  ngOptions.genDir = basePath;

  return {parsed, ngOptions};
}

function getProjectDirectory(project: string): string {
  let isFile: boolean;
  try {
    isFile = fs.lstatSync(project).isFile();
  } catch (e) {
    // Project doesn't exist. Assume it is a file has an extension. This case happens
    // when the project file is passed to set basePath but no tsconfig.json file exists.
    // It is used in tests to ensure that the options can be passed in without there being
    // an actual config file.
    isFile = path.extname(project) !== '';
  }

  // If project refers to a file, the project directory is the file's parent directory
  // otherwise project is the project directory.
  return isFile ? path.dirname(project) : project;
}

export function performCompilation(
    basePath: string, files: string[], options: ts.CompilerOptions, ngOptions: any,
    consoleError: (s: string) => void = console.error,
    checkFunc: (cwd: string, ...args: any[]) => void = check, tsCompilerHost?: ts.CompilerHost) {
  try {
    ngOptions.basePath = basePath;
    ngOptions.genDir = basePath;

    let host = tsCompilerHost || ts.createCompilerHost(options, true);
    host.realpath = p => p;

    const rootFileNames = files.map(f => path.normalize(f));

    const addGeneratedFileName =
        (fileName: string) => {
          if (fileName.startsWith(basePath) && TS_EXT.exec(fileName)) {
            rootFileNames.push(fileName);
          }
        }

    if (ngOptions.flatModuleOutFile && !ngOptions.skipMetadataEmit) {
      const {host: bundleHost, indexName, errors} =
          createBundleIndexHost(ngOptions, rootFileNames, host);
      if (errors) checkFunc(basePath, errors);
      if (indexName) addGeneratedFileName(indexName);
      host = bundleHost;
    }

    const ngHostOptions = {...options, ...ngOptions};
    const ngHost = ng.createHost({tsHost: host, options: ngHostOptions});

    const ngProgram =
        ng.createProgram({rootNames: rootFileNames, host: ngHost, options: ngHostOptions});

    // Check parameter diagnostics
    checkFunc(basePath, ngProgram.getTsOptionDiagnostics(), ngProgram.getNgOptionDiagnostics());

    // Check syntactic diagnostics
    checkFunc(basePath, ngProgram.getTsSyntacticDiagnostics());

    // Check TypeScript semantic and Angular structure diagnostics
    checkFunc(
        basePath, ngProgram.getTsSemanticDiagnostics(), ngProgram.getNgStructuralDiagnostics());

    // Check Angular semantic diagnostics
    checkFunc(basePath, ngProgram.getNgSemanticDiagnostics());

    ngProgram.emit({
      emitFlags: api.EmitFlags.Default |
          ((ngOptions.skipMetadataEmit || ngOptions.flatModuleOutFile) ? 0 : api.EmitFlags.Metadata)
    });
  } catch (e) {
    if (isSyntaxError(e)) {
      console.error(e.message);
      consoleError(e.message);
      return 1;
    }
  }

  return 0;
}


export function main(
    args: string[], consoleError: (s: string) => void = console.error,
    checkFunc: (cwd: string, ...args: any[]) => void = check): number {
  try {
    const parsedArgs = require('minimist')(args);
    const project = parsedArgs.p || parsedArgs.project || '.';

    const projectDir = fs.lstatSync(project).isFile() ? path.dirname(project) : project;

    // file names in tsconfig are resolved relative to this absolute path
    const basePath = path.resolve(process.cwd(), projectDir);
    const {parsed, ngOptions} = readConfiguration(project, basePath, checkFunc);
    return performCompilation(
        basePath, parsed.fileNames, parsed.options, ngOptions, consoleError, checkFunc);
  } catch (e) {
    consoleError(e.stack);
    consoleError('Compilation failed');
    return 2;
  }
}

// CLI entry point
if (require.main === module) {
  process.exit(main(process.argv.slice(2), s => console.error(s)));
}
