/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

import {CliOptions} from './cli_options';
import {MetadataWriterHost} from './compiler_host';

import {CodegenExtension, createBundleIndexHost} from './main_no_tsickle';
import {check, tsc} from './tsc';
import {VinylFile, isVinylFile} from './vinyl_file';

const TS_EXT = /\.ts$/;

export function main(
    project: string | VinylFile, cliOptions: CliOptions, codegen?: CodegenExtension,
    options?: ts.CompilerOptions): Promise<any> {
  try {
    let projectDir = project;
    // project is vinyl like file object
    if (isVinylFile(project)) {
      projectDir = path.dirname(project.path);
    }
    // project is path to project file
    else if (fs.lstatSync(project).isFile()) {
      projectDir = path.dirname(project);
    }

    // file names in tsconfig are resolved relative to this absolute path
    const basePath = path.resolve(process.cwd(), cliOptions.basePath || projectDir);

    // read the configuration options from wherever you store them
    let {parsed, ngOptions} = tsc.readConfiguration(project, basePath, options);
    ngOptions.basePath = basePath;
    let rootFileNames: string[] = parsed.fileNames.slice(0);
    const createProgram = (host: ts.CompilerHost, oldProgram?: ts.Program) => {
      return ts.createProgram(rootFileNames.slice(0), parsed.options, host, oldProgram);
    };
    const addGeneratedFileName = (genFileName: string) => {
      if (genFileName.startsWith(basePath) && TS_EXT.exec(genFileName)) {
        rootFileNames.push(genFileName);
      }
    };

    const diagnostics = (parsed.options as any).diagnostics;
    if (diagnostics) (ts as any).performance.enable();

    let host = ts.createCompilerHost(parsed.options, true);
    // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
    // https://github.com/Microsoft/TypeScript/issues/9552
    host.realpath = (fileName: string) => fileName;

    // If the compilation is a flat module index then produce the flat module index
    // metadata and the synthetic flat module index.
    if (ngOptions.flatModuleOutFile && !ngOptions.skipMetadataEmit) {
      const {host: bundleHost, indexName, errors} =
          createBundleIndexHost(ngOptions, rootFileNames, host);
      if (errors) check(errors);
      if (indexName) addGeneratedFileName(indexName);
      host = bundleHost;
    }

    const tsickleHost: tsickle.TsickleHost = {
      shouldSkipTsickleProcessing: (fileName) => /\.d\.ts$/.test(fileName),
      pathToModuleName: (context, importPath) => '',
      shouldIgnoreWarningsForPath: (filePath) => false,
      fileNameToModuleId: (fileName) => fileName,
      googmodule: false,
      untyped: true,
      convertIndexImportShorthand: false,
      transformDecorators: ngOptions.annotationsAs !== 'decorators',
      transformTypesToClosure: ngOptions.annotateForClosureCompiler,
    };

    const program = createProgram(host);

    const errors = program.getOptionsDiagnostics();
    check(errors);

    if (ngOptions.skipTemplateCodegen || !codegen) {
      codegen = () => Promise.resolve([]);
    }

    if (diagnostics) console.time('NG codegen');
    return codegen(ngOptions, cliOptions, program, host).then((genFiles) => {
      if (diagnostics) console.timeEnd('NG codegen');

      // Add the generated files to the configuration so they will become part of the program.
      if (ngOptions.alwaysCompileGeneratedCode) {
        genFiles.forEach(genFileName => addGeneratedFileName(genFileName));
      }
      if (!ngOptions.skipMetadataEmit) {
        host = new MetadataWriterHost(host, ngOptions, true);
      }

      // Create a new program since codegen files were created after making the old program
      let programWithCodegen = createProgram(host, program);
      tsc.typeCheck(host, programWithCodegen);

      if (diagnostics) console.time('Emit');
      const {diagnostics: emitDiags} =
          tsickle.emitWithTsickle(programWithCodegen, tsickleHost, host, ngOptions);
      if (diagnostics) console.timeEnd('Emit');
      check(emitDiags);

      if (diagnostics) {
        (ts as any).performance.forEachMeasure(
            (name: string, duration: number) => { console.error(`TS ${name}: ${duration}ms`); });
      }
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  let {options, errors} = (ts as any).parseCommandLine(args);
  check(errors);
  const project = options.project || '.';
  // TODO(alexeagle): command line should be TSC-compatible, remove "CliOptions" here
  const cliOptions = new CliOptions(require('minimist')(args));
  main(project, cliOptions, undefined, options)
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
      });
}
