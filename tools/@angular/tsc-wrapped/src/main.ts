import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {check, tsc} from './tsc';

import NgOptions from './options';
import {MetadataWriterHost, TsickleHost} from './compiler_host';
import {CliOptions} from './cli_options';

export type CodegenExtension =
    (ngOptions: NgOptions, cliOptions: CliOptions, program: ts.Program, host: ts.CompilerHost) =>
        Promise<void>;

export function main(
    project: string, cliOptions: CliOptions, codegen?: CodegenExtension): Promise<any> {
  try {
    let projectDir = project;
    if (fs.lstatSync(project).isFile()) {
      projectDir = path.dirname(project);
    }

    // file names in tsconfig are resolved relative to this absolute path
    const basePath = path.resolve(process.cwd(), cliOptions.basePath || projectDir);

    // read the configuration options from wherever you store them
    const {parsed, ngOptions} = tsc.readConfiguration(project, basePath);
    ngOptions.basePath = basePath;

    const host = ts.createCompilerHost(parsed.options, true);

    // HACK: patch the realpath to solve symlink issue here:
    // https://github.com/Microsoft/TypeScript/issues/9552
    // todo(misko): remove once facade symlinks are removed
    host.realpath = (path) => path;

    const program = ts.createProgram(parsed.fileNames, parsed.options, host);
    const errors = program.getOptionsDiagnostics();
    check(errors);

    if (ngOptions.skipTemplateCodegen || !codegen) {
      codegen = () => Promise.resolve(null);
    }
    return codegen(ngOptions, cliOptions, program, host).then(() => {
      // Create a new program since codegen files were created after making the old program
      const newProgram = ts.createProgram(parsed.fileNames, parsed.options, host, program);
      tsc.typeCheck(host, newProgram);

      // Emit *.js with Decorators lowered to Annotations, and also *.js.map
      const tsicklePreProcessor = new TsickleHost(host, newProgram);
      tsc.emit(tsicklePreProcessor, newProgram);

      if (!ngOptions.skipMetadataEmit) {
        // Emit *.metadata.json and *.d.ts
        // Not in the same emit pass with above, because tsickle erases
        // decorators which we want to read or document.
        // Do this emit second since TypeScript will create missing directories for us
        // in the standard emit.
        const metadataWriter = new MetadataWriterHost(host, newProgram, ngOptions);
        tsc.emit(metadataWriter, newProgram);
      }
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

// CLI entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  const project = args.p || args.project || '.';
  const cliOptions = new CliOptions(args);
  main(project, cliOptions).then((exitCode: any) => process.exit(exitCode)).catch((e: any) => {
    console.error(e.stack);
    console.error('Compilation failed');
    process.exit(1);
  });
}
