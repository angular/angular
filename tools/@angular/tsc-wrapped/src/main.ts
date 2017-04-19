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

import {check, tsc} from './tsc';

import NgOptions from './options';
import {MetadataWriterHost, SyntheticIndexHost} from './compiler_host';
import {CliOptions} from './cli_options';
import {VinylFile, isVinylFile} from './vinyl_file';
import {MetadataBundler, CompilerHostAdapter} from './bundler';
import {privateEntriesToIndex} from './index_writer';
export {UserError} from './tsc';

const DTS = /\.d\.ts$/;
const JS_EXT = /(\.js|)$/;

export type CodegenExtension =
    (ngOptions: NgOptions, cliOptions: CliOptions, program: ts.Program, host: ts.CompilerHost) =>
        Promise<void>;

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
    const {parsed, ngOptions} = tsc.readConfiguration(project, basePath, options);
    ngOptions.basePath = basePath;
    const createProgram = (host: ts.CompilerHost, oldProgram?: ts.Program) =>
        ts.createProgram(parsed.fileNames, parsed.options, host, oldProgram);
    const diagnostics = (parsed.options as any).diagnostics;
    if (diagnostics) (ts as any).performance.enable();

    let host = ts.createCompilerHost(parsed.options, true);

    // If the compilation is a flat module index then produce the flat module index
    // metadata and the synthetic flat module index.
    if (ngOptions.flatModuleOutFile && !ngOptions.skipMetadataEmit) {
      const files = parsed.fileNames.filter(f => !DTS.test(f));
      if (files.length != 1) {
        check([{
          file: null,
          start: null,
          length: null,
          messageText:
              'Angular compiler option "flatModuleIndex" requires one and only one .ts file in the "files" field.',
          category: ts.DiagnosticCategory.Error,
          code: 0
        }]);
      }
      const file = files[0];
      const indexModule = file.replace(/\.ts$/, '');
      const bundler =
          new MetadataBundler(indexModule, ngOptions.flatModuleId, new CompilerHostAdapter(host));
      if (diagnostics) console.time('NG flat module index');
      const metadataBundle = bundler.getMetadataBundle();
      if (diagnostics) console.timeEnd('NG flat module index');
      const metadata = JSON.stringify(metadataBundle.metadata);
      const name =
          path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile.replace(JS_EXT, '.ts'));
      const libraryIndex = `./${path.basename(indexModule)}`;
      const content = privateEntriesToIndex(libraryIndex, metadataBundle.privates);
      host = new SyntheticIndexHost(host, {name, content, metadata});
      parsed.fileNames.push(name);
    }

    const tsickleCompilerHostOptions: tsickle.Options = {
      googmodule: false,
      untyped: true,
      convertIndexImportShorthand:
          ngOptions.target === ts.ScriptTarget.ES2015,  // This covers ES6 too
    };

    const tsickleHost: tsickle.TsickleHost = {
      shouldSkipTsickleProcessing: (fileName) => /\.d\.ts$/.test(fileName),
      pathToModuleName: (context, importPath) => '',
      shouldIgnoreWarningsForPath: (filePath) => false,
      fileNameToModuleId: (fileName) => fileName,
    };

    const tsickleCompilerHost =
        new tsickle.TsickleCompilerHost(host, ngOptions, tsickleCompilerHostOptions, tsickleHost);

    const program = createProgram(tsickleCompilerHost);

    const errors = program.getOptionsDiagnostics();
    check(errors);

    if (ngOptions.skipTemplateCodegen || !codegen) {
      codegen = () => Promise.resolve(null);
    }

    if (diagnostics) console.time('NG codegen');
    return codegen(ngOptions, cliOptions, program, host).then(() => {
      if (diagnostics) console.timeEnd('NG codegen');
      let definitionsHost: ts.CompilerHost = tsickleCompilerHost;
      if (!ngOptions.skipMetadataEmit) {
        // if tsickle is not not used for emitting, but we do use the MetadataWriterHost,
        // it also needs to emit the js files.
        const emitJsFiles =
            ngOptions.annotationsAs === 'decorators' && !ngOptions.annotateForClosureCompiler;
        definitionsHost = new MetadataWriterHost(tsickleCompilerHost, ngOptions, emitJsFiles);
      }
      // Create a new program since codegen files were created after making the old program
      let programWithCodegen = createProgram(definitionsHost, program);
      tsc.typeCheck(host, programWithCodegen);

      let programForJsEmit = programWithCodegen;

      if (ngOptions.annotationsAs !== 'decorators') {
        if (diagnostics) console.time('NG downlevel');
        tsickleCompilerHost.reconfigureForRun(programForJsEmit, tsickle.Pass.DECORATOR_DOWNLEVEL);
        // A program can be re-used only once; save the programWithCodegen to be reused by
        // metadataWriter
        programForJsEmit = createProgram(tsickleCompilerHost);
        check(tsickleCompilerHost.diagnostics);
        if (diagnostics) console.timeEnd('NG downlevel');
      }

      if (ngOptions.annotateForClosureCompiler) {
        if (diagnostics) console.time('NG JSDoc');
        tsickleCompilerHost.reconfigureForRun(programForJsEmit, tsickle.Pass.CLOSURIZE);
        programForJsEmit = createProgram(tsickleCompilerHost);
        check(tsickleCompilerHost.diagnostics);
        if (diagnostics) console.timeEnd('NG JSDoc');
      }

      // Emit *.js and *.js.map
      tsc.emit(programForJsEmit);

      // Emit *.d.ts and maybe *.metadata.json
      // Not in the same emit pass with above, because tsickle erases
      // decorators which we want to read or document.
      // Do this emit second since TypeScript will create missing directories for us
      // in the standard emit.
      tsc.emit(programWithCodegen);

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
  main(project, cliOptions, null, options)
      .then((exitCode: any) => process.exit(exitCode))
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
      });
}
