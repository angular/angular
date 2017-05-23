import {AotCompiler, NgAnalyzedModules, createAotCompiler} from '@angular/compiler';
import * as ts from 'typescript';

import {CompilerHost as AotCompilerHost} from '../compiler_host';

import {CompilerHost, CompilerOptions} from './api';
import {CustomTransformers, Diagnostic, EmitFlags, Program} from './api';

export class ProgramImpl implements Program {
  constructor(
      private tsProgram: ts.Program, private ngCompiler: AotCompiler,
      private analyzedModules: NgAnalyzedModules) {}

  getTsProgram(): ts.Program { return this.tsProgram; }

  getNgDiagnostics(): Diagnostic[] { return []; }

  emit({transformers, emitFlags = EmitFlags.Default}: {
    transformers?: CustomTransformers,
    emitFlags: EmitFlags,
  }): void {
    const generatedFiles = this.ngCompiler.emitAllImpls(this.analyzedModules);

    const before = transformers && transformers.beforeTs ? transformers.beforeTs : [];
    const after = transformers && transformers.afterTs ? transformers.afterTs : [];

    this.tsProgram.emit(undefined, undefined, undefined, undefined, {before, after});
  }
}

export function createProgram({rootNames, options, host, oldProgram, isSync}: {
  rootNames: string[],
  options: CompilerOptions,
  host: CompilerHost, oldProgram?: Program,
  isSync: boolean
}): Program|Promise<Program> {
  const oldTsProgram = oldProgram ? oldProgram.getTsProgram() : undefined;
  // create initial pgm
  const tsProgram = ts.createProgram(rootNames, options, host, oldTsProgram);

  // create the aot compiler host (compiler_host, pass host as arg, patch loadResource)
  const aotCompilerHost = new AotCompilerHost(tsProgram, options, host, host);

  if (host.loadResource) {
    aotCompilerHost.loadResource = host.loadResource.bind(host);
  }

  // create the aot compiler
  const {compiler} = createAotCompiler(aotCompilerHost, options);

  // angular specific compilation steps
  const createNgProgram = (analyzedModules: NgAnalyzedModules) => {
    const stubs = compiler.emitAllStubs(analyzedModules);

    // create the pgm + stubs
    const stubFiles = stubs.reduce((files: string[], generatedFile) => {
      if (generatedFile.source) {
        return [...files, generatedFile.source];
      }
      return files;
    }, []);

    const tsPgmWithStubs =
        ts.createProgram([...rootNames, ...stubFiles], options, host, oldTsProgram);

    return new ProgramImpl(tsPgmWithStubs, compiler, analyzedModules);
  };

  const srcNames = tsProgram.getSourceFiles().map(sf => sf.fileName);

  if (isSync) {
    const analyzedModules = compiler.analyzeModulesSync(srcNames);
    return createNgProgram(analyzedModules);
  }

  return compiler.analyzeModulesAsync(srcNames).then(
      analyzedModules => createNgProgram(analyzedModules));
}
