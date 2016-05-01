#!/usr/bin/env node
// TODO(alexeagle): use --lib=node when available; remove this reference
// https://github.com/Microsoft/TypeScript/pull/7757#issuecomment-205644657
/// <reference path="../../typings/node/node.d.ts"/>

// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {tsc, check} from './tsc';
import {MetadataWriterHost, TsickleHost} from './compiler_host';
import {NodeReflectorHost} from './reflector_host';
import {CodeGenerator} from './codegen';
import {MetadataCollector, ModuleMetadata} from 'ts-metadata-collector';

const DEBUG = false;

function debug(msg: string, ...o: any[]) {
  if (DEBUG) console.log(msg, ...o);
}

export function main(project: string, basePath?: string): Promise<any> {
  try {
    let projectDir = project;
    if (fs.lstatSync(project).isFile()) {
      projectDir = path.dirname(project);
    }
    // file names in tsconfig are resolved relative to this absolute path
    basePath = path.join(process.cwd(), basePath || projectDir);

    // read the configuration options from wherever you store them
    const {parsed, ngOptions} = tsc.readConfiguration(project, basePath);
    ngOptions.basePath = basePath;

    const host = ts.createCompilerHost(parsed.options, true);

    let codegenStep: Promise<any>;

    const program = ts.createProgram(parsed.fileNames, parsed.options, host);
    const errors = program.getOptionsDiagnostics();
    check(errors);

    const doCodegen =
        ngOptions.skipTemplateCodegen ?
            Promise.resolve(null) :
            CodeGenerator.create(ngOptions, program, parsed.options, host).codegen();

    return doCodegen.then(() => {
      tsc.typeCheck(host, program);

      // Emit *.js with Decorators lowered to Annotations, and also *.js.map
      const tsicklePreProcessor = new TsickleHost(host, parsed.options);
      tsc.emit(tsicklePreProcessor, program);

      if (!ngOptions.skipMetadataEmit) {
        // Emit *.metadata.json and *.d.ts
        // Not in the same emit pass with above, because tsickle erases
        // decorators which we want to read or document.
        // Do this emit second since TypeScript will create missing directories for us
        // in the standard emit.
        const metadataWriter = new MetadataWriterHost(host, program, parsed.options, ngOptions);
        tsc.emit(metadataWriter, program);
      }
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

// CLI entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  main(args.p || args.project || '.', args.basePath)
      .then(exitCode => process.exit(exitCode))
      .catch(e => {
        console.error(e.stack);
        console.error("Compilation failed");
        process.exit(1);
      });
}
