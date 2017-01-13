/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {check, tsc} from './tsc';

import NgOptions from './options';
import {MetadataWriterHost, DecoratorDownlevelCompilerHost, TsickleCompilerHost} from './compiler_host';
import {CliOptions} from './cli_options';

export {UserError} from './tsc';

export type CodegenExtension =
    (ngOptions: NgOptions, cliOptions: CliOptions, program: ts.Program, host: ts.CompilerHost) =>
        Promise<void>;

export function main(
    project: string, cliOptions: CliOptions, codegen?: CodegenExtension,
    options?: ts.CompilerOptions): Promise<any> {
  try {
    let projectDir = project;
    if (fs.lstatSync(project).isFile()) {
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

    const host = ts.createCompilerHost(parsed.options, true);

    // HACK: patch the realpath to solve symlink issue here:
    // https://github.com/Microsoft/TypeScript/issues/9552
    // todo(misko): remove once facade symlinks are removed
    host.realpath = (path) => path;

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

      if (ngOptions.annotationsAs !== 'decorators') {
        if (diagnostics) console.time('NG downlevel');
        const downlevelHost = new DecoratorDownlevelCompilerHost(preprocessHost, programForJsEmit);
        // A program can be re-used only once; save the programWithCodegen to be reused by
        // metadataWriter
        programForJsEmit = createProgram(downlevelHost);
        check(downlevelHost.diagnostics);
        preprocessHost = downlevelHost;
        if (diagnostics) console.timeEnd('NG downlevel');
      }

      if (ngOptions.annotateForClosureCompiler) {
        if (diagnostics) console.time('NG JSDoc');
        const tsickleHost = new TsickleCompilerHost(preprocessHost, programForJsEmit, ngOptions);
        programForJsEmit = createProgram(tsickleHost);
        check(tsickleHost.diagnostics);
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
