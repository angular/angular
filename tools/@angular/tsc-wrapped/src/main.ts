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

    // HACK: patch the realpath to solve symlink issue here:
    // https://github.com/Microsoft/TypeScript/issues/9552
    // todo(misko): remove once facade symlinks are removed
    host.realpath = (path) => path;

    // If the comilation is a bundle index then produce the bundle index metadata and
    // the synthetic bundle index.
    if (ngOptions.bundleIndex && !ngOptions.skipMetadataEmit) {
      const files = parsed.fileNames.filter(f => !DTS.test(f));
      if (files.length != 1 && (!ngOptions.libraryIndex || files.length < 1)) {
        check([{
          file: null,
          start: null,
          length: null,
          messageText:
              'Angular compiler option "bundleIndex" requires one and only one .ts file in the "files" field or "libraryIndex" to also be specified in order to select which module to use as the library index',
          category: ts.DiagnosticCategory.Error,
          code: 0
        }]);
      }
      const file = files[0];
      const indexModule = file.replace(/\.ts$/, '');
      const libraryIndexModule = ngOptions.libraryIndex ?
          MetadataBundler.resolveModule(ngOptions.libraryIndex, indexModule) :
          indexModule;
      const bundler =
          new MetadataBundler(indexModule, ngOptions.importAs, new CompilerHostAdapter(host));
      if (diagnostics) console.time('NG bundle index');
      const metadataBundle = bundler.getMetadataBundle();
      if (diagnostics) console.timeEnd('NG bundle index');
      const metadata = JSON.stringify(metadataBundle.metadata);
      const name = path.join(path.dirname(libraryIndexModule), ngOptions.bundleIndex + '.ts');
      const libraryIndex = ngOptions.libraryIndex || `./${path.basename(indexModule)}`;
      const content = privateEntriesToIndex(libraryIndex, metadataBundle.privates);
      host = new SyntheticIndexHost(host, {name, content, metadata});
      parsed.fileNames.push(name);
    }

    const program = createProgram(host);
    const errors = program.getOptionsDiagnostics();
    check(errors);

    if (ngOptions.skipTemplateCodegen || !codegen) {
      codegen = () => Promise.resolve(null);
    }

    if (diagnostics) console.time('NG codegen');
    return codegen(ngOptions, cliOptions, program, host).then(() => {
      if (diagnostics) console.timeEnd('NG codegen');
      let definitionsHost = host;
      if (!ngOptions.skipMetadataEmit) {
        definitionsHost = new MetadataWriterHost(host, ngOptions);
      }
      // Create a new program since codegen files were created after making the old program
      let programWithCodegen = createProgram(definitionsHost, program);
      tsc.typeCheck(host, programWithCodegen);

      let preprocessHost = host;
      let programForJsEmit = programWithCodegen;


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

      const tsickleCompilerHost = new tsickle.TsickleCompilerHost(
          preprocessHost, ngOptions, tsickleCompilerHostOptions, tsickleHost);

      if (ngOptions.annotationsAs !== 'decorators') {
        if (diagnostics) console.time('NG downlevel');
        tsickleCompilerHost.reconfigureForRun(programForJsEmit, tsickle.Pass.DECORATOR_DOWNLEVEL);
        // A program can be re-used only once; save the programWithCodegen to be reused by
        // metadataWriter
        programForJsEmit = createProgram(tsickleCompilerHost);
        check(tsickleCompilerHost.diagnostics);
        preprocessHost = tsickleCompilerHost;
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
  let {options, fileNames, errors} = (ts as any).parseCommandLine(args);
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
